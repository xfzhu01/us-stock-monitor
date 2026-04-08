export interface EventSource {
  name: string;
  url: string;
}

export interface EventVO {
  id: number;
  eventDate: string;
  category: string;
  title: string;
  summary: string;
  sourceUrl?: string; // Legacy
  sourceName?: string; // Legacy
  sources?: EventSource[];
  credibilityScore: number;
  impactScore: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  isVerified: boolean;
  createdAt: string;
}
