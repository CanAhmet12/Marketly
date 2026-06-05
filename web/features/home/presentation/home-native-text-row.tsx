"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { gridCardTitle } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { HomeNativeQuotedStrip, HomeNativeRepostStrip } from "@/features/home/presentation/home-native-embeds";
import { HomeNativeCreatorHeader, HomeNativeEngagementSlot, HomeNativePostArticle } from "@/features/home/presentation/home-native-post-frame";

type Props = {
  post: FeedPost;
  engagement: HomeEngagementHandlers;
};

function HomeNativeImageMedia({ post }: { post: FeedPost }) {
  const items = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  const singleUrl = post.image_url && items.length === 0 ? post.image_url : null;
  if (!singleUrl && items.length === 0) return null;

  if (singleUrl) {
    return (
      <div className="mt-3.5 overflow-hidden rounded-xl shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_22%,transparent)] sm:mt-4">
        <img
          src={singleUrl}
          alt=""
          className="aspect-[2/1] w-full max-h-[min(38rem,78vh)] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01] sm:aspect-[2.15/1]"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-2.5">
      {items.slice(0, 4).map((m) => (
        <div
          key={m.url}
          className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-[color-mix(in_srgb,var(--color-divider)_22%,transparent)] shadow-[0_8px_28px_-18px_rgba(0,0,0,0.55)]"
        >
          <img src={m.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function HomeNativeLinkPreviewWide({ preview }: { preview: NonNullable<FeedPost["link_preview"]> }) {
  return (
    <button
      type="button"
      className="group/lp mt-3.5 w-full min-w-0 overflow-hidden rounded-xl text-left ring-1 ring-[color-mix(in_srgb,var(--color-divider)_20%,transparent)] shadow-[0_10px_36px_-22px_rgba(0,0,0,0.6)] transition-[transform,opacity,box-shadow] duration-200 hover:shadow-[0_14px_44px_-20px_rgba(0,0,0,0.55)] active:scale-[0.995] sm:mt-4"
      onClick={() => preview.url && window.open(preview.url, "_blank", "noopener,noreferrer")}
    >
      {preview.image ? (
        <div className="relative aspect-[2.1/1] w-full overflow-hidden bg-[var(--color-thumb-bg)] sm:aspect-[2.25/1]">
          <img
            src={preview.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/lp:scale-[1.02]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>
      ) : null}
      <div className="bg-[color-mix(in_srgb,var(--color-bg-elevated)_52%,transparent)] px-3 py-3.5 sm:px-4 sm:py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-meta)]">{preview.site_name || "Bağlantı"}</p>
        <p className="mt-1 line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.02em] text-[var(--color-text)] sm:text-[1.125rem]">
          {preview.title || preview.url}
        </p>
        {preview.description ? (
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{preview.description}</p>
        ) : null}
      </div>
    </button>
  );
}

export function HomeNativeTextDiscussionRow({ post, engagement }: Props) {
  const href = homeHrefForFeedPost(post);
  const title = gridCardTitle(post);
  const body = post.content?.trim() || "";
  const mediaItems = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  const singleUrl = post.image_url && mediaItems.length === 0 ? post.image_url : null;
  const hasMedia = Boolean(singleUrl || mediaItems.length > 0);
  const showQuoteMedia = !post.social_repost || post.social_repost.kind === "quote_repost";
  const hasLink = Boolean(post.link_preview?.url && showQuoteMedia);
  const metaLine =
    post.social_repost?.kind === "repost" ? (
      <p className="mt-1.5 text-[12px] font-medium text-[var(--color-meta)]">Yeniden paylaştı</p>
    ) : undefined;

  const embeds =
    post.social_repost || post.quoted_post ? (
      <div className="mt-4 space-y-3 sm:mt-4 sm:space-y-3.5">
        {post.social_repost ? <HomeNativeRepostStrip rep={post.social_repost} /> : null}
        {post.quoted_post ? <HomeNativeQuotedStrip quoted={post.quoted_post} /> : null}
      </div>
    ) : null;

  return (
    <HomeNativePostArticle tone="surface">
      <HomeNativeCreatorHeader post={post} metaLine={metaLine} />
      <div className="mt-3.5 min-w-0 sm:mt-4">
        <Link href={href} className="group/content block">
          {title ? (
            <h3 className="text-[1.3125rem] font-bold leading-[1.22] tracking-[-0.024em] text-[var(--color-text)] transition-colors group-hover/content:text-[var(--color-primary)] sm:text-[1.375rem]">
              {title}
            </h3>
          ) : null}
          {body ? (
            <p className="mt-2.5 line-clamp-6 text-[16px] font-normal leading-[1.62] text-[var(--color-text-secondary)] sm:mt-3 sm:text-[17px] sm:leading-[1.58]">
              {body}
            </p>
          ) : null}
        </Link>
        {showQuoteMedia && hasMedia ? <HomeNativeImageMedia post={post} /> : null}
        {showQuoteMedia && hasLink && post.link_preview ? <HomeNativeLinkPreviewWide preview={post.link_preview} /> : null}
        {embeds}
      </div>
      <HomeNativeEngagementSlot>
        <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />
      </HomeNativeEngagementSlot>
    </HomeNativePostArticle>
  );
}
