'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn, formatNumber, formatPercent } from '@/lib/utils';

interface MarketSnapshotProps {
  name: string;
  subtitle?: string;
  value: number | null | undefined;
  changePct: number | null | undefined;
  format?: 'price' | 'yield' | 'index';
}

function formatValue(
  v: number | null | undefined,
  kind: MarketSnapshotProps['format']
): string {
  if (v == null) return '--';
  if (kind === 'yield') return `${v.toFixed(2)}%`;
  if (kind === 'index') return formatNumber(Math.round(v * 100) / 100);
  return formatNumber(Math.round(v * 100) / 100);
}

export function MarketSnapshot({
  name,
  subtitle,
  value,
  changePct,
  format = 'price',
}: MarketSnapshotProps) {
  const pct = changePct ?? 0;
  const up = pct > 0;
  const flat = pct === 0;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-4 shadow-lg transition hover:border-gray-700">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {name}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-[10px] text-gray-600">{subtitle}</p>
      ) : null}
      <p className="mt-2 font-mono text-2xl font-semibold text-gray-100">
        {formatValue(value, format)}
      </p>
      <div
        className={cn(
          'mt-2 flex items-center gap-1 text-sm font-medium',
          flat && 'text-gray-400',
          !flat && up && 'text-bull',
          !flat && !up && 'text-bear'
        )}
      >
        {flat ? (
          <Minus className="h-4 w-4" aria-hidden />
        ) : up ? (
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        ) : (
          <ArrowDownRight className="h-4 w-4" aria-hidden />
        )}
        <span>{formatPercent(pct)}</span>
      </div>
    </div>
  );
}
