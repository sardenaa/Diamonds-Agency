export function calculateCustomerLtv(totalPaid: number): string {
  return `$${totalPaid.toLocaleString()}`;
}
