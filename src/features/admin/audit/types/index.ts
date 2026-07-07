export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}
