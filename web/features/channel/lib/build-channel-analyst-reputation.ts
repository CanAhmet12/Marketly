import type { ChannelProfile } from "@/features/channel/types";
import type { AnalystBadgeId, AnalystReputationProfile } from "@/features/signals/intelligence/types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Canlı mod — profil + sinyal sayısından minimal itibar özeti */
export function buildChannelAnalystReputationFromProfile(
  profile: ChannelProfile,
  signalsCount: number,
  displayName: string,
): AnalystReputationProfile | null {
  const accuracy = profile.signal_accuracy;
  if (accuracy == null && signalsCount === 0) return null;

  const trust = accuracy != null ? clamp(accuracy, 40, 95) : clamp(52 + signalsCount * 3, 48, 78);
  const consistency =
    accuracy != null ? clamp(accuracy * 0.9, 38, 90) : clamp(48 + signalsCount * 2, 42, 72);
  const riskAdjusted =
    accuracy != null ? clamp(accuracy * 0.85, 35, 88) : clamp(45 + signalsCount * 2.5, 40, 70);

  const badges: AnalystBadgeId[] = [];
  if (profile.verified) badges.push("community_trusted");
  if (profile.tier === "elite" || profile.tier === "pro") badges.push("premium_strategist");
  if (accuracy != null && accuracy >= 70) badges.push("veteran_analyst");
  if (profile.follower_count < 5000 && signalsCount >= 3) badges.push("rising_creator");
  if (profile.specialties?.some((s) => /makro|macro/i.test(s))) badges.push("macro_specialist");

  const headline =
    trust >= 78
      ? "Yüksek güven profili — tutarlı sinyal üretimi"
      : trust >= 62
        ? "Dengeli üretici — risk ayarlı görünüm"
        : signalsCount > 0
          ? "Gelişen üretici — örneklem genişledikçe skorlar sıkılaşır"
          : "Sinyal geçmişi oluşuyor";

  return {
    analystId: profile.id,
    display: displayName,
    headline,
    scores: {
      trustScore: trust,
      consistencyScore: consistency,
      convictionQuality: clamp(trust * 0.88, 35, 85),
      riskAdjustedPerformance: riskAdjusted,
      communityTrust: clamp((profile.follower_count > 0 ? 58 : 45) + (profile.verified ? 12 : 0), 40, 88),
      engagementQuality: clamp(50 + signalsCount * 2, 42, 80),
      premiumReputation: profile.subscriber_count > 0 ? clamp(60 + profile.subscriber_count / 10, 55, 90) : 48,
      signalLongevity: clamp(45 + signalsCount * 2.5, 40, 82),
      specializationStrength: profile.specialties?.length ? clamp(52 + profile.specialties.length * 6, 48, 85) : 44,
      strategyQuality: profile.strategy_style ? 62 : 50,
    },
    badges: badges.slice(0, 4),
  };
}
