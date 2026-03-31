'use client';

import { BadgeCheck } from 'lucide-react';
import Link from 'next/link';

import { SENTIMENTS } from '@/lib/constants';
import { cn, formatDate, getCategoryColor, getCategoryLabel } from '@/lib/utils';
import type { EventVO } from '@/types/event';

interface EventCardProps {
  event: EventVO;
}

export function EventCard({ event }: EventCardProps) {
  const sent = SENTIMENTS[event.sentiment];

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-xl border border-gray-800 bg-gray-900/90 p-4 shadow-lg transition hover:border-indigo-500/40 hover:shadow-xl"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium text-white ${getCategoryColor(event.category)}`}
        >
          {getCategoryLabel(event.category)}
        </span>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-xs font-medium',
            event.sentiment === 'BULLISH' && 'bg-green-500/20 text-green-400',
            event.sentiment === 'BEARISH' && 'bg-red-500/20 text-red-400',
            event.sentiment === 'NEUTRAL' && 'bg-gray-700 text-gray-300'
          )}
        >
          {sent.label}
        </span>
        {event.isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-400">
            <BadgeCheck className="h-3.5 w-3.5" />
            已验证
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-gray-100">{event.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
        {event.summary}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase text-gray-500">可信度</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${event.credibilityScore}%` }}
            />
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{event.credibilityScore}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-500">影响力</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${event.impactScore}%` }}
            />
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{event.impactScore}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{event.sourceName}</span>
        <span>{formatDate(event.eventDate)}</span>
      </div>
    </Link>
  );
}
