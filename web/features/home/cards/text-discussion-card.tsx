"use client";

/* eslint-disable @next/next/no-img-element -- feed medya / önizleme */

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, gridCardTitle } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeFeedEngagementRow } from "@/features/home/cards/home-feed-engagement-row";
import { HomeEditorialPostGrid } from "@/features/home/presentation/home-post-layout";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

type Props = {
  post: FeedPost;
  href: string;
  engagement: HomeEngagementHandlers;
  /** Yalnızca Home akışı — premium yüzey + gömülü alıntı/medya */
  feedSurface?: "default" | "home";
};

function tierShort(post: FeedPost): string | null {
  const t = (post.author_tier ?? "").toLowerCase();
  if (t === "elite") return "Elite";
  if (t === "pro") return "Pro";
  return null;
}

function tierPillClass(tier: string): string {
  if (tier === "elite") return "bg-[color-mix(in_srgb,var(--color-tier-elite)_18%,transparent)] text-[var(--color-tier-elite)] ring-1 ring-[color-mix(in_srgb,var(--color-tier-elite)_35%,transparent)]";
  if (tier === "pro") return "bg-[color-mix(in_srgb,var(--color-tier-pro)_16%,transparent)] text-[var(--color-tier-pro)] ring-1 ring-[color-mix(in_srgb,var(--color-tier-pro)_30%,transparent)]";
  return "";
}

function HomeMediaBlock({ post, soft, bleed }: { post: FeedPost; soft: boolean; bleed?: boolean }) {
  const items = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
  const singleUrl = post.image_url && items.length === 0 ? post.image_url : null;
  if (!singleUrl && items.length === 0) return null;

  const wrap = cn(
    soft
      ? "overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--color-bg-elevated)_70%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_42%,transparent)]"
      : "overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]",
    !bleed && (soft ? "mt-2.5" : "mt-3"),
  );

  if (singleUrl) {
    return (
      <div className={wrap}>
        <img
          src={singleUrl}
          alt=""
          className="aspect-[2/1] w-full max-h-[min(36rem,78vh)] object-cover sm:aspect-video sm:max-h-[min(38rem,72vh)]"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div className={cn("grid grid-cols-2 gap-1.5", soft && "sm:gap-2", !bleed && soft && "mt-2.5", !bleed && !soft && "mt-3")}>
      {items.slice(0, 4).map((m) => (
        <div
          key={m.url}
          className={cn(
            "aspect-[4/3] overflow-hidden rounded-lg sm:rounded-md",
            soft ? "bg-[color-mix(in_srgb,var(--color-bg-elevated)_80%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_40%,transparent)]" : "border border-[var(--color-border)]",
          )}
        >
          <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function HomeLinkPreview({
  preview,
  soft,
  stacked,
  bleed,
}: {
  preview: NonNullable<FeedPost["link_preview"]>;
  soft: boolean;
  stacked?: boolean;
  bleed?: boolean;
}) {
  const shell = cn(
    "flex w-full min-w-0 overflow-hidden rounded-lg text-left transition-opacity hover:opacity-[0.96]",
    !bleed && "mt-2.5",
    stacked && "flex-col",
    soft
      ? "bg-[color-mix(in_srgb,var(--color-bg-elevated)_75%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-divider)_50%,transparent)]"
      : "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:shadow-[var(--shadow-card)]",
  );

  return (
    <button type="button" className={shell} onClick={() => preview.url && window.open(preview.url, "_blank", "noopener,noreferrer")}>
      {preview.image ? (
        <div
          className={cn(
            "relative shrink-0 bg-[var(--color-thumb-bg)]",
            stacked ? "aspect-video w-full" : "h-28 w-[38%] max-w-[11rem] sm:h-32 sm:max-w-[13rem]",
          )}
        >
          <img src={preview.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : null}
      <div className={cn("min-w-0 p-3", !stacked && "flex-1")}>
        <p className="text-[12px] font-medium text-[var(--color-meta)] sm:text-[13px]">{preview.site_name || "Bağlantı"}</p>
        <p className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug text-[var(--color-text)] sm:text-[15px]">{preview.title || preview.url}</p>
        {preview.description ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{preview.description}</p>
        ) : null}
      </div>
    </button>
  );
}

function HomeQuotedBlock({ quoted }: { quoted: FeedPost }) {
  return (
    <div className="border-l-2 border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] pl-3">
      <div className="rounded-r-xl rounded-bl-xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_55%,transparent)] px-3 py-2.5 ring-1 ring-[color-mix(in_srgb,var(--color-divider)_40%,transparent)]">
        <p className="text-[12px] font-semibold text-[var(--color-text)]">
          {quoted.author_name} <span className="font-normal text-[var(--color-meta)]">{quoted.author_handle}</span>
        </p>
        <p className="mt-1 line-clamp-3 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{quoted.content}</p>
      </div>
    </div>
  );
}

function HomeSocialRepostEmbed({ rep }: { rep: NonNullable<FeedPost["social_repost"]> }) {
  return (
    <div className="border-l-2 border-[color-mix(in_srgb,var(--color-text-tertiary)_35%,transparent)] pl-3">
      <div className="rounded-r-xl rounded-bl-xl bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-3 py-2.5 ring-1 ring-[color-mix(in_srgb,var(--color-divider)_38%,transparent)]">
        <p className="text-[12px] font-semibold tracking-wide text-[var(--color-meta)]">
          {rep.kind === "quote_repost" ? "Alıntı" : "Yeniden paylaşım"}
        </p>
        <Link href={`/post/${rep.source_post_id}`} className="mt-1 block text-left">
          <p className="text-[12px] font-semibold text-[var(--color-text)]">
            {rep.source.author_name}{" "}
            <span className="font-normal text-[var(--color-meta)]">{rep.source.author_handle}</span>
          </p>
          {rep.source.asset_tag ? (
            <span className="mt-1 inline-block text-[12px] font-semibold text-[var(--color-primary)]">#{rep.source.asset_tag}</span>
          ) : null}
          <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-[var(--color-text-secondary)]">{rep.source.content_snippet}</p>
        </Link>
      </div>
    </div>
  );
}

export function TextDiscussionCard({ post, href, engagement, feedSurface = "default" }: Props) {
  const title = gridCardTitle(post);
  const body = post.content?.trim() || "";
  const home = feedSurface === "home";
  const tier = tierShort(post);

  if (home) {
    const mediaItems = post.media_urls?.filter((m) => m.type === "image" || m.type === "gif") ?? [];
    const singleUrl = post.image_url && mediaItems.length === 0 ? post.image_url : null;
    const hasMedia = Boolean(singleUrl || mediaItems.length > 0);
    const showQuoteMedia = !post.social_repost || post.social_repost.kind === "quote_repost";
    const hasLink = Boolean(post.link_preview?.url && showQuoteMedia);
    const hasFullBleed = showQuoteMedia && (hasMedia || hasLink);
    const under =
      post.social_repost || post.quoted_post ? (
        <div className="space-y-2.5">
          {post.social_repost ? <HomeSocialRepostEmbed rep={post.social_repost} /> : null}
          {post.quoted_post ? <HomeQuotedBlock quoted={post.quoted_post} /> : null}
        </div>
      ) : undefined;

    return (
      <article className="group relative overflow-hidden rounded-xl transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_5%,var(--color-bg-subtle))]">
        <HomeEditorialPostGrid
          avatar={
            <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="block transition-transform hover:scale-[1.02]">
              <SafeAvatar
                src={authorAvatarSrc(post)}
                alt=""
                size={48}
                className="h-12 w-12 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]"
              />
            </Link>
          }
          header={
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  href={`/channel/${post.user_id}`}
                  className="text-[17px] font-bold tracking-[-0.02em] text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                >
                  {post.author_name}
                </Link>
                {tier ? (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tierPillClass(post.author_tier))}>
                    {tier}
                  </span>
                ) : null}
                <span className="text-[13px] font-medium text-[var(--color-text-tertiary)]">{post.author_handle}</span>
                <span className="text-[13px] font-medium tabular-nums text-[var(--color-meta)]">· {formatTimeAgo(post.created_at)}</span>
              </div>
              {post.asset_tag ? (
                <Link
                  href={`/results?q=${encodeURIComponent(post.asset_tag.replace(/^#/, ""))}`}
                  className="mt-1.5 inline-block text-[13px] font-semibold text-[var(--color-primary)] transition-colors hover:underline"
                >
                  #{post.asset_tag.replace(/^#/, "")}
                </Link>
              ) : null}
              {post.social_repost?.kind === "repost" ? (
                <p className="mt-1.5 text-[12px] font-medium text-[var(--color-meta)]">Yeniden paylaştı</p>
              ) : null}
            </div>
          }
          primary={
            <Link href={href} className="group/content block">
              {title ? (
                <h3 className="text-[1.125rem] font-bold leading-[1.28] tracking-[-0.02em] text-[var(--color-text)] transition-colors group-hover/content:text-[var(--color-primary)] sm:text-[1.25rem]">
                  {title}
                </h3>
              ) : null}
              {body ? (
                <p
                  className="mt-1.5 text-[15px] font-normal leading-[1.58] text-[var(--color-text-secondary)] sm:text-[16px] sm:leading-[1.56]"
                  style={{ lineClamp: 5, WebkitLineClamp: 5, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {body}
                </p>
              ) : null}
            </Link>
          }
          fullBleed={
            hasFullBleed ? (
              <div className="space-y-2">
                {hasMedia && showQuoteMedia ? <HomeMediaBlock post={post} soft bleed /> : null}
                {hasLink && post.link_preview ? <HomeLinkPreview preview={post.link_preview} soft stacked bleed /> : null}
              </div>
            ) : undefined
          }
          underMedia={under}
          footer={<HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="home" />}
        />
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative transition-colors",
        "bg-[var(--color-bg)] px-[var(--sp-4)] py-[var(--sp-4)] hover:bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-bg))]",
      )}
    >
      <div className={cn("flex", "gap-[var(--sp-3)]")}>
        <Link href={`/channel/${post.user_id}`} tabIndex={-1} className="shrink-0 transition-transform hover:scale-[1.02]">
          <SafeAvatar
            src={authorAvatarSrc(post)}
            alt=""
            size={44}
            className={cn("rounded-full ring-1 ring-[color:var(--color-ring-subtle)]", "h-11 w-11")}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/channel/${post.user_id}`}
              className={cn(
                "font-bold leading-tight text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]",
                "text-[15px] leading-none",
              )}
            >
              {post.author_name}
            </Link>
            {tier ? (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tierPillClass(post.author_tier))}>
                {tier}
              </span>
            ) : null}
            <span className={cn("font-medium", "text-[13px] text-[var(--color-muted)]")}>{post.author_handle}</span>
            <span className={cn("font-medium tabular-nums", "text-[13px] text-[var(--color-meta)]")}>· {formatTimeAgo(post.created_at)}</span>
          </div>
          {post.asset_tag ? (
            <Link
              href={`/results?q=${encodeURIComponent(post.asset_tag.replace(/^#/, ""))}`}
              className={cn(
                "mt-1.5 inline-block font-semibold text-[var(--color-primary)] transition-colors hover:underline",
                "text-[13px] text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]",
              )}
            >
              #{post.asset_tag.replace(/^#/, "")}
            </Link>
          ) : null}
          {post.social_repost?.kind === "repost" ? (
            <p className="mt-1.5 text-[12px] font-medium text-[var(--color-meta)]">Yeniden paylaştı</p>
          ) : null}
          <Link href={href} className="mt-2 block group/content">
            {title ? (
              <h3
                className={cn(
                  "font-bold tracking-[-0.02em] text-[var(--color-text)] transition-colors group-hover/content:text-[var(--color-primary)]",
                  "text-[17px] leading-[1.35] group-hover/content:text-[var(--color-primary-dark)]",
                )}
              >
                {title}
              </h3>
            ) : null}
            {body ? (
              <p
                className={cn("mt-2 text-[15px] font-normal text-[var(--color-text-secondary)]", "max-w-[min(100%,42rem)] leading-[1.6]")}
                style={{ lineClamp: 4, WebkitLineClamp: 4, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
              >
                {body}
              </p>
            ) : null}
          </Link>

          <HomeFeedEngagementRow post={post} commentHref={href} engagement={engagement} variant="default" />
        </div>
      </div>
    </article>
  );
}
