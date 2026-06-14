import type { ForexCrossPairResponse } from "@/features/markets/forex/lib/forex-detail-types";
import {
  forexDisplayLabel,
  forexPairCategoryLabel,
  forexPairLabel,
  normalizeForexSymbol,
  relatedPairGroup,
  yahooTickerFor,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function crossPairGroup(symbol: string): string[] {
  const sym = normalizeForexSymbol(symbol);
  const related = relatedPairGroup(sym);
  return [sym, ...related].filter((p, i, arr) => arr.indexOf(p) === i).slice(0, 6);
}

export async function fetchForexCrossPair(symbol: string): Promise<ForexCrossPairResponse | null> {
  const sym = normalizeForexSymbol(symbol);
  const peers = crossPairGroup(sym);

  const resolved = await Promise.all(
    peers.map(async (peerSym) => {
      const ticker = yahooTickerFor(peerSym);
      if (!ticker) return null;
      const daily = await fetchYahooChart(ticker, "1d", "5d");
      if (!daily?.length) return null;
      const last = daily[daily.length - 1]!;
      const prev = daily.length >= 2 ? daily[daily.length - 2]!.close : daily[0]!.open;
      return {
        symbol: peerSym,
        pair: forexPairLabel(peerSym),
        name: forexDisplayLabel(peerSym),
        price: last.close,
        changePct: pctChange(last.close, prev),
        isSubject: peerSym === sym,
        isBenchmark: peerSym === "DXY",
      };
    }),
  );

  const rows = resolved.filter((row): row is NonNullable<typeof row> => Boolean(row));
  if (rows.length === 0) return null;

  const prices = rows.map((r) => r.price);
  const median = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)] ?? prices[0]!;
  const bestPrice = Math.min(...prices);

  const mapped = rows
    .map((row, index) => ({
      rank: index + 1,
      pairId: row.symbol.toLowerCase(),
      pairName: row.name,
      symbol: row.symbol,
      pair: row.pair,
      price: row.price,
      spreadPct: median > 0 ? (Math.abs(row.price - median) / median) * 100 : 0,
      changePct: row.changePct,
      isSubject: row.isSubject,
      isBenchmark: row.isBenchmark,
    }))
    .sort((a, b) => a.price - b.price)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const bestRow = mapped.find((r) => r.price === bestPrice) ?? mapped[0]!;
  const benchmarkRow = mapped.find((r) => r.isBenchmark) ?? mapped.find((r) => r.symbol === "DXY") ?? mapped[0]!;
  const avgSpreadPct = mapped.reduce((sum, row) => sum + row.spreadPct, 0) / mapped.length;

  return {
    symbol: sym,
    pair: forexPairLabel(sym),
    categoryLabel: forexPairCategoryLabel(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    pairCount: mapped.length,
    bestPrice: bestRow.price,
    bestPricePair: bestRow.pair,
    benchmarkPair: benchmarkRow.pair,
    avgSpreadPct,
    rows: mapped,
  };
}
