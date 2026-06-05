"use client";

import Link from "next/link";
import { useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection, RecommendedCreatorCard } from "@/features/home/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = { section: HomeSection; engagement: HomeEngagementHandlers };

export function CreatorGridSection({ section, engagement }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <ul className="grid grid-cols-1 gap-[var(--sp-2)] sm:grid-cols-2 lg:grid-cols-4">
        {section.items.map((item) =>
          item.kind === "creator_card" ? (
            <li key={item.creator.id}>
              <CreatorCard creator={item.creator} href={item.href} engagement={engagement} />
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}

function CreatorCard({
  creator,
  href,
  engagement,
}: {
  creator: RecommendedCreatorCard;
  href: string;
  engagement: HomeEngagementHandlers;
}) {
  const [followed, setFollowed] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-[var(--sp-2)]">
        <Link href={href} tabIndex={-1}>
          <SafeAvatar src={creator.avatar_url ?? ""} alt="" size={48} className="h-12 w-12 shrink-0 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href} className="flex items-center gap-1">
            <span className="truncate text-[14px] font-semibold text-[var(--color-text)]">{creator.name}</span>
            {creator.verified ? (
              <span className="shrink-0 text-[10px] font-semibold text-[var(--color-primary)]" title="Doğrulanmış">
                ✓
              </span>
            ) : null}
          </Link>
          <p className="truncate text-[12px] font-semibold text-[var(--color-muted)]">{creator.handle}</p>
        </div>
      </div>
      <p className="mt-[var(--sp-2)] line-clamp-2 flex-1 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]">{creator.expertise}</p>
      <p className="mt-1 text-[11px] font-semibold tabular-nums text-[var(--color-meta)]">{formatCompactCount(creator.follower_count)} takipçi</p>
      <button
        type="button"
        disabled={!engagement.isLoggedIn}
        onClick={() => {
          if (!engagement.isLoggedIn) {
            engagement.onRequireAuth?.();
            return;
          }
          setFollowed((v) => !v);
        }}
        className={cn(
          "mt-[var(--sp-2)] w-full rounded-[var(--radius-pill)] py-2 text-[12px] font-semibold transition",
          followed ? "border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)]" : "bg-[var(--color-primary)] text-white hover:opacity-95",
          !engagement.isLoggedIn && "opacity-80",
        )}
      >
        {followed ? "Takiptesin" : "Takip et"}
      </button>
    </article>
  );
}
