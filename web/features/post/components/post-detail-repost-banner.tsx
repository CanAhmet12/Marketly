"use client";

import { memo } from "react";

import type { FeedPost } from "@/features/feed/types";

type Props = {
  rep: NonNullable<FeedPost["social_repost"]>;
};

function PostDetailRepostBannerInner({ rep }: Props) {
  return (
    <p className="pd-repost-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 9V4h5M19 15v5h-5M19 9 14 4H9M5 15l5 5h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {rep.kind === "quote_repost" ? "Alıntılı yayın" : "Yeniden paylaşıldı"}
    </p>
  );
}

export const PostDetailRepostBanner = memo(PostDetailRepostBannerInner);
