export function calculateOccupancy(capacity: number, booked: number): number {
  if (capacity === 0) return 0;
  return Math.min(100, Math.round((booked / capacity) * 100));
}
