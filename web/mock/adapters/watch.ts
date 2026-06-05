import type { WatchPostDetail } from "@/features/watch/types";

import { MOCK_POST_BY_ID, MOCK_POST_SOURCES, type MockPostSource } from "../fixtures/posts";
import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { mockPlaylistMembersContainingPost, resolveMockPlaylistById } from "./creator-studio-playlists";
import { getMockCreatedPosts } from "./upload-store";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { playlistContinuation, watchContinuityLabel, watchContinuityReason } from "@/features/personalization/domain/watch-next-rank";
import type { WatchNextCandidate, WatchNextRankInput } from "@/features/personalization/domain/personalization-types";
import { recentCreatorBingeCount } from "@/features/personalization/domain/watch-history-store";

export function mockWatchPostDetail(postId: string, userId: string | null): WatchPostDetail | null {
  // Check localStorage-created posts first
  const created = getMockCreatedPosts();
  const createdMatch = created.find((p) => p.id === postId);
  const srcRaw = createdMatch ?? MOCK_POST_BY_ID[postId] ?? MOCK_POST_BY_ID["mock-post-001"];
  if (!srcRaw) return null;

  const src = srcRaw;
  const prof = MOCK_PROFILE_BY_ID[src.user_id];
  const likedSeed = userId ? src.id.charCodeAt(src.id.length - 1) % 4 === 0 : false;
  return {
    id: src.id,
    user_id: src.user_id,
    content: src.content,
    type: src.type,
    video_url: src.video_url,
    thumbnail_url: src.thumbnail_url,
    image_url: src.image_url,
    title: src.title,
    description: src.description,
    likes: src.likes,
    comments: src.comments,
    views_count: src.views_count,
    shares_count: src.shares_count,
    created_at: src.created_at,
    duration: src.duration,
    asset_tag: src.asset_tag,
    media_urls: src.media_urls,
    author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
    author_tier: prof?.tier ?? "free",
    is_liked: likedSeed,
    is_saved: false,
  };
}

export type MockRelatedVideosOpts = {
  playlistId?: string | null;
  currentAssetTag?: string | null;
  currentType?: string | null;
  viewerId?: string | null;
};

function toCandidate(p: MockPostSource): WatchNextCandidate {
  return {
    id: p.id,
    user_id: p.user_id,
    type: p.type,
    title: p.title,
    content: p.content,
    asset_tag: p.asset_tag,
    thumbnail_url: p.thumbnail_url,
    image_url: p.image_url,
    created_at: p.created_at,
    views_count: p.views_count,
    duration: p.duration,
    comments: p.comments,
    likes: p.likes,
    discussion_anchor_post_id: p.discussion_anchor_post_id ?? null,
  };
}

export function mockRelatedVideos(excludeId: string, preferUserId?: string | null, opts?: MockRelatedVideosOpts) {
  const createdPool = getMockCreatedPosts().filter(
    (p) => p.id !== excludeId && ["video", "short", "pulse", "live"].includes((p.type ?? "").toLowerCase()),
  );
  const fixturePool = MOCK_POST_SOURCES.filter(
    (p) => p.id !== excludeId && ["video", "short", "pulse", "live"].includes((p.type ?? "").toLowerCase()),
  );
  const existingIds = new Set(fixturePool.map((p) => p.id));
  const newCreated = createdPool.filter((p) => !existingIds.has(p.id));
  const pool = [...newCreated, ...fixturePool];

  let memberOrder: string[] | null = null;
  if (opts?.playlistId) {
    const pl = resolveMockPlaylistById(opts.playlistId, true);
    memberOrder = pl?.memberPostIds?.length ? pl.memberPostIds : null;
  } else if (preferUserId) {
    const implicit = mockPlaylistMembersContainingPost(excludeId, preferUserId, true);
    memberOrder = implicit?.length ? implicit : null;
  }

  const input: WatchNextRankInput = {
    excludeId,
    preferUserId: preferUserId ?? null,
    playlistMemberOrder: memberOrder,
    currentAssetTag: opts?.currentAssetTag ?? null,
    currentType: opts?.currentType ?? null,
  };

  const { after, set } = playlistContinuation(memberOrder, excludeId);
  const viewerId = opts?.viewerId ?? null;
  const repo = getPersonalizationRepository();
  const candidates = pool.map(toCandidate);
  const ranked = repo.rankWatchNextCandidates(candidates, input, viewerId);

  return ranked.slice(0, 12).map((r) => {
    const prof = MOCK_PROFILE_BY_ID[r.user_id];
    const srcPost = pool.find((p) => p.id === r.id);
    const reason = watchContinuityReason(
      r,
      after,
      set,
      input,
      recentCreatorBingeCount(r.user_id, 45 * 60 * 1000),
    );
    return {
      id: r.id,
      creator_id: r.user_id,
      title: r.title,
      content: r.content,
      thumbnail_url: r.thumbnail_url,
      image_url: r.image_url,
      video_url: srcPost?.video_url ?? null,
      type: r.type,
      created_at: r.created_at,
      views_count: r.views_count ?? 0,
      duration: r.duration ?? null,
      creator_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
      creator_handle: `@${prof?.username ?? "user"}`,
      continuity_tag: watchContinuityLabel(reason),
    };
  });
}
