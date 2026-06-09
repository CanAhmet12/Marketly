import type { SupabaseClient } from "@supabase/supabase-js";

import { insertFollow } from "@/features/channel/fetch-follow";
import type { OnboardingDraft } from "@/features/onboarding/domain/types";
import { addToWatchlistDb } from "@/features/markets/fetch-watchlist";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { readWelcomeInterests } from "@/features/welcome/welcome-storage";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { isMockDataEnabled } from "@/mock/config";

/** Kişiselleştirme + watchlist + takip — setup tamamlanınca */
export async function applyOnboardingBootstrap(
  client: SupabaseClient | null,
  viewerId: string | null,
  draft: OnboardingDraft,
): Promise<void> {
  const p = getPersonalizationRepository();

  const welcomeTopics = readWelcomeInterests();
  const topics = [...new Set([...welcomeTopics, ...(draft.interest_topic_ids ?? [])])].slice(0, 8);

  for (const token of topics) {
    p.applyFeedFeedback({ type: "interested_topic", token });
    p.applyExplorationFeedback({ type: "interested_exploration_theme", themeId: token });
    p.recordInteraction({ kind: "content_view", topicToken: token, quality: 0.5, surface: "onboarding" });
  }

  for (const cid of (draft.creator_ids ?? []).slice(0, 5)) {
    p.applyExplorationFeedback({ type: "interested_exploration_creator", creatorId: cid });
    p.applyRecommendationFeedback({ type: "rec_follow_interest", creatorId: cid });
    if (client && viewerId && isWebWriteEnabled() && !isMockDataEnabled()) {
      await insertFollow(client, viewerId, cid).catch(() => undefined);
    }
  }

  const symbols =
    draft.watchlist_symbols.length > 0
      ? draft.watchlist_symbols
      : draft.skipped
        ? ["BTC", "ETH"]
        : [];

  for (const sym of symbols.slice(0, 6)) {
    p.recordInteraction({
      kind: "asset_view",
      assetSymbol: sym,
      quality: 0.55,
      surface: "onboarding_watchlist_seed",
    });
    if (client && viewerId && isWebWriteEnabled() && !isMockDataEnabled()) {
      await addToWatchlistDb(client, viewerId, sym).catch(() => undefined);
    }
  }

  if (draft.identity === "trader" || draft.identity === "analyst") {
    p.recordAdaptiveLearning({ type: "recommendation_rail_view", surface: `onboarding_identity_${draft.identity}` });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
  }
}
