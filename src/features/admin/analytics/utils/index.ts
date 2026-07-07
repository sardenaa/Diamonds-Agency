export function calculatePercentage(value: number, max: number): number {
  if (max === 0) return 0;
  return (value / max) * 100;
}
