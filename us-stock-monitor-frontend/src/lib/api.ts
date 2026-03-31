import axios, { type AxiosError } from 'axios';

import type { AnalysisVO } from '@/types/analysis';
import type { ApiResult, DashboardVO, PageResult } from '@/types/api';
import type { EventVO } from '@/types/event';
import type { FundPositionVO } from '@/types/fund';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResult<unknown>;
    if (body.code !== 0) {
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return { ...response, data: body.data };
  },
  (error: AxiosError<ApiResult<unknown>>) => {
    const msg =
      error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(msg));
  }
);

export async function fetchDashboard(): Promise<DashboardVO> {
  const { data } = await apiClient.get<DashboardVO>('/api/v1/dashboard');
  return data as DashboardVO;
}

export interface EventsQueryParams {
  date?: string;
  category?: string;
  sentiment?: string;
  verified?: boolean;
  page?: number;
  size?: number;
}

export async function fetchEvents(
  params: EventsQueryParams
): Promise<PageResult<EventVO>> {
  const { data } = await apiClient.get<PageResult<EventVO>>(
    '/api/v1/events',
    { params }
  );
  return data as PageResult<EventVO>;
}

export async function fetchEventById(id: number): Promise<EventVO> {
  const { data } = await apiClient.get<EventVO>(`/api/v1/events/${id}`);
  return data as EventVO;
}

export async function fetchLatestAnalysis(): Promise<AnalysisVO | null> {
  const { data } = await apiClient.get<AnalysisVO | null>(
    '/api/v1/analysis/latest'
  );
  return data as AnalysisVO | null;
}

export async function fetchAnalysisByDate(date: string): Promise<AnalysisVO> {
  const { data } = await apiClient.get<AnalysisVO>(
    `/api/v1/analysis/${encodeURIComponent(date)}`
  );
  return data as AnalysisVO;
}

export async function fetchAnalysisHistory(
  days: number
): Promise<AnalysisVO[]> {
  const { data } = await apiClient.get<AnalysisVO[]>(
    '/api/v1/analysis/history',
    { params: { days } }
  );
  return data as AnalysisVO[];
}

export async function fetchAnalysisDates(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/api/v1/analysis/dates');
  return data as string[];
}

export interface FundPositionsQueryParams {
  fundName?: string;
  ticker?: string;
  quarter?: string;
  action?: string;
  page?: number;
  size?: number;
}

export async function fetchFundPositions(
  params: FundPositionsQueryParams
): Promise<PageResult<FundPositionVO>> {
  const { data } = await apiClient.get<PageResult<FundPositionVO>>(
    '/api/v1/funds/positions',
    { params }
  );
  return data as PageResult<FundPositionVO>;
}

export async function fetchFundList(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/api/v1/funds/list');
  return data as string[];
}

export async function fetchQuarterList(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/api/v1/funds/quarters');
  return data as string[];
}
