export const LS_ONBOARDING_DRAFT = "marketly-onboarding-draft-v1";
export const LS_ONBOARDING_DONE = "marketly-onboarding-complete-v1";

export function readOnboardingDoneLocal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LS_ONBOARDING_DONE) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingDoneLocal(): void {
  try {
    localStorage.setItem(LS_ONBOARDING_DONE, "1");
    localStorage.removeItem(LS_ONBOARDING_DRAFT);
  } catch {
    /* */
  }
}

export function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* */
  }
}
