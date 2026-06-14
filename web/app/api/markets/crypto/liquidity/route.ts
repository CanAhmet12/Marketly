import { NextResponse } from "next/server";

import {
  fetchBinanceSpot,
  parseCryptoSymbol,
  usdtPair,
} from "@/features/markets/crypto/lib/binance-spot";
import type {
  CryptoLiquidityResponse,
  LiquidityLevel,
  LiquidityTrade,
} from "@/features/markets/crypto/lib/crypto-liquidity-types";

type BinanceDepth = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};

type BinanceTrade = {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
};

function parseLimit(raw: string | null, fallback: number, max: number): number {
  const n = Number(raw ?? String(fallback));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(5, Math.floor(n)));
}

function buildLevels(rows: [string, string][], side: "bid" | "ask"): LiquidityLevel[] {
  const parsed = rows
    .map(([priceRaw, qtyRaw]) => {
      const price = Number(priceRaw);
      const qty = Number(qtyRaw);
      if (!Number.isFinite(price) || !Number.isFinite(qty) || price <= 0 || qty <= 0) return null;
      return { price, qty, notional: price * qty };
    })
    .filter((r): r is { price: number; qty: number; notional: number } => r != null);

  const sorted =
    side === "bid"
      ? parsed.sort((a, b) => b.price - a.price)
      : parsed.sort((a, b) => a.price - b.price);

  let cumQty = 0;
  let cumNotional = 0;

  return sorted.map((row) => {
    cumQty += row.qty;
    cumNotional += row.notional;
    return {
      price: row.price,
      qty: row.qty,
      notional: row.notional,
      cumQty,
      cumNotional,
    };
  });
}

function mapTrades(rows: BinanceTrade[]): LiquidityTrade[] {
  return rows
    .map((t) => {
      const price = Number(t.price);
      const qty = Number(t.qty);
      if (!Number.isFinite(price) || !Number.isFinite(qty) || price <= 0 || qty <= 0) return null;
      return {
        id: t.id,
        price,
        qty,
        notional: price * qty,
        time: t.time,
        side: t.isBuyerMaker ? ("sell" as const) : ("buy" as const),
      };
    })
    .filter((r): r is LiquidityTrade => r != null)
    .sort((a, b) => b.time - a.time);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = parseCryptoSymbol(searchParams.get("symbol"));
  const depthLimit = parseLimit(searchParams.get("depthLimit"), 50, 100);
  const tradeLimit = parseLimit(searchParams.get("tradeLimit"), 40, 100);

  if (!symbol) {
    return NextResponse.json({ error: "Geçersiz sembol" }, { status: 400 });
  }

  const pair = usdtPair(symbol);

  const [depth, tradesRaw] = await Promise.all([
    fetchBinanceSpot<BinanceDepth>("/api/v3/depth", {
      symbol: pair,
      limit: String(depthLimit),
    }),
    fetchBinanceSpot<BinanceTrade[]>("/api/v3/trades", {
      symbol: pair,
      limit: String(tradeLimit),
    }),
  ]);

  if (!depth?.bids?.length || !depth?.asks?.length) {
    return NextResponse.json({ error: "Likidite verisi bulunamadı" }, { status: 404 });
  }

  const bids = buildLevels(depth.bids, "bid");
  const asks = buildLevels(depth.asks, "ask");
  const trades = tradesRaw?.length ? mapTrades(tradesRaw) : [];

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const midPrice = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : 0;
  const spread = bestBid > 0 && bestAsk > 0 ? bestAsk - bestBid : 0;
  const spreadBps = midPrice > 0 ? (spread / midPrice) * 10_000 : 0;

  const payload: CryptoLiquidityResponse = {
    symbol,
    pair,
    source: "binance",
    updatedAt: Date.now(),
    bestBid,
    bestAsk,
    midPrice,
    spread,
    spreadBps,
    bidDepthQty: bids[bids.length - 1]?.cumQty ?? 0,
    askDepthQty: asks[asks.length - 1]?.cumQty ?? 0,
    bids,
    asks,
    trades,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
    },
  });
}
