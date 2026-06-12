import type { ForexSignalStripPayload } from "@/features/markets/forex/types";
import type { MarketAssetView } from "@/features/markets/types";

import { pairLabel } from "@/features/markets/lib/live-category/live-category-shared";

export function buildForexSignalsPayload(
  assets: readonly MarketAssetView[],
): ForexSignalStripPayload {
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
    .map((a) => {
      const pair = pairLabel(a.symbol);
      return {
        symbol: a.symbol.toUpperCase().replace("/", ""),
        pair,
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
      };
    });

  const totalActiveSignals = hasSignals
    ? assets.reduce((s, a) => s + a.signal_active_count, 0)
    : topAssets.reduce((s, a) => s + a.activeSignals, 0);

  return {
    totalActiveSignals,
    bullPct: avgBull,
    bearPct: 100 - avgBull,
    marketBiasLabel: avgBull >= 58 ? "Alış ağırlıklı" : avgBull <= 42 ? "Satış ağırlıklı" : "Nötr FX",
    topAssets,
  };
}

/** UTC saatine göre basit seans etiketi */
export function resolveForexScreenerSession(now = new Date()): "LDN" | "NY" | "TKY" | "ALL" | "CLOSED" {
  const h = now.getUTCHours();
  const ldn = h >= 8 && h < 17;
  const ny = h >= 13 && h < 22;
  const tky = h >= 0 && h < 9;
  if (ldn && ny) return "ALL";
  if (ldn) return "LDN";
  if (ny) return "NY";
  if (tky) return "TKY";
  return "CLOSED";
}
