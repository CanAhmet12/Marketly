import { isMockDataEnabled } from "@/mock/config";

import type { OnboardingRepository } from "./onboarding-repository";
import { MockOnboardingRepository } from "./mock-onboarding-repository";
import { SupabaseOnboardingRepository } from "./supabase-onboarding-repository";

export type { OnboardingRepository } from "./onboarding-repository";

let m: MockOnboardingRepository | null = null;
let s: SupabaseOnboardingRepository | null = null;

export function getOnboardingRepository(): OnboardingRepository {
  if (isMockDataEnabled()) {
    m ??= new MockOnboardingRepository();
    return m;
  }
  s ??= new SupabaseOnboardingRepository();
  return s;
}
