export type CommodityKline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type YahooChartInterval =
  | "1m"
  | "2m"
  | "5m"
  | "15m"
  | "30m"
  | "60m"
  | "1h"
  | "1d"
  | "1wk"
  | "1mo";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export async function fetchYahooChart(
  ticker: string,
  interval: YahooChartInterval,
  range: string,
): Promise<CommodityKline[] | null> {
  const url = new URL(`${YAHOO_BASE}/${encodeURIComponent(ticker)}`);
  url.searchParams.set("interval", interval);
  url.searchParams.set("range", range);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6_000);
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Marketly/1.0)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: Array<number | null>;
              high?: Array<number | null>;
              low?: Array<number | null>;
              close?: Array<number | null>;
              volume?: Array<number | null>;
            }>;
          };
        }>;
      };
    };

    const result = json.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const quote = result?.indicators?.quote?.[0];
    if (!quote || timestamps.length === 0) return null;

    const klines: CommodityKline[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = quote.close?.[i];
      if (close == null || !Number.isFinite(close) || close <= 0) continue;
      klines.push({
        time: timestamps[i]!,
        open: quote.open?.[i] ?? close,
        high: quote.high?.[i] ?? close,
        low: quote.low?.[i] ?? close,
        close,
        volume: quote.volume?.[i] ?? 0,
      });
    }

    return klines.length > 0 ? klines : null;
  } catch {
    return null;
  }
}

export async function fetchYahooLastPrice(ticker: string): Promise<number | null> {
  const klines = await fetchYahooChart(ticker, "1h", "1d");
  if (!klines?.length) return null;
  return klines[klines.length - 1]!.close;
}

export type YahooQuote = {
  price: number;
  change24hPct: number;
};

export async function fetchYahooQuote(ticker: string): Promise<YahooQuote | null> {
  const klines = await fetchYahooChart(ticker, "1h", "5d");
  if (!klines || klines.length < 2) return null;

  const current = klines[klines.length - 1]!.close;
  const prev =
    klines.length >= 25 ? klines[klines.length - 25]!.close : klines[0]!.open;
  const change24hPct =
    prev > 0 ? ((current - prev) / prev) * 100 : 0;

  return { price: current, change24hPct };
}
