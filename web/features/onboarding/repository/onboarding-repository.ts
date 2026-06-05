import type {
  OnboardingCatalog,
  OnboardingDraft,
  OnboardingIntelPartial,
} from "@/features/onboarding/domain/types";

export type OnboardingRepository = {
  getCatalog(): OnboardingCatalog;
  getIntelPartial(draft: Partial<OnboardingDraft>): OnboardingIntelPartial;
  saveDraft(draft: Partial<OnboardingDraft>): void;
  loadDraft(): Partial<OnboardingDraft> | null;
  applyBootstrap(viewerId: string | null, draft: OnboardingDraft): void;
  skipWithMinimalSeed(viewerId: string | null): void;
  markComplete(): void;
  needsOnboarding(): boolean;
};
