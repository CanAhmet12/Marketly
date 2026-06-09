const WELCOME_SEEN_KEY = "marketly-welcome-v1-seen";
const WELCOME_INTERESTS_KEY = "marketly-welcome-v1-interests";

export function hasWelcomeSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    /* */
  }
}

export function readWelcomeInterests(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WELCOME_INTERESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveWelcomeInterests(ids: string[]): void {
  try {
    localStorage.setItem(WELCOME_INTERESTS_KEY, JSON.stringify(ids.slice(0, 6)));
  } catch {
    /* */
  }
}
