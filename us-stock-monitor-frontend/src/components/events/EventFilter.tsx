'use client';

import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

export interface EventFilterValues {
  date: string;
  categories: string[];
  sentiment: '' | 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  verified: boolean;
}

interface EventFilterProps {
  value: EventFilterValues;
  onChange: (next: EventFilterValues) => void;
}

const categoryKeys = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];

export function EventFilter({ value, onChange }: EventFilterProps) {
  const toggleCategory = (cat: string) => {
    const set = new Set(value.categories);
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    onChange({ ...value, categories: Array.from(set) });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-lg">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">日期</span>
          <input
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className={cn(
              'rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-gray-100',
              'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
            )}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-gray-400">情绪</span>
          <select
            value={value.sentiment}
            onChange={(e) =>
              onChange({
                ...value,
                sentiment: e.target.value as EventFilterValues['sentiment'],
              })
            }
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          >
            <option value="">全部</option>
            <option value="BULLISH">看涨</option>
            <option value="BEARISH">看跌</option>
            <option value="NEUTRAL">中性</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={value.verified}
            onChange={(e) => onChange({ ...value, verified: e.target.checked })}
            className="rounded border-gray-600 bg-gray-950 text-indigo-600 focus:ring-indigo-500"
          />
          仅已验证
        </label>
      </div>
      <div>
        <p className="mb-2 text-sm text-gray-400">类别（多选）</p>
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => {
            const active = value.categories.includes(key);
            const { label, color } = CATEGORIES[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCategory(key)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  active
                    ? `${color} text-white ring-2 ring-white/30`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
