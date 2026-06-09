import type { CreatorDirectoryRow } from "@/features/creators/types";
import { getCardTagTone } from "@/features/discover/visual-reference/discover-card-tones";
import type {
  VRCreatorActivityBadge,
  VRCreatorActivityLine,
  VRCreatorActivityTileTone,
  VRCreatorItem,
} from "@/features/discover/visual-reference/discover-visual-reference-data";
import { formatCompactCount } from "@/lib/format-compact-count";

function stableU32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickMod<T>(seed: string, pool: readonly T[]): T {
  return pool[stableU32(seed) % pool.length]!;
}

export function avatarColorFromCreatorId(id: string): string {
  const n = stableU32(`c-${id}`);
  const r = 24 + (n & 0x3f);
  const g = 24 + ((n >> 8) & 0x3f);
  const b = 24 + ((n >> 16) & 0x3f);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function initialsFromDisplayName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  if (p.length === 1) return p[0]!.slice(0, 1).toUpperCase();
  return (p[0]!.slice(0, 1) + p[p.length - 1]!.slice(0, 1)).toUpperCase();
}

function formatContentFormats(row: CreatorDirectoryRow): string {
  const labels: Record<string, string> = {
    live: "Canlı",
    video: "Video",
    pulse: "Pulse",
    signal: "Sinyal",
    post: "Gönderi",
  };
  const parts = row.contentFormats.map((f) => labels[f] ?? f);
  return parts.slice(0, 3).join(" · ") || "İçerik";
}

function tileToneFromTag(tag: string): VRCreatorActivityTileTone {
  const tone = getCardTagTone(tag);
  if (tone === "crypto") return "crypto";
  if (tone === "bist") return "bist";
  return "macro";
}

export function mapDirectoryRowToVRCreator(row: CreatorDirectoryRow): VRCreatorItem {
  const tag = row.assetTags[0] ?? row.specialties[0]?.slice(0, 16) ?? "Üretici";
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    specialty: row.specialties[0] ?? row.bio?.slice(0, 72) ?? "Piyasa analizi",
    tag,
    followers: formatCompactCount(row.followerCount),
    contentFormats: formatContentFormats(row),
    isLive: row.isLive,
    avatarColor: avatarColorFromCreatorId(row.id),
    avatarInitial: initialsFromDisplayName(row.displayName),
    portraitUrl: row.avatarUrl?.trim() ? row.avatarUrl : undefined,
    href: row.isLive && row.liveHref ? row.liveHref : row.channelHref,
  };
}

export function buildCreatorActivityFeedFromDirectory(rows: CreatorDirectoryRow[]): VRCreatorActivityLine[] {
  if (!rows.length) return [];

  const badgeCycle: VRCreatorActivityBadge[] = ["live", "trend", "new", "hot"];
  const toneCycle: VRCreatorActivityTileTone[] = ["bist", "crypto", "macro", "bist"];

  return rows.slice(0, 8).map((row, i) => {
    const chipA = row.assetTags[0] ?? row.bestSignalSymbol ?? "Gündem";
    const badge: VRCreatorActivityBadge = row.isLive
      ? "live"
      : row.rising
        ? "trend"
        : pickMod(`${row.id}-b-${i}`, badgeCycle);
    const headline =
      row.latestHeadline?.trim() ||
      (row.isLive ? "Canlı yayında" : `${row.displayName} profili`);
    const railContext =
      row.latestHeadline?.slice(0, 56) ||
      row.specialties[0]?.slice(0, 56) ||
      row.bio?.slice(0, 56) ||
      "Profil";

    return {
      creatorId: row.id,
      badge,
      headline,
      railContext,
      topicChipA: chipA.slice(0, 12),
      topicChipB: row.isLive ? "Canlı" : row.contentFormats[0] === "signal" ? "Sinyal" : "Akış",
      tileTone: row.isLive ? "live" : tileToneFromTag(chipA) ?? pickMod(`${row.id}-t`, toneCycle),
      cta: row.isLive ? "İzle" : "Profil",
    };
  });
}
