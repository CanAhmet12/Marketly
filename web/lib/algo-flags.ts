import { logAlgoMetricEvent } from "@/lib/log-algo-metric";
import type { AlgoExperimentId } from "@/lib/algo-experiment";

/**
 * algo-flags.ts — Algoritma Feature Flag Sistemi
 *
 * Araştırma kaynakları (Sprint 2 — Bölüm 12.1):
 *  • Netflix Multi-Armed Bandit: epsilon-greedy policy (5% explore)
 *    "The value of a recommendation is its marginal contribution to discovery" (incrementality)
 *  • Spotify BaRT (Bandits as Recommendations as Treatments) — Mart 2025 deploy
 *    "epsilon-greedy: mostly exploits best-known action, occasionally explores"
 *  • eugeneyan.com/writing/bandits: Thompson Sampling vs UCB vs epsilon-greedy
 *    → Spotify üretimde epsilon-greedy seçti: basit, propensity scoring ile uyumlu
 *
 * Kullanım:
 *  - Her algoritma değişikliği flag'la kapılı → anında geri alınabilir
 *  - EPSILON = 0.05 → %5 zaman yeni varyantı test et, %95 en iyi bilineni kullan
 *  - Flag'lar env'den veya runtime override'dan okunur
 *
 * Aktivasyon (Supabase env):
 *  NEXT_PUBLIC_ALGO_DISCOVER_RANK=true
 *  NEXT_PUBLIC_ALGO_SIGNAL_TREND=true
 *  NEXT_PUBLIC_ALGO_HOME_RANKING=true
 *  NEXT_PUBLIC_ALGO_HYBRID_SEARCH=true
 */

// ── Epsilon-greedy exploration sabiti (Spotify BaRT'tan) ──
const EPSILON = 0.05;

function envBool(key: string): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env[key];
  return v === "true" || v === "1";
}

function shouldExplore(): boolean {
  return Math.random() < EPSILON;
}

/**
 * Tüm algoritma flag'larının merkezi yönetimi
 */
export const AlgoFlags = {
  /**
   * Sprint 2 — Discover feed TikTok iki-aşamalı ranking
   * Aktif: tab-aware scoring + diversity window
   */
  get discoverRanking(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_DISCOVER_RANK") || shouldExplore();
  },

  /**
   * Sprint 1 — Sinyal feed Gaussian decay trending skoru
   * Aktif: chronoloji yerine hybrid trend scoring
   */
  get signalTrendScore(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_SIGNAL_TREND") || shouldExplore();
  },

  /**
   * Sprint 3 — Home feed sunucu tarafı kişiselleştirilmiş sıralama
   * Aktif: likes DESC → get_personalized_feed RPC
   */
  get homeServerRanking(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_HOME_RANKING");
  },

  /**
   * Sprint 3 — BM25 + pgvector hibrit arama
   * Aktif: ILIKE → tsvector + vector search RRF füzyonu
   */
  get hybridSearch(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_HYBRID_SEARCH");
  },

  /**
   * Sprint 4 — Creator composite leaderboard skoru
   * Aktif: signal_accuracy DESC → çok boyutlu composite
   */
  get creatorCompositeScore(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_CREATOR_COMPOSITE");
  },

  /**
   * Sprint 4 — Sinyal collaborative filtering önerileri
   * Aktif: signal_recommendations MV canlı kullanımı
   */
  get signalCollaborativeFilter(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_SIGNAL_CF");
  },

  /**
   * Sprint 5 — Kişiselleştirme sunucu sync
   * Aktif: localStorage affinity → Supabase user_affinity_profiles
   */
  get personalizationServerSync(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_PERS_SYNC");
  },

  /**
   * Sprint 9 — Piyasa verisi algoritmaları
   * Aktif: Pearson korelasyon, LM sentiment, assets tabanlı kategori
   */
  get marketDataAlgorithms(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_MARKET_DATA");
  },

  /**
   * Sprint 10 — Bildirim önceliklendirme
   * Aktif: kişisel skor + akıllı gruplandırma
   */
  get notificationPrioritization(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_NOTIF_PRIO");
  },

  /**
   * Sprint 11 — Sosyal tartışma önerileri
   * Aktif: get_personalized_discussions RPC + canlı rail
   */
  get discussionRecommendations(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_DISCUSSION_REC");
  },

  /**
   * Sprint 12 — A/B metrik logging
   * Aktif: algorithm_experiments tablosuna RPC ingest
   */
  get algoMetricsLogging(): boolean {
    return envBool("NEXT_PUBLIC_ALGO_METRICS");
  },
} as const;

/**
 * Metrik logging — `log_algorithm_experiment` RPC (debounced batch)
 */
export function logAlgoMetric(params: {
  flag: keyof typeof AlgoFlags;
  variant?: "control" | "treatment" | "explore";
  metric: "impression" | "click" | "engagement" | "conversion";
  value?: number;
  meta?: Record<string, unknown>;
}): void {
  if (params.flag === "algoMetricsLogging") return;
  logAlgoMetricEvent({
    experimentId: params.flag as AlgoExperimentId,
    metric: params.metric,
    value: params.value,
    variant: params.variant,
    meta: params.meta,
  });
}

/**
 * Epsilon-greedy varyant seçici
 * Araştırma: Spotify — "epsilon-greedy for its simplicity in production and propensity scoring"
 */
export function pickVariant<T>(
  bestKnown: T,
  alternatives: T[],
  epsilon = EPSILON,
): T {
  if (alternatives.length === 0) return bestKnown;
  if (Math.random() < epsilon) {
    return alternatives[Math.floor(Math.random() * alternatives.length)] ?? bestKnown;
  }
  return bestKnown;
}
