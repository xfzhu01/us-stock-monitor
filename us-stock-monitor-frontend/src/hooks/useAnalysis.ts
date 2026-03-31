'use client';

import useSWR from 'swr';

import {
  fetchAnalysisByDate,
  fetchAnalysisDates,
  fetchAnalysisHistory,
  fetchLatestAnalysis,
} from '@/lib/api';
import type { AnalysisVO } from '@/types/analysis';

export function useLatestAnalysis() {
  return useSWR<AnalysisVO | null>('/api/v1/analysis/latest', fetchLatestAnalysis, {
    revalidateOnFocus: false,
  });
}

export function useAnalysisByDate(date: string | null) {
  return useSWR<AnalysisVO>(
    date ? ['/api/v1/analysis', date] : null,
    ([, d]) => fetchAnalysisByDate(d as string),
    { revalidateOnFocus: false }
  );
}

export function useAnalysisHistory(days: number) {
  return useSWR<AnalysisVO[]>(
    ['/api/v1/analysis/history', days],
    () => fetchAnalysisHistory(days),
    { revalidateOnFocus: false }
  );
}

export function useAnalysisDates() {
  return useSWR<string[]>('/api/v1/analysis/dates', fetchAnalysisDates, {
    revalidateOnFocus: false,
  });
}
