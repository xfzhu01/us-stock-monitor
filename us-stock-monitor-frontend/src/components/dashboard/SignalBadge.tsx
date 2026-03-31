'use client';

import { cn } from '@/lib/utils';
import { SIGNALS } from '@/lib/constants';
import type { AnalysisVO } from '@/types/analysis';

const signalEnglish: Record<AnalysisVO['trendSignal'], string> = {
  strong_bull: 'Strong Bull',
  bull: 'Bullish',
  neutral: 'Neutral',
  bear: 'Bearish',
  strong_bear: 'Strong Bear',
};

interface SignalBadgeProps {
  trendSignal: AnalysisVO['trendSignal'];
  className?: string;
}

export function SignalBadge({ trendSignal, className }: SignalBadgeProps) {
  const cfg = SIGNALS[trendSignal];
  const strong = trendSignal === 'strong_bull' || trendSignal === 'strong_bear';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-xl',
        strong && 'animate-pulse',
        className
      )}
    >
      {strong ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-20',
            trendSignal === 'strong_bull' ? 'bg-green-600' : 'bg-red-600'
          )}
        />
      ) : null}
      <p className="text-sm font-medium text-gray-400">市场信号</p>
      <p className={cn('mt-2 text-4xl font-bold tracking-tight', cfg.textColor)}>
        {cfg.label}
      </p>
      <p className="mt-1 text-sm text-gray-500">{signalEnglish[trendSignal]}</p>
    </div>
  );
}
