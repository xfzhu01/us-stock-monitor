'use client';

import useSWR from 'swr';

import { fetchDashboard } from '@/lib/api';
import type { DashboardVO } from '@/types/api';

export function useDashboard() {
  return useSWR<DashboardVO>('/api/v1/dashboard', fetchDashboard, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
}
