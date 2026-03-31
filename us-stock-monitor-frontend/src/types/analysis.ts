export interface AnalysisVO {
  id: number;
  analysisDate: string;
  spxBullProb7d: number;
  spxBullProb30d: number;
  ndxBullProb7d: number;
  ndxBullProb30d: number;
  signal: 'strong_bull' | 'bull' | 'neutral' | 'bear' | 'strong_bear';
  keyRisks: string[];
  keyTailwinds: string[];
  eventIdsUsed: number[];
  reportMarkdown: string;
  modelVersion: string;
  generatedAt: string;
}
