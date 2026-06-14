"use client";

import { useEffect, useRef, useState } from "react";

import {
  ORDER_BOOK_LEVELS,
  type OrderBookLevel,
  type OrderBookSnapshot,
} from "@/features/markets/crypto/symbol-detail/lib/order-book-types";

type RawLevel = { price: number; qty: number };

const THROTTLE_MS = 120;
const RECONNECT_MS = 2500;
const REST_POLL_MS = 3_000;

function parseRows(rows: unknown, limit = 0): RawLevel[] {
  if (!Array.isArray(rows)) return [];
  const out: RawLevel[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const price = Number(row[0]);
    const qty = Number(row[1]);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || price <= 0) continue;
    out.push({ price, qty });
    if (limit > 0 && out.length >= limit) break;
  }
  return out;
}

type BookMaps = { bids: Map<number, number>; asks: Map<number, number> };

function emptyBookMaps(): BookMaps {
  return { bids: new Map(), asks: new Map() };
}

function mergeBookSide(map: Map<number, number>, rows: RawLevel[]) {
  for (const { price, qty } of rows) {
    if (qty <= 0) map.delete(price);
    else map.set(price, qty);
  }
}

function bookMapsToRaw(maps: BookMaps, limit: number): { bids: RawLevel[]; asks: RawLevel[] } {
  const toLevels = (map: Map<number, number>, side: "bid" | "ask"): RawLevel[] => {
    const rows = Array.from(map.entries()).map(([price, qty]) => ({ price, qty }));
    const sorted =
      side === "bid"
        ? rows.sort((a, b) => b.price - a.price)
        : rows.sort((a, b) => a.price - b.price);
    return sorted.slice(0, limit);
  };

  return {
    bids: toLevels(maps.bids, "bid"),
    asks: toLevels(maps.asks, "ask"),
  };
}

function parseDepthMessage(msg: Record<string, unknown>): { bids: RawLevel[]; asks: RawLevel[] } {
  const bids = parseRows(msg.b ?? msg.bids, 20);
  const asks = parseRows(msg.a ?? msg.asks, 20);
  return { bids, asks };
}

function enrichLevels(levels: RawLevel[], side: "bid" | "ask"): OrderBookLevel[] {
  if (levels.length === 0) return [];

  const sorted =
    side === "bid"
      ? [...levels].sort((a, b) => b.price - a.price)
      : [...levels].sort((a, b) => a.price - b.price);

  const trimmed = sorted.slice(0, ORDER_BOOK_LEVELS);
  let cumulative = 0;
  const withCumulative = trimmed.map((level) => {
    cumulative += level.qty;
    return { ...level, total: cumulative };
  });
  const maxCumulative = Math.max(...withCumulative.map((l) => l.total), 0.000001);

  return withCumulative.map((level) => ({
    price: level.price,
    qty: level.qty,
    total: level.total,
    depthPct: (level.total / maxCumulative) * 100,
  }));
}

function buildSnapshot(
  bidsRaw: RawLevel[],
  asksRaw: RawLevel[],
  source: "binance" | "bybit" | "rest",
  connected: boolean,
): OrderBookSnapshot {
  const bids = enrichLevels(bidsRaw, "bid");
  const asksAsc = enrichLevels(asksRaw, "ask");
  const asks = [...asksAsc].reverse();

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asksAsc[0]?.price ?? 0;
  const mid = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : 0;
  const spread = bestBid > 0 && bestAsk > 0 ? bestAsk - bestBid : 0;
  const spreadPct = mid > 0 ? (spread / mid) * 100 : 0;

  return {
    bids,
    asks,
    bestBid,
    bestAsk,
    spread,
    spreadPct,
    mid,
    source: source === "rest" ? "binance" : source,
    connected,
  };
}

const EMPTY_SNAPSHOT: OrderBookSnapshot = {
  bids: [],
  asks: [],
  bestBid: 0,
  bestAsk: 0,
  spread: 0,
  spreadPct: 0,
  mid: 0,
  source: "binance",
  connected: false,
};

async function fetchRestOrderBook(symbol: string): Promise<OrderBookSnapshot | null> {
  try {
    const params = new URLSearchParams({
      symbol,
      depthLimit: String(ORDER_BOOK_LEVELS),
      tradeLimit: "1",
    });
    const res = await fetch(`/api/markets/crypto/liquidity?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      bids?: { price: number; qty: number }[];
      asks?: { price: number; qty: number }[];
    };

    const bids = (data.bids ?? []).slice(0, ORDER_BOOK_LEVELS).map((row) => ({
      price: row.price,
      qty: row.qty,
    }));
    const asks = (data.asks ?? []).slice(0, ORDER_BOOK_LEVELS).map((row) => ({
      price: row.price,
      qty: row.qty,
    }));

    if (bids.length === 0 && asks.length === 0) return null;
    return buildSnapshot(bids, asks, "rest", true);
  } catch {
    return null;
  }
}

export function useOrderBookStream(symbol: string) {
  const sym = symbol.trim().toUpperCase();
  const pair = `${sym}USDT`;
  const [snapshot, setSnapshot] = useState<OrderBookSnapshot>(EMPTY_SNAPSHOT);
  const [status, setStatus] = useState<"connecting" | "live" | "unavailable">("connecting");

  const pendingRef = useRef<{ bids: RawLevel[]; asks: RawLevel[]; source: "binance" | "bybit" } | null>(
    null,
  );
  const bybitBookRef = useRef<BookMaps>(emptyBookMaps());
  const flushTimerRef = useRef<number | null>(null);
  const firstUpdateRef = useRef(true);
  const wsLiveRef = useRef(false);

  useEffect(() => {
    if (sym.length < 2) {
      setStatus("unavailable");
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }

    let active = true;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let restTimer: number | null = null;
    let triedBybit = false;
    firstUpdateRef.current = true;
    wsLiveRef.current = false;
    bybitBookRef.current = emptyBookMaps();

    const applySnapshot = (next: OrderBookSnapshot, live: boolean) => {
      if (!active) return;
      setSnapshot(next);
      setStatus(live ? "live" : "connecting");
    };

    const flushPending = () => {
      flushTimerRef.current = null;
      const pending = pendingRef.current;
      if (!pending || !active) return;
      pendingRef.current = null;
      wsLiveRef.current = true;
      applySnapshot(buildSnapshot(pending.bids, pending.asks, pending.source, true), true);
    };

    const queueUpdate = (bids: RawLevel[], asks: RawLevel[], src: "binance" | "bybit") => {
      pendingRef.current = { bids, asks, source: src };
      if (firstUpdateRef.current) {
        firstUpdateRef.current = false;
        flushPending();
        return;
      }
      if (flushTimerRef.current != null) return;
      flushTimerRef.current = window.setTimeout(flushPending, THROTTLE_MS);
    };

    const pollRest = async () => {
      if (!active || wsLiveRef.current) return;
      const rest = await fetchRestOrderBook(sym);
      if (rest && active && !wsLiveRef.current) {
        applySnapshot(rest, true);
      }
    };

    const scheduleReconnect = () => {
      if (!active || reconnectTimer != null) return;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, RECONNECT_MS);
    };

    const connectBinance = () => {
      const url = `wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@depth20@100ms`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        if (!active) return;
        if (!wsLiveRef.current) setStatus("connecting");
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>;
          const { bids, asks } = parseDepthMessage(msg);
          if (bids.length === 0 && asks.length === 0) return;
          queueUpdate(bids, asks, "binance");
        } catch {
          /* ignore malformed frame */
        }
      };

      ws.onerror = () => {
        if (!active) return;
        ws?.close();
      };

      ws.onclose = () => {
        if (!active) return;
        ws = null;
        if (!triedBybit) {
          triedBybit = true;
          connectBybit();
          return;
        }
        if (!wsLiveRef.current) {
          void pollRest();
        }
        scheduleReconnect();
      };
    };

    const connectBybit = () => {
      bybitBookRef.current = emptyBookMaps();
      ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");

      ws.onopen = () => {
        if (!active) return;
        ws?.send(JSON.stringify({ op: "subscribe", args: [`orderbook.50.${pair}`] }));
        if (!wsLiveRef.current) setStatus("connecting");
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const msg = JSON.parse(event.data as string) as {
            topic?: string;
            type?: string;
            success?: boolean;
            data?: Record<string, unknown>;
          };
          if (msg.success === true) return;
          if (!msg.topic?.startsWith("orderbook") || !msg.data) return;

          if (msg.type === "snapshot") {
            bybitBookRef.current = emptyBookMaps();
          }

          const bidRows = parseRows(msg.data.b ?? msg.data.bids);
          const askRows = parseRows(msg.data.a ?? msg.data.asks);
          if (bidRows.length === 0 && askRows.length === 0) return;

          mergeBookSide(bybitBookRef.current.bids, bidRows);
          mergeBookSide(bybitBookRef.current.asks, askRows);

          const { bids, asks } = bookMapsToRaw(bybitBookRef.current, 50);
          if (bids.length === 0 && asks.length === 0) return;
          queueUpdate(bids, asks, "bybit");
        } catch {
          /* ignore malformed frame */
        }
      };

      ws.onerror = () => {
        if (!active) return;
        ws?.close();
      };

      ws.onclose = () => {
        if (!active) return;
        ws = null;
        if (!wsLiveRef.current) {
          void pollRest();
        }
        scheduleReconnect();
      };
    };

    const connect = () => {
      triedBybit = false;
      firstUpdateRef.current = true;
      wsLiveRef.current = false;
      bybitBookRef.current = emptyBookMaps();
      connectBinance();
    };

    void pollRest();
    restTimer = window.setInterval(() => {
      if (!wsLiveRef.current) void pollRest();
    }, REST_POLL_MS);

    connect();

    return () => {
      active = false;
      if (reconnectTimer != null) window.clearTimeout(reconnectTimer);
      if (restTimer != null) window.clearInterval(restTimer);
      if (flushTimerRef.current != null) window.clearTimeout(flushTimerRef.current);
      pendingRef.current = null;
      ws?.close();
    };
  }, [pair, sym]);

  return { snapshot, status, pair };
}
