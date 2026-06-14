import type { CommodityVenueComparisonResponse } from "@/features/markets/commodities/lib/commodity-detail-types";
import {
  unitForCommoditySymbol,
  venueGroupFor,
} from "@/features/markets/commodities/lib/commodity-symbol-meta";
import { fetchYahooLastPrice } from "@/features/markets/commodities/lib/commodity-yahoo";

export async function fetchCommodityVenueComparison(
  symbol: string,
): Promise<CommodityVenueComparisonResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const venues = venueGroupFor(sym);
  if (venues.length === 0) return null;

  const uniqueYahoo = [...new Map(venues.map((v) => [v.yahoo, v])).values()];
  const prices = await Promise.all(
    uniqueYahoo.map(async (venue) => ({
      yahoo: venue.yahoo,
      price: await fetchYahooLastPrice(venue.yahoo),
    })),
  );

  const priceByYahoo = new Map<string, number>();
  for (const row of prices) {
    if (row.price != null && row.price > 0) priceByYahoo.set(row.yahoo, row.price);
  }

  if (priceByYahoo.size === 0) return null;

  const resolved = venues
    .map((venue) => {
      const price = priceByYahoo.get(venue.yahoo);
      if (price == null) return null;
      return { venue, price };
    })
    .filter((row): row is { venue: (typeof venues)[0]; price: number } => Boolean(row));

  if (resolved.length === 0) return null;

  const allPrices = resolved.map((r) => r.price);
  const median = [...allPrices].sort((a, b) => a - b)[Math.floor(allPrices.length / 2)] ?? allPrices[0]!;
  const bestPrice = Math.min(...allPrices);

  const rows = resolved
    .map(({ venue, price }, index) => {
      const priceDeltaPct = median > 0 ? ((price - median) / median) * 100 : 0;
      const spreadPct = median > 0 ? (Math.abs(price - median) / median) * 100 : 0;
      return {
        rank: index + 1,
        venueId: venue.id,
        venueName: venue.name,
        pair: venue.pair,
        price,
        spreadPct,
        priceDeltaPct,
        isBestPrice: price === bestPrice,
        isBenchmark: Boolean(venue.isBenchmark),
      };
    })
    .sort((a, b) => a.price - b.price)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const bestRow = rows.find((r) => r.isBestPrice) ?? rows[0]!;
  const benchmarkRow = rows.find((r) => r.isBenchmark) ?? rows[0]!;
  const avgSpreadPct = rows.reduce((sum, row) => sum + row.spreadPct, 0) / rows.length;

  return {
    symbol: sym,
    unit: unitForCommoditySymbol(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    venueCount: rows.length,
    bestPrice: bestRow.price,
    bestPriceVenue: bestRow.venueName,
    benchmarkVenue: benchmarkRow.venueName,
    avgSpreadPct,
    rows,
  };
}
