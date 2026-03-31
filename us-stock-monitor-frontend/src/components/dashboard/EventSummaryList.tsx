'use client';

import Link from 'next/link';

import { getCategoryColor, getCategoryLabel } from '@/lib/utils';
import type { EventVO } from '@/types/event';

function sentimentDot(s: EventVO['sentiment']) {
  if (s === 'BULLISH') return 'bg-bull';
  if (s === 'BEARISH') return 'bg-bear';
  return 'bg-neutral';
}

interface EventSummaryListProps {
  events: EventVO[];
}

export function EventSummaryList({ events }: EventSummaryListProps) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-8 text-center text-sm text-gray-500">
        今日暂无重点事件
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/90 shadow-lg">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-200">今日重点事件</h2>
      </div>
      <ul className="divide-y divide-gray-800">
        {events.map((e) => (
          <li key={e.id}>
            <Link
              href={`/events/${e.id}`}
              className="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-800/60"
            >
              <span
                className={`mt-0.5 inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-white ${getCategoryColor(e.category)}`}
              >
                {getCategoryLabel(e.category)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-100">{e.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span>影响 {e.impactScore}</span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${sentimentDot(e.sentiment)}`}
                    title={e.sentiment}
                  />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
