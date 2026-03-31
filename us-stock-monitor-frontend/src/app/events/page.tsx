'use client';

import { useEffect, useMemo, useState } from 'react';

import { EventCard } from '@/components/events/EventCard';
import {
  EventFilter,
  type EventFilterValues,
} from '@/components/events/EventFilter';
import { TopBar } from '@/components/layout/TopBar';
import { useEvents } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const PAGE_SIZE = 10;

export default function EventsPage() {
  const { selectedDate } = useAppStore();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<EventFilterValues>({
    date: selectedDate,
    categories: [],
    sentiment: '',
    verified: false,
  });

  useEffect(() => {
    setFilter((f) => ({ ...f, date: selectedDate }));
  }, [selectedDate]);

  const params = useMemo(
    () => ({
      date: filter.date,
      category: filter.categories.length ? filter.categories.join(',') : undefined,
      sentiment: filter.sentiment || undefined,
      verified: filter.verified ? true : undefined,
      page,
      size: PAGE_SIZE,
    }),
    [filter, page]
  );

  const { data, error, isLoading } = useEvents(params);

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="事件监控" />
        <div className="p-8 text-center text-red-400">加载失败：{error.message}</div>
      </div>
    );
  }

  const totalPages = data?.totalPages ?? 0;
  const content = data?.content ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="事件监控" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <EventFilter
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setPage(0);
          }}
        />

        {isLoading ? (
          <div className="grid gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-gray-800" />
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-12 text-center text-gray-500">
            当前筛选条件下没有事件
          </div>
        ) : (
          <div className="grid gap-4">
            {content.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
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
