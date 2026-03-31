'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import {
  useAnalysisByDate,
  useAnalysisDates,
  useAnalysisHistory,
} from '@/hooks/useAnalysis';
import { SIGNALS } from '@/lib/constants';
import { cn, formatDate, getSignalColor, getSignalLabel } from '@/lib/utils';

import { AnalysisReport } from './AnalysisReport';
import { ProbabilityChart } from './ProbabilityChart';
import { RiskTailwindList } from './RiskTailwindList';

interface AnalysisWorkspaceProps {
  /** yyyy-MM-dd */
  date: string;
}

function groupByMonth(dates: string[]) {
  const map = new Map<string, string[]>();
  for (const d of dates) {
    const month = d.slice(0, 7);
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(d);
  }
  return map;
}

export function AnalysisWorkspace({ date }: AnalysisWorkspaceProps) {
  const { data: dates, isLoading: datesLoading } = useAnalysisDates();
  const { data: analysis, error, isLoading } = useAnalysisByDate(date);
  const { data: history } = useAnalysisHistory(30);

  const grouped = useMemo(() => {
    if (!dates?.length) return new Map<string, string[]>();
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    return groupByMonth(sorted);
  }, [dates]);

  if (isLoading || datesLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 lg:p-8">
        <div className="h-10 w-64 rounded bg-gray-800" />
        <div className="grid gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-800" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-gray-800" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 text-center text-gray-400">
        无法加载该日期的分析报告
      </div>
    );
  }

  const probCards = [
    { label: 'SPX 7日看涨概率', value: analysis.spxBullProb7d, tone: 'text-blue-400' },
    { label: 'SPX 30日看涨概率', value: analysis.spxBullProb30d, tone: 'text-green-400' },
    { label: 'NDX 7日看涨概率', value: analysis.ndxBullProb7d, tone: 'text-orange-400' },
    { label: 'NDX 30日看涨概率', value: analysis.ndxBullProb30d, tone: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-xl border border-gray-800 bg-gray-900/80 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:w-56 lg:overflow-y-auto">
        <div className="border-b border-gray-800 px-3 py-2 text-xs font-medium text-gray-500">
          报告日期
        </div>
        <div className="p-2">
          {Array.from(grouped.entries()).map(([month, ds]) => (
            <div key={month} className="mb-4">
              <p className="mb-1 px-2 text-[10px] uppercase text-gray-600">
                {month}
              </p>
              <ul className="space-y-0.5">
                {ds.map((d) => (
                  <li key={d}>
                    <Link
                      href={`/analysis/${d}`}
                      className={cn(
                        'block rounded-lg px-2 py-1.5 text-sm transition',
                        d === date
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                      )}
                    >
                      {formatDate(d, 'MM月dd日')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium text-white ${SIGNALS[analysis.trendSignal].color}`}
          >
            {getSignalLabel(analysis.trendSignal)}
          </span>
          <span className={cn('text-sm', getSignalColor(analysis.trendSignal))}>
            模型 {analysis.modelVersion}
          </span>
          <span className="text-xs text-gray-500">
            生成于 {formatDate(analysis.generatedAt, 'yyyy-MM-dd HH:mm')}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {probCards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-gray-800 bg-gray-900/90 p-4 shadow-lg"
            >
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={cn('mt-2 text-3xl font-bold tabular-nums', c.tone)}>
                {Math.round(c.value)}
                <span className="text-lg font-normal text-gray-500">%</span>
              </p>
            </div>
          ))}
        </div>

        <ProbabilityChart data={history ?? []} />

        <RiskTailwindList risks={analysis.keyRisks} tailwinds={analysis.keyTailwinds} />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-300">完整报告</h2>
          <AnalysisReport markdown={analysis.reportMarkdown || '_暂无正文_'} />
        </div>
      </div>
    </div>
  );
}
