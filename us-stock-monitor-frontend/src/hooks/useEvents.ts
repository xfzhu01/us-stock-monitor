'use client';

import useSWR from 'swr';

import { fetchEvents, type EventsQueryParams } from '@/lib/api';
import type { EventVO } from '@/types/event';
import type { PageResult } from '@/types/api';

const fetcher = ([, params]: [string, EventsQueryParams]) =>
  fetchEvents(params);

export function useEvents(params: EventsQueryParams) {
  const key: [string, EventsQueryParams] = ['/api/v1/events', params];

  return useSWR<PageResult<EventVO>>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}
