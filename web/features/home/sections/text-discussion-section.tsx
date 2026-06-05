"use client";

import { TextDiscussionCard } from "@/features/home/cards/text-discussion-card";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";

type Props = { section: HomeSection; engagement: HomeEngagementHandlers };

export function TextDiscussionSection({ section, engagement }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <ul className="flex flex-col gap-[var(--sp-3)]">
        {section.items.map((item) =>
          item.kind === "feed_post" ? (
            <li key={item.post.id} className="list-none">
              <TextDiscussionCard post={item.post} href={item.href} engagement={engagement} />
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
