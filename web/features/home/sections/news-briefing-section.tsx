"use client";

import Link from "next/link";

import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";

type Props = { section: HomeSection };

export function NewsBriefingSection({ section }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <ul className="divide-y divide-[var(--color-divider)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]">
        {section.items.map((item, i) =>
          item.kind === "news_line" ? (
            <li key={`${item.href}-${i}`}>
              <Link href={item.href} className="flex flex-col gap-0.5 px-[var(--sp-3)] py-[var(--sp-2)] transition hover:bg-[var(--color-surface-hover)]">
                <span className="text-[14px] font-semibold leading-snug text-[var(--color-text)]">{item.title}</span>
                <span className="text-[11px] font-semibold text-[var(--color-muted)]">{item.meta}</span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
