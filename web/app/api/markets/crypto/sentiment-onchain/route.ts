import { NextResponse } from "next/server";

import { parseCryptoSymbol } from "@/features/markets/crypto/lib/binance-spot";
import { resolveCoinGeckoId } from "@/features/markets/crypto/lib/coingecko-ids";
import type { CryptoSentimentOnchainResponse, FearGreedPoint } from "@/features/markets/crypto/lib/crypto-sentiment-onchain-types";
import { fearGreedLabelTr } from "@/features/markets/crypto/lib/fear-greed";

type AlternativeMeRow = {
  value: string;
  value_classification: string;
  timestamp: string;
};

type AlternativeMeResponse = {
  data?: AlternativeMeRow[];
};

type CoinGeckoDetailPlatform = {
  contract_address?: string;
  geckoterminal_url?: string;
};

type CoinGeckoCoin = {
  market_data?: {
    market_cap_rank?: number | null;
    total_value_locked?: { usd?: number | null } | number | null;
  };
  detail_platforms?: Record<string, CoinGeckoDetailPlatform>;
};

type GeckoTerminalHolders = {
  count?: number;
  distribution_percentage?: {
    top_10?: string;
    "11_30"?: string;
    "31_50"?: string;
    rest?: string;
  };
};

type GeckoTerminalInfo = {
  data?: {
    attributes?: {
      holders?: GeckoTerminalHolders;
    };
  };
};

const NATIVE_ONCHAIN_FALLBACK: Record<string, { network: string; address: string; platform: string }> = {
  BTC: { network: "eth", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", platform: "WBTC · Ethereum" },
  ETH: { network: "eth", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", platform: "WETH · Ethereum" },
};

const PLATFORM_PRIORITY = [
  "ethereum",
  "solana",
  "base",
  "arbitrum-one",
  "binance-smart-chain",
  "polygon-pos",
  "avalanche",
  "optimistic-ethereum",
];

function mapFearGreedRow(row: AlternativeMeRow): FearGreedPoint {
  const value = Number(row.value);
  return {
    value: Number.isFinite(value) ? value : 0,
    label: row.value_classification,
    labelTr: fearGreedLabelTr(Number.isFinite(value) ? value : 50),
    timestamp: Number(row.timestamp) * 1000,
  };
}

async function fetchFearGreedHistory(limit = 7): Promise<FearGreedPoint[]> {
  try {
    const res = await fetch(`https://api.alternative.me/fng/?limit=${limit}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as AlternativeMeResponse;
    return (data.data ?? []).map(mapFearGreedRow).reverse();
  } catch {
    return [];
  }
}

function resolveOnchainTarget(
  symbol: string,
  detailPlatforms?: Record<string, CoinGeckoDetailPlatform>,
): { network: string; address: string; platform: string } | null {
  const fallback = NATIVE_ONCHAIN_FALLBACK[symbol];
  if (fallback) return fallback;

  if (!detailPlatforms) return null;

  const tryPlatform = (platform: string) => {
    const row = detailPlatforms[platform];
    if (!row?.contract_address || !row.geckoterminal_url) return null;
    const match = row.geckoterminal_url.match(/geckoterminal\.com\/([^/]+)\/tokens\/([^/?#]+)/i);
    if (!match) return null;
    return {
      network: match[1]!,
      address: decodeURIComponent(match[2]!),
      platform: `${platform} · ${match[1]}`,
    };
  };

  for (const platform of PLATFORM_PRIORITY) {
    const hit = tryPlatform(platform);
    if (hit) return hit;
  }

  for (const platform of Object.keys(detailPlatforms)) {
    const hit = tryPlatform(platform);
    if (hit) return hit;
  }

  return null;
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

async function fetchGeckoTerminalHolders(
  network: string,
  address: string,
): Promise<GeckoTerminalHolders | null> {
  const url = `https://api.geckoterminal.com/api/v2/networks/${encodeURIComponent(network)}/tokens/${encodeURIComponent(address)}/info`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as GeckoTerminalInfo;
    return data.data?.attributes?.holders ?? null;
  } catch {
    return null;
  }
}

function concentrationFromTop10(top10Pct: number): "low" | "medium" | "high" {
  if (top10Pct >= 60) return "high";
  if (top10Pct >= 45) return "medium";
  return "low";
}

function readTvlUsd(raw: CoinGeckoCoin["market_data"]): number | null {
  const tvl = raw?.total_value_locked;
  if (tvl == null) return null;
  if (typeof tvl === "number") return tvl > 0 ? tvl : null;
  const usd = Number(tvl.usd ?? 0);
  return usd > 0 ? usd : null;
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

  const [history, coin] = await Promise.all([fetchFearGreedHistory(7), fetchCoinGeckoCoin(coinId)]);

  if (history.length === 0) {
    return NextResponse.json({ error: "Fear & Greed verisi alınamadı" }, { status: 502 });
  }

  const current = history[history.length - 1]!;
  const first = history[0];
  const change7d = first ? current.value - first.value : null;

  const onchainTarget = resolveOnchainTarget(symbol, coin?.detail_platforms);
  let holders: GeckoTerminalHolders | null = null;

  if (onchainTarget) {
    holders = await fetchGeckoTerminalHolders(onchainTarget.network, onchainTarget.address);
  }

  const distribution = holders?.distribution_percentage;
  const top10Pct = Number(distribution?.top_10 ?? 0);
  const onchainAvailable = Boolean(holders?.count && holders.count > 0);

  const payload: CryptoSentimentOnchainResponse = {
    symbol,
    coinId,
    updatedAt: Date.now(),
    fearGreed: {
      current,
      history,
      change7d,
    },
    onchain: {
      available: onchainAvailable,
      network: onchainTarget?.network ?? null,
      platform: onchainTarget?.platform ?? null,
      holderCount: holders?.count ?? null,
      distribution: onchainAvailable
        ? {
            top10Pct,
            mid11_30Pct: Number(distribution?.["11_30"] ?? 0),
            mid31_50Pct: Number(distribution?.["31_50"] ?? 0),
            restPct: Number(distribution?.rest ?? 0),
          }
        : null,
      concentration: concentrationFromTop10(top10Pct),
      marketCapRank: coin?.market_data?.market_cap_rank ?? null,
      tvlUsd: readTvlUsd(coin?.market_data),
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
