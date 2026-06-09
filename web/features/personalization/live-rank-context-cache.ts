import type { LiveRankContext } from "./fetch-live-rank-context";

let cached: { userId: string | null; ctx: LiveRankContext } | null = null;

export function setLiveRankContextCache(userId: string | null, ctx: LiveRankContext): void {
  cached = { userId, ctx };
}

export function getLiveRankContextCache(userId: string | null): LiveRankContext | null {
  if (!cached) return null;
  if (userId != null && cached.userId !== userId) return null;
  return cached.ctx;
}

/** Kişiselleştirme snapshot — en son yüklenen bağlam */
export function getLatestLiveRankContext(): LiveRankContext | null {
  return cached?.ctx ?? null;
}

export function getLiveRankContextUserId(): string | null {
  return cached?.userId ?? null;
}

export function clearLiveRankContextCache(): void {
  cached = null;
}
