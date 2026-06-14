import type { NasdaqSpreadSessionResponse } from "@/features/markets/nasdaq/lib/nasdaq-detail-types";
import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import {
  benchmarkSymbolFor,
  isNasdaqIndexSymbol,
  nasdaqNameFor,
  yahooTickerFor,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const ORDER_BOOK_LEVELS = 5;

function getEtClock(): { day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { day: dayMap[weekday] ?? 1, hour, minute };
}

function resolveUsSession(): NasdaqSpreadSessionResponse["session"] {
  const { day, hour, minute } = getEtClock();
  const mins = hour * 60 + minute;

  if (day === 0 || day === 6) {
    return {
      status: "closed",
      phase: "closed",
      label: "US piyasalar kapalı",
      venue: "NASDAQ",
      nextEvent: day === 6 ? "Pazar pre-market 04:00 ET" : "Pazartesi pre-market 04:00 ET",
      timezone: "America/New_York",
    };
  }

  if (mins >= 4 * 60 && mins < 9 * 60 + 30) {
    return {
      status: "pre",
      phase: "pre",
      label: "Pre-market",
      venue: "NASDAQ",
      nextEvent: "09:30 ET regular açılış",
      timezone: "America/New_York",
    };
  }

  if (mins >= 9 * 60 + 30 && mins < 16 * 60) {
    return {
      status: "open",
      phase: "regular",
      label: "Regular seans",
      venue: "NASDAQ",
      nextEvent: "16:00 ET kapanış",
      timezone: "America/New_York",
    };
  }

  if (mins >= 16 * 60 && mins < 20 * 60) {
    return {
      status: "pre",
      phase: "after",
      label: "After-hours",
      venue: "NASDAQ",
      nextEvent: "20:00 ET extended kapanış",
      timezone: "America/New_York",
    };
  }

  return {
    status: "closed",
    phase: "closed",
    label: "Seans dışı",
    venue: "NASDAQ",
    nextEvent: "04:00 ET pre-market",
    timezone: "America/New_York",
  };
}

function spreadLabel(bps: number): string {
  if (bps <= 2) return "Dar spread";
  if (bps <= 6) return "Normal spread";
  return "Geniş spread";
}

function clampDepth(ratio: number): number {
  return Math.min(96, Math.max(12, Math.round(ratio * 800 + 18)));
}

const SESSION_VENUES = [
  { name: "Pre-market", pair: "NASDAQ ECN", mult: 1.8 },
  { name: "Regular", pair: "NASDAQ", mult: 1.0 },
  { name: "After-hours", pair: "Extended", mult: 1.6 },
  { name: "ARCA", pair: "NYSE ARCA", mult: 1.2 },
  { name: "BATS", pair: "Cboe BZX", mult: 1.35 },
] as const;

export async function fetchNasdaqSpreadSession(
  symbol: string,
): Promise<NasdaqSpreadSessionResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const [quote, benchQuote] = await Promise.all([
    fetchYahooQuote(ticker),
    fetchYahooQuote(yahooTickerFor(benchmarkSymbolFor(sym)) ?? "^GSPC"),
  ]);

  if (!quote) return null;

  const mid = quote.price;
  const baseBps = isNasdaqIndexSymbol(sym) ? 1.2 : 2.4;
  const volBoost = Math.abs(quote.change24hPct) * 0.15;
  const spreadBps = baseBps + volBoost;
  const halfSpread = (mid * spreadBps) / 10_000 / 2;

  const rows = SESSION_VENUES.slice(0, ORDER_BOOK_LEVELS).map((venue) => {
    const venueBps = spreadBps * venue.mult;
    const venueHalf = (mid * venueBps) / 10_000 / 2;
    return {
      venueName: venue.name,
      pair: venue.pair,
      bid: mid - venueHalf,
      ask: mid + venueHalf,
      spreadBps: venueBps,
      depthPct: clampDepth(venue.mult / 2),
    };
  });

  const benchSym = benchmarkSymbolFor(sym);

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    session: resolveUsSession(),
    spread: {
      mid,
      spreadBps,
      bestBid: mid - halfSpread,
      bestAsk: mid + halfSpread,
      spreadLabel: spreadLabel(spreadBps),
    },
    benchmark: {
      name: nasdaqNameFor(benchSym),
      price: benchQuote?.price ?? mid,
      deltaPct: benchQuote?.change24hPct ?? quote.change24hPct,
    },
    rows,
  };
}

export function formatSpreadPrice(price: number, symbol: string): string {
  return formatNasdaqTickerPrice(price, symbol);
}
