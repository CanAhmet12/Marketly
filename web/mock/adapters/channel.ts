import type { ChannelPost, ChannelProfile, FollowState } from "@/features/channel/types";

import { getMockSignalsForCreator } from "../adapters/signals-source";
import { MOCK_POST_SOURCES } from "../fixtures/posts";
import { MOCK_PROFILE_BY_ID, pickCanonicalProfileId } from "../fixtures/profiles";
import { getMockCreatedPosts, getMockCreatedSignals } from "./upload-store";

export function mockChannelProfile(channelUserId: string): ChannelProfile | null {
  const canonical = pickCanonicalProfileId(channelUserId);
  const base = MOCK_PROFILE_BY_ID[canonical];
  if (!base) return null;
  return { ...base, id: channelUserId };
}

export function mockChannelPosts(channelUserId: string): ChannelPost[] {
  const canonical = pickCanonicalProfileId(channelUserId);
  // Base posts from fixtures
  const base = MOCK_POST_SOURCES.filter((p) => p.user_id === canonical);
  // Prepend user-created posts from localStorage (only for the canonical viewer)
  const created = getMockCreatedPosts().filter((p) => p.user_id === canonical || p.user_id === channelUserId);
  const existingIds = new Set(base.map((p) => p.id));
  const newOnes = created.filter((p) => !existingIds.has(p.id));
  const all = [...newOnes, ...base];
  return all.map((s) => ({
    id: s.id,
    user_id: channelUserId,
    content: s.content,
    type: s.type,
    video_url: s.video_url,
    thumbnail_url: s.thumbnail_url,
    image_url: s.image_url,
    title: s.title,
    likes: s.likes,
    comments: s.comments,
    created_at: s.created_at,
    asset_tag: s.asset_tag,
    media_urls: s.media_urls,
  }));
}

export function mockChannelSignals(channelUserId: string) {
  const canonical = pickCanonicalProfileId(channelUserId);
  const base = getMockSignalsForCreator(canonical);
  // Prepend persisted created signals
  const created = getMockCreatedSignals().filter(
    (s) => s.creator_id === canonical || s.creator_id === channelUserId,
  );
  const existingIds = new Set(base.map((s) => s.id));
  const newOnes = created.filter((s) => !existingIds.has(s.id));
  return [...newOnes, ...base];
}

export function mockFollowState(channelUserId: string): FollowState {
  const canonical = pickCanonicalProfileId(channelUserId);
  const base = MOCK_PROFILE_BY_ID[canonical];
  return {
    isFollowing: false,
    followersCount: base?.follower_count ?? 12_000,
    followingCount: base?.following_count ?? 400,
  };
}
