import type { ServerAffinityProfile } from "./fetch-user-affinity-profile";

let cached: { userId: string | null; profile: ServerAffinityProfile | null } | null = null;

export function setServerAffinityCache(userId: string | null, profile: ServerAffinityProfile | null): void {
  cached = { userId, profile };
}

export function getServerAffinityCache(userId: string | null): ServerAffinityProfile | null {
  if (!cached) return null;
  if (userId != null && cached.userId !== userId) return null;
  return cached.profile;
}

export function clearServerAffinityCache(): void {
  cached = null;
}
