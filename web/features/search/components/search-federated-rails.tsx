"use client";

import { useMemo } from "react";

import { SearchCommunityList } from "@/features/search/components/search-community-list";
import { SearchContentGrid } from "@/features/search/components/search-content-grid";
import { SearchMarketsGrid } from "@/features/search/components/search-markets-grid";
import { SearchPeopleGrid } from "@/features/search/components/search-people-grid";
import { SearchResultRail } from "@/features/search/components/search-result-rail";
import { rankFederatedSections, type FederatedSectionKey } from "@/features/search/lib/rank-search-results";
import type {
  CommunitySearchHit,
  CreatorRoomSearchHit,
  DiscussionSearchHit,
  SearchResultBundle,
  SearchSplitPosts,
  SearchTabGroupId,
} from "@/features/search/types";
import { SearchNoResults } from "@/features/search/components/search-no-results";

type Props = {
  query: string;
  bundle: SearchResultBundle;
  split: SearchSplitPosts;
  discussions: DiscussionSearchHit[];
  communities: CommunitySearchHit[];
  creatorRooms: CreatorRoomSearchHit[];
  onTabChange: (tab: SearchTabGroupId) => void;
};

function presentSections(
  bundle: SearchResultBundle,
  split: SearchSplitPosts,
  discussions: DiscussionSearchHit[],
  communities: CommunitySearchHit[],
  creatorRooms: CreatorRoomSearchHit[],
): Set<FederatedSectionKey> {
  const s = new Set<FederatedSectionKey>();
  if (bundle.markets.length) s.add("markets");
  if (bundle.signals.length) s.add("signals");
  if (bundle.channels.length) s.add("creators");
  if (split.videos.length) s.add("videos");
  if (split.livePosts.length) s.add("live");
  if (split.pulsePosts.length) s.add("pulse");
  if (split.textPosts.length) s.add("posts");
  if (discussions.length) s.add("discussions");
  if (communities.length) s.add("communities");
  if (creatorRooms.length) s.add("rooms");
  return s;
}

export function SearchFederatedRails({
  query,
  bundle,
  split,
  discussions,
  communities,
  creatorRooms,
  onTabChange,
}: Props) {
  const order = useMemo(
    () => rankFederatedSections(query, presentSections(bundle, split, discussions, communities, creatorRooms)),
    [query, bundle, split, discussions, communities, creatorRooms],
  );

  const total =
    bundle.posts.length +
    bundle.channels.length +
    bundle.signals.length +
    bundle.markets.length +
    discussions.length +
    communities.length +
    creatorRooms.length;

  if (total === 0) {
    return <SearchNoResults query={query} suggestion="Farklı bir kelime veya sembol deneyin." />;
  }

  const renderSection = (key: FederatedSectionKey) => {
    switch (key) {
      case "markets":
        return (
          <SearchResultRail
            key={key}
            label="Piyasalar"
            count={bundle.markets.length}
            accent="teal"
            onSeeAll={bundle.markets.length > 3 ? () => onTabChange("markets") : undefined}
          >
            <SearchMarketsGrid markets={bundle.markets} signals={[]} limit={3} showCommunityHint={false} />
          </SearchResultRail>
        );
      case "signals":
        return (
          <SearchResultRail
            key={key}
            label="Sinyaller"
            count={bundle.signals.length}
            accent="signal"
            onSeeAll={bundle.signals.length > 2 ? () => onTabChange("markets") : undefined}
          >
            <SearchMarketsGrid markets={[]} signals={bundle.signals} limit={2} showCommunityHint={false} />
          </SearchResultRail>
        );
      case "creators":
        return (
          <SearchResultRail
            key={key}
            label="Üreticiler"
            count={bundle.channels.length}
            onSeeAll={bundle.channels.length > 3 ? () => onTabChange("people") : undefined}
          >
            <SearchPeopleGrid channels={bundle.channels} creatorRooms={[]} limit={3} compact />
          </SearchResultRail>
        );
      case "videos":
        return (
          <SearchResultRail
            key={key}
            label="Videolar"
            count={split.videos.length}
            accent="teal"
            onSeeAll={split.videos.length > 4 ? () => onTabChange("content") : undefined}
          >
            <SearchContentGrid videos={split.videos} pulsePosts={[]} livePosts={[]} textPosts={[]} limit={4} />
          </SearchResultRail>
        );
      case "live":
        return (
          <SearchResultRail
            key={key}
            label="Canlı"
            count={split.livePosts.length}
            accent="live"
            onSeeAll={split.livePosts.length > 2 ? () => onTabChange("content") : undefined}
          >
            <SearchContentGrid videos={[]} pulsePosts={[]} livePosts={split.livePosts} textPosts={[]} limit={2} />
          </SearchResultRail>
        );
      case "pulse":
        return (
          <SearchResultRail
            key={key}
            label="Pulse"
            count={split.pulsePosts.length}
            onSeeAll={split.pulsePosts.length > 5 ? () => onTabChange("content") : undefined}
          >
            <SearchContentGrid videos={[]} pulsePosts={split.pulsePosts} livePosts={[]} textPosts={[]} limit={5} />
          </SearchResultRail>
        );
      case "posts":
        return (
          <SearchResultRail
            key={key}
            label="Gönderiler"
            count={split.textPosts.length}
            onSeeAll={split.textPosts.length > 3 ? () => onTabChange("content") : undefined}
          >
            <SearchContentGrid videos={[]} pulsePosts={[]} livePosts={[]} textPosts={split.textPosts} limit={3} />
          </SearchResultRail>
        );
      case "discussions":
        return (
          <SearchResultRail
            key={key}
            label="Tartışmalar"
            count={discussions.length}
            onSeeAll={discussions.length > 3 ? () => onTabChange("community") : undefined}
          >
            <SearchCommunityList discussions={discussions} communities={[]} limit={3} />
          </SearchResultRail>
        );
      case "communities":
        return (
          <SearchResultRail
            key={key}
            label="Topluluklar"
            count={communities.length}
            onSeeAll={communities.length > 3 ? () => onTabChange("community") : undefined}
          >
            <SearchCommunityList discussions={[]} communities={communities} limit={3} />
          </SearchResultRail>
        );
      case "rooms":
        return (
          <SearchResultRail
            key={key}
            label="Üretici odaları"
            count={creatorRooms.length}
            onSeeAll={creatorRooms.length > 3 ? () => onTabChange("people") : undefined}
          >
            <SearchPeopleGrid channels={[]} creatorRooms={creatorRooms} limit={3} />
          </SearchResultRail>
        );
      default:
        return null;
    }
  };

  return <div className="srch-stream">{order.map(renderSection)}</div>;
}
