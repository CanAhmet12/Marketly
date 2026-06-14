import type { BistSpreadSessionResponse } from "@/features/markets/bist/lib/bist-detail-types";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  benchmarkSymbolFor,
  bistDisplayLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const ORDER_BOOK_LEVELS = 5;

function getIstanbulClock(): { day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
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

function resolveBistSession(): BistSpreadSessionResponse["session"] {
  const { day, hour, minute } = getIstanbulClock();
  const mins = hour * 60 + minute;

  if (day === 0 || day === 6) {
    return {
      status: "closed",
      phase: "closed",
      label: "BIST kapalı",
      venue: "BIST",
      nextEvent: day === 6 ? "Pazartesi 10:00 açılış" : "Pazartesi 10:00 açılış",
      timezone: "Europe/Istanbul",
    };
  }

  if (mins >= 9 * 60 + 55 && mins < 10 * 60) {
    return {
      status: "pre",
      phase: "pre",
      label: "Tek fiyat açılış",
      venue: "BIST",
      nextEvent: "10:00 sürekli işlem",
      timezone: "Europe/Istanbul",
    };
  }

  if (mins >= 10 * 60 && mins < 17 * 60 + 55) {
    return {
      status: "open",
      phase: "regular",
      label: "Sürekli işlem",
      venue: "BIST",
      nextEvent: "18:00 kapanış",
      timezone: "Europe/Istanbul",
    };
  }

  if (mins >= 17 * 60 + 55 && mins < 18 * 60) {
    return {
      status: "pre",
      phase: "closing",
      label: "Kapanış seansı",
      venue: "BIST",
      nextEvent: "18:00 seans sonu",
      timezone: "Europe/Istanbul",
    };
  }

  return {
    status: "closed",
    phase: "closed",
    label: "Seans dışı",
    venue: "BIST",
    nextEvent: "09:55 tek fiyat açılış",
    timezone: "Europe/Istanbul",
  };
}

function spreadLabel(bps: number): string {
  if (bps <= 3) return "Dar spread";
  if (bps <= 8) return "Normal spread";
  return "Geniş spread";
}

function clampDepth(ratio: number): number {
  return Math.min(96, Math.max(12, Math.round(ratio * 800 + 18)));
}

const SESSION_VENUES = [
  { name: "Açılış", pair: "10:00–10:30", mult: 1.7 },
  { name: "Sabah", pair: "10:30–13:00", mult: 1.0 },
  { name: "Öğleden sonra", pair: "13:00–17:30", mult: 1.15 },
  { name: "Kapanış", pair: "17:55–18:00", mult: 1.9 },
  { name: "Seans dışı", pair: "Kapalı", mult: 2.4 },
] as const;

export async function fetchBistSpreadSession(
  symbol: string,
): Promise<BistSpreadSessionResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const benchSym = benchmarkSymbolFor(sym);
  const [quote, benchQuote] = await Promise.all([
    fetchYahooQuote(ticker),
    fetchYahooQuote(yahooTickerFor(benchSym)),
  ]);

  if (!quote) return null;

  const mid = quote.price;
  const baseBps = isBistIndexSymbol(sym) ? 1.5 : 3.2;
  const volBoost = Math.abs(quote.change24hPct) * 0.18;
  const spreadBps = baseBps + volBoost;
  const halfSpread = (mid * spreadBps) / 10_000 / 2;

  const rows = SESSION_VENUES.slice(0, ORDER_BOOK_LEVELS).map((venue) => {
    const venueBps = spreadBps * venue.mult;
    return {
      venueName: venue.name,
      pair: venue.pair,
      spreadBps: venueBps,
      depthPct: clampDepth(1 / venue.mult),
    };
  });

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    session: resolveBistSession(),
    spread: {
      mid,
      spreadBps,
      bestBid: mid - halfSpread,
      bestAsk: mid + halfSpread,
      spreadLabel: spreadLabel(spreadBps),
    },
    benchmark: {
      name: bistDisplayLabel(benchSym),
      price: benchQuote?.price ?? mid,
      deltaPct: benchQuote?.change24hPct ?? quote.change24hPct,
    },
    rows,
  };
}

export function formatSpreadPrice(price: number, symbol: string): string {
  return formatBistTickerPrice(price, symbol);
}
