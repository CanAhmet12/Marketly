import { NextResponse } from "next/server";

import { parseCryptoSymbol } from "@/features/markets/crypto/lib/binance-spot";
import { resolveCoinGeckoId } from "@/features/markets/crypto/lib/coingecko-ids";
import type {
  CryptoMarketsComparisonResponse,
  MarketsComparisonRow,
  MarketsComparisonTrust,
} from "@/features/markets/crypto/lib/crypto-markets-comparison-types";

type CoinGeckoTicker = {
  base: string;
  target: string;
  market: { name: string; identifier: string };
  last: number;
  converted_volume?: { usd?: number | null };
  bid_ask_spread_percentage?: number | null;
  trust_score?: string | null;
  is_anomaly?: boolean;
  is_stale?: boolean;
  trade_url?: string | null;
};

type CoinGeckoTickersResponse = {
  tickers?: CoinGeckoTicker[];
};

const PREFERRED_QUOTES = new Set(["USDT", "USDC", "USD", "FDUSD", "BUSD"]);

function quoteScore(target: string): number {
  const t = target.trim().toUpperCase();
  if (t === "USDT") return 0;
  if (t === "USDC") return 1;
  if (t === "USD") return 2;
  if (t === "FDUSD") return 3;
  if (t === "BUSD") return 4;
  return 10;
}

function normalizeTrust(raw: string | null | undefined): MarketsComparisonTrust {
  if (raw === "green") return "green";
  if (raw === "yellow") return "yellow";
  if (raw === "red") return "red";
  return "unknown";
}

function pickBestPerExchange(tickers: CoinGeckoTicker[]): CoinGeckoTicker[] {
  const byExchange = new Map<string, CoinGeckoTicker>();

  for (const ticker of tickers) {
    if (ticker.is_anomaly || ticker.is_stale) continue;
    if (!PREFERRED_QUOTES.has(ticker.target.trim().toUpperCase())) continue;
    if (!Number.isFinite(ticker.last) || ticker.last <= 0) continue;

    const id = ticker.market.identifier;
    const existing = byExchange.get(id);
    if (!existing) {
      byExchange.set(id, ticker);
      continue;
    }

    const volNew = Number(ticker.converted_volume?.usd ?? 0);
    const volOld = Number(existing.converted_volume?.usd ?? 0);
    if (volNew > volOld) {
      byExchange.set(id, ticker);
    } else if (volNew === volOld && quoteScore(ticker.target) < quoteScore(existing.target)) {
      byExchange.set(id, ticker);
    }
  }

  return [...byExchange.values()].sort(
    (a, b) => Number(b.converted_volume?.usd ?? 0) - Number(a.converted_volume?.usd ?? 0),
  );
}

function buildRows(tickers: CoinGeckoTicker[]): MarketsComparisonRow[] {
  const picked = pickBestPerExchange(tickers).slice(0, 14);
  if (picked.length === 0) return [];

  const prices = picked.map((t) => t.last);
  const medianPrice = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)] ?? prices[0]!;
  const bestPrice = Math.min(...prices);

  return picked.map((ticker, index) => {
    const priceDeltaPct =
      medianPrice > 0 ? ((ticker.last - medianPrice) / medianPrice) * 100 : 0;

    return {
      rank: index + 1,
      exchangeId: ticker.market.identifier,
      exchangeName: ticker.market.name,
      pair: `${ticker.base}/${ticker.target}`,
      price: ticker.last,
      volumeUsd: Number(ticker.converted_volume?.usd ?? 0),
      spreadPct: Number(ticker.bid_ask_spread_percentage ?? 0),
      trustScore: normalizeTrust(ticker.trust_score),
      priceDeltaPct,
      tradeUrl: ticker.trade_url ?? null,
      isTopVolume: index === 0,
      isBestPrice: ticker.last === bestPrice,
    };
  });
}

async function fetchCoinGeckoTickers(coinId: string): Promise<CoinGeckoTicker[]> {
  const url = new URL(`https://api.coingecko.com/api/v3/coins/${coinId}/tickers`);
  url.searchParams.set("order", "volume_desc");
  url.searchParams.set("page", "1");
  url.searchParams.set("include_exchange_logo", "false");

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as CoinGeckoTickersResponse;
    return data.tickers ?? [];
  } catch {
    return [];
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

  const tickers = await fetchCoinGeckoTickers(coinId);
  const rows = buildRows(tickers);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Borsa karşılaştırması bulunamadı" }, { status: 404 });
  }

  const bestRow = rows.find((row) => row.isBestPrice) ?? rows[0]!;
  const topVolumeRow = rows.find((row) => row.isTopVolume) ?? rows[0]!;
  const avgSpreadPct = rows.reduce((sum, row) => sum + row.spreadPct, 0) / rows.length;

  const payload: CryptoMarketsComparisonResponse = {
    symbol,
    coinId,
    source: "coingecko",
    updatedAt: Date.now(),
    exchangeCount: rows.length,
    bestPrice: bestRow.price,
    bestPriceExchange: bestRow.exchangeName,
    topVolumeExchange: topVolumeRow.exchangeName,
    avgSpreadPct,
    rows,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
