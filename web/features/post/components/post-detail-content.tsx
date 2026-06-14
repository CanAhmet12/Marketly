"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  isLivePost,
  isPulsePost,
  isSignalPost,
  isVideoLikePost,
} from "@/features/feed/feed-display";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { authorAvatarSrc, resolvePostDetailMedia } from "../post-detail-helpers";
import type { PostDetail } from "../types";

import { PostDetailAssetChip } from "./post-detail-asset-chip";
import { PostDetailAuthorBadges } from "./post-detail-author-badges";
import { PostDetailMentionText } from "./post-detail-mention-text";
import { PostDetailMenu } from "./post-detail-menu";
import { PostDetailQuotedEmbed } from "./post-detail-quoted-embed";
import { PostDetailRepostBanner } from "./post-detail-repost-banner";
import { PostDetailRepostEmbed } from "./post-detail-repost-embed";
import { PostDetailThreadNav } from "./post-detail-thread-nav";
import { PostDetailThreadSiblings } from "./post-detail-thread-siblings";

interface Props {
  post: PostDetail;
  onShare?: () => void;
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

/** Thread nav, repost banner, author header — medya hero'dan önce */
export function PostDetailContentLead({ post, onShare }: Props) {
  const typeBadge = <PostTypeBadge post={post} />;

  return (
    <>
      <PostDetailThreadNav post={post} />
      <PostDetailThreadSiblings postId={post.id} />

      {post.social_repost ? <PostDetailRepostBanner rep={post.social_repost} /> : null}

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
            <PostDetailAuthorBadges verified={post.verified} tier={post.author_tier} />
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

          {post.asset_tag ? <PostDetailAssetChip assetTag={post.asset_tag} /> : null}
        </div>

        <PostDetailMenu post={post} className="pd-header-menu" onShare={onShare} />
      </header>
    </>
  );
}

/** Başlık, gövde, link önizleme, alıntılar — medya hero'dan sonra */
export function PostDetailContentBody({ post }: Props) {
  const hasLinkPreview = Boolean(post.link_preview?.url) && !resolvePostDetailMedia(post);
  const quotedMissing = Boolean(post.quoted_post_id) && !post.quoted_post;

  return (
    <>
      {post.title && <h1 className="pd-title">{post.title}</h1>}
      {post.description && post.description !== post.content && (
        <p className="pd-description">{post.description}</p>
      )}
      {post.content && (
        <p className="pd-body-text">
          <PostDetailMentionText text={post.content} />
        </p>
      )}

      {hasLinkPreview && post.link_preview && <LinkPreviewBlock preview={post.link_preview} />}
      {quotedMissing && (
        <div className="pd-quoted-missing">Alıntılanan gönderi artık yok veya gizli.</div>
      )}
      {post.social_repost ? <PostDetailRepostEmbed rep={post.social_repost} /> : null}
      {post.quoted_post ? (
        <div className="pd-quoted-wrap">
          <PostDetailQuotedEmbed quoted={post.quoted_post} />
        </div>
      ) : null}
    </>
  );
}

/** Tam gövde — medya yok layout veya geriye dönük kullanım */
export function PostDetailContent({ post }: Props) {
  return (
    <>
      <PostDetailContentLead post={post} />
      <PostDetailContentBody post={post} />
    </>
  );
}
