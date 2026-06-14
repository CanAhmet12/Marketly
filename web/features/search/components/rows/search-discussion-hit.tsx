"use client";

import Link from "next/link";

import type { DiscussionSearchHit } from "@/features/search/types";

type Props = { discussion: DiscussionSearchHit };

export function SearchDiscussionHit({ discussion }: Props) {
  return (
    <Link href={discussion.href} className="srch-hit srch-hit--thread">
      <div className="srch-hit__thread-head">
        <h3 className="srch-hit__thread-title">{discussion.title}</h3>
        {discussion.heat_label ? <span className="srch-hit__heat">{discussion.heat_label}</span> : null}
      </div>
      <p className="srch-hit__thread-snippet">{discussion.snippet}</p>
      <div className="srch-hit__meta">
        <span>{discussion.author_name}</span>
        {discussion.asset_tag ? (
          <>
            <span>·</span>
            <span className="srch-hit__asset-tag">#{discussion.asset_tag}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
