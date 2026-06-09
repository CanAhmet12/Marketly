import Link from "next/link";
import { memo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";

function postHref(post: FeedPost): string {
  if (isVideoLikePost(post)) return `/watch/${post.id}`;
  return `/post/${post.id}`;
}

type Props = {
  post: FeedPost;
  onUnsave: (postId: string) => void;
};

export const SavedRow = memo(function SavedRow({ post, onUnsave }: Props) {
  const snippet = post.title?.trim() || post.content?.trim().slice(0, 180) || "Gönderi";
  const isVideo = isVideoLikePost(post);

  return (
    <li className="sv-feed-row" data-kind={isVideo ? "video" : "post"}>
      <div className="sv-unread-bar" aria-hidden />
      <Link href={postHref(post)} className="sv-row-avatar" aria-label={`${post.author_name} gönderisi`}>
        {post.author_avatar ? (
          <SafeAvatar src={post.author_avatar} alt="" size={44} className="h-11 w-11" />
        ) : (
          <span className="sv-avatar-fallback">{post.author_name.slice(0, 1).toUpperCase()}</span>
        )}
        {isVideo ? <span className="sv-kind-dot sv-kind-dot--video" aria-hidden /> : null}
      </Link>
      <div className="sv-row-body">
        <div className="sv-row-meta">
          <div className="sv-row-tags">
            <span className="sv-row-kind">{isVideo ? "Video" : "Gönderi"}</span>
            {post.asset_tag ? <span className="sv-row-tag">{post.asset_tag}</span> : null}
          </div>
          <time className="sv-row-time" dateTime={post.created_at}>
            {formatSocialRelativeTime(post.created_at)}
          </time>
        </div>
        <Link href={postHref(post)} className="sv-row-open">
          <p className="sv-row-title">{snippet}</p>
        </Link>
        <p className="sv-row-actor">
          <span className="sv-row-author">{post.author_name}</span>
          {post.author_handle ? <span className="sv-row-handle"> · {post.author_handle}</span> : null}
        </p>
        <div className="sv-row-actions">
          <Link href={postHref(post)} className="sv-action-link sv-action-link--primary">
            Aç
          </Link>
          <button type="button" className="sv-action-link" onClick={() => void onUnsave(post.id)}>
            Kaldır
          </button>
        </div>
      </div>
    </li>
  );
});
