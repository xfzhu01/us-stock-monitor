'use client';

import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then((res) => res.data.data);

export function useMarketQuotes() {
  return useSWR('/api/market', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
}
