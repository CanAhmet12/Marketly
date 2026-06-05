import type { MarketAssetCategory } from "@/features/markets/types";
import {
  deriveSignalAccessTier,
  deriveSignalPackageLabel,
  deriveSubscriberCopies24h,
  premiumPreviewSnippet,
} from "@/features/signals/domain/signal-economy";
import { deriveSignalLifecycle, hashToUnit } from "@/features/signals/domain/signal-meta";
import type { SignalStatusKey } from "@/features/signals/domain/signal-meta";
import type {
  CommunityBias,
  SentimentAlignment,
  SignalsFeedRow,
  SignalsPageRow,
  SignalStrategy,
  ThesisGrade,
  VolatilityHint,
} from "@/features/signals/repository/types";

/** `mapSignalsPageRowToFeedRow` çıktısı — zenginleştirme öncesi */
export type SignalsFeedRowCore = SignalsPageRow & {
  sparkline: number[];
  assetCategory: MarketAssetCategory;
  strategy: SignalStrategy;
  riskRewardLabel: string | null;
  entryZoneLabel: string | null;
  status_key: SignalStatusKey;
  expires_at: string | null;
  analyst: SignalsFeedRow["analyst"];
};

function parseRiskRewardRatio(label: string | null): number | null {
  if (!label) return null;
  const m = label.match(/1\s*:\s*([\d.]+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function volatilityFor(category: MarketAssetCategory, tf: string, id: string): VolatilityHint {
  const h = hashToUnit(`${id}-vol`);
  const shortTf = tf === "1S" || tf === "4S";
  if (category === "crypto") return shortTf ? "high" : h > 0.35 ? "high" : "medium";
  if (category === "forex") return shortTf ? "high" : "medium";
  if (category === "commodity") return "medium";
  if (category === "index") return shortTf ? "medium" : "low";
  return shortTf ? "medium" : "low";
}

function sentimentFor(direction: SignalsFeedRow["direction"]): SentimentAlignment {
  if (direction === "BUY") return "bullish";
  if (direction === "SELL") return "bearish";
  return "neutral";
}

function communityBias(direction: SignalsFeedRow["direction"], id: string): CommunityBias {
  const h = hashToUnit(`${id}-bias`);
  if (direction === "HOLD") return "mixed";
  if (h > 0.62) return direction === "BUY" ? "bullish" : "bearish";
  if (h > 0.28) return "mixed";
  return direction === "BUY" ? "bearish" : "bullish";
}

function thesisGrade(confidence: number): ThesisGrade {
  if (confidence >= 74) return "A";
  if (confidence >= 58) return "B";
  return "C";
}

function timeframeCategory(tf: string, strategy: SignalStrategy): string {
  if (strategy === "scalp") return "Ultra kısa";
  if (strategy === "long") return "Uzun vade";
  if (tf === "1G" || tf === "3G") return "Orta vade";
  return "Kısa vade";
}

function freshnessScore(createdAt: string, likes: number, copies: number, id: string): number {
  const ageH = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  const decay = Math.max(0, 100 - ageH * 2.2);
  const bump = Math.min(22, Math.log1p(likes + copies * 1.6) * 2.4);
  const jitter = (hashToUnit(`${id}-fresh`) - 0.5) * 4;
  return Math.round(Math.min(100, Math.max(0, decay + bump + jitter)));
}

function hitRateLookback(analystAccuracy: number | null, id: string): number | null {
  if (analystAccuracy == null) return null;
  const d = (hashToUnit(`${id}-hit`) - 0.5) * 8;
  return Math.round(Math.min(95, Math.max(42, analystAccuracy + d)));
}

function performancePreview(active: boolean, sparkline: number[], id: string): number | null {
  if (!active || sparkline.length < 3) return null;
  const a = sparkline[0] ?? 1;
  const b = sparkline[sparkline.length - 1] ?? a;
  const raw = ((b - a) / Math.max(Math.abs(a), 1e-6)) * 100;
  const cap = 38 + hashToUnit(`${id}-pp`) * 8;
  return Math.round(Math.min(cap, Math.max(-cap * 0.65, raw)));
}

function copies24h(copies: number, id: string): number {
  if (copies <= 0) return 0;
  const frac = 0.035 + hashToUnit(`${id}-c24`) * 0.09;
  return Math.max(1, Math.round(copies * frac));
}

/** Feed satırına pazar / güven / topluluk alanlarını ekler — mock ve üretim aynı şekil. */
export function enrichSignalsFeedRow(row: SignalsFeedRowCore): SignalsFeedRow {
  const id = row.id;
  const lifecycle_phase = deriveSignalLifecycle(row);
  const risk_reward_ratio = parseRiskRewardRatio(row.riskRewardLabel);
  const volatility_hint = volatilityFor(row.assetCategory, row.timeframe, id);
  const sentiment_alignment = sentimentFor(row.direction);
  const community_bias = communityBias(row.direction, id);
  const h = hashToUnit(id);
  const discussion_active = h > 0.68;
  const creator_replied_recently = h > 0.84;
  const signal_access = deriveSignalAccessTier(row);
  const signal_package_label = deriveSignalPackageLabel(id);
  const c24 = copies24h(row.copies_count, id);
  const pd = hashToUnit(`${id}-pd`);
  const su = hashToUnit(`${id}-su`);

  return {
    ...row,
    risk_reward_ratio,
    lifecycle_phase,
    signal_hit_rate_lookback_pct: hitRateLookback(row.analyst.accuracy, id),
    analyst_win_rate_pct: row.analyst.accuracy,
    volatility_hint,
    sentiment_alignment,
    timeframe_category: timeframeCategory(row.timeframe, row.strategy),
    freshness_score: freshnessScore(row.created_at, row.likes_count, row.copies_count, id),
    community_copies_24h: c24,
    discussion_active,
    community_bias,
    creator_replied_recently,
    thesis_grade: thesisGrade(row.confidence),
    performance_preview_pct: performancePreview(row.is_active, row.sparkline, id),
    signal_access,
    signal_package_label,
    premium_preview_snippet: premiumPreviewSnippet(row.rationale, id),
    subscriber_copies_24h: deriveSubscriberCopies24h(c24, id),
    premium_discussion: pd > 0.88 && signal_access !== "public",
    strategy_update_ping: su > 0.91 && signal_access !== "public",
  };
}
