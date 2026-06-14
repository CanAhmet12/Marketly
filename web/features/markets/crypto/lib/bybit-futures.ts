import type { CryptoDerivativesResponse } from "@/features/markets/crypto/lib/crypto-derivatives-types";

const BYBIT_BASE = "https://api.bybit.com" as const;

type BybitEnvelope<T> = {
  retCode: number;
  retMsg: string;
  result: T;
};

type BybitTicker = {
  symbol: string;
  markPrice: string;
  fundingRate: string;
  openInterest: string;
  openInterestValue: string;
  nextFundingTime: string;
};

type BybitOpenInterestRow = {
  openInterest: string;
  timestamp: string;
};

type BybitAccountRatioRow = {
  buyRatio: string;
  sellRatio: string;
  timestamp: string;
};

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

async function fetchBybit<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`${BYBIT_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const body = (await res.json()) as BybitEnvelope<T>;
    if (body.retCode !== 0 || body.result == null) return null;
    return body.result;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBybitDerivatives(
  symbol: string,
  pair: string,
): Promise<CryptoDerivativesResponse | null> {
  const [tickerResult, oiResult, ratioResult] = await Promise.all([
    fetchBybit<{ list: BybitTicker[] }>("/v5/market/tickers", {
      category: "linear",
      symbol: pair,
    }),
    fetchBybit<{ list: BybitOpenInterestRow[] }>("/v5/market/open-interest", {
      category: "linear",
      symbol: pair,
      intervalTime: "1h",
      limit: "25",
    }),
    fetchBybit<{ list: BybitAccountRatioRow[] }>("/v5/market/account-ratio", {
      category: "linear",
      symbol: pair,
      period: "1h",
      limit: "1",
    }),
  ]);

  const ticker = tickerResult?.list?.[0];
  if (!ticker) return null;

  const markPrice = Number(ticker.markPrice);
  const fundingRate = Number(ticker.fundingRate);
  const oiQty = Number(ticker.openInterest);
  const oiUsd = Number(ticker.openInterestValue);
  const nextFundingTime = Number(ticker.nextFundingTime);

  if (!Number.isFinite(markPrice) || markPrice <= 0 || !Number.isFinite(oiQty) || oiQty <= 0) {
    return null;
  }

  let oiChange24hPct = 0;
  const oiRows = oiResult?.list ?? [];
  if (oiRows.length >= 2) {
    const sorted = [...oiRows].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    const oldest = Number(sorted[0]!.openInterest);
    const newest = Number(sorted[sorted.length - 1]!.openInterest);
    if (Number.isFinite(oldest) && Number.isFinite(newest) && oldest > 0) {
      oiChange24hPct = pctChange(newest, oldest);
    }
  }

  const ratio = ratioResult?.list?.[0];
  const buyRatio = ratio ? Number(ratio.buyRatio) : 0.5;
  const sellRatio = ratio ? Number(ratio.sellRatio) : 0.5;
  const longAccountPct = buyRatio * 100;
  const shortAccountPct = sellRatio * 100;
  const longShortRatio = sellRatio > 0 ? buyRatio / sellRatio : 1;

  const takerBuyPct24h = longAccountPct;
  const takerSellPct24h = shortAccountPct;
  const sellBias = takerSellPct24h - takerBuyPct24h;
  const liquidationBias: CryptoDerivativesResponse["liquidationBias"] =
    sellBias >= 4 ? "long" : sellBias <= -4 ? "short" : "neutral";

  return {
    symbol,
    pair,
    source: "bybit",
    updatedAt: Date.now(),
    markPrice,
    fundingRate,
    fundingRatePct: fundingRate * 100,
    fundingAnnualizedPct: fundingRate * 3 * 365 * 100,
    nextFundingTime: Number.isFinite(nextFundingTime) ? nextFundingTime : Date.now() + 8 * 3600_000,
    openInterestQty: oiQty,
    openInterestUsd: Number.isFinite(oiUsd) && oiUsd > 0 ? oiUsd : oiQty * markPrice,
    openInterestChange24hPct: oiChange24hPct,
    longAccountPct,
    shortAccountPct,
    longShortRatio,
    takerBuyPct24h,
    takerSellPct24h,
    takerBuyVol24h: 0,
    takerSellVol24h: 0,
    liquidationBias,
  };
}
