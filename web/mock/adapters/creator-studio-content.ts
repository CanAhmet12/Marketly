import type {
  CreatorContentItem,
  StudioContentKind,
  StudioContentStatus,
  StudioLocalMutations,
  StudioVisibility,
} from "@/features/studio/types";
import type { MockPostSource } from "@/mock/fixtures/posts";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_SIGNAL_ROWS } from "@/mock/fixtures/signals";

import { pickThumb, studioSeed } from "./creator-studio-utils";
import { getStudioDrafts, getStudioScheduledPosts } from "./creator-studio-publishing";
import { getMockCreatedPosts, getMockCreatedSignals } from "./upload-store";

function mapPostKind(t: string | null): StudioContentKind {
  if (t === "video" || t === "short" || t === "live" || t === "signal" || t === "post") return t;
  return "post";
}

function mapPostToItem(p: MockPostSource): CreatorContentItem {
  const kind = mapPostKind(p.type);
  const status: StudioContentStatus = p.type === "live" ? "live" : "published";
  const visRoll = studioSeed(p.id, "vis") % 10;
  const visibility: StudioVisibility = visRoll < 7 ? "public" : visRoll < 9 ? "unlisted" : "private";
  return {
    id: p.id,
    kind,
    title: p.title ?? "Gönderi",
    preview: p.content.slice(0, 140),
    thumbnailUrl: pickThumb(p),
    status,
    views: p.views_count,
    comments: p.comments,
    likes: p.likes,
    publishedAt: p.created_at,
    visibility,
    href: kind === "video" || kind === "short" ? `/watch/${p.id}` : `/post/${p.id}`,
  };
}

function duplicateItemFrom(source: CreatorContentItem, idx: number): CreatorContentItem {
  return {
    ...source,
    id: `dup-${source.id}-${idx}`,
    title: `${source.title} (kopya)`,
    status: "published",
    views: Math.max(0, Math.floor(source.views * 0.02)),
    publishedAt: new Date().toISOString(),
  };
}

export function getStudioContentItems(ownerId: string, local: StudioLocalMutations, mockDataset: boolean): CreatorContentItem[] {
  if (!mockDataset) return [];
  const archived = new Set(local.archivedContentIds);
  const fixturePosts = MOCK_POST_SOURCES.filter((p) => p.user_id === ownerId);

  // Prepend persisted user-created posts
  const createdPosts = getMockCreatedPosts().filter(
    (p) => p.user_id === ownerId,
  );
  const fixtureIds = new Set(fixturePosts.map((p) => p.id));
  const newPosts = createdPosts.filter((p) => !fixtureIds.has(p.id));
  const posts = [...newPosts, ...fixturePosts].map(mapPostToItem);

  // Prepend persisted user-created signals
  const createdSignals = getMockCreatedSignals().filter((s) => s.creator_id === ownerId);
  const fixtureSignalIds = new Set(MOCK_SIGNAL_ROWS.filter((s) => s.creator_id === ownerId).map((s) => s.id));
  const newSignals = createdSignals.filter((s) => !fixtureSignalIds.has(s.id));
  const signalItems: CreatorContentItem[] = [
    ...newSignals.map((s): CreatorContentItem => ({
      id: s.id,
      kind: "signal" as const,
      title: `${s.symbol} ${s.direction}`,
      preview: (s.rationale ?? s.content ?? "").slice(0, 140),
      thumbnailUrl: null,
      status: "published" as const,
      views: 0,
      comments: 0,
      likes: s.likes_count,
      publishedAt: s.created_at,
      visibility: "public" as const,
      href: `/signals`,
    })),
    ...MOCK_SIGNAL_ROWS.filter((s) => s.creator_id === ownerId).map((s): CreatorContentItem => ({
      id: s.id,
      kind: "signal" as const,
      title: `${s.symbol} ${s.direction}`,
      preview: (s.rationale ?? "").slice(0, 140),
      thumbnailUrl: null,
      status: "published" as const,
      views: s.copies_count * 4,
      comments: Math.floor(s.likes_count / 8),
      likes: s.likes_count,
      publishedAt: s.created_at,
      visibility: "public" as const,
      href: `/signals`,
    })),
  ];

  const drafts = getStudioDrafts(ownerId, local, mockDataset).map(
    (d): CreatorContentItem => ({
      id: d.id,
      kind: "draft",
      title: d.title,
      preview: d.preview,
      thumbnailUrl: d.thumbnailUrl,
      status: "draft",
      views: 0,
      comments: 0,
      likes: 0,
      publishedAt: null,
      visibility: "private",
      href: "/studio/drafts",
    }),
  );

  const scheduled = getStudioScheduledPosts(ownerId, local, mockDataset).map(
    (s): CreatorContentItem => ({
      id: s.id,
      kind: "scheduled",
      title: s.title,
      preview: s.preview,
      thumbnailUrl: s.thumbnailUrl,
      status: "scheduled",
      views: 0,
      comments: 0,
      likes: 0,
      publishedAt: s.scheduledFor,
      visibility: "public",
      href: "/studio/scheduled",
    }),
  );

  const base = [...posts, ...signalItems, ...drafts, ...scheduled].filter((x) => !archived.has(x.id));

  const dupes: CreatorContentItem[] = [];
  for (let i = 0; i < local.duplicateSourceIds.length; i++) {
    const sid = local.duplicateSourceIds[i];
    const src = base.find((b) => b.id === sid);
    if (src) dupes.push(duplicateItemFrom(src, i));
  }

  return [...base, ...dupes].sort((a, b) => {
    const ta = new Date(a.publishedAt ?? 0).getTime();
    const tb = new Date(b.publishedAt ?? 0).getTime();
    return tb - ta;
  });
}
