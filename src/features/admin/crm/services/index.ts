export class CrmService {
  static getSegmentName(tier: string): string {
    return tier === 'royal' ? '👑 Royal Segment' : '💼 Preferred VIP';
  }
}
