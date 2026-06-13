import type { NasdaqSignalStripPayload } from "@/features/markets/nasdaq/types";
import type { MarketAssetView } from "@/features/markets/types";

export function buildNasdaqSignalsPayload(
  assets: readonly MarketAssetView[],
): NasdaqSignalStripPayload {
  const withSignals = assets.filter((a) => a.signal_active_count > 0);
  const hasSignals = withSignals.length > 0;
  const pool = hasSignals ? withSignals : assets;

  const avgBull =
    pool.length > 0
      ? Math.round(pool.reduce((s, a) => s + a.signal_bull_pct, 0) / pool.length)
      : 50;

  const topAssets = [...pool]
    .sort((a, b) => b.signal_active_count - a.signal_active_count)
    .slice(0, 6)
    .map((a) => ({
      symbol: a.symbol.toUpperCase(),
      name: a.name,
      activeSignals: Math.max(a.signal_active_count, hasSignals ? 1 : 0),
      bullPct: a.signal_bull_pct,
      biasLabel:
        a.signal_bull_pct >= 58 ? "Alış bias" : a.signal_bull_pct <= 42 ? "Satış bias" : "Nötr",
      avgConfidence: Math.min(
        92,
        Math.max(38, Math.round(48 + Math.abs(a.signal_bull_pct - 50) * 0.9)),
      ),
      dominantDirection:
        a.signal_bull_pct >= 58 ? ("BUY" as const) : a.signal_bull_pct <= 42 ? ("SELL" as const) : ("HOLD" as const),
    }));

  const totalActiveSignals = hasSignals
    ? assets.reduce((s, a) => s + a.signal_active_count, 0)
    : topAssets.reduce((s, a) => s + a.activeSignals, 0);

  return {
    totalActiveSignals,
    bullPct: avgBull,
    bearPct: 100 - avgBull,
    marketBiasLabel: avgBull >= 58 ? "Alış ağırlıklı" : avgBull <= 42 ? "Satış ağırlıklı" : "Nötr tech",
    topAssets,
  };
}
