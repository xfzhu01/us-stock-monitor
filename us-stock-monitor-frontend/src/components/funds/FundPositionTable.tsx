'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ACTIONS } from '@/lib/constants';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import type { FundPositionVO } from '@/types/fund';

type SortKey = keyof FundPositionVO;

interface FundPositionTableProps {
  rows: FundPositionVO[];
}

export function FundPositionTable({ rows }: FundPositionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('filingDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey as keyof FundPositionVO];
      const vb = b[sortKey as keyof FundPositionVO];
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va ?? '');
      const sb = String(vb ?? '');
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const header = (key: SortKey, label: string) => {
    const active = sortKey === key;
    return (
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium hover:text-indigo-300',
          active && 'text-indigo-400'
        )}
        onClick={() => {
          if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
          else {
            setSortKey(key);
            setSortDir('desc');
          }
        }}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : null}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/80 shadow-lg">
      <table className="min-w-[960px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-950/80 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-3 py-3">{header('fundName', '基金')}</th>
            <th className="px-3 py-3">{header('managerName', '经理')}</th>
            <th className="px-3 py-3">{header('ticker', '股票')}</th>
            <th className="px-3 py-3">{header('companyName', '公司')}</th>
            <th className="px-3 py-3">操作</th>
            <th className="px-3 py-3 text-right">{header('sharesChange', '变动股数')}</th>
            <th className="px-3 py-3 text-right">{header('sharesTotal', '总持仓')}</th>
            <th className="px-3 py-3 text-right">{header('valueUsd', '市值 (USD)')}</th>
            <th className="px-3 py-3 text-right">{header('portfolioPct', '占比 %')}</th>
            <th className="px-3 py-3">{header('quarter', '季度')}</th>
            <th className="px-3 py-3">{header('filingDate', '披露日')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sorted.map((row) => {
            const act = ACTIONS[row.action];
            return (
              <tr key={row.id} className="hover:bg-gray-800/50">
                <td className="px-3 py-2.5 text-gray-200">{row.fundName}</td>
                <td className="px-3 py-2.5 text-gray-400">{row.managerName}</td>
                <td className="px-3 py-2.5 font-mono text-indigo-300">{row.ticker}</td>
                <td className="max-w-[200px] truncate px-3 py-2.5 text-gray-300">
                  {row.companyName}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      act.bg,
                      act.color
                    )}
                  >
                    {act.label}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-300">
                  {formatNumber(row.sharesChange)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-300">
                  {formatNumber(row.sharesTotal)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-200">
                  ${formatNumber(Math.round(row.valueUsd))}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-400">
                  {row.portfolioPct.toFixed(2)}%
                </td>
                <td className="px-3 py-2.5 text-gray-400">{row.quarter}</td>
                <td className="px-3 py-2.5 text-gray-500">
                  {formatDate(row.filingDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
