import {
  fetchBinanceFutures,
  fetchBinanceFuturesData,
} from "@/features/markets/crypto/lib/binance-futures";
import type { CryptoDerivativesResponse } from "@/features/markets/crypto/lib/crypto-derivatives-types";

type PremiumIndex = {
  symbol: string;
  markPrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
  time: number;
};

type OpenInterest = {
  symbol: string;
  openInterest: string;
  time: number;
};

type OpenInterestHistRow = {
  sumOpenInterest: string;
  sumOpenInterestValue: string;
  timestamp: number;
};

type TakerRatioRow = {
  buySellRatio: string;
  buyVol: string;
  sellVol: string;
  timestamp: number;
};

type LongShortAccountRow = {
  longAccount: string;
  shortAccount: string;
  longShortRatio: string;
  timestamp: number;
};

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export async function fetchBinanceDerivatives(
  symbol: string,
  pair: string,
): Promise<CryptoDerivativesResponse | null> {
  const [premium, openInterest, oiHist, takerRows, accountRatio] = await Promise.all([
    fetchBinanceFutures<PremiumIndex>("/fapi/v1/premiumIndex", { symbol: pair }),
    fetchBinanceFutures<OpenInterest>("/fapi/v1/openInterest", { symbol: pair }),
    fetchBinanceFuturesData<OpenInterestHistRow[]>("/openInterestHist", {
      symbol: pair,
      period: "1h",
      limit: "25",
    }),
    fetchBinanceFuturesData<TakerRatioRow[]>("/takerlongshortRatio", {
      symbol: pair,
      period: "1h",
      limit: "24",
    }),
    fetchBinanceFuturesData<LongShortAccountRow[]>("/globalLongShortAccountRatio", {
      symbol: pair,
      period: "1h",
      limit: "1",
    }),
  ]);

  if (!premium || !openInterest) return null;

  const markPrice = Number(premium.markPrice);
  const fundingRate = Number(premium.lastFundingRate);
  const oiQty = Number(openInterest.openInterest);

  if (!Number.isFinite(markPrice) || markPrice <= 0 || !Number.isFinite(oiQty) || oiQty <= 0) {
    return null;
  }

  const oiUsd = oiQty * markPrice;

  let oiChange24hPct = 0;
  const oiHistRows = oiHist ?? [];
  if (oiHistRows.length >= 2) {
    const sorted = [...oiHistRows].sort((a, b) => a.timestamp - b.timestamp);
    const oldest = Number(sorted[0]!.sumOpenInterestValue);
    const newest = Number(sorted[sorted.length - 1]!.sumOpenInterestValue);
    if (Number.isFinite(oldest) && Number.isFinite(newest) && oldest > 0) {
      oiChange24hPct = pctChange(newest, oldest);
    }
  }

  let takerBuyVol24h = 0;
  let takerSellVol24h = 0;
  for (const row of takerRows ?? []) {
    const buy = Number(row.buyVol);
    const sell = Number(row.sellVol);
    if (Number.isFinite(buy) && buy > 0) takerBuyVol24h += buy;
    if (Number.isFinite(sell) && sell > 0) takerSellVol24h += sell;
  }

  const takerTotal = takerBuyVol24h + takerSellVol24h;
  const takerBuyPct24h = takerTotal > 0 ? (takerBuyVol24h / takerTotal) * 100 : 50;
  const takerSellPct24h = takerTotal > 0 ? (takerSellVol24h / takerTotal) * 100 : 50;

  const account = accountRatio?.[0];
  const longAccountPct = account ? Number(account.longAccount) * 100 : 50;
  const shortAccountPct = account ? Number(account.shortAccount) * 100 : 50;
  const longShortRatio = account ? Number(account.longShortRatio) : 1;

  const sellBias = takerSellPct24h - takerBuyPct24h;
  const liquidationBias: CryptoDerivativesResponse["liquidationBias"] =
    sellBias >= 4 ? "long" : sellBias <= -4 ? "short" : "neutral";

  return {
    symbol,
    pair,
    source: "binance",
    updatedAt: Date.now(),
    markPrice,
    fundingRate,
    fundingRatePct: fundingRate * 100,
    fundingAnnualizedPct: fundingRate * 3 * 365 * 100,
    nextFundingTime: premium.nextFundingTime,
    openInterestQty: oiQty,
    openInterestUsd: oiUsd,
    openInterestChange24hPct: oiChange24hPct,
    longAccountPct,
    shortAccountPct,
    longShortRatio,
    takerBuyPct24h,
    takerSellPct24h,
    takerBuyVol24h,
    takerSellVol24h,
    liquidationBias,
  };
}
