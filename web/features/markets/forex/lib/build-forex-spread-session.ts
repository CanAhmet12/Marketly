import type { ForexSpreadSessionResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  activeForexSessionLabel,
  buildForexSessions,
} from "@/features/markets/forex/lib/forex-pulse-utils";
import { pipSize } from "@/features/markets/forex/lib/forex-pip-utils";
import {
  forexPairLabel,
  normalizeForexSymbol,
  resolveForexPairCategory,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const ORDER_BOOK_LEVELS = 5;

const SESSION_VENUES = [
  { name: "Tokyo", pair: "Asian ECN", mult: 1.85, openUtc: 0, closeUtc: 9 },
  { name: "Londra", pair: "London ECN", mult: 1.05, openUtc: 8, closeUtc: 17 },
  { name: "New York", pair: "NY ECN", mult: 1.0, openUtc: 13, closeUtc: 22 },
  { name: "Tokyo·Londra", pair: "Overlap", mult: 0.82, openUtc: 8, closeUtc: 9 },
  { name: "Londra·NY", pair: "Overlap", mult: 0.72, openUtc: 13, closeUtc: 17 },
] as const;

function getUtcClock(): { hour: number; minute: number; day: number } {
  const now = new Date();
  return {
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
    day: now.getUTCDay(),
  };
}

function resolveForexSession(): ForexSpreadSessionResponse["session"] {
  const { hour, day } = getUtcClock();
  const sessions = buildForexSessions();
  const active = sessions.filter((s) => s.status === "active");
  const label = activeForexSessionLabel();

  if (day === 6 || day === 0) {
    return {
      status: "closed",
      label: "Hafta sonu kapalı",
      venue: "FX OTC",
      nextEvent: day === 6 ? "Pazar 22:00 UTC Sydney açılış" : "Pazartesi 00:00 UTC Tokyo",
      timezone: "UTC",
    };
  }

  if (active.length >= 2) {
    return {
      status: "open",
      label,
      venue: "Overlap",
      nextEvent: "Sonraki seans geçişi",
      timezone: "UTC",
    };
  }

  if (active.length === 1) {
    const s = active[0]!;
    return {
      status: "open",
      label,
      venue: s.label,
      nextEvent: s.time,
      timezone: "UTC",
    };
  }

  const soon = sessions.find((s) => s.status === "soon");
  if (soon) {
    return {
      status: "pre",
      label: `${soon.label} yakında`,
      venue: soon.label,
      nextEvent: soon.time,
      timezone: "UTC",
    };
  }

  return {
    status: "closed",
    label: "Seans arası",
    venue: "FX OTC",
    nextEvent: "00:00 UTC Tokyo",
    timezone: "UTC",
  };
}

function baseSpreadPips(symbol: string): number {
  const cat = resolveForexPairCategory(symbol);
  if (cat === "exotic") return 18;
  if (cat === "minor") return 2.4;
  if (cat === "macro") return 0.8;
  return 0.9;
}

function spreadLabel(pips: number): string {
  if (pips <= 1.2) return "Dar spread";
  if (pips <= 4) return "Normal spread";
  return "Geniş spread";
}

function clampDepth(ratio: number): number {
  return Math.min(96, Math.max(12, Math.round(ratio * 800 + 18)));
}

function isSessionActive(openUtc: number, closeUtc: number, hourUtc: number): boolean {
  return hourUtc >= openUtc && hourUtc < closeUtc;
}

export async function fetchForexSpreadSession(
  symbol: string,
): Promise<ForexSpreadSessionResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const [quote, dxyQuote] = await Promise.all([
    fetchYahooQuote(ticker),
    fetchYahooQuote("DX-Y.NYB"),
  ]);

  if (!quote) return null;

  const mid = quote.price;
  const pip = pipSize(sym);
  const basePips = baseSpreadPips(sym);
  const volBoost = Math.abs(quote.change24hPct) * 0.08;
  const spreadPips = basePips + volBoost;
  const halfSpread = (spreadPips * pip) / 2;
  const spreadBps = mid > 0 ? ((spreadPips * pip) / mid) * 10_000 : 0;
  const { hour } = getUtcClock();

  const rows = SESSION_VENUES.slice(0, ORDER_BOOK_LEVELS).map((venue) => {
    const active = isSessionActive(venue.openUtc, venue.closeUtc, hour);
    const sessionMult = active ? 0.92 : 1.0;
    const venuePips = spreadPips * venue.mult * sessionMult;
    const venueHalf = (venuePips * pip) / 2;
    const venueBps = mid > 0 ? ((venuePips * pip) / mid) * 10_000 : spreadBps * venue.mult;

    return {
      venueName: venue.name,
      pair: venue.pair,
      bid: mid - venueHalf,
      ask: mid + venueHalf,
      spreadBps: venueBps,
      spreadPips: venuePips,
      depthPct: clampDepth(1 / venue.mult),
    };
  });

  return {
    symbol: sym,
    pair: forexPairLabel(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    session: resolveForexSession(),
    spread: {
      mid,
      spreadBps,
      spreadPips,
      bestBid: mid - halfSpread,
      bestAsk: mid + halfSpread,
      spreadLabel: spreadLabel(spreadPips),
    },
    benchmark: {
      name: "DXY",
      price: dxyQuote?.price ?? mid,
      deltaPct: dxyQuote?.change24hPct ?? quote.change24hPct,
    },
    rows,
  };
}
