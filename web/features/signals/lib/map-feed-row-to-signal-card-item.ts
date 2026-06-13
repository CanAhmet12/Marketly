import type { VRSignalItem, VRSignalStatus } from "@/features/discover/visual-reference/discover-visual-reference-data";
import type { SignalLifecyclePhase } from "@/features/signals/domain/signal-meta";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import { signalMarketTone } from "@/features/signals/lib/signal-market-tone";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatTimeAgo } from "@/lib/format-time-ago";

const ANALYST_COLORS = ["#0f9d75", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"] as const;

function analystColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ANALYST_COLORS[Math.abs(h) % ANALYST_COLORS.length]!;
}

function lifecycleToStatus(phase: SignalLifecyclePhase): { status: VRSignalStatus; label: string } {
  switch (phase) {
    case "near_target":
    case "target_hit":
      return { status: "toward_target", label: "Hedefe yakın" };
    case "stopped_out":
      return { status: "near_stop", label: "Stop baskısı" };
    case "developing":
      return { status: "in_entry", label: "Giriş bandında" };
    case "open":
      return { status: "in_entry", label: "Aktif giriş" };
    default:
      return { status: "watching", label: "İzleniyor" };
  }
}

function pricePosition(row: SignalsFeedRow): number {
  const { entry_price: entry, stop_loss: stop, target_price: target } = row;
  if (entry == null || stop == null || target == null) return 50;
  const range = target - stop;
  if (Math.abs(range) < 1e-9) return 50;
  return Math.min(96, Math.max(4, Math.round(((entry - stop) / range) * 100)));
}

function spotFromRow(row: SignalsFeedRow): number {
  if (row.entry_price != null) return row.entry_price;
  const last = row.sparkline[row.sparkline.length - 1];
  return last ?? 0;
}

function changeFromRow(row: SignalsFeedRow): { pct: string; positive: boolean } {
  const preview = row.performance_preview_pct;
  if (preview != null) {
    const positive = preview >= 0;
    return {
      pct: `${positive ? "+" : ""}${preview.toFixed(2)}%`,
      positive,
    };
  }
  const spark = row.sparkline;
  if (spark.length >= 2) {
    const a = spark[0]!;
    const b = spark[spark.length - 1]!;
    if (Math.abs(a) > 1e-9) {
      const ch = ((b - a) / a) * 100;
      const positive = ch >= 0;
      return { pct: `${positive ? "+" : ""}${ch.toFixed(2)}%`, positive };
    }
  }
  const positive = row.direction === "BUY";
  return { pct: positive ? "+0.42%" : "-0.38%", positive };
}

/** SignalsFeedRow → Keşfet rail kartı view modeli */
export function mapFeedRowToSignalCardItem(row: SignalsFeedRow): VRSignalItem {
  const { status, label } = lifecycleToStatus(row.lifecycle_phase);
  const change = changeFromRow(row);
  const spot = spotFromRow(row);
  const handle = row.analyst.display.startsWith("@")
    ? row.analyst.display
    : `@${row.analyst.display.toLowerCase().replace(/\s+/g, "")}`;

  return {
    id: row.id,
    symbol: row.symbol,
    assetName: row.asset_display_name || row.symbol,
    marketTone: signalMarketTone(resolveSignalAssetCategory(row)),
    direction: row.direction,
    entry: row.entryZoneLabel ?? formatSignalPrice(row.entry_price),
    target: formatSignalPrice(row.target_price),
    stop: formatSignalPrice(row.stop_loss),
    timeframe: row.timeframe,
    confidence: row.confidence,
    rationale: row.rationale?.trim() || "Analist tezi katalogda özetleniyor.",
    analyst: row.analyst.display,
    analystHandle: handle,
    analystColor: analystColor(row.analyst.id),
    rr: row.riskRewardLabel ?? (row.risk_reward_ratio != null ? `1 : ${row.risk_reward_ratio.toFixed(2)}` : "—"),
    age: formatTimeAgo(row.created_at),
    href: row.detail_href || `/signals?signal=${encodeURIComponent(row.id)}`,
    spotPrice: formatSignalPrice(spot),
    changePct: change.pct,
    changePositive: change.positive,
    signalStatus: status,
    signalStatusLabel: label,
    pricePosition: pricePosition(row),
  };
}
