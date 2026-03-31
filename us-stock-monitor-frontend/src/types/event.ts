export interface EventVO {
  id: number;
  eventDate: string;
  category: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  credibilityScore: number;
  impactScore: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  isVerified: boolean;
  createdAt: string;
}
