import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import { mockExpiresAtIso, signalStatusKey } from "@/features/signals/domain/signal-meta";
import type { SignalStatusKey } from "@/features/signals/domain/signal-meta";
import { enrichSignalsFeedRow, type SignalsFeedRowCore } from "@/features/signals/lib/feed-intelligence";
import type { SignalsFeedRow, SignalsPageRow, SignalStrategy } from "@/features/signals/repository/types";
import { inferMarketAssetCategory } from "@/lib/market-category";

function inferStrategy(tf: string): SignalStrategy {
  if (tf === "1S" || tf === "4S") return "scalp";
  if (tf === "1A") return "long";
  return "swing";
}

function riskRewardLabel(entry: number | null, target: number | null, stop: number | null): string | null {
  if (entry == null || target == null || stop == null) return null;
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk < 1e-9) return null;
  return `1 : ${(reward / risk).toFixed(2)}`;
}

function entryZoneLabel(entry: number | null): string | null {
  if (entry == null) return null;
  const pad = Math.max(entry * 0.0025, entry * 0.0001);
  return `${(entry - pad).toLocaleString("tr-TR", { maximumFractionDigits: 4 })} – ${(entry + pad).toLocaleString("tr-TR", { maximumFractionDigits: 4 })}`;
}

/** `SignalsPageRow` + analist paketinden feed satırı — mock ve kanal yüzeyleri ortak */
export function mapSignalsPageRowToFeedRow(s: SignalsPageRow, analyst: SignalsFeedRow["analyst"]): SignalsFeedRow {
  const trend: "up" | "down" | "flat" = s.direction === "BUY" ? "up" : s.direction === "SELL" ? "down" : "flat";
  const core: SignalsFeedRowCore = {
    ...s,
    sparkline: buildSparklineSeries(`${s.id}-sig`, trend),
    assetCategory: inferMarketAssetCategory(s.symbol),
    strategy: inferStrategy(s.timeframe),
    riskRewardLabel: riskRewardLabel(s.entry_price, s.target_price, s.stop_loss),
    entryZoneLabel: entryZoneLabel(s.entry_price),
    status_key: signalStatusKey(s) as SignalStatusKey,
    expires_at: mockExpiresAtIso(s.created_at),
    analyst,
  };
  return enrichSignalsFeedRow(core);
}
