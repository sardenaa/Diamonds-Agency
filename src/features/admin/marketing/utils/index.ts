export function formatDiscount(value: number, type: 'percent' | 'fixed'): string {
  if (type === 'percent') {
    return `${value}% Off`;
  }
  return `$${value} Off`;
}
