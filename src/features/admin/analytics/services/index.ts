export class AnalyticsService {
  static formatRevenue(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }
}
