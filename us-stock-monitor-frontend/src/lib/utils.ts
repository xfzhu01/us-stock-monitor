import { type ClassValue, clsx } from 'clsx';
import { format as formatDateFns } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

import { ACTIONS, CATEGORIES, SIGNALS } from '@/lib/constants';
import type { AnalysisVO } from '@/types/analysis';
import type { FundPositionVO } from '@/types/fund';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | Date, pattern = 'yyyy-MM-dd') {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return formatDateFns(d, pattern, { locale: zhCN });
}

export function formatDateTime(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return formatDateFns(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function getSignalColor(trendSignal: AnalysisVO['trendSignal']): string {
  return SIGNALS[trendSignal]?.textColor ?? 'text-gray-400';
}

export function getSignalLabel(trendSignal: AnalysisVO['trendSignal']): string {
  return SIGNALS[trendSignal]?.label ?? trendSignal;
}

export function getCategoryLabel(category: string): string {
  const key = category as keyof typeof CATEGORIES;
  return CATEGORIES[key]?.label ?? category;
}

export function getCategoryColor(category: string): string {
  const key = category as keyof typeof CATEGORIES;
  return CATEGORIES[key]?.color ?? 'bg-gray-500';
}

export function getSentimentColor(sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'): string {
  return sentiment === 'BULLISH'
    ? 'text-bull'
    : sentiment === 'BEARISH'
      ? 'text-bear'
      : 'text-neutral';
}

export function getActionColor(action: FundPositionVO['action']): string {
  return ACTIONS[action]?.color ?? 'text-gray-400';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

export function formatPercent(pct: number, digits = 2): string {
  return `${pct >= 0 ? '' : ''}${pct.toFixed(digits)}%`;
}
