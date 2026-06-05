"use client";

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, gridCardTitle, pickGridThumbnail } from "@/features/feed/feed-display";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";
import type { FeedPost } from "@/features/feed/types";
import { cn } from "@/lib/cn";

type Props = { section: HomeSection; engagement: HomeEngagementHandlers };

export function LiveNowSection({ section, engagement }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <div className="-mx-[var(--sp-3)] flex gap-[var(--sp-2)] overflow-x-auto px-[var(--sp-3)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll">
        {section.items.map((item) =>
          item.kind === "feed_post" ? (
            <LiveCard key={item.post.id} post={item.post} href={item.href} engagement={engagement} />
          ) : null,
        )}
      </div>
    </section>
  );
}

function LiveCard({
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
  const title = gridCardTitle(post);

  return (
    <article className="w-[min(280px,78vw)] shrink-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-thumb)] bg-[var(--color-thumb-bg)] ring-1 ring-[color:var(--color-ring-subtle)] shadow-[var(--shadow-thumb)]">
        <Link href={href} className="absolute inset-0 z-0" aria-label={title}>
          {thumb && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" onError={() => setImgFailed(true)} />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-muted)]">Canlı</div>
          )}
        </Link>
        <span className="absolute left-[var(--sp-2)] top-[var(--sp-2)] z-[1] flex items-center gap-1 rounded bg-red-600 px-[var(--sp-2)] py-px text-[10px] font-semibold uppercase tracking-wide text-white">
          Canlı
        </span>
      </div>
      <div className="mt-[var(--sp-2)] flex gap-2">
        <SafeAvatar src={authorAvatarSrc(post)} alt="" size={32} className="h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Link href={href} className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--color-text)]">
            {title}
          </Link>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--color-meta)]">{post.author_name}</p>
        </div>
        <button
          type="button"
          className={cn("shrink-0 self-start text-[12px] font-semibold", post.is_liked ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]")}
          onClick={() => {
            if (!engagement.isLoggedIn) engagement.onRequireAuth?.();
            else engagement.onToggleLike(post);
          }}
        >
          ♥
        </button>
      </div>
    </article>
  );
}
