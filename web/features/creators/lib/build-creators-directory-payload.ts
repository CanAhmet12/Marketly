import { CREATOR_ASSET_PRESETS } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryPayload, CreatorDirectoryRow } from "@/features/creators/types";

function scoreRecommended(c: CreatorDirectoryRow): number {
  if (c.compositeScore != null && c.compositeScore > 0) {
    return c.compositeScore + (c.isLive ? 2.5 : 0);
  }
  const acc = c.signalAccuracy ?? 0;
  const tier = c.tier === "elite" ? 1.15 : c.tier === "pro" ? 1.08 : 1;
  const live = c.isLive ? 2.5 : 0;
  return acc * tier + live + Math.log1p(c.followerCount) * 0.35;
}

/** Favikon centile + eToro copy velocity — sunucu rising_velocity öncelikli */
function risingScore(c: CreatorDirectoryRow): number {
  if (c.risingVelocity != null && c.risingVelocity > 0) {
    return c.risingVelocity + (c.isLive ? 0.55 : 0) + (c.verified ? 0.15 : 0);
  }
  return (
    (c.signalAccuracy ?? 0) * 0.48 +
    Math.log1p(c.followerCount) * 0.42 +
    (c.isLive ? 0.55 : 0) +
    (c.activeSignalsCount ?? 0) * 0.12 +
    (c.verified ? 0.15 : 0)
  );
}

/** Featured + live + rising bayrakları ve sıralama meta */
export function buildCreatorsDirectoryPayload(creators: CreatorDirectoryRow[]): CreatorDirectoryPayload {
  const deduped = [...new Map(creators.map((c) => [c.id, c])).values()];

  const featuredIds = [...deduped]
    .sort((a, b) => scoreRecommended(b) - scoreRecommended(a))
    .slice(0, 3)
    .map((c) => c.id);

  const liveNowIds = deduped.filter((c) => c.isLive).map((c) => c.id);

  const risingCandidates = deduped
    .filter((c) => !featuredIds.includes(c.id))
    .sort((a, b) => risingScore(b) - risingScore(a));

  const risingIds = new Set(risingCandidates.slice(0, 4).map((c) => c.id));

  const rows = deduped.map((c) => ({
    ...c,
    editorPick: featuredIds.includes(c.id),
    rising: risingIds.has(c.id) || (c.risingVelocity ?? 0) >= 25,
  }));

  return {
    creators: rows,
    featuredIds,
    liveNowIds,
    assetPresets: CREATOR_ASSET_PRESETS,
  };
}

export function pickFeaturedCreators(payload: CreatorDirectoryPayload): CreatorDirectoryRow[] {
  const map = new Map(payload.creators.map((c) => [c.id, c]));
  return payload.featuredIds.map((id) => map.get(id)).filter(Boolean) as CreatorDirectoryRow[];
}

export function pickLiveCreators(payload: CreatorDirectoryPayload): CreatorDirectoryRow[] {
  const map = new Map(payload.creators.map((c) => [c.id, c]));
  return payload.liveNowIds.map((id) => map.get(id)).filter(Boolean) as CreatorDirectoryRow[];
}

export function pickRisingCreators(payload: CreatorDirectoryPayload): CreatorDirectoryRow[] {
  return payload.creators.filter((c) => c.rising);
}

export function countCreators(payload: CreatorDirectoryPayload) {
  const withAccuracy = payload.creators.filter((c) => c.signalAccuracy != null && c.signalAccuracy > 0);
  const avgAccuracy =
    withAccuracy.length > 0
      ? Math.round(withAccuracy.reduce((s, c) => s + (c.signalAccuracy ?? 0), 0) / withAccuracy.length)
      : null;

  return {
    total: payload.creators.length,
    live: payload.liveNowIds.length,
    rising: payload.creators.filter((c) => c.rising).length,
    editor: payload.featuredIds.length,
    avgAccuracy,
  };
}
