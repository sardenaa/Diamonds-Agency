export function getBookingStatusLabel(status: string, lang: 'en' | 'ar'): string {
  if (lang === 'ar') {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  }
  return status.toUpperCase();
}
