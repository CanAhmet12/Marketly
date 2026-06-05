import type { CreatorDirectoryRow } from "@/features/creators/types";

/** Tazelik vitrini — editör seçkisinde olmayan yükselen üreticiler. */
export function pickRisingCreators(
  rows: CreatorDirectoryRow[],
  excludeIds: readonly string[],
  limit = 8,
): CreatorDirectoryRow[] {
  const skip = new Set(excludeIds);
  return rows
    .filter((r) => r.rising && !skip.has(r.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
