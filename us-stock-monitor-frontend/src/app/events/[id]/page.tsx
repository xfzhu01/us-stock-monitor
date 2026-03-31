'use client';

import { BadgeCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { TopBar } from '@/components/layout/TopBar';
import { fetchEventById } from '@/lib/api';
import { SENTIMENTS } from '@/lib/constants';
import {
  formatDate,
  formatDateTime,
  getCategoryColor,
  getCategoryLabel,
} from '@/lib/utils';

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: event, error, isLoading } = useSWR(
    Number.isFinite(id) ? `/api/v1/events/${id}` : null,
    () => fetchEventById(id)
  );

  if (!Number.isFinite(id)) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="事件详情" />
        <div className="p-8 text-center text-gray-500">无效的事件 ID</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="事件详情" />
        <div className="p-8 text-center text-red-400">{error.message}</div>
      </div>
    );
  }

  if (isLoading || !event) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="事件详情" />
        <div className="animate-pulse space-y-4 p-4 lg:p-8">
          <div className="h-8 w-2/3 rounded bg-gray-800" />
          <div className="h-40 rounded-xl bg-gray-800" />
        </div>
      </div>
    );
  }

  const sent = SENTIMENTS[event.sentiment];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="事件详情" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <Link
          href="/events"
          className="inline-flex text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← 返回列表
        </Link>

        <article className="rounded-xl border border-gray-800 bg-gray-900/90 p-6 shadow-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium text-white ${getCategoryColor(event.category)}`}
            >
              {getCategoryLabel(event.category)}
            </span>
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
              {sent.label}
            </span>
            {event.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs text-indigo-400">
                <BadgeCheck className="h-4 w-4" />
                已验证
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-100">{event.title}</h1>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">事件日期</dt>
              <dd className="font-mono text-gray-200">{formatDate(event.eventDate)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">来源</dt>
              <dd className="text-gray-200">{event.sourceName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">可信度</dt>
              <dd className="text-gray-200">{event.credibilityScore}</dd>
            </div>
            <div>
              <dt className="text-gray-500">影响力</dt>
              <dd className="text-gray-200">{event.impactScore}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">原文链接</dt>
              <dd>
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                >
                  {event.sourceUrl}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-gray-800 pt-6">
            <h2 className="text-sm font-semibold text-gray-400">摘要</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-gray-200">
              {event.summary}
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            创建于 {formatDateTime(event.createdAt)}
          </p>
        </article>
      </main>
    </div>
  );
}
