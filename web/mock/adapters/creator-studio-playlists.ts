import type { StudioPlaylistItem, StudioVisibility } from "@/features/studio/types";
import type { MockPostSource } from "@/mock/fixtures/posts";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";

import { pickThumb, studioSeed } from "./creator-studio-utils";

function buildMemberIds(posts: MockPostSource[], ownerId: string, listIndex: number, targetCount: number): string[] {
  if (posts.length === 0) return [];
  const sorted = [...posts].sort((a, b) => a.id.localeCompare(b.id));
  const count = Math.min(Math.max(1, targetCount), sorted.length);
  const offset = studioSeed(ownerId, `plo:${listIndex}`) % sorted.length;
  const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];
  return rotated.slice(0, count).map((p) => p.id);
}

export function getStudioPlaylists(ownerId: string, mockDataset: boolean): StudioPlaylistItem[] {
  if (!mockDataset) return [];
  const posts = MOCK_POST_SOURCES.filter((p) => p.user_id === ownerId && (p.type === "video" || p.type === "short"));
  const n = 2 + (studioSeed(ownerId, "pln") % 3);
  const out: StudioPlaylistItem[] = [];
  for (let i = 0; i < n; i++) {
    const id = `pl-${ownerId}-${i}`;
    const cover = posts[(studioSeed(ownerId, `plc:${i}`) + i) % Math.max(1, posts.length)];
    const visRoll = studioSeed(ownerId, `plv:${i}`) % 10;
    const visibility: StudioVisibility = visRoll < 6 ? "public" : visRoll < 9 ? "unlisted" : "private";
    const wantCount = 3 + (studioSeed(ownerId, `plc:${i}`) % 12);
    const memberPostIds = buildMemberIds(posts, ownerId, i, wantCount);
    const videoCount = memberPostIds.length;
    out.push({
      id,
      title: `Liste ${i + 1} — ${ownerId.includes("mock") ? "Eğitim" : "Koleksiyon"}`,
      description: "Oynatma listesi; watch sıradaki ve studio ile aynı veri modeli.",
      videoCount,
      visibility,
      updatedAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
      coverThumbnailUrl: cover ? pickThumb(cover) : null,
      ownerId,
      memberPostIds,
    });
  }
  return out;
}

/** Tüm mock sahipleri üzerinde playlist arar (playlist sayfası / watch `list`) */
export function resolveMockPlaylistById(playlistId: string, mockDataset: boolean): StudioPlaylistItem | null {
  if (!mockDataset) return null;
  const owners = Array.from(new Set(MOCK_POST_SOURCES.map((p) => p.user_id)));
  for (const oid of owners) {
    const hit = getStudioPlaylists(oid, true).find((p) => p.id === playlistId);
    if (hit) return hit;
  }
  return null;
}

/** Şu anki videonun ait olduğu ilk listeyi üretici bazında bulur */
export function mockPlaylistMembersContainingPost(postId: string, ownerId: string, mockDataset: boolean): string[] | null {
  if (!mockDataset) return null;
  for (const pl of getStudioPlaylists(ownerId, true)) {
    if (pl.memberPostIds.includes(postId)) return pl.memberPostIds;
  }
  return null;
}
