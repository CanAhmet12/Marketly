import type { BistPeerComparisonResponse } from "@/features/markets/bist/lib/bist-detail-types";
import {
  bistDisplayLabel,
  bistSectorLabel,
  normalizeBistSymbol,
  peerGroupFor,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export async function fetchBistPeerComparison(
  symbol: string,
): Promise<BistPeerComparisonResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const peers = peerGroupFor(sym);

  const resolved = await Promise.all(
    peers.map(async (peerSym) => {
      const ticker = yahooTickerFor(peerSym);
      const daily = await fetchYahooChart(ticker, "1d", "5d");
      if (!daily?.length) return null;
      const last = daily[daily.length - 1]!;
      const prev = daily.length >= 2 ? daily[daily.length - 2]!.close : daily[0]!.open;
      return {
        symbol: peerSym,
        name: bistDisplayLabel(peerSym),
        price: last.close,
        changePct: pctChange(last.close, prev),
        isSubject: peerSym === sym,
        isBenchmark: peerSym === "XU100" || peerSym === "BIST100",
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
      peerId: row.symbol.toLowerCase(),
      peerName: row.name,
      symbol: row.symbol,
      price: row.price,
      spreadPct: median > 0 ? (Math.abs(row.price - median) / median) * 100 : 0,
      changePct: row.changePct,
      isSubject: row.isSubject,
      isBenchmark: row.isBenchmark,
    }))
    .sort((a, b) => a.price - b.price)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const bestRow = mapped.find((r) => r.price === bestPrice) ?? mapped[0]!;
  const benchmarkRow = mapped.find((r) => r.isBenchmark) ?? mapped[0]!;
  const avgSpreadPct = mapped.reduce((sum, row) => sum + row.spreadPct, 0) / mapped.length;

  return {
    symbol: sym,
    sectorLabel: bistSectorLabel(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    peerCount: mapped.length,
    bestPrice: bestRow.price,
    bestPricePeer: bestRow.peerName,
    benchmarkPeer: benchmarkRow.peerName,
    avgSpreadPct,
    rows: mapped,
  };
}
