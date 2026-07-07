import { Booking, Review } from '../types.js';

export interface BackupPayload {
  timestamp: string;
  bookings: Booking[];
  reviews: Review[];
  tours?: any[];
  blogs?: any[];
  coupons?: any[];
  crm?: any[];
  tickets?: any[];
  whatsappTemplates?: any[];
}

export class DatabaseBackupService {
  /**
   * Aggregates all bookings, reviews, and associated collections from the API and downloads
   * them as a structured JSON backup file directly to the admin's local disk.
   */
  static async exportLocalBackup(): Promise<boolean> {
    try {
      // 1. Fetch relevant databases
      const [bookingsRes, reviewsRes, toursRes, blogsRes, couponsRes, crmRes, ticketsRes, templatesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/reviews'),
        fetch('/api/tours'),
        fetch('/api/blogs'),
        fetch('/api/coupons'),
        fetch('/api/crm'),
        fetch('/api/tickets'),
        fetch('/api/whatsapp-templates')
      ]);

      if (!bookingsRes.ok || !reviewsRes.ok) {
        throw new Error('Failed to retrieve core database tables.');
      }

      const bookings = await bookingsRes.json();
      const reviews = await reviewsRes.json();
      const tours = toursRes.ok ? await toursRes.json() : [];
      const blogs = blogsRes.ok ? await blogsRes.json() : [];
      const coupons = couponsRes.ok ? await couponsRes.json() : [];
      const crm = crmRes.ok ? await crmRes.json() : [];
      const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
      const whatsappTemplates = templatesRes.ok ? await templatesRes.json() : [];

      // 2. Aggregate into the Backup payload
      const backupPayload: BackupPayload = {
        timestamp: new Date().toISOString(),
        bookings,
        reviews,
        tours,
        blogs,
        coupons,
        crm,
        tickets,
        whatsappTemplates
      };

      // 3. Create a browser-native download link
      const dataStr = JSON.stringify(backupPayload, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const exportFileDefaultName = `mas-sovereign-database-backup-${timestamp}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      return true;
    } catch (err) {
      console.error('Failed to export system backup locally:', err);
      return false;
    }
  }

  /**
   * Uploads and restores a database backup file, posting the payload to the server's import route.
   */
  static async importLocalBackup(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const rawText = event.target?.result as string;
          const payload: BackupPayload = JSON.parse(rawText);

          // Validation of structural requirements
          if (!payload.bookings || !Array.isArray(payload.bookings) || !payload.reviews || !Array.isArray(payload.reviews)) {
            resolve({
              success: false,
              message: 'Invalid backup file structure: Core collections "bookings" or "reviews" are missing or malformed.'
            });
            return;
          }

          // Send payload to our server API route for database integration
          const res = await fetch('/api/admin/backups/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            resolve({ success: true, message: data.message || 'Database state successfully imported and synchronized.' });
          } else {
            const errData = await res.json();
            resolve({ success: false, message: errData.error || 'Failed to apply uploaded backup snapshot on server.' });
          }
        } catch (err: any) {
          console.error('Failed to parse or import backup file:', err);
          resolve({ success: false, message: `Failed to restore backup: ${err.message}` });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, message: 'FileReader error occurred while loading backup file.' });
      };

      reader.readAsText(file);
    });
  }
}
