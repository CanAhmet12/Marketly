import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type { SignalsHeroPayload } from "@/features/signals/types";

function latestRowTimestamp(rows: SignalsFeedRow[]): string {
  if (!rows.length) return new Date().toISOString();
  let max = rows[0]!.created_at;
  for (const r of rows) {
    if (r.created_at > max) max = r.created_at;
  }
  return max;
}

export function computeSignalsHero(rows: SignalsFeedRow[]): SignalsHeroPayload {
  const active = rows.filter((r) => r.is_active);
  const buyCount = active.filter((r) => r.direction === "BUY").length;
  const sellCount = active.filter((r) => r.direction === "SELL").length;
  const holdCount = active.filter((r) => r.direction === "HOLD").length;
  const avgConfidence = active.length ? active.reduce((s, r) => s + r.confidence, 0) / active.length : 0;
  const closed = rows.filter((r) => r.result === "TP" || r.result === "SL");
  const tp = closed.filter((r) => r.result === "TP").length;
  const successRate = closed.length ? Math.round((tp / closed.length) * 100) : null;
  const pool = active.filter((r) => r.direction === "BUY" || r.direction === "SELL");
  const lastStrong = pool.length ? [...pool].sort((a, b) => b.confidence - a.confidence)[0]! : null;

  let pulseLabel = "Dengeli akış";
  if (buyCount > sellCount * 1.25) pulseLabel = "Alış baskısı";
  else if (sellCount > buyCount * 1.25) pulseLabel = "Satış baskısı";

  return {
    activeCount: active.length,
    buyCount,
    sellCount,
    holdCount,
    successRate,
    avgConfidence: Math.round(avgConfidence),
    lastStrong: lastStrong
      ? { symbol: lastStrong.symbol, confidence: lastStrong.confidence, direction: lastStrong.direction }
      : null,
    pulseLabel,
    updatedAt: latestRowTimestamp(rows),
  };
}
