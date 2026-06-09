import type { SupabaseClient } from "@supabase/supabase-js";

import type { OnboardingDraft } from "@/features/onboarding/domain/types";
import { markOnboardingDoneLocal } from "@/features/onboarding/lib/onboarding-storage";

export type OnboardingProfileState = {
  completed: boolean;
  draft: Partial<OnboardingDraft> | null;
};

export async function fetchOnboardingProfileState(
  client: SupabaseClient,
  userId: string,
): Promise<OnboardingProfileState> {
  const { data, error } = await client
    .from("profiles")
    .select("onboarding_completed_at, onboarding_json")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703") return { completed: false, draft: null };
    console.warn("[onboarding] fetchProfile", error.message);
    return { completed: false, draft: null };
  }

  const completed = Boolean(data?.onboarding_completed_at);
  if (completed) markOnboardingDoneLocal();

  let draft: Partial<OnboardingDraft> | null = null;
  const raw = data?.onboarding_json;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    draft = raw as Partial<OnboardingDraft>;
  }

  return { completed, draft };
}

export async function persistOnboardingComplete(
  client: SupabaseClient,
  userId: string,
  draft: OnboardingDraft,
): Promise<{ ok: boolean; error?: string }> {
  markOnboardingDoneLocal();
  const now = new Date().toISOString();
  const { error } = await client
    .from("profiles")
    .update({
      onboarding_completed_at: now,
      onboarding_json: { ...draft, completed_at: now },
    })
    .eq("id", userId);

  if (error) {
    if (error.code === "42703") {
      markOnboardingDoneLocal();
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  markOnboardingDoneLocal();
  return { ok: true };
}

export async function needsOnboardingAsync(
  client: SupabaseClient | null,
  userId: string | null,
): Promise<boolean> {
  if (typeof window !== "undefined") {
    const { readOnboardingDoneLocal } = await import("@/features/onboarding/lib/onboarding-storage");
    if (readOnboardingDoneLocal()) return false;
  }
  if (!client || !userId) return false;
  const state = await fetchOnboardingProfileState(client, userId);
  return !state.completed;
}
