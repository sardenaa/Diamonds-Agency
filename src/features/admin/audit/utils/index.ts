export function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString();
}
