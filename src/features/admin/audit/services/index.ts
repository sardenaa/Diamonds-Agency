export class SecurityAuditService {
  static getLogCategory(action: string): string {
    const act = action.toUpperCase();
    if (act.includes('TOUR')) return 'tours';
    if (act.includes('BOOKING') || act.includes('REFUND') || act.includes('UPGRADE') || act.includes('EXPORT') || act.includes('MANUAL')) return 'bookings';
    if (act.includes('CRM') || act.includes('TICKET') || act.includes('CUSTOMER') || act.includes('REPLY')) return 'crm_tickets';
    if (act.includes('COUPON') || act.includes('BLOG')) return 'coupons_blogs';
    return 'system_security';
  }
}
