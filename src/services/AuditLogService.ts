export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export class AuditLogService {
  /**
   * Logs an administrative action on the server's audit ledger.
   */
  static async logAction(action: string, user: string, details: string): Promise<boolean> {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, user, details })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to register security audit log:', err);
      return false;
    }
  }

  /**
   * Retrieves all registered audit log entries from the server.
   */
  static async getLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        return data.auditLogs || [];
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch security audit logs:', err);
      return [];
    }
  }
}
