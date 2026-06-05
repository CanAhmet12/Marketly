"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  gridCardTitle,
  isLivePost,
  isPulsePost,
  isSignalPost,
  isVideoLikePost,
} from "@/features/feed/feed-display";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { authorAvatarSrc } from "../post-detail-helpers";
import type { PostDetail } from "../types";

interface Props {
  post: PostDetail;
}

function PostTypeBadge({ post }: { post: PostDetail }) {
  if (isSignalPost(post)) {
    return <span className="pd-type-badge pd-type-badge--signal">Sinyal</span>;
  }
  if (isLivePost(post)) {
    return <span className="pd-type-badge pd-type-badge--live">Canlı</span>;
  }
  if (isPulsePost(post)) {
    return <span className="pd-type-badge pd-type-badge--pulse">Pulse</span>;
  }
  if (isVideoLikePost(post)) {
    return <span className="pd-type-badge pd-type-badge--video">Video</span>;
  }
  return null;
}

function LinkPreviewBlock({ preview }: { preview: NonNullable<PostDetail["link_preview"]> }) {
  return (
    <button
      type="button"
      className="pd-link-preview"
      onClick={() => preview.url && window.open(preview.url, "_blank", "noopener,noreferrer")}
    >
      {preview.image ? (
        <div className="pd-link-preview-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="pd-link-preview-body">
        <div className="pd-link-preview-site">{preview.site_name || "Bağlantı"}</div>
        <div className="pd-link-preview-title">{preview.title || preview.url}</div>
        {preview.description ? <div className="pd-link-preview-desc">{preview.description}</div> : null}
      </div>
    </button>
  );
}

function QuotedBlock({ quoted }: { quoted: NonNullable<PostDetail["quoted_post"]> }) {
  const href = isVideoLikePost(quoted) ? `/watch/${quoted.id}` : `/post/${quoted.id}`;
  return (
    <Link href={href} className="pd-quoted-block">
      <div className="pd-quoted-author">
        {quoted.author_name}{" "}
        <span className="pd-quoted-handle">{quoted.author_handle}</span>
      </div>
      <p className="pd-quoted-text">{quoted.content || gridCardTitle(quoted)}</p>
    </Link>
  );
}

export function PostDetailContent({ post }: Props) {
  const hasMedia =
    Boolean(post.image_url?.trim()) ||
    Boolean(post.thumbnail_url?.trim()) ||
    Boolean(post.video_url?.trim()) ||
    Boolean(post.media_urls?.length);
  const hasLinkPreview = Boolean(post.link_preview?.url) && !hasMedia;
  const quotedMissing = Boolean(post.quoted_post_id) && !post.quoted_post;
  const typeBadge = <PostTypeBadge post={post} />;

  return (
    <>
      {post.reply_to_post_id && (
        <div className="pd-reply-chain">
          Yanıt zinciri —{" "}
          <Link href={`/post/${post.reply_to_post_id}`} className="pd-reply-chain-link">
            üst gönderiyi görüntüle
          </Link>
        </div>
      )}

      <header className="pd-header">
        <Link href={`/channel/${post.user_id}`} className="pd-avatar-link">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt={`${post.author_name} profil fotoğrafı`}
            size={42}
            className="pd-avatar"
          />
        </Link>

        <div className="pd-identity">
          <div className="pd-author-row">
            <Link href={`/channel/${post.user_id}`} className="pd-author-name">
              {post.author_name}
            </Link>
            {post.verified && <span className="pd-badge pd-badge--verified">Verified</span>}
            {post.author_tier === "elite" && <span className="pd-badge pd-badge--elite">Elite</span>}
            {post.author_tier === "pro" && <span className="pd-badge pd-badge--pro">Pro</span>}
            {typeBadge}
          </div>

          <div className="pd-handle-row">
            <span>{post.author_handle}</span>
            <span className="pd-sep">·</span>
            <time title={new Date(post.created_at).toLocaleString("tr-TR")}>
              {formatTimeAgo(post.created_at)}
            </time>
            {(post.views_count ?? 0) > 0 && (
              <>
                <span className="pd-sep">·</span>
                <span>{post.views_count?.toLocaleString("tr-TR")} görüntüleme</span>
              </>
            )}
          </div>

          {post.asset_tag && (
            <Link href={`/markets/${encodeURIComponent(post.asset_tag)}`} className="pd-asset-chip">
              #{post.asset_tag}
            </Link>
          )}
        </div>
      </header>

      {post.title && <h1 className="pd-title">{post.title}</h1>}
      {post.description && post.description !== post.content && (
        <p className="pd-description">{post.description}</p>
      )}
      {post.content && <p className="pd-body-text">{post.content}</p>}

      {hasLinkPreview && post.link_preview && <LinkPreviewBlock preview={post.link_preview} />}
      {quotedMissing && (
        <div className="pd-quoted-missing">Alıntılanan gönderi artık yok veya gizli.</div>
      )}
      {post.quoted_post && <QuotedBlock quoted={post.quoted_post} />}
    </>
  );
}
