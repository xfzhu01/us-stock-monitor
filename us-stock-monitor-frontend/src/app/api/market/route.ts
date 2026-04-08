import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

/**
 * Finnhub free tier doesn't support raw index symbols (^GSPC, ^VIX, etc.).
 * We use liquid ETF proxies instead:
 *   SPY  → S&P 500     QQQ  → Nasdaq 100
 *   VIXY → VIX         TLT  → US 10-Year Bond
 *   UUP  → US Dollar
 */
const SYMBOL_MAP: Record<string, { symbol: string; label: string }> = {
  spx:   { symbol: 'SPY',  label: 'S&P 500' },
  ndx:   { symbol: 'QQQ',  label: 'Nasdaq 100' },
  vix:   { symbol: 'VIXY', label: 'VIX' },
  us10y: { symbol: 'TLT',  label: 'US 10Y' },
  dxy:   { symbol: 'UUP',  label: 'DXY' },
};

interface FinnhubQuote {
  /** Current price */
  c: number;
  /** Change ($) */
  d: number | null;
  /** Percent change */
  dp: number | null;
  /** High price of the day */
  h: number;
  /** Low price of the day */
  l: number;
  /** Open price of the day */
  o: number;
  /** Previous close price */
  pc: number;
  /** Timestamp */
  t: number;
}

async function fetchQuote(symbol: string): Promise<FinnhubQuote> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Finnhub ${symbol}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function GET() {
  try {
    if (!FINNHUB_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'FINNHUB_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Fetch all quotes in parallel
    const entries = Object.entries(SYMBOL_MAP);
    const quotes = await Promise.all(
      entries.map(([, { symbol }]) => fetchQuote(symbol))
    );

    // Build the response in the same shape the dashboard expects
    const data: Record<string, any> = {};
    entries.forEach(([key, { symbol }], idx) => {
      const q = quotes[idx];
      data[key] = {
        symbol,
        regularMarketPrice: q.c,
        regularMarketChange: q.d ?? 0,
        regularMarketChangePercent: q.dp ?? 0,
        regularMarketDayHigh: q.h,
        regularMarketDayLow: q.l,
        regularMarketOpen: q.o,
        regularMarketPreviousClose: q.pc,
        timestamp: q.t,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Failed to fetch market data from Finnhub:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
