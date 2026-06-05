import type { OnboardingCatalog, OnboardingDraft, OnboardingIntelPartial } from "../domain/types";
import type { OnboardingRepository } from "./onboarding-repository";

const EMPTY_CATALOG: OnboardingCatalog = {
  identities: [],
  topics: [],
  market_themes: [],
  signal_styles: [],
  strategies: [],
  creators: [],
  personas: [],
  creator_hints: [],
  nav_after: [
    { href: "/", label: "Ana" },
    { href: "/discover", label: "Keşfet" },
  ],
  watchlist_starter_symbols: [],
};

export class SupabaseOnboardingRepository implements OnboardingRepository {
  getCatalog(): OnboardingCatalog {
    return EMPTY_CATALOG;
  }

  getIntelPartial(draft: Partial<OnboardingDraft>): OnboardingIntelPartial {
    void draft;
    return {
      progress_pct: 0,
      confidence_hint: "Canlı onboarding RPC bekleniyor.",
      adaptive_hint: "—",
      exploration_line: "—",
      strategy_summary: "—",
    };
  }

  saveDraft(): void {
    /* TODO: profiles.onboarding_json */
  }

  loadDraft(): Partial<OnboardingDraft> | null {
    return null;
  }

  applyBootstrap(): void {
    /* TODO: edge function */
  }

  skipWithMinimalSeed(): void {
    /* no-op */
  }

  markComplete(): void {
    /* TODO */
  }

  needsOnboarding(): boolean {
    return false;
  }
}
