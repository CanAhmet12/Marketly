import type { SignalLifecyclePhase } from "@/features/signals/domain/signal-meta";
import { strategyTacticLabel } from "@/features/signals/components/unified-signal-primitives";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import { signalMarketTone, type SignalMarketTone } from "@/features/signals/lib/signal-market-tone";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatTimeAgo } from "@/lib/format-time-ago";

const ANALYST_COLORS = ["#0f9d75", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"] as const;

const MARKET_LABELS: Record<SignalMarketTone, string> = {
  crypto: "Kripto",
  bist: "BIST",
  forex: "Forex",
  commodity: "Emtia",
  macro: "Makro",
};

function analystColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ANALYST_COLORS[Math.abs(h) % ANALYST_COLORS.length]!;
}

function trackingMeta(row: SignalsFeedRow): { mode: "live" | "watch" | "update"; label: string } {
  if (row.strategy_update_ping) return { mode: "update", label: "Güncellendi" };
  if (row.is_active && (row.discussion_active || row.community_copies_24h >= 3)) {
    return { mode: "live", label: "Canlı takip" };
  }
  if (row.is_active) return { mode: "watch", label: "İzleniyor" };
  return { mode: "watch", label: "Arşiv" };
}

function lifecycleStatus(phase: SignalLifecyclePhase): { label: string; tone: "entry" | "target" | "stop" | "neutral" } {
  switch (phase) {
    case "near_target":
    case "target_hit":
      return { label: "Hedefe yakın", tone: "target" };
    case "stopped_out":
      return { label: "Stop baskısı", tone: "stop" };
    case "developing":
      return { label: "Giriş bandında", tone: "entry" };
    case "open":
      return { label: "Aktif pozisyon", tone: "entry" };
    default:
      return { label: "Piyasa izlemede", tone: "neutral" };
  }
}

export function livePricePosition(row: SignalsFeedRow): number {
  const spot = row.sparkline[row.sparkline.length - 1];
  const stop = row.stop_loss;
  const target = row.target_price;
  if (spot != null && stop != null && target != null) {
    const range = target - stop;
    if (Math.abs(range) > 1e-9) {
      return Math.min(96, Math.max(4, Math.round(((spot - stop) / range) * 100)));
    }
  }
  const entry = row.entry_price;
  if (entry != null && stop != null && target != null) {
    const range = target - stop;
    if (Math.abs(range) > 1e-9) {
      return Math.min(96, Math.max(4, Math.round(((entry - stop) / range) * 100)));
    }
  }
  return 50;
}

export function progressToTarget(row: SignalsFeedRow): number {
  const spot = row.sparkline[row.sparkline.length - 1];
  const entry = row.entry_price;
  const target = row.target_price;
  if (spot == null || entry == null || target == null) return 0;
  const total = Math.abs(target - entry);
  if (total < 1e-9) return 0;
  const moved = row.direction === "SELL" ? entry - spot : spot - entry;
  return Math.min(100, Math.max(0, Math.round((moved / total) * 100)));
}

export function changeFromRow(row: SignalsFeedRow): { pct: string; positive: boolean } {
  const preview = row.performance_preview_pct;
  if (preview != null) {
    const positive = preview >= 0;
    return { pct: `${positive ? "+" : ""}${preview.toFixed(2)}%`, positive };
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
  return { pct: "+0.00%", positive: true };
}

export type SignalsLiveCardItem = {
  id: string;
  symbol: string;
  assetName: string;
  marketTone: SignalMarketTone;
  marketLabel: string;
  timeframe: string;
  strategyLabel: string;
  confidence: number;
  entry: string;
  target: string;
  stop: string;
  rr: string;
  spotPrice: string;
  changePct: string;
  changePositive: boolean;
  sparkline: number[];
  trackingMode: "live" | "watch" | "update";
  trackingLabel: string;
  statusLabel: string;
  statusTone: "entry" | "target" | "stop" | "neutral";
  pricePosition: number;
  progressPct: number;
  watchers: number;
  thesisGrade: string | null;
  analyst: string;
  analystHandle: string;
  analystColor: string;
  analystVerified: boolean;
  age: string;
  freshnessScore: number;
  href: string;
  likesCount: number;
  copiesCount: number;
  copies24h: number;
};

export function mapFeedRowToLiveCardItem(row: SignalsFeedRow): SignalsLiveCardItem {
  const tone = signalMarketTone(resolveSignalAssetCategory(row));
  const tracking = trackingMeta(row);
  const status = lifecycleStatus(row.lifecycle_phase);
  const change = changeFromRow(row);
  const spot = row.sparkline[row.sparkline.length - 1] ?? row.entry_price ?? 0;
  const handle = row.analyst.display.startsWith("@")
    ? row.analyst.display
    : `@${row.analyst.display.toLowerCase().replace(/\s+/g, "")}`;

  return {
    id: row.id,
    symbol: row.symbol,
    assetName: row.asset_display_name || row.symbol,
    marketTone: tone,
    marketLabel: MARKET_LABELS[tone],
    timeframe: row.timeframe,
    strategyLabel: strategyTacticLabel(row.strategy),
    confidence: row.confidence,
    entry: row.entryZoneLabel ?? formatSignalPrice(row.entry_price),
    target: formatSignalPrice(row.target_price),
    stop: formatSignalPrice(row.stop_loss),
    rr: row.riskRewardLabel ?? (row.risk_reward_ratio != null ? `1:${row.risk_reward_ratio.toFixed(1)}` : "—"),
    spotPrice: formatSignalPrice(spot),
    changePct: change.pct,
    changePositive: change.positive,
    sparkline: row.sparkline.length >= 2 ? row.sparkline : [spot * 0.992, spot * 0.996, spot * 0.998, spot],
    trackingMode: tracking.mode,
    trackingLabel: tracking.label,
    statusLabel: status.label,
    statusTone: status.tone,
    pricePosition: livePricePosition(row),
    progressPct: progressToTarget(row),
    watchers: Math.max(1, row.community_copies_24h + Math.floor(row.copies_count / 8)),
    thesisGrade: row.thesis_grade ?? null,
    analyst: row.analyst.display,
    analystHandle: handle,
    analystColor: analystColor(row.analyst.id),
    analystVerified: row.analyst.verified,
    age: formatTimeAgo(row.created_at),
    freshnessScore: row.freshness_score,
    href: row.detail_href || `/signals/${encodeURIComponent(row.id)}`,
    likesCount: row.likes_count,
    copiesCount: row.copies_count,
    copies24h: row.community_copies_24h,
  };
}
