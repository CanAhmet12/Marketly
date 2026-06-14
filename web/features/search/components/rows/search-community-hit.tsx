"use client";

import Link from "next/link";

import type { CommunitySearchHit } from "@/features/search/types";

type Props = { community: CommunitySearchHit };

export function SearchCommunityHit({ community }: Props) {
  return (
    <Link href={community.href} className="srch-hit srch-hit--thread srch-hit--community">
      <div className="srch-hit__thread-head">
        <h3 className="srch-hit__thread-title">{community.title}</h3>
        {community.heat_label ? <span className="srch-hit__heat">{community.heat_label}</span> : null}
      </div>
      <p className="srch-hit__thread-snippet">{community.subtitle}</p>
      <div className="srch-hit__meta">
        <span>{community.sentiment_label}</span>
        {community.linked_symbols.length > 0 ? (
          <>
            <span>·</span>
            <span className="srch-hit__symbols">{community.linked_symbols.slice(0, 3).join(" · ")}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
