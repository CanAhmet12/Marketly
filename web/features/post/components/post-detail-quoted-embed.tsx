"use client";

import Link from "next/link";
import { memo } from "react";

import type { FeedPost } from "@/features/feed/types";
import { homeHrefForFeedPost } from "@/features/home/routing";

import { PostDetailMentionText } from "./post-detail-mention-text";

type Props = {
  quoted: FeedPost;
};

function PostDetailQuotedEmbedInner({ quoted }: Props) {
  return (
    <Link href={homeHrefForFeedPost(quoted)} className="pd-quoted-block">
      <p className="pd-quoted-author">
        {quoted.author_name}{" "}
        <span className="pd-quoted-handle">{quoted.author_handle}</span>
      </p>
      <p className="pd-quoted-text">
        <PostDetailMentionText text={quoted.content} />
      </p>
    </Link>
  );
}

export const PostDetailQuotedEmbed = memo(PostDetailQuotedEmbedInner);
