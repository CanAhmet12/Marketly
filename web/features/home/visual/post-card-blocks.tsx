"use client";

/* eslint-disable @next/next/no-img-element -- gönderi medyası / link preview rastgele domain */

import Link from "next/link";
import { memo } from "react";

import type { FeedPost, MediaItem } from "@/features/feed/types";

export function tierShortLabel(tier: string): string | null {
  const t = tier.toLowerCase();
  if (t === "elite") return "Elite";
  if (t === "pro") return "Pro";
  return null;
}

export function tierBadgeClass(tier: string): string {
  const t = tier.toLowerCase();
  if (t === "elite") return "hv-ref-article__tier hv-ref-article__tier--elite";
  if (t === "pro") return "hv-ref-article__tier hv-ref-article__tier--pro";
  return "";
}

export async function sharePost(post: FeedPost) {
  const snippet = post.content?.trim()
    ? `${post.content.slice(0, 140)}${post.content.length > 140 ? "…" : ""}`
    : post.title || "Marketly gönderisi";
  const text = `${post.author_name}: ${snippet}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Marketly", text });
      return;
    } catch {
      /* iptal */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* yok */
  }
}

const MENTION_RE = /(@[A-Za-zğüşöçıİĞÜŞÖÇ0-9_]+)/g;

function MentionText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(MENTION_RE);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <Link
            key={`${part}-${i}`}
            href={`/results?q=${encodeURIComponent(part.slice(1))}`}
            className="hv-ref-article__mention"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        ) : (
          <span key={`t-${i}`}>{part}</span>
        ),
      )}
    </span>
  );
}

function collectImageItems(post: FeedPost): MediaItem[] {
  const items = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  if (items.length > 0) return items;
  if (post.image_url) return [{ url: post.image_url, type: "image" }];
  return [];
}

function FeedMediaImg({
  item,
  priority,
  className,
}: {
  item: MediaItem;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src={item.url}
      alt=""
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(item.width && item.height ? { width: item.width, height: item.height } : {})}
    />
  );
}

function PostMediaGridInner({ post, priority }: { post: FeedPost; priority?: boolean }) {
  const items = collectImageItems(post);
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="hv-ref-article__media hv-ref-article__media--single">
        <FeedMediaImg item={items[0]} priority={priority} className="hv-ref-article__media-img" />
      </div>
    );
  }

  const countClass =
    items.length === 2
      ? "hv-ref-article__media--duo"
      : items.length === 3
        ? "hv-ref-article__media--trio"
        : "hv-ref-article__media--quad";

  return (
    <div className={`hv-ref-article__media hv-ref-article__media--grid ${countClass}`}>
      {items.slice(0, 4).map((item, idx) => (
        <div key={item.url} className="hv-ref-article__media-cell">
          <FeedMediaImg
            item={item}
            priority={priority && idx === 0}
            className="hv-ref-article__media-img"
          />
        </div>
      ))}
    </div>
  );
}

export const PostMediaGrid = memo(PostMediaGridInner);

function PostLinkPreviewInner({ preview }: { preview: NonNullable<FeedPost["link_preview"]> }) {
  return (
    <button
      type="button"
      className="hv-ref-article__link-preview"
      onClick={() => preview.url && window.open(preview.url, "_blank", "noopener,noreferrer")}
    >
      {preview.image ? (
        <div className="hv-ref-article__link-preview-img">
          <img src={preview.image} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="hv-ref-article__link-preview-body">
        <p className="hv-ref-article__link-preview-site">{preview.site_name || "Bağlantı"}</p>
        <p className="hv-ref-article__link-preview-title">{preview.title || preview.url}</p>
        {preview.description ? (
          <p className="hv-ref-article__link-preview-desc">{preview.description}</p>
        ) : null}
      </div>
    </button>
  );
}

export const PostLinkPreview = memo(PostLinkPreviewInner);

function PostQuotedEmbedInner({ quoted }: { quoted: FeedPost }) {
  return (
    <Link href={`/post/${quoted.id}`} className="hv-ref-article__quote">
      <p className="hv-ref-article__quote-author">
        {quoted.author_name}{" "}
        <span className="hv-ref-article__quote-handle">{quoted.author_handle}</span>
      </p>
      <p className="hv-ref-article__quote-text">
        <MentionText text={quoted.content} />
      </p>
    </Link>
  );
}

export const PostQuotedEmbed = memo(PostQuotedEmbedInner);

function PostSocialRepostBannerInner({ rep }: { rep: NonNullable<FeedPost["social_repost"]> }) {
  return (
    <p className="hv-ref-article__repost-banner">
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

export const PostSocialRepostBanner = memo(PostSocialRepostBannerInner);

function PostSocialRepostEmbedInner({ rep }: { rep: NonNullable<FeedPost["social_repost"]> }) {
  return (
    <Link href={`/post/${rep.source_post_id}`} className="hv-ref-article__repost-embed">
      <p className="hv-ref-article__repost-embed-label">
        {rep.kind === "quote_repost" ? "Alıntı" : "Kaynak gönderi"}
      </p>
      <p className="hv-ref-article__repost-embed-author">
        {rep.source.author_name}{" "}
        <span className="hv-ref-article__repost-embed-handle">{rep.source.author_handle}</span>
      </p>
      {rep.source.asset_tag ? (
        <span className="hv-ref-article__repost-embed-tag">#{rep.source.asset_tag}</span>
      ) : null}
      <p className="hv-ref-article__repost-embed-snippet">{rep.source.content_snippet}</p>
    </Link>
  );
}

export const PostSocialRepostEmbed = memo(PostSocialRepostEmbedInner);

export { MentionText };
