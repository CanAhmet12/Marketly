/** Onboarding domain */

export type OnboardingIdentityMode =
  | "investor"
  | "trader"
  | "macro_follower"
  | "creator"
  | "educator"
  | "analyst"
  | "explorer";

export type OnboardingDraft = {
  identity: OnboardingIdentityMode | null;
  interest_topic_ids: string[];
  creator_ids: string[];
  market_theme_ids: string[];
  signal_style: "swing" | "scalp" | "balanced" | null;
  strategy: "value" | "momentum" | "macro" | "mixed" | null;
  /** -1 makro … +1 momentum */
  macro_vs_momentum: number;
  watchlist_symbols: string[];
  skipped: boolean;
};

export type OnboardingCatalog = {
  identities: { id: OnboardingIdentityMode; label: string; sub: string }[];
  topics: { id: string; label: string }[];
  market_themes: { id: string; label: string }[];
  signal_styles: { id: NonNullable<OnboardingDraft["signal_style"]>; label: string }[];
  strategies: { id: NonNullable<OnboardingDraft["strategy"]>; label: string }[];
  creators: { id: string; label: string; handle: string }[];
  personas: { id: string; label: string; subline: string; preset: Partial<OnboardingDraft> }[];
  creator_hints: string[];
  nav_after: { href: string; label: string }[];
  /** İlk watchlist seçimleri — UI sabitleri repo üzerinden */
  watchlist_starter_symbols: string[];
};

export type OnboardingIntelPartial = {
  progress_pct: number;
  confidence_hint: string;
  adaptive_hint: string;
  exploration_line: string;
  strategy_summary: string;
};
