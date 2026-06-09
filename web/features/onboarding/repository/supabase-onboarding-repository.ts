import type { SupabaseClient } from "@supabase/supabase-js";

import { applyOnboardingBootstrap } from "@/features/onboarding/apply-onboarding-bootstrap";
import type { OnboardingCatalog, OnboardingDraft, OnboardingIntelPartial } from "../domain/types";
import { fetchOnboardingProfileState, persistOnboardingComplete } from "../fetch-onboarding-profile";
import { buildOnboardingCatalog } from "../lib/onboarding-catalog";
import {
  LS_ONBOARDING_DRAFT,
  markOnboardingDoneLocal,
  readJsonStorage,
  readOnboardingDoneLocal,
  writeJsonStorage,
} from "../lib/onboarding-storage";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type { OnboardingRepository } from "./onboarding-repository";

export class SupabaseOnboardingRepository implements OnboardingRepository {
  getCatalog(): OnboardingCatalog {
    return buildOnboardingCatalog();
  }

  getIntelPartial(draft: Partial<OnboardingDraft>): OnboardingIntelPartial {
    const p = getPersonalizationRepository();
    const snap = p.getRecommendationAdaptationSnapshot(null);
    let score = 0;
    const max = 6;
    if (draft.identity) score += 1;
    score += Math.min(2, (draft.interest_topic_ids?.length ?? 0) / 2);
    score += Math.min(1, (draft.watchlist_symbols?.length ?? 0) / 2);
    score += Math.min(1, (draft.creator_ids?.length ?? 0) / 2);
    const progress_pct = Math.min(100, Math.round((score / max) * 100));
    return {
      progress_pct,
      confidence_hint: snap.coldData ? "Seçimler öneri güvenini artırır." : `Güven: %${Math.round(snap.overallConfidence * 100)}`,
      adaptive_hint: snap.hints[0] ?? snap.subline,
      exploration_line: `Keşif payı %${Math.round(snap.explorationShare * 100)}`,
      strategy_summary: draft.identity ? `${draft.identity} profili` : "Profil seçilmedi",
    };
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
  }

  needsOnboarding(): boolean {
    return !readOnboardingDoneLocal();
  }

  skipWithMinimalSeed(viewerId: string | null): void {
    void this._bootstrap(viewerId, { ...this._emptyDraft(), skipped: true });
  }

  applyBootstrap(viewerId: string | null, draft: OnboardingDraft): void {
    void this._bootstrap(viewerId, draft);
  }

  private _emptyDraft(): OnboardingDraft {
    return {
      identity: null,
      interest_topic_ids: [],
      creator_ids: [],
      market_theme_ids: [],
      signal_style: null,
      strategy: null,
      macro_vs_momentum: 0,
      watchlist_symbols: [],
      skipped: false,
    };
  }

  private async _bootstrap(viewerId: string | null, draft: OnboardingDraft): Promise<void> {
    let client: SupabaseClient | null = null;
    try {
      client = getSupabaseBrowserClient();
    } catch {
      client = null;
    }

    await applyOnboardingBootstrap(client, viewerId, draft);

    if (client && viewerId) {
      await persistOnboardingComplete(client, viewerId, draft);
    } else {
      this.markComplete();
    }
  }

  /** Auth init sırasında profil durumunu senkronize et */
  async syncFromProfile(userId: string): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      const state = await fetchOnboardingProfileState(client, userId);
      if (state.completed) markOnboardingDoneLocal();
      if (state.draft) writeJsonStorage(LS_ONBOARDING_DRAFT, state.draft);
    } catch {
      /* */
    }
  }
}
