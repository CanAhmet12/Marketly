import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import { mockExpiresAtIso, normalizeSignalResult, signalStatusKey } from "@/features/signals/domain/signal-meta";
import type { SignalStatusKey } from "@/features/signals/domain/signal-meta";
import { enrichSignalsFeedRow, type SignalsFeedRowCore } from "@/features/signals/lib/feed-intelligence";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { inferMarketAssetCategory, normalizeAssetCategory } from "@/lib/market-category";

export type SignalsFeedRpcRow = {
  id: string;
  creator_id: string;
  asset_id: string;
  asset_symbol: string;
  asset_name: string;
  asset_category: string;
  direction: string;
  confidence: number;
  entry_price: number | null;
  target_price: number | null;
  stop_loss: number | null;
  timeframe: string;
  rationale: string | null;
  is_active: boolean;
  copies_count: number;
  likes_count: number;
  created_at: string;
  result: string | null;
  creator_username: string | null;
  creator_full_name: string | null;
  creator_avatar_url: string | null;
  creator_verified: boolean;
  creator_follower_count: number;
  creator_signal_accuracy: number | null;
  creator_tier: string | null;
  trend_score: number | null;
  creator_recent_win_rate: number | null;
};

function inferStrategy(tf: string): SignalsFeedRow["strategy"] {
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

function profileDisplay(row: SignalsFeedRpcRow): string {
  return row.creator_full_name?.trim() || row.creator_username?.trim() || "Analist";
}

/** `get_signals_feed` RPC satırı → `SignalsFeedRow` */
export function mapRpcRowToSignalsFeedRow(row: SignalsFeedRpcRow): SignalsFeedRow {
  const sym = String(row.asset_symbol ?? row.asset_id).toUpperCase();
  const trend: "up" | "down" | "flat" =
    row.direction === "BUY" ? "up" : row.direction === "SELL" ? "down" : "flat";

  const core: SignalsFeedRowCore = {
    id: String(row.id),
    creator_id: String(row.creator_id),
    asset_id: String(row.asset_id),
    symbol: sym,
    direction: (row.direction as SignalsFeedRow["direction"]) ?? "HOLD",
    confidence: row.confidence,
    entry_price: row.entry_price,
    target_price: row.target_price,
    stop_loss: row.stop_loss,
    timeframe: String(row.timeframe ?? "1G"),
    rationale: row.rationale,
    is_active: Boolean(row.is_active),
    copies_count: row.copies_count ?? 0,
    likes_count: row.likes_count ?? 0,
    created_at: String(row.created_at),
    result: normalizeSignalResult(row.result),
    creator_display: profileDisplay(row),
    asset_display_name: row.asset_name?.trim() || sym,
    detail_href: `/signals?signal=${encodeURIComponent(String(row.id))}`,
    sparkline: buildSparklineSeries(`${row.id}-sig`, trend),
    assetCategory: normalizeAssetCategory(row.asset_category) ?? inferMarketAssetCategory(sym),
    strategy: inferStrategy(String(row.timeframe ?? "1G")),
    riskRewardLabel: riskRewardLabel(row.entry_price, row.target_price, row.stop_loss),
    entryZoneLabel: entryZoneLabel(row.entry_price),
    status_key: signalStatusKey({
      is_active: row.is_active,
      result: normalizeSignalResult(row.result),
    }) as SignalStatusKey,
    expires_at: mockExpiresAtIso(row.created_at),
    copies_24h_real: null,
    analyst: {
      id: String(row.creator_id),
      display: profileDisplay(row),
      avatar_url: row.creator_avatar_url,
      verified: Boolean(row.creator_verified),
      follower_count: row.creator_follower_count ?? 0,
      accuracy: row.creator_signal_accuracy ?? row.creator_recent_win_rate ?? null,
      specialties: null,
      tier: row.creator_tier ?? "free",
      strategy_style: null,
    },
  };

  const enriched = enrichSignalsFeedRow(core);
  if (row.trend_score != null) {
    enriched.freshness_score = Math.round(Math.min(100, row.trend_score));
  }
  if (row.creator_recent_win_rate != null) {
    enriched.signal_hit_rate_lookback_pct = row.creator_recent_win_rate;
    enriched.analyst_win_rate_pct = row.creator_recent_win_rate;
  }
  return enriched;
}
