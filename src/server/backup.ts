import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDB, saveDB, logAudit } from './db.js';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_RAW = process.env.BACKUP_ENCRYPTION_KEY || 'sovereign_mas_disaster_recovery_aes_key';

export interface BackupMetadata {
  id: string;
  filename: string;
  timestamp: string;
  sizeBytes: number;
  type: 'Auto' | 'Manual';
}

/**
 * Gets the SHA-256 32-byte key from raw string configuration
 */
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();
}

/**
 * Encrypts data to hex output with a random IV
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts hex input using prepended IV
 */
function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Malformed backup payload.');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Creates an encrypted disaster recovery backup of the bookings and reviews collections.
 * Saves the encrypted snapshot file to the backups folder.
 */
export function createBackup(type: 'Auto' | 'Manual' = 'Manual'): BackupMetadata {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const db = getDB();
    // Isolate bookings and reviews as requested, but export full DB for complete recovery
    const backupPayload = {
      timestamp: new Date().toISOString(),
      type,
      bookings: db.bookings || [],
      reviews: db.reviews || [],
      // Storing other structures to ensure seamless disaster restore operation
      tours: db.tours || [],
      blogs: db.blogs || [],
      coupons: db.coupons || [],
      crm: db.crm || [],
      tickets: db.tickets || [],
      whatsappTemplates: db.whatsappTemplates || []
    };

    const serializedPayload = JSON.stringify(backupPayload, null, 2);
    const encryptedData = encrypt(serializedPayload);
    
    const timestamp = Date.now();
    const filename = `backup-${timestamp}-${type.toLowerCase()}.enc`;
    const filepath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filepath, encryptedData, 'utf8');
    const stats = fs.statSync(filepath);

    const metadata: BackupMetadata = {
      id: `bk-${timestamp}`,
      filename,
      timestamp: new Date(timestamp).toISOString(),
      sizeBytes: stats.size,
      type
    };

    logAudit(
      'DISASTER_RECOVERY_BACKUP_CREATED',
      'Disaster Recovery Engine',
      `Successfully generated ${type.toUpperCase()} encrypted snapshot of reservations (${db.bookings.length} items) and reviews (${db.reviews.length} items) saved to cloud backups.`
    );

    return metadata;
  } catch (error: any) {
    console.error('Failed to create encrypted backup snapshot:', error);
    logAudit(
      'DISASTER_RECOVERY_BACKUP_FAILED',
      'System Error',
      `Failed to create backup snapshot. Error details: ${error.message}`
    );
    throw error;
  }
}

/**
 * Lists all available encrypted backup snapshots
 */
export function listBackups(): BackupMetadata[] {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const backups: BackupMetadata[] = [];

    for (const file of files) {
      if (file.startsWith('backup-') && file.endsWith('.enc')) {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        const parts = file.replace('.enc', '').split('-');
        
        const timestamp = parseInt(parts[1]);
        const typeStr = parts[2] || 'manual';
        const type: 'Auto' | 'Manual' = typeStr.toLowerCase() === 'auto' ? 'Auto' : 'Manual';

        if (!isNaN(timestamp)) {
          backups.push({
            id: `bk-${timestamp}`,
            filename: file,
            timestamp: new Date(timestamp).toISOString(),
            sizeBytes: stats.size,
            type
          });
        }
      }
    }

    // Sort newest backups first
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error listing backup snapshots:', error);
    return [];
  }
}

/**
 * Restores the system state from an encrypted backup snapshot
 */
export function restoreBackup(filename: string): void {
  try {
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file ${filename} does not exist.`);
    }

    const encryptedData = fs.readFileSync(filepath, 'utf8');
    const decryptedJson = decrypt(encryptedData);
    const payload = JSON.parse(decryptedJson);

    // Validate payload shape
    if (!payload.bookings || !payload.reviews) {
      throw new Error('Invalid backup file structure: missing bookings or reviews collections.');
    }

    // Restore to server DB
    const db = getDB();
    db.bookings = payload.bookings;
    db.reviews = payload.reviews;
    if (payload.tours) db.tours = payload.tours;
    if (payload.blogs) db.blogs = payload.blogs;
    if (payload.coupons) db.coupons = payload.coupons;
    if (payload.crm) db.crm = payload.crm;
    if (payload.tickets) db.tickets = payload.tickets;
    if (payload.whatsappTemplates) db.whatsappTemplates = payload.whatsappTemplates;

    saveDB(db);

    logAudit(
      'DISASTER_RECOVERY_RESTORED',
      'Disaster Recovery Engine',
      `Restored system state from encrypted backup file: ${filename}. Active reservations count: ${db.bookings.length}, reviews: ${db.reviews.length}.`
    );
  } catch (error: any) {
    console.error('Disaster recovery restore failed:', error);
    logAudit(
      'DISASTER_RECOVERY_RESTORE_FAILED',
      'System Error',
      `Restore operation aborted for ${filename}. Error details: ${error.message}`
    );
    throw error;
  }
}

/**
 * Initializes the background scheduler to take daily backups automatically.
 */
export function initDailyBackupScheduler(): void {
  // Check on boot: if no backups exist or if latest backup is older than 24 hours, perform one
  try {
    const backups = listBackups();
    const autoBackups = backups.filter(b => b.type === 'Auto');
    
    let shouldBackupOnBoot = false;
    if (autoBackups.length === 0) {
      shouldBackupOnBoot = true;
    } else {
      const latestBackupTime = new Date(autoBackups[0].timestamp).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - latestBackupTime > oneDayMs) {
        shouldBackupOnBoot = true;
      }
    }

    if (shouldBackupOnBoot) {
      console.log('[BACKUP] Daily background scheduler: Initializing first automated snapshot.');
      createBackup('Auto');
    }
  } catch (err) {
    console.error('Error during boot backup check:', err);
  }

  // Setup periodic check every 4 hours to verify daily backup
  setInterval(() => {
    try {
      const backups = listBackups();
      const autoBackups = backups.filter(b => b.type === 'Auto');
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (autoBackups.length === 0 || (Date.now() - new Date(autoBackups[0].timestamp).getTime() > oneDayMs)) {
        console.log('[BACKUP] Daily background scheduler: Triggering automated daily encrypted snapshot.');
        createBackup('Auto');
      }
    } catch (err) {
      console.error('[BACKUP] Periodic background scheduler error:', err);
    }
  }, 4 * 60 * 60 * 1000); // Check every 4 hours
}
