"use client";

import Link from "next/link";
import { memo } from "react";

import type { FeedPost } from "@/features/feed/types";

type Props = {
  rep: NonNullable<FeedPost["social_repost"]>;
};

function PostDetailRepostEmbedInner({ rep }: Props) {
  return (
    <Link href={`/post/${rep.source_post_id}`} className="pd-repost-embed">
      <p className="pd-repost-embed__label">
        {rep.kind === "quote_repost" ? "Alıntı" : "Kaynak gönderi"}
      </p>
      <p className="pd-repost-embed__author">
        {rep.source.author_name}{" "}
        <span className="pd-repost-embed__handle">{rep.source.author_handle}</span>
      </p>
      {rep.source.asset_tag ? (
        <span className="pd-repost-embed__tag">#{rep.source.asset_tag}</span>
      ) : null}
      <p className="pd-repost-embed__snippet">{rep.source.content_snippet}</p>
    </Link>
  );
}

export const PostDetailRepostEmbed = memo(PostDetailRepostEmbedInner);
