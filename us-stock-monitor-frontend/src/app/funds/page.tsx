'use client';

import { useMemo, useState } from 'react';

import { FundPositionTable } from '@/components/funds/FundPositionTable';
import { FundSelector } from '@/components/funds/FundSelector';
import { TopBar } from '@/components/layout/TopBar';
import { useFundList, useFundPositions, useQuarterList } from '@/hooks/useFundPositions';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function FundsPage() {
  const [page, setPage] = useState(0);
  const [funds, setFunds] = useState<string[]>([]);
  const [ticker, setTicker] = useState('');
  const [quarter, setQuarter] = useState('');
  const [action, setAction] = useState<string>('');

  const { data: fundNames } = useFundList();
  const { data: quarters } = useQuarterList();

  const params = useMemo(
    () => ({
      fundName: funds.length ? funds.join(',') : undefined,
      ticker: ticker.trim() || undefined,
      quarter: quarter || undefined,
      action: action || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [funds, ticker, quarter, action, page]
  );

  const { data, error, isLoading } = useFundPositions(params);

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="基金动向" />
        <div className="p-8 text-center text-red-400">{error.message}</div>
      </div>
    );
  }

  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="基金动向" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-lg lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="mb-2 text-xs text-gray-500">基金（多选）</p>
            <FundSelector
              funds={fundNames ?? []}
              selected={funds}
              onChange={(next) => {
                setFunds(next);
                setPage(0);
              }}
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-500">股票代码</p>
            <input
              type="search"
              placeholder="如 AAPL"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-sm text-gray-100"
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-500">季度</p>
            <select
              value={quarter}
              onChange={(e) => {
                setQuarter(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            >
              <option value="">全部</option>
              {(quarters ?? []).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-500">操作类型</p>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            >
              <option value="">全部</option>
              <option value="NEW">新建仓</option>
              <option value="ADD">加仓</option>
              <option value="REDUCE">减仓</option>
              <option value="CLOSE">清仓</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-800" />
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-12 text-center text-gray-500">
            暂无持仓变动记录
          </div>
        ) : (
          <FundPositionTable rows={rows} />
        )}

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={cn(
                'rounded-lg border border-gray-700 px-4 py-2 text-sm',
                page <= 0 ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-800'
              )}
            >
              上一页
            </button>
            <span className="text-sm text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={cn(
                'rounded-lg border border-gray-700 px-4 py-2 text-sm',
                page >= totalPages - 1
                  ? 'cursor-not-allowed opacity-40'
                  : 'hover:bg-gray-800'
              )}
            >
              下一页
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
