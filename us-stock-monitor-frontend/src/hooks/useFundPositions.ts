'use client';

import useSWR from 'swr';

import {
  fetchFundList,
  fetchFundPositions,
  fetchQuarterList,
  type FundPositionsQueryParams,
} from '@/lib/api';
import type { FundPositionVO } from '@/types/fund';
import type { PageResult } from '@/types/api';

const positionsFetcher = ([, params]: [
  string,
  FundPositionsQueryParams,
]) => fetchFundPositions(params);

export function useFundPositions(params: FundPositionsQueryParams) {
  const key: [string, FundPositionsQueryParams] = [
    '/api/v1/funds/positions',
    params,
  ];

  return useSWR<PageResult<FundPositionVO>>(key, positionsFetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

export function useFundList() {
  return useSWR<string[]>('/api/v1/funds/list', fetchFundList, {
    revalidateOnFocus: false,
  });
}

export function useQuarterList() {
  return useSWR<string[]>('/api/v1/funds/quarters', fetchQuarterList, {
    revalidateOnFocus: false,
  });
}
