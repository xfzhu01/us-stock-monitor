import type { AnalysisVO } from './analysis';
import type { EventVO } from './event';
import type { MarketDataVO } from './market';

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DashboardVO {
  latestAnalysis: AnalysisVO | null;
  latestMarket: MarketDataVO | null;
  todayTopEvents: EventVO[];
  recentProbTrend: AnalysisVO[];
}
