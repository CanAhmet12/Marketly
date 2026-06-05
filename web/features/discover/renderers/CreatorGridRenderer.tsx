"use client";

import Link from "next/link";

import { DiscoverCreatorSpotlightCard } from "@/features/discover/components/DiscoverCreatorSpotlightCard";
import { EmptyState } from "@/components/states";
import type { FeedPost } from "@/features/feed/types";
import { mapFeedPostToCreatorSpotlightRow } from "@/mock/adapters/discover-lower";

type Props = {
  posts: FeedPost[];
};

export function CreatorGridRenderer({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="Henüz üretici yok"
        description="İlk içerik üreticisi sen ol!"
        actionLabel="Keşfet"
        actionHref="/discover"
        tone="creator"
        compact
      />
    );
  }

  return (
    <div className="hv-ref-discover-sec hv-ref-discover-sec--creators">
      <div className="hv-ref-discover-sec__head">
        <div className="min-w-0">
          <h2 className="hv-ref-discover-sec__title">Üreticiler</h2>
          <p className="hv-ref-discover-sec__kicker">Uzmanlık ve içerik formatına göre — keşif odaklı sıra.</p>
        </div>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-md border border-[color-mix(in_srgb,var(--hv-sep)_80%,transparent)] bg-[color-mix(in_srgb,var(--hv-text)_5%,transparent)] px-3 py-2 text-[0.8125rem] font-semibold text-[var(--hv-text-2)] transition-colors hover:border-[color-mix(in_srgb,var(--hv-text)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--hv-text)_8%,transparent)] hover:text-[var(--hv-text)]"
        >
          Ana akış
        </Link>
      </div>
      <ul className="m-0 mt-[var(--hv-s-4)] grid list-none grid-cols-1 gap-[var(--hv-s-3)] p-0 md:grid-cols-2">
        {posts.slice(0, 24).map((post, index) => (
          <li key={post.id} className="min-w-0">
            <DiscoverCreatorSpotlightCard row={mapFeedPostToCreatorSpotlightRow(post, index)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
