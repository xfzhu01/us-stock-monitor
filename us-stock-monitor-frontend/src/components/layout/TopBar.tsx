'use client';

import { Calendar } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface TopBarProps {
  title: string;
  showDatePicker?: boolean;
}

export function TopBar({ title, showDatePicker = true }: TopBarProps) {
  const { selectedDate, setSelectedDate } = useAppStore();

  return (
    <header className="flex flex-col gap-3 border-b border-gray-800 bg-gray-950/80 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <h1 className="text-xl font-semibold tracking-tight text-gray-100">{title}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" aria-hidden />
          <span>今日</span>
          <span className="font-mono text-gray-200">{formatDate(new Date())}</span>
        </div>
        {showDatePicker ? (
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <span className="hidden sm:inline">选择日期</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={cn(
                'rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 font-mono text-sm text-gray-100',
                'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              )}
            />
          </label>
        ) : null}
      </div>
    </header>
  );
}
