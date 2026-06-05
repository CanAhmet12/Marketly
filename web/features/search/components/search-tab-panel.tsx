"use client";

import { SearchCommunityList } from "@/features/search/components/search-community-list";
import { SearchContentGrid } from "@/features/search/components/search-content-grid";
import { SearchMarketsGrid } from "@/features/search/components/search-markets-grid";
import { SearchPeopleGrid } from "@/features/search/components/search-people-grid";
import type {
  CommunitySearchHit,
  CreatorRoomSearchHit,
  DiscussionSearchHit,
  SearchResultBundle,
  SearchSplitPosts,
  SearchTabGroupId,
} from "@/features/search/types";
import { NoResultsState } from "@/components/states";

type Props = {
  tab: SearchTabGroupId;
  query: string;
  bundle: SearchResultBundle;
  split: SearchSplitPosts;
  discussions: DiscussionSearchHit[];
  communities: CommunitySearchHit[];
  creatorRooms: CreatorRoomSearchHit[];
};

export function SearchTabPanel({
  tab,
  query,
  bundle,
  split,
  discussions,
  communities,
  creatorRooms,
}: Props) {
  if (tab === "content") {
    const has =
      split.videos.length ||
      split.pulsePosts.length ||
      split.livePosts.length ||
      split.textPosts.length;
    if (!has) {
      return <NoResultsState query={query} suggestion="Bu kategoride içerik bulunamadı." compact />;
    }
    return (
      <SearchContentGrid
        videos={split.videos}
        pulsePosts={split.pulsePosts}
        livePosts={split.livePosts}
        textPosts={split.textPosts}
      />
    );
  }

  if (tab === "people") {
    const has = bundle.channels.length || creatorRooms.length;
    if (!has) {
      return <NoResultsState query={query} suggestion="Bu kategoride üretici veya oda bulunamadı." compact />;
    }
    return <SearchPeopleGrid channels={bundle.channels} creatorRooms={creatorRooms} />;
  }

  if (tab === "markets") {
    const has = bundle.signals.length || bundle.markets.length;
    if (!has) {
      return <NoResultsState query={query} suggestion="Bu kategoride piyasa veya sinyal bulunamadı." compact />;
    }
    return <SearchMarketsGrid markets={bundle.markets} signals={bundle.signals} />;
  }

  if (tab === "community") {
    const has = discussions.length || communities.length;
    if (!has) {
      return <NoResultsState query={query} suggestion="Bu sorgu için topluluk sonucu yok." compact />;
    }
    return <SearchCommunityList discussions={discussions} communities={communities} />;
  }

  return null;
}
