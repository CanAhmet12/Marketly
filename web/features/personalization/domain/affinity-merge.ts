import type { AffinityContext } from "./personalization-types";

const EMPTY_META = { eventCount: 0, confidence: 0, diversity: 0.35, horizonBias: 0 };

function mergeMaps(
  server: Readonly<Record<string, number>>,
  local: Readonly<Record<string, number>>,
  localWeight: number,
): Record<string, number> {
  const keys = new Set([...Object.keys(server), ...Object.keys(local)]);
  const out: Record<string, number> = {};
  for (const k of keys) {
    const s = server[k] ?? 0;
    const l = local[k] ?? 0;
    out[k] = Math.round((s * (1 - localWeight) + l * localWeight) * 10) / 10;
  }
  return out;
}

/** Sunucu profili + yerel olaylar — Spotify cross-device sync modeli */
export function mergeAffinityContexts(
  server: AffinityContext | null,
  local: AffinityContext,
  localWeight = 0.65,
): AffinityContext {
  if (!server || server.meta.eventCount < 1) return local;
  if (local.meta.eventCount < 3) return server;

  const w = Math.min(0.85, Math.max(0.35, localWeight));

  return {
    creators: mergeMaps(server.creators, local.creators, w),
    assets: mergeMaps(server.assets, local.assets, w),
    topics: mergeMaps(server.topics, local.topics, w),
    signals: mergeMaps(server.signals, local.signals, w),
    rooms: mergeMaps(server.rooms, local.rooms, w),
    discussions: mergeMaps(server.discussions, local.discussions, w),
    formats: mergeMaps(server.formats, local.formats, w),
    meta: {
      eventCount: Math.max(server.meta.eventCount, local.meta.eventCount),
      confidence: Math.max(server.meta.confidence, local.meta.confidence),
      diversity: (server.meta.diversity + local.meta.diversity) / 2,
      horizonBias: server.meta.horizonBias * (1 - w) + local.meta.horizonBias * w,
    },
  };
}

export function affinityContextFromServerRow(row: {
  asset_affinity?: Record<string, number> | null;
  creator_affinity?: Record<string, number> | null;
  format_affinity?: Record<string, number> | null;
  topic_affinity?: Record<string, number> | null;
  event_count?: number | null;
  confidence?: number | null;
  horizon_bias?: number | null;
  diversity?: number | null;
}): AffinityContext {
  return {
    creators: row.creator_affinity ?? {},
    assets: row.asset_affinity ?? {},
    topics: row.topic_affinity ?? {},
    signals: {},
    rooms: {},
    discussions: {},
    formats: row.format_affinity ?? {},
    meta: {
      eventCount: row.event_count ?? 0,
      confidence: Number(row.confidence ?? 0),
      diversity: Number(row.diversity ?? 0.35),
      horizonBias: Number(row.horizon_bias ?? 0),
    },
  };
}

export const EMPTY_AFFINITY_CONTEXT: AffinityContext = {
  creators: {},
  assets: {},
  topics: {},
  signals: {},
  rooms: {},
  discussions: {},
  formats: {},
  meta: EMPTY_META,
};
