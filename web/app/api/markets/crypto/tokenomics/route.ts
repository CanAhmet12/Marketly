import { NextResponse } from "next/server";

import { parseCryptoSymbol } from "@/features/markets/crypto/lib/binance-spot";
import { resolveCoinGeckoId } from "@/features/markets/crypto/lib/coingecko-ids";
import type {
  CryptoTokenomicsResponse,
  TokenomicsSupplySlice,
  TokenomicsUnlockInsight,
} from "@/features/markets/crypto/lib/crypto-tokenomics-types";

type CoinGeckoCoin = {
  id: string;
  name: string;
  market_data?: {
    circulating_supply?: number | null;
    total_supply?: number | null;
    max_supply?: number | null;
    market_cap?: { usd?: number | null };
    fully_diluted_valuation?: { usd?: number | null };
  };
};

type CoinGeckoMarketChart = {
  prices?: [number, number][];
  market_caps?: [number, number][];
};

function pctOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return (part / whole) * 100;
}

function computeSupplyGrowth30d(chart: CoinGeckoMarketChart | null): number | null {
  const prices = chart?.prices ?? [];
  const caps = chart?.market_caps ?? [];
  if (prices.length < 10 || caps.length < 10) return null;

  const nowIdx = caps.length - 1;
  const pastIdx = Math.max(0, caps.length - 31);
  const priceNow = prices[nowIdx]?.[1];
  const pricePast = prices[pastIdx]?.[1];
  const capNow = caps[nowIdx]?.[1];
  const capPast = caps[pastIdx]?.[1];

  if (!priceNow || !pricePast || !capNow || !capPast || priceNow <= 0 || pricePast <= 0) {
    return null;
  }

  const supplyNow = capNow / priceNow;
  const supplyPast = capPast / pricePast;
  if (supplyPast <= 0) return null;

  return ((supplyNow - supplyPast) / supplyPast) * 100;
}

function computeUnlockPressure(
  lockedPct: number,
  supplyGrowth30dPct: number | null,
  mcFdvRatio: number,
): CryptoTokenomicsResponse["unlockPressure"] {
  let score = 0;
  if (lockedPct >= 40) score += 2;
  else if (lockedPct >= 20) score += 1;

  if (supplyGrowth30dPct != null && supplyGrowth30dPct > 3) score += 2;
  else if (supplyGrowth30dPct != null && supplyGrowth30dPct > 1) score += 1;

  if (mcFdvRatio > 0 && mcFdvRatio < 0.5) score += 2;
  else if (mcFdvRatio > 0 && mcFdvRatio < 0.75) score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function buildSlices(
  circulatingQty: number,
  totalQty: number | null,
  maxQty: number | null,
  lockedQty: number,
): TokenomicsSupplySlice[] {
  const base = maxQty ?? totalQty ?? circulatingQty;
  if (base <= 0) return [];

  const slices: TokenomicsSupplySlice[] = [
    {
      key: "circulating",
      label: "Dolaşımda",
      qty: circulatingQty,
      pct: pctOf(circulatingQty, base),
    },
  ];

  if (lockedQty > 0) {
    slices.push({
      key: "locked",
      label: "Kilitli",
      qty: lockedQty,
      pct: pctOf(lockedQty, base),
    });
  }

  const remainingQty = Math.max(0, base - circulatingQty - lockedQty);
  if (remainingQty > 0.0001) {
    slices.push({
      key: "remaining",
      label: "Kalan",
      qty: remainingQty,
      pct: pctOf(remainingQty, base),
    });
  }

  return slices;
}

function buildInsights(payload: {
  lockedPct: number;
  supplyGrowth30dPct: number | null;
  mcFdvRatio: number;
  circulatingQty: number;
  maxQty: number | null;
}): TokenomicsUnlockInsight[] {
  const insights: TokenomicsUnlockInsight[] = [];

  if (payload.lockedPct >= 15) {
    insights.push({
      id: "locked-supply",
      title: "Kilitli arz",
      detail: "Henüz piyasaya çıkmamış tokenlar vesting ile baskı oluşturabilir.",
      severity: payload.lockedPct >= 40 ? "high" : payload.lockedPct >= 25 ? "medium" : "low",
      metricLabel: "Kilitli",
      metricValue: `${payload.lockedPct.toFixed(1)}%`,
    });
  }

  if (payload.supplyGrowth30dPct != null && Math.abs(payload.supplyGrowth30dPct) >= 0.5) {
    insights.push({
      id: "supply-growth",
      title: "Arz genişlemesi",
      detail: "Son 30 günde dolaşımdaki arz değişimi unlock/enflasyon sinyali verir.",
      severity:
        payload.supplyGrowth30dPct > 5
          ? "high"
          : payload.supplyGrowth30dPct > 2
            ? "medium"
            : "low",
      metricLabel: "30g",
      metricValue: `${payload.supplyGrowth30dPct > 0 ? "+" : ""}${payload.supplyGrowth30dPct.toFixed(2)}%`,
    });
  }

  if (payload.mcFdvRatio > 0 && payload.mcFdvRatio < 0.85) {
    insights.push({
      id: "fdv-premium",
      title: "FDV primi",
      detail: "Tam seyreltilmiş değerleme mevcut piyasa değerinin üzerinde.",
      severity: payload.mcFdvRatio < 0.45 ? "high" : "medium",
      metricLabel: "MC/FDV",
      metricValue: `${(payload.mcFdvRatio * 100).toFixed(0)}%`,
    });
  }

  if (payload.maxQty && payload.maxQty > 0 && payload.circulatingQty / payload.maxQty >= 0.8) {
    insights.push({
      id: "near-max",
      title: "Tavan arza yakın",
      detail: "Dolaşımdaki arz maksimum arza yaklaşıyor; yeni mint baskısı sınırlı.",
      severity: payload.circulatingQty / payload.maxQty >= 0.95 ? "medium" : "low",
      metricLabel: "Dolaşım",
      metricValue: `${((payload.circulatingQty / payload.maxQty) * 100).toFixed(0)}%`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "stable",
      title: "Dengeli arz profili",
      detail: "Kilit ve FDV metrikleri şu an düşük baskı bandında görünüyor.",
      severity: "low",
      metricLabel: "Baskı",
      metricValue: "Düşük",
    });
  }

  return insights.slice(0, 4);
}

async function fetchCoinGeckoCoin(coinId: string): Promise<CoinGeckoCoin | null> {
  const url = new URL(`https://api.coingecko.com/api/v3/coins/${coinId}`);
  url.searchParams.set("localization", "false");
  url.searchParams.set("tickers", "false");
  url.searchParams.set("market_data", "true");
  url.searchParams.set("community_data", "false");
  url.searchParams.set("developer_data", "false");
  url.searchParams.set("sparkline", "false");

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CoinGeckoCoin;
  } catch {
    return null;
  }
}

async function fetchCoinGeckoMarketChart(coinId: string): Promise<CoinGeckoMarketChart | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CoinGeckoMarketChart;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCryptoSymbol(searchParams.get("symbol"));

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const coinId = await resolveCoinGeckoId(symbol);
  if (!coinId) {
    return NextResponse.json({ error: "CoinGecko eşleşmesi bulunamadı" }, { status: 404 });
  }

  const [coin, chart] = await Promise.all([
    fetchCoinGeckoCoin(coinId),
    fetchCoinGeckoMarketChart(coinId),
  ]);

  if (!coin?.market_data) {
    return NextResponse.json({ error: "Tokenomics verisi bulunamadı" }, { status: 404 });
  }

  const circulatingQty = Number(coin.market_data.circulating_supply ?? 0);
  const totalQtyRaw = coin.market_data.total_supply;
  const maxQtyRaw = coin.market_data.max_supply;
  const totalQty = totalQtyRaw != null && Number.isFinite(Number(totalQtyRaw)) ? Number(totalQtyRaw) : null;
  const maxQty = maxQtyRaw != null && Number.isFinite(Number(maxQtyRaw)) ? Number(maxQtyRaw) : null;

  if (!Number.isFinite(circulatingQty) || circulatingQty <= 0) {
    return NextResponse.json({ error: "Arz verisi geçersiz" }, { status: 502 });
  }

  const baseQty = maxQty ?? totalQty ?? circulatingQty;
  const lockedQty = totalQty && totalQty > circulatingQty ? totalQty - circulatingQty : 0;
  const lockedPct = pctOf(lockedQty, baseQty);
  const circulatingPct = pctOf(circulatingQty, baseQty);

  const marketCapUsd = Number(coin.market_data.market_cap?.usd ?? 0);
  const fdvUsd = Number(coin.market_data.fully_diluted_valuation?.usd ?? 0);
  const mcFdvRatio = fdvUsd > 0 ? marketCapUsd / fdvUsd : 1;

  const supplyGrowth30dPct = computeSupplyGrowth30d(chart);
  const unlockPressure = computeUnlockPressure(lockedPct, supplyGrowth30dPct, mcFdvRatio);

  const payload: CryptoTokenomicsResponse = {
    symbol,
    coinId,
    name: coin.name,
    source: "coingecko",
    updatedAt: Date.now(),
    circulatingQty,
    totalQty,
    maxQty,
    lockedQty,
    lockedPct,
    circulatingPct,
    marketCapUsd,
    fdvUsd,
    mcFdvRatio,
    supplyGrowth30dPct,
    unlockPressure,
    slices: buildSlices(circulatingQty, totalQty, maxQty, lockedQty),
    insights: buildInsights({
      lockedPct,
      supplyGrowth30dPct,
      mcFdvRatio,
      circulatingQty,
      maxQty,
    }),
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
