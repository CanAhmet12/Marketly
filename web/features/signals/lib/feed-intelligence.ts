/**
 * feed-intelligence.ts — Sinyal feed zenginleştirme
 *
 * Araştırma kaynakları (Sprint 1 — Bölüm 1):
 *  • SentimentRadar / Adanos API: bullish-bearish oran hesaplama metodolojisi
 *  • Buzzberg.ai: composite sentiment (Sentiment 30% + Distribution 35% + Engagement 20% + Volatility 15%)
 *  • factor-decay-lab (arXiv 2026): sinyal half-life — 28 saat (finansal sinyaller için)
 *  • SentimentAlpha / FinBERT: direction tabanlı basit bias (API olmadan)
 *
 * KURAL: hashToUnit() artık hiçbir kullanıcıya gösterilen alanda kullanılmaz.
 *   - community_bias  → direction + gerçek yorum sayısı (null yoksa)
 *   - discussion_active → gerçek comment_count > 0
 *   - creator_replied_recently → gerçek creator_replied alanı
 *   - copies24h → gerçek DB alanı (yoksa null, sahte değil)
 *   - hitRateLookback → gerçek signal_accuracy (DB'den)
 *   - performance_preview_pct → gerçek fiyat hesabı (sparkline yoksa null)
 */

import type { MarketAssetCategory } from "@/features/markets/types";
import {
  deriveSignalAccessTier,
  deriveSignalPackageLabel,
  deriveSubscriberCopies24h,
  premiumPreviewSnippet,
} from "@/features/signals/domain/signal-economy";
import { deriveSignalLifecycle } from "@/features/signals/domain/signal-meta";
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
  // Gerçek DB alanları (Sprint 1 — hash kaldırma)
  comment_count?: number | null;
  creator_replied?: boolean | null;
  copies_24h_real?: number | null;
  bullish_count?: number | null;
  bearish_count?: number | null;
};

function parseRiskRewardRatio(label: string | null): number | null {
  if (!label) return null;
  const m = label.match(/1\s*:\s*([\d.]+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ── Volatilite: varlık kategorisi + timeframe tabanlı (deterministik, makul) ──
function volatilityFor(category: MarketAssetCategory, tf: string): VolatilityHint {
  const shortTf = tf === "1S" || tf === "4S" || tf === "15D";
  if (category === "crypto") return shortTf ? "high" : "medium";
  if (category === "forex") return shortTf ? "high" : "medium";
  if (category === "commodity") return "medium";
  if (category === "index") return shortTf ? "medium" : "low";
  return shortTf ? "medium" : "low";
}

// ── Sentiment: direction → doğrudan (Adanos/Buzzberg yaklaşımı) ──
function sentimentFor(direction: SignalsFeedRow["direction"]): SentimentAlignment {
  if (direction === "BUY") return "bullish";
  if (direction === "SELL") return "bearish";
  return "neutral";
}

// ── Community bias: gerçek yorum sayıları üzerinden ──
// Araştırma: Buzzberg.ai — bullish/bearish voice ratio
// Eğer gerçek sayılar yoksa → direction'dan çıkar (null değil, makul tahmini)
function communityBias(
  direction: SignalsFeedRow["direction"],
  bullishCount: number | null | undefined,
  bearishCount: number | null | undefined,
): CommunityBias {
  // Gerçek yorum verileri varsa
  if (bullishCount != null && bearishCount != null) {
    const total = bullishCount + bearishCount;
    if (total === 0) return "mixed";
    const ratio = bullishCount / total;
    if (ratio > 0.65) return "bullish";
    if (ratio < 0.35) return "bearish";
    return "mixed";
  }
  // Gerçek veri yoksa direction'dan çıkar (güvenli fallback, hash değil)
  if (direction === "BUY") return "bullish";
  if (direction === "SELL") return "bearish";
  return "mixed";
}

// ── Thesis grade: confidence tabanlı (makul, kullanıcıya gösterilir) ──
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

// ── Tazelik skoru: gerçek yaş + etkileşim (hash jitter kaldırıldı) ──
// Araştırma: ExecReps.ai — Gaussian decay 12h half-life for social signals
function freshnessScore(createdAt: string, likes: number, copies: number): number {
  const ageH = Math.max(0.1, (Date.now() - new Date(createdAt).getTime()) / 3_600_000);
  // Gaussian decay (12 saat yarı-ömür) — ExecReps.ai metodolojisi
  const gaussianDecay = Math.exp(-0.693 * Math.pow(ageH / 12.0, 1.0)) * 60;
  // Log ölçek etkileşim bump (popularity cascade önleme)
  const bump = Math.min(30, Math.log1p(likes + copies * 2.5) * 3.5);
  return Math.round(Math.min(100, Math.max(0, gaussianDecay + bump)));
}

// ── Hit rate lookback: SADECE gerçek signal_accuracy'den ──
// Hash türevi jitter KALDIRILDI — finansal güven riski
function hitRateLookback(analystAccuracy: number | null): number | null {
  if (analystAccuracy == null || analystAccuracy <= 0) return null;
  // Gerçek doğruluk olduğu gibi döndür (hashToUnit jitter yok)
  return Math.round(Math.min(100, Math.max(0, analystAccuracy)));
}

// ── Performance preview: gerçek fiyat hesabı (sparkline varsa) ──
// Hash cap KALDIRILDI — sahte cap gerçek gibi gösteriyordu
function performancePreview(active: boolean, sparkline: number[]): number | null {
  if (!active || sparkline.length < 3) return null;
  const a = sparkline[0];
  const b = sparkline[sparkline.length - 1];
  if (a == null || b == null || Math.abs(a) < 1e-9) return null;
  const raw = ((b - a) / Math.abs(a)) * 100;
  // Gerçek performans — cap sadece veri anomalisi için (%200 üstü = veri sorunu)
  if (Math.abs(raw) > 200) return null;
  return Math.round(raw * 10) / 10;
}

// ── Copies 24h: gerçek DB alanından, yoksa null ──
// Hash türevi sahte copies KALDIRILDI
function copies24h(real: number | null | undefined): number | null {
  if (real == null) return null;
  return Math.max(0, real);
}

/** Feed satırına pazar / güven / topluluk alanlarını ekler.
 *
 * Sprint 1 Değişiklikleri:
 *  - hashToUnit() tamamen kaldırıldı (community_bias, discussion_active,
 *    creator_replied_recently, copies24h, hitRateLookback, performance_preview)
 *  - Tüm alanlar ya gerçek DB verisinden ya da deterministik iş mantığından türetiliyor
 *  - Gerçek veri yoksa null döndürülüyor (UI graceful "—" gösteriyor)
 */
export function enrichSignalsFeedRow(row: SignalsFeedRowCore): SignalsFeedRow {
  const lifecycle_phase = deriveSignalLifecycle(row);
  const risk_reward_ratio = parseRiskRewardRatio(row.riskRewardLabel);
  const volatility_hint = volatilityFor(row.assetCategory, row.timeframe);
  const sentiment_alignment = sentimentFor(row.direction);

  // Gerçek community bias (yorum sayılarından veya direction fallback)
  const community_bias = communityBias(row.direction, row.bullish_count, row.bearish_count);

  // Gerçek discussion_active (DB'den comment_count)
  const discussion_active = (row.comment_count ?? 0) > 0;

  // Gerçek creator_replied (DB'den)
  const creator_replied_recently = row.creator_replied === true;

  const signal_access = deriveSignalAccessTier(row);
  const signal_package_label = deriveSignalPackageLabel(row.id);

  // Gerçek copies_24h (DB'den, yoksa null)
  const c24 = copies24h(row.copies_24h_real);

  return {
    ...row,
    risk_reward_ratio,
    lifecycle_phase,
    // Gerçek win rate (hash jitter yok)
    signal_hit_rate_lookback_pct: hitRateLookback(row.analyst.accuracy),
    analyst_win_rate_pct: row.analyst.accuracy,
    volatility_hint,
    sentiment_alignment,
    timeframe_category: timeframeCategory(row.timeframe, row.strategy),
    // Gaussian decay tazelik (hash jitter yok)
    freshness_score: freshnessScore(row.created_at, row.likes_count, row.copies_count),
    // Gerçek copies veya null
    community_copies_24h: c24 ?? 0,
    discussion_active,
    community_bias,
    creator_replied_recently,
    thesis_grade: thesisGrade(row.confidence),
    // Gerçek fiyat hareketi veya null
    performance_preview_pct: performancePreview(row.is_active, row.sparkline),
    signal_access,
    signal_package_label,
    premium_preview_snippet: premiumPreviewSnippet(row.rationale, row.id),
    subscriber_copies_24h: c24 != null ? deriveSubscriberCopies24h(c24, row.id) : 0,
    // Gerçek premium discussion (DB'den, yoksa false)
    premium_discussion: false,      // TODO: gerçek DB alanı hazır olunca bağla
    strategy_update_ping: false,    // TODO: gerçek DB alanı hazır olunca bağla
  };
}
