import type { SignalsFeedRow } from "@/features/signals/repository/types";

const NOW = () => Date.now();

function economyBoost(row: SignalsFeedRow): number {
  if (row.signal_access === "public") return 0;
  if (row.signal_access === "premium") return 2.4;
  if (row.signal_access === "subscriber_only") return 3.1;
  if (row.signal_access === "preview_only") return 2.8;
  return 1.6;
}

/**
 * Trend sıralaması — tazelik, güven, etkileşim, analist kalitesi, doğrulanmışlık.
 * Üretimde RPC ile değiştirilebilir; şimdilik deterministik istemci skoru.
 */
export function signalMarketplaceTrendScore(row: SignalsFeedRow, now = NOW()): number {
  const ageH = Math.max(0.25, (now - new Date(row.created_at).getTime()) / 3_600_000);
  const freshness = Math.exp(-ageH / 28) * 38;
  const confW = row.confidence * 0.32;
  const engagement = Math.log1p(row.likes_count + row.copies_count * 2.1 + row.community_copies_24h * 3) * 5.5;
  const analyst = (row.analyst.accuracy ?? 52) * 0.14;
  const verified = row.analyst.verified ? 4 : 0;
  const thesis = row.thesis_grade === "A" ? 6 : row.thesis_grade === "B" ? 3 : 0;
  const lifecycle =
    row.lifecycle_phase === "near_target" || row.lifecycle_phase === "target_hit"
      ? 5
      : row.lifecycle_phase === "developing"
        ? 2
        : 0;
  const rr = row.risk_reward_ratio != null ? Math.min(8, row.risk_reward_ratio * 1.1) : 0;
  return freshness + confW + engagement + analyst + verified + thesis + lifecycle + rr + economyBoost(row);
}

export function signalCreatorQualityScore(row: SignalsFeedRow): number {
  const f = Math.log1p(row.analyst.follower_count) * 2.1;
  const a = (row.analyst.accuracy ?? 50) * 0.45;
  const streak = row.analyst.verified ? 6 : 0;
  const spec = Math.min(8, (row.analyst.specialties?.length ?? 0) * 2);
  const tier =
    row.analyst.tier && row.analyst.tier !== "free"
      ? row.analyst.tier === "elite"
        ? 5
        : 3
      : 0;
  return f + a + streak + spec + tier + economyBoost(row) * 0.85;
}
