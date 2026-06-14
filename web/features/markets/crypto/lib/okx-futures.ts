import type { CryptoDerivativesResponse } from "@/features/markets/crypto/lib/crypto-derivatives-types";

const OKX_BASE = "https://www.okx.com" as const;
const FETCH_TIMEOUT_MS = 5_000;

type OkxEnvelope<T> = {
  code: string;
  msg: string;
  data: T;
};

async function fetchOkx<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`${OKX_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const body = (await res.json()) as OkxEnvelope<T>;
    if (body.code !== "0" || body.data == null) return null;
    return body.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function okxInstId(symbol: string): string {
  return `${symbol.trim().toUpperCase()}-USDT-SWAP`;
}

export async function fetchOkxDerivatives(
  symbol: string,
  pair: string,
): Promise<CryptoDerivativesResponse | null> {
  const instId = okxInstId(symbol);

  const [fundingRows, oiRows, markRows] = await Promise.all([
    fetchOkx<{ fundingRate: string; nextFundingTime: string }[]>("/api/v5/public/funding-rate", {
      instId,
    }),
    fetchOkx<{ oi: string; oiUsd: string }[]>("/api/v5/public/open-interest", {
      instType: "SWAP",
      instId,
    }),
    fetchOkx<{ markPx: string }[]>("/api/v5/public/mark-price", {
      instType: "SWAP",
      instId,
    }),
  ]);

  const funding = fundingRows?.[0];
  const oi = oiRows?.[0];
  const mark = markRows?.[0];
  if (!funding || !oi || !mark) return null;

  const markPrice = Number(mark.markPx);
  const fundingRate = Number(funding.fundingRate);
  const oiQty = Number(oi.oi);
  const oiUsd = Number(oi.oiUsd);
  const nextFundingTime = Number(funding.nextFundingTime);

  if (!Number.isFinite(markPrice) || markPrice <= 0 || !Number.isFinite(oiQty) || oiQty <= 0) {
    return null;
  }

  return {
    symbol,
    pair,
    source: "okx",
    updatedAt: Date.now(),
    markPrice,
    fundingRate,
    fundingRatePct: fundingRate * 100,
    fundingAnnualizedPct: fundingRate * 3 * 365 * 100,
    nextFundingTime: Number.isFinite(nextFundingTime) ? nextFundingTime : Date.now() + 8 * 3600_000,
    openInterestQty: oiQty,
    openInterestUsd: Number.isFinite(oiUsd) && oiUsd > 0 ? oiUsd : oiQty * markPrice,
    openInterestChange24hPct: 0,
    longAccountPct: 50,
    shortAccountPct: 50,
    longShortRatio: 1,
    takerBuyPct24h: 50,
    takerSellPct24h: 50,
    takerBuyVol24h: 0,
    takerSellVol24h: 0,
    liquidationBias: "neutral",
  };
}
