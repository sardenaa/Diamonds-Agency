export function getTicketInitials(name: string): string {
  if (!name) return 'VIP';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
