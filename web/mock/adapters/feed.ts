import type { FeedPageResult, FeedPost, SocialRepostBlock } from "@/features/feed/types";

import { MOCK_EDITORIAL_HOME_POSTS } from "../fixtures/editorial-home-posts";
import { getMockFollowingCreatorIds } from "../fixtures/follows";
import type { MockPostSource } from "../fixtures/posts";
import { MOCK_POST_SOURCES } from "../fixtures/posts";
import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { getMockCreatedPosts } from "./upload-store";
import { resolveMockPostSourceById } from "./mock-post-resolve";

export type MockHomeFeedMode = "for_you" | "following";

const PAGE_SIZE = 15;
/** Keşfet — sekme başına daha zengin havuz (video/pulse/canlı filtreleri için) */
const DISCOVER_PAGE_SIZE = 36;

/** Merge persisted created posts at the top of the pool, deduplicated */
function mergeCreatedPosts(pool: MockPostSource[]): MockPostSource[] {
  const created = getMockCreatedPosts();
  if (created.length === 0) return pool;
  const existingIds = new Set(pool.map((p) => p.id));
  const newOnes = created.filter((c) => !existingIds.has(c.id));
  return [...newOnes, ...pool];
}

function discoverEngagementScore(p: MockPostSource): number {
  return p.likes + p.comments * 2;
}

/**
 * Keşfet mock havuzu — saf etkileşim sıralaması ilk sayfada sadece “post” ağırlığı bırakıp
 * video/pulse/canlı satırlarını sekme filtrelerinin dışına itebiliyordu; tür kovaları içinde sıralayıp birleştiriyoruz.
 */
function sortDiscoverMockPool(pool: MockPostSource[]): MockPostSource[] {
  const t = (x: MockPostSource) => (x.type ?? "").toLowerCase();
  const engagementSort = (a: MockPostSource, b: MockPostSource) => {
    const s = discoverEngagementScore(b) - discoverEngagementScore(a);
    if (s !== 0) return s;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const lives = pool.filter((p) => t(p) === "live").sort(engagementSort);
  const pulses = pool.filter((p) => t(p) === "pulse" || t(p) === "short").sort(engagementSort);
  const videos = pool.filter((p) => t(p) === "video").sort(engagementSort);
  const signals = pool.filter((p) => t(p) === "signal").sort(engagementSort);
  const others = pool
    .filter((p) => !["video", "pulse", "short", "live", "signal"].includes(t(p)))
    .sort(engagementSort);

  /** Keşfet ilk sayfa: canlı / pulse / video karışık gelsin (sekme filtreleri boş kalmasın). */
  const buckets: MockPostSource[][] = [lives, pulses, videos, signals, others];
  const out: MockPostSource[] = [];
  let guard = 0;
  while (buckets.some((b) => b.length > 0) && guard < 10_000) {
    guard += 1;
    for (const b of buckets) {
      const next = b.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

function mapQuotedOnly(src: MockPostSource): FeedPost {
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  return {
    id: src.id,
    user_id: src.user_id,
    content: src.content,
    asset_tag: src.asset_tag,
    image_url: src.image_url,
    type: src.type,
    video_url: src.video_url,
    thumbnail_url: src.thumbnail_url,
    title: src.title,
    likes: src.likes,
    comments: src.comments,
    views_count: src.views_count,
    created_at: src.created_at,
    author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: false,
    is_saved: false,
    media_urls: src.media_urls,
    mentioned_users: src.mentioned_users,
    link_preview: null,
    quoted_post_id: null,
    quoted_post: null,
    social_repost: null,
  };
}

export function mapMockPostToFeedPost(src: MockPostSource, quoted: FeedPost | null, userId: string | null): FeedPost {
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  const likedSeed = userId ? src.id.charCodeAt(src.id.length - 1) % 3 === 0 : false;
  return {
    id: src.id,
    user_id: src.user_id,
    content: src.content,
    asset_tag: src.asset_tag,
    image_url: src.image_url,
    type: src.type,
    video_url: src.video_url,
    thumbnail_url: src.thumbnail_url,
    title: src.title,
    likes: src.likes,
    comments: src.comments,
    views_count: src.views_count,
    created_at: src.created_at,
    author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: likedSeed,
    is_saved: false,
    media_urls: src.media_urls,
    mentioned_users: src.mentioned_users,
    link_preview: null,
    quoted_post_id: src.quoted_post_id,
    quoted_post: quoted,
    social_repost: null,
  };
}

function pickRepostSource(slice: MockPostSource[], avoidId: string, offset: number): MockPostSource | null {
  const pool = slice.filter((s) => s.type === "post" && s.id !== avoidId);
  if (!pool.length) return null;
  return pool[offset % pool.length] ?? null;
}

function buildSocialRepostForIndex(slice: MockPostSource[], index: number): SocialRepostBlock | null {
  const base = slice[index];
  if (!base || base.type !== "post") return null;
  if (index === 1) {
    const pick = pickRepostSource(slice, base.id, 3);
    if (!pick) return null;
    const qp = MOCK_PROFILE_BY_ID[pick.user_id];
    return {
      kind: "quote_repost",
      commentary: "Risk çerçevesi net — bu seviyelerde kademeli olmak mantıklı.",
      source_post_id: pick.id,
      source: {
        author_name: qp?.full_name ?? qp?.username ?? "Kaynak",
        author_handle: `@${qp?.username ?? "user"}`,
        content_snippet: (pick.title?.trim() || pick.content).slice(0, 140) + ((pick.title?.trim() || pick.content).length > 140 ? "…" : ""),
        asset_tag: pick.asset_tag,
      },
    };
  }
  if (index === 5) {
    const pick = pickRepostSource(slice, base.id, 1);
    if (!pick) return null;
    const qp = MOCK_PROFILE_BY_ID[pick.user_id];
    return {
      kind: "repost",
      commentary: null,
      source_post_id: pick.id,
      source: {
        author_name: qp?.full_name ?? qp?.username ?? "Kaynak",
        author_handle: `@${qp?.username ?? "user"}`,
        content_snippet: (pick.title?.trim() || pick.content).slice(0, 160) + ((pick.title?.trim() || pick.content).length > 160 ? "…" : ""),
        asset_tag: pick.asset_tag,
      },
    };
  }
  return null;
}

function attachSocialReposts(posts: FeedPost[], slice: MockPostSource[], pageIndex: number): FeedPost[] {
  if (pageIndex !== 0) return posts;
  return posts.map((fp, i) => {
    const rep = buildSocialRepostForIndex(slice, i);
    if (!rep) return fp;
    if (rep.kind === "quote_repost") {
      return {
        ...fp,
        content: rep.commentary ?? fp.content,
        quoted_post_id: null,
        quoted_post: null,
        social_repost: rep,
      };
    }
    return {
      ...fp,
      content: "",
      quoted_post_id: null,
      quoted_post: null,
      social_repost: rep,
    };
  });
}

export function mockHomeFeedPage(pageIndex: number, userId: string | null, mode: MockHomeFeedMode = "for_you"): FeedPageResult {
  let pool = mergeCreatedPosts([...MOCK_EDITORIAL_HOME_POSTS, ...MOCK_POST_SOURCES]);
  if (mode === "following") {
    const allow = new Set(getMockFollowingCreatorIds(userId));
    pool = pool.filter((s) => allow.has(s.user_id));
  }
  if (mode === "for_you" || mode === "following") {
    pool = pool.filter((s) => s.type === "post");
  }
  const sorted = pool.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const from = pageIndex * PAGE_SIZE;
  const slice = sorted.slice(from, from + PAGE_SIZE);

  const quotedIds = new Set(slice.map((s) => s.quoted_post_id).filter(Boolean) as string[]);
  const quotedMap: Record<string, FeedPost> = {};
  for (const qid of quotedIds) {
    const raw = resolveMockPostSourceById(qid);
    if (raw) quotedMap[qid] = mapQuotedOnly(raw);
  }

  const posts = attachSocialReposts(
    slice.map((s) => {
      const q = s.quoted_post_id && quotedMap[s.quoted_post_id] ? quotedMap[s.quoted_post_id] : null;
      return mapMockPostToFeedPost(s, q, userId);
    }),
    slice,
    pageIndex,
  );

  return {
    posts,
    hasMore: from + PAGE_SIZE < sorted.length,
  };
}

/** Keşfet — tür dengeli + kova içi etkileşim sırası (sekme filtreleri boş kalmasın). */
export function mockDiscoverFeedPage(pageIndex: number, userId: string | null): FeedPageResult {
  const sorted = sortDiscoverMockPool(mergeCreatedPosts([...MOCK_POST_SOURCES]));
  const from = pageIndex * DISCOVER_PAGE_SIZE;
  const slice = sorted.slice(from, from + DISCOVER_PAGE_SIZE);

  const quotedIds = new Set(slice.map((s) => s.quoted_post_id).filter(Boolean) as string[]);
  const quotedMap: Record<string, FeedPost> = {};
  for (const qid of quotedIds) {
    const raw = resolveMockPostSourceById(qid);
    if (raw) quotedMap[qid] = mapQuotedOnly(raw);
  }

  const posts = attachSocialReposts(
    slice.map((s) => {
      const q = s.quoted_post_id && quotedMap[s.quoted_post_id] ? quotedMap[s.quoted_post_id] : null;
      return mapMockPostToFeedPost(s, q, userId);
    }),
    slice,
    pageIndex,
  );

  return {
    posts,
    hasMore: from + DISCOVER_PAGE_SIZE < sorted.length,
  };
}
