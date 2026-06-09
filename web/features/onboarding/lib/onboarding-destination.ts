import type { OnboardingDraft, OnboardingIdentityMode } from "@/features/onboarding/domain/types";

/** Setup tamamlandıktan sonra ilk hedef */
export function resolveOnboardingDestination(draft: Partial<OnboardingDraft>): string {
  if (draft.skipped) return "/discover";

  const identity = draft.identity;
  switch (identity as OnboardingIdentityMode | null | undefined) {
    case "trader":
    case "analyst":
      return "/signals";
    case "investor":
      return "/watchlist";
    case "creator":
      return "/studio";
    case "explorer":
      return "/discover";
    default:
      if ((draft.watchlist_symbols?.length ?? 0) > 0) return "/watchlist";
      if ((draft.interest_topic_ids ?? []).includes("kripto") || (draft.interest_topic_ids ?? []).includes("bist")) {
        return "/markets";
      }
      return "/";
  }
}
