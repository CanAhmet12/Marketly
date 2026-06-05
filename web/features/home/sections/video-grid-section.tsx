"use client";

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  authorAvatarSrc,
  formatDurationBadge,
  gridCardTitle,
  pickDurationSeconds,
  pickGridThumbnail,
} from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

type Props = {
  section: HomeSection;
  engagement: HomeEngagementHandlers;
};

export function VideoGridSection({ section, engagement }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <ul className="grid grid-cols-1 gap-x-[var(--grid-gap-x)] gap-y-[var(--grid-gap-y)] sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) =>
          item.kind === "feed_post" ? (
            <li key={item.post.id}>
              <VideoGridCell post={item.post} href={item.href} engagement={engagement} />
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}

function VideoGridCell({
  post,
  href,
  engagement,
}: {
  post: FeedPost;
  href: string;
  engagement: HomeEngagementHandlers;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const durationSec = pickDurationSeconds(post);
  const title = gridCardTitle(post);
  const views = post.views_count;

  return (
    <article className="flex flex-col bg-transparent">
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-[var(--radius-thumb)] bg-[var(--color-thumb-bg)] ring-1 ring-[color:var(--color-ring-subtle)]",
          "shadow-[var(--shadow-thumb)] transition-[box-shadow] duration-[var(--motion-soft)] hover:shadow-[var(--shadow-thumb-hover)]",
        )}
      >
        <Link href={href} className="absolute inset-0 z-0" aria-label={title}>
          {thumb && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[12px] font-semibold text-[var(--color-muted)]">
              Önizleme
            </div>
          )}
        </Link>
        {durationSec != null ? (
          <span className="absolute bottom-[var(--sp-2)] right-[var(--sp-2)] z-[1] rounded bg-black/88 px-[var(--sp-2)] py-px font-mono text-[10px] font-semibold tabular-nums text-white">
            {formatDurationBadge(durationSec)}
          </span>
        ) : null}
      </div>
      <div className="mt-[var(--sp-3)] flex items-start gap-[10px] px-px">
        <Link href={`/channel/${post.user_id}`} className="shrink-0 pt-[3px]" tabIndex={-1}>
          <SafeAvatar src={authorAvatarSrc(post)} alt="" size={36} className="h-9 w-9 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href} className="block">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.012em] text-[var(--color-text)]">{title}</h3>
          </Link>
          <p className="mt-1 truncate text-[13px] font-semibold text-[var(--color-text-secondary)]">
            <Link href={`/channel/${post.user_id}`} className="hover:text-[var(--color-text)]">
              {post.author_name}
            </Link>
          </p>
          <p className="mt-0.5 truncate text-[12px] font-semibold tabular-nums text-[var(--color-meta)]">
            {views != null && views > 0 ? `${formatCompactCount(views)} görüntüleme` : `${formatCompactCount(post.likes)} beğeni`}
            <span className="mx-1 text-[var(--color-divider)]">·</span>
            {formatCompactCount(post.comments)} yorum
            <span className="mx-1 text-[var(--color-divider)]">·</span>
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 pt-px">
          <button
            type="button"
            aria-label={post.is_liked ? "Beğeniyi kaldır" : "Beğen"}
            disabled={engagement.likePendingPostId === post.id}
            onClick={(e) => {
              e.preventDefault();
              if (!engagement.isLoggedIn) {
                engagement.onRequireAuth?.();
                return;
              }
              engagement.onToggleLike(post);
            }}
            className={cn(
              "rounded-full p-1.5 text-[12px] font-semibold transition",
              post.is_liked ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)]",
            )}
          >
            ♥
          </button>
        </div>
      </div>
    </article>
  );
}
