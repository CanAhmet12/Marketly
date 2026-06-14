import type { CommoditySpreadSessionResponse } from "@/features/markets/commodities/lib/commodity-detail-types";
import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
import {
  unitForCommoditySymbol,
  venueGroupFor,
  yahooTickerFor,
} from "@/features/markets/commodities/lib/commodity-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

const ORDER_BOOK_LEVELS = 8;

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

function resolveSession(symbol: string): CommoditySpreadSessionResponse["session"] {
  const cat = resolveCommodityCategory(symbol);
  const venue =
    cat === "degerli-metal" ? "COMEX" : cat === "enerji" ? "NYMEX" : cat === "tarim" ? "CBOT" : "LME/COMEX";
  const { day, hour } = getEtClock();

  if (day === 6) {
    return {
      status: "closed",
      label: `${venue} kapalı`,
      venue,
      nextEvent: "Pazar 18:00 ET açılış",
      timezone: "America/New_York",
    };
  }
  if (day === 0 && hour < 18) {
    return {
      status: "closed",
      label: `${venue} kapalı`,
      venue,
      nextEvent: "18:00 ET açılış",
      timezone: "America/New_York",
    };
  }
  if (day === 5 && hour >= 17) {
    return {
      status: "closed",
      label: "Hafta sonu molası",
      venue,
      nextEvent: "Pazar 18:00 ET",
      timezone: "America/New_York",
    };
  }
  if (hour === 17) {
    return {
      status: "pre",
      label: "Günlük mola",
      venue,
      nextEvent: "18:00 ET devam",
      timezone: "America/New_York",
    };
  }

  return {
    status: "open",
    label: `${venue} açık`,
    venue,
    nextEvent: "17:00 ET günlük mola",
    timezone: "America/New_York",
  };
}

function spreadLabel(bps: number): string {
  if (bps <= 3) return "Dar spread";
  if (bps <= 8) return "Normal spread";
  return "Geniş spread";
}

export async function fetchCommoditySpreadSession(
  symbol: string,
): Promise<CommoditySpreadSessionResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const venues = venueGroupFor(sym);
  const primary = yahooTickerFor(sym) ?? venues[0]?.yahoo;
  if (!primary) return null;

  const uniqueYahoo = [...new Map(venues.map((v) => [v.yahoo, v])).values()];
  const quotes = await Promise.all(
    uniqueYahoo.map(async (venue) => ({
      venue,
      quote: await fetchYahooQuote(venue.yahoo),
    })),
  );

  const resolved = quotes
    .filter((row): row is typeof row & { quote: NonNullable<(typeof row)["quote"]> } => Boolean(row.quote))
    .map(({ venue, quote }) => ({ venue, ...quote }));

  if (resolved.length === 0) return null;

  const benchmark = resolved.find((r) => r.venue.isBenchmark) ?? resolved[0]!;
  const prices = resolved.map((r) => r.price);
  const mid = prices.reduce((s, p) => s + p, 0) / prices.length;
  const bestBid = Math.min(...prices);
  const bestAsk = Math.max(...prices);
  const spreadBps = mid > 0 ? ((bestAsk - bestBid) / mid) * 10_000 : 0;

  const rows = resolved
    .sort((a, b) => a.price - b.price)
    .slice(0, ORDER_BOOK_LEVELS)
    .map((row) => {
      const halfSpread = (row.price * spreadBps) / 10_000 / 2;
      const depthPct = clampDepth(Math.abs(row.price - mid) / mid);
      return {
        venueName: row.venue.name,
        pair: row.venue.pair,
        bid: row.price - halfSpread,
        ask: row.price + halfSpread,
        spreadBps: mid > 0 ? ((halfSpread * 2) / row.price) * 10_000 : spreadBps,
        depthPct,
      };
    });

  while (rows.length < ORDER_BOOK_LEVELS) {
    const last = rows[rows.length - 1];
    if (!last) break;
    rows.push({
      ...last,
      depthPct: Math.max(8, last.depthPct - 6),
    });
  }

  return {
    symbol: sym,
    unit: unitForCommoditySymbol(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    session: resolveSession(sym),
    spread: {
      mid,
      spreadBps,
      bestBid,
      bestAsk,
      spreadLabel: spreadLabel(spreadBps),
    },
    benchmark: {
      name: benchmark.venue.name,
      price: benchmark.price,
      deltaPct: benchmark.change24hPct,
    },
    rows: rows.slice(0, ORDER_BOOK_LEVELS),
  };
}

function clampDepth(ratio: number): number {
  return Math.min(96, Math.max(12, Math.round(ratio * 800 + 18)));
}
