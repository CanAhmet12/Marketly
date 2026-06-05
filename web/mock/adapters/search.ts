import type { SearchChannelHit, SearchPostHit, SearchResultBundle, SearchSignalHit } from "@/features/search/types";
import { getSocialRepository } from "@/features/social/repository";

import { MOCK_CREATOR_DIRECTORY } from "../fixtures/channels";
import { MOCK_SEARCH_ASSETS } from "../fixtures/markets";
import { MOCK_POST_SOURCES } from "../fixtures/posts";
import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";
import { mockSearchSignalHits } from "../fixtures/signals";
import { getMockCreatedPosts, getMockCreatedSignals } from "./upload-store";

function relevanceScore(haystack: string[], q: string): number {
  if (!q) return 1;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const term of terms) {
    for (const hay of haystack) {
      const h = hay.toLowerCase();
      if (h === term) score += 10;         // exact match
      else if (h.startsWith(term)) score += 6;  // prefix
      else if (h.includes(term)) score += 3;    // contains
    }
  }
  return score;
}

function asSearchPostHit(s: (typeof MOCK_POST_SOURCES)[0]): SearchPostHit {
  const prof = MOCK_PROFILE_BY_ID[s.user_id];
  return {
    id: s.id,
    user_id: s.user_id,
    type: s.type,
    content: s.content,
    title: s.title,
    thumbnail_url: s.thumbnail_url,
    image_url: s.image_url,
    created_at: s.created_at,
    likes: s.likes,
    comments: s.comments,
    views_count: s.views_count ?? 0,
    duration: s.duration ?? null,
    asset_tag: s.asset_tag,
    author_name: prof?.full_name ?? prof?.username ?? "Kullanıcı",
    author_handle: `@${prof?.username ?? "user"}`,
    author_avatar: prof?.avatar_url ?? null,
  };
}

function asChannelHit(p: (typeof MOCK_CREATOR_DIRECTORY)[0]): SearchChannelHit {
  // Enrich with profile data if available
  const full = MOCK_PROFILE_BY_ID[p.id];
  return {
    id: p.id,
    username: p.username,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    bio: full?.bio ?? p.bio,
    follower_count: p.follower_count,
    tier: p.tier,
    verified: full?.verified ?? false,
    signal_accuracy: full?.signal_accuracy ?? null,
    specialties: full?.specialties ?? null,
    strategy_style: full?.strategy_style ?? null,
  };
}

export function mockSearchResults(query: string): SearchResultBundle {
  const q = query.trim().toLowerCase();

  // Merge fixture + localStorage-created posts
  const createdPosts = getMockCreatedPosts();
  const fixtureIds = new Set(MOCK_POST_SOURCES.map((p) => p.id));
  const newCreated = createdPosts.filter((p) => !fixtureIds.has(p.id));
  const allPosts = [...newCreated.map(asSearchPostHit), ...MOCK_POST_SOURCES.map(asSearchPostHit)];

  // Score and filter posts
  const scoredPosts = allPosts
    .map((p) => ({
      hit: p,
      score: relevanceScore(
        [p.title ?? "", p.content ?? "", p.asset_tag ?? "", p.author_name ?? ""],
        q,
      ),
    }))
    .filter(({ score }) => !q || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ hit }) => hit);

  // Score and filter channels
  const scoredChannels = MOCK_CREATOR_DIRECTORY.map(asChannelHit)
    .map((c) => ({
      hit: c,
      score: relevanceScore(
        [c.username, c.full_name ?? "", c.bio ?? "", ...(c.specialties ?? []), c.strategy_style ?? ""],
        q,
      ),
    }))
    .filter(({ score }) => !q || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ hit }) => hit);

  // Merge fixture + localStorage-created signals
  const createdSignals = getMockCreatedSignals();
  const fixtureSignalIds = new Set(mockSearchSignalHits().map((s) => s.id));
  const newCreatedSignals: SearchSignalHit[] = createdSignals
    .filter((s) => !fixtureSignalIds.has(s.id))
    .map((s) => ({
      id: s.id,
      creator_id: s.creator_id,
      asset_id: s.asset_id,
      symbol: s.symbol,
      direction: s.direction,
      confidence: s.confidence,
      timeframe: s.timeframe,
      rationale: s.rationale,
      created_at: s.created_at,
      creator_name: "Sen",
      creator_avatar: null,
      entry_price: s.entry_price,
      target_price: s.target_price,
    }));
  const allSignals = [...newCreatedSignals, ...mockSearchSignalHits()];

  const scoredSignals = allSignals
    .map((s) => ({
      hit: s,
      score: relevanceScore([s.symbol, s.rationale ?? "", s.timeframe, s.direction], q),
    }))
    .filter(({ score }) => !q || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ hit }) => hit);

  // Score assets
  const scoredMarkets = MOCK_SEARCH_ASSETS.map((a) => ({
    hit: { id: a.id, symbol: a.symbol, name: a.name, change_pct: (a as { change_pct?: number }).change_pct ?? null },
    score: relevanceScore([a.symbol, a.name ?? ""], q),
  }))
    .filter(({ score }) => !q || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ hit }) => hit);

  // Fallback: if query gave no results, return broad set
  const posts = scoredPosts.length ? scoredPosts : allPosts.slice(0, 15);
  const channels = scoredChannels.length ? scoredChannels : MOCK_CREATOR_DIRECTORY.slice(0, 8).map(asChannelHit);
  const signals = scoredSignals.length ? scoredSignals : allSignals.slice(0, 8);
  const markets = scoredMarkets.length ? scoredMarkets : MOCK_SEARCH_ASSETS.slice(0, 8).map((a) => ({ id: a.id, symbol: a.symbol, name: a.name, change_pct: null }));

  const discussions = q ? getSocialRepository().searchDiscussionHits(q, 28) : [];
  const communities = getSocialRepository().searchTopicCommunityHits(q, 28);
  const creatorRooms = getSocialRepository().searchCreatorRoomHits(q, 24);

  const composerRefs = q ? getSocialRepository().searchComposerReferences(q, 10) : [];

  return { posts, channels, signals, markets, discussions, communities, creatorRooms, composerRefs };
}
