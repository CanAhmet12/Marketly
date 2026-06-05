"use client";

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { authorAvatarSrc, gridCardTitle, pickGridThumbnail } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";
import { cn } from "@/lib/cn";

type Props = { section: HomeSection; engagement: HomeEngagementHandlers };

export function ShortsRailSection({ section, engagement }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <div className="-mx-[var(--sp-3)] flex gap-[var(--sp-2)] overflow-x-auto px-[var(--sp-3)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll">
        {section.items.map((item) =>
          item.kind === "feed_post" ? (
            <ShortCard key={item.post.id} post={item.post} href={item.href} engagement={engagement} />
          ) : null,
        )}
      </div>
    </section>
  );
}

function ShortCard({ post, href, engagement }: { post: FeedPost; href: string; engagement: HomeEngagementHandlers }) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumb = pickGridThumbnail(post);
  const title = gridCardTitle(post);

  return (
    <article className="w-[108px] shrink-0">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-thumb-bg)] ring-1 ring-[color:var(--color-ring-subtle)] shadow-[var(--shadow-thumb)]">
        <Link href={href} className="absolute inset-0 z-0" aria-label={title}>
          {thumb && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" onError={() => setImgFailed(true)} />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold text-[var(--color-muted)]">Pulse</div>
          )}
        </Link>
        <span className="absolute bottom-1 left-1 z-[1] rounded bg-black/75 px-1 py-px text-[9px] font-semibold uppercase text-white">Pulse</span>
      </div>
      <div className="mt-[var(--sp-2)] flex items-start gap-1.5">
        <SafeAvatar src={authorAvatarSrc(post)} alt="" size={24} className="h-6 w-6 shrink-0 rounded-full" />
        <p className="line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-snug text-[var(--color-text)]">{title}</p>
        <button
          type="button"
          className={cn("shrink-0 text-[11px]", post.is_liked ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]")}
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
