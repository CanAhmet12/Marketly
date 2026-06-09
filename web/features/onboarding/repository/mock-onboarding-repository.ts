import { getHomeRepository } from "@/features/home/repository";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { isMockDataEnabled } from "@/mock/config";

import type {
  OnboardingCatalog,
  OnboardingDraft,
  OnboardingIntelPartial,
} from "../domain/types";
import type { OnboardingRepository } from "./onboarding-repository";

import {
  LS_ONBOARDING_DRAFT,
  markOnboardingDoneLocal,
  readJsonStorage,
  readOnboardingDoneLocal,
  writeJsonStorage,
} from "@/features/onboarding/lib/onboarding-storage";
import { buildOnboardingCatalog } from "@/features/onboarding/lib/onboarding-catalog";

function bumpPersonalization() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
}

export class MockOnboardingRepository implements OnboardingRepository {
  getCatalog(): OnboardingCatalog {
    const creators = getHomeRepository()
      .getRecommendedCreators()
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        label: c.name,
        handle: c.handle.startsWith("@") ? c.handle : `@${c.handle}`,
      }));

    return buildOnboardingCatalog(creators);
  }


  getIntelPartial(draft: Partial<OnboardingDraft>): OnboardingIntelPartial {
    const p = getPersonalizationRepository();
    const snap = p.getRecommendationAdaptationSnapshot(null);
    let score = 0;
    const max = 9;
    if (draft.identity) score += 1;
    score += Math.min(2, (draft.interest_topic_ids?.length ?? 0) / 3);
    score += Math.min(2, (draft.creator_ids?.length ?? 0) / 2);
    score += Math.min(1, (draft.market_theme_ids?.length ?? 0) / 2);
    if (draft.signal_style) score += 1;
    if (draft.strategy) score += 1;
    if (draft.watchlist_symbols?.length) score += 1;
    const progress_pct = Math.min(100, Math.round((score / max) * 100));
    const confidence_hint = snap.coldData ? "SoÄŸuk baÅŸlangÄ±Ã§ â€” seÃ§imler gÃ¼ven skorunu yÃ¼kseltir." : `GÃ¼ven bandÄ±: ${Math.round(snap.overallConfidence * 100)}% Â· keÅŸif payÄ± %${Math.round(snap.explorationShare * 100)}`;
    const adaptive_hint = snap.hints[0] ?? snap.subline;
    const exploration_line = `Ã–nerilen keÅŸif payÄ±: %${Math.round(snap.explorationShare * 100)} â€” onboarding tamamlanÄ±nca akÄ±ÅŸlar gÃ¼ncellenir.`;
    const strategy_summary =
      draft.strategy === "macro"
        ? "Makro aÄŸÄ±rlÄ±klÄ± profil"
        : draft.strategy === "momentum"
          ? "Momentum aÄŸÄ±rlÄ±klÄ± profil"
          : draft.strategy === "value"
            ? "DeÄŸer odaklÄ± profil"
            : "Dengeli strateji profili";
    return { progress_pct, confidence_hint, adaptive_hint, exploration_line, strategy_summary };
  }

  saveDraft(draft: Partial<OnboardingDraft>): void {
    writeJsonStorage(LS_ONBOARDING_DRAFT, draft);
  }

  loadDraft(): Partial<OnboardingDraft> | null {
    const d = readJsonStorage<Partial<OnboardingDraft> | null>(LS_ONBOARDING_DRAFT, null);
    return d && typeof d === "object" ? d : null;
  }

  markComplete(): void {
    markOnboardingDoneLocal();
    bumpPersonalization();
  }

  needsOnboarding(): boolean {
    if (typeof window === "undefined") return false;
    if (!isMockDataEnabled()) return false;
    return !readOnboardingDoneLocal();
  }

  skipWithMinimalSeed(viewerId: string | null): void {
    const p = getPersonalizationRepository();
    p.recordAdaptiveLearning({ type: "discover_tab_view", tab: "trending" });
    if (viewerId) p.recordAdaptiveLearning({ type: "positive_creator", creatorId: viewerId });
    this.markComplete();
  }

  applyBootstrap(viewerId: string | null, draft: OnboardingDraft): void {
    const p = getPersonalizationRepository();
    if (draft.skipped) {
      this.skipWithMinimalSeed(viewerId);
      return;
    }

    for (const token of draft.interest_topic_ids.slice(0, 10)) {
      p.applyFeedFeedback({ type: "interested_topic", token });
      p.applyExplorationFeedback({ type: "interested_exploration_theme", themeId: token });
      p.recordInteraction({ kind: "content_view", topicToken: token, quality: 0.45, surface: "onboarding" });
    }

    for (const cid of draft.creator_ids.slice(0, 8)) {
      p.applyExplorationFeedback({ type: "interested_exploration_creator", creatorId: cid });
      p.applyRecommendationFeedback({ type: "rec_follow_interest", creatorId: cid });
      p.recordAdaptiveLearning({ type: "positive_creator", creatorId: cid });
    }

    for (const th of draft.market_theme_ids.slice(0, 6)) {
      p.applyRecommendationFeedback({ type: "rec_interested_market_theme", themeId: th });
    }

    if (draft.strategy) {
      p.applyRecommendationFeedback({ type: "rec_interested_strategy", strategyId: draft.strategy });
    }

    if (draft.signal_style) {
      p.recordAdaptiveLearning({ type: "recommendation_rail_view", surface: `onboarding_signal_${draft.signal_style}` });
    }

    const tab =
      draft.macro_vs_momentum < -0.25 ? "trending" : draft.macro_vs_momentum > 0.25 ? "signals" : "creators";
    p.recordAdaptiveLearning({ type: "discover_tab_view", tab });

    for (const sym of draft.watchlist_symbols.slice(0, 8)) {
      p.recordInteraction({
        kind: "asset_view",
        assetSymbol: sym,
        quality: 0.55,
        surface: "onboarding_watchlist_seed",
      });
    }

    if (draft.identity === "creator" && viewerId) {
      p.recordInteraction({ kind: "creator_view", creatorId: viewerId, quality: 0.7, surface: "onboarding_creator_identity" });
    }

    if (draft.identity === "trader" || draft.identity === "analyst") {
      p.recordAdaptiveLearning({ type: "recommendation_rail_view", surface: `onboarding_identity_${draft.identity}` });
    }

    this.markComplete();
  }
}
