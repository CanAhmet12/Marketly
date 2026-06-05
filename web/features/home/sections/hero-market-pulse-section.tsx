import Link from "next/link";

import type { HomeSection } from "@/features/home/types";

type Props = {
  section: HomeSection;
};

export function HeroMarketPulseSection({ section }: Props) {
  return (
    <section className="mt-[var(--sp-2)]" aria-labelledby={`${section.id}-heading`}>
      <h2 id={`${section.id}-heading`} className="sr-only">
        {section.title}
      </h2>
      <div className="flex min-h-9 w-full min-w-0 items-center gap-[var(--sp-2)] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[var(--color-bg-subtle)] px-[var(--sp-2)] py-[var(--sp-2)]">
        <div className="flex min-w-0 flex-1 items-center gap-[var(--sp-2)] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll">
          {section.items.map((it, i) =>
            it.kind === "pulse_chip" ? (
              <Link
                key={`${it.href}-${i}`}
                href={it.href}
                className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-[var(--sp-2)] py-px text-[12px] font-semibold text-[var(--color-text-secondary)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-border))] hover:text-[var(--color-text)] active:scale-[0.98]"
              >
                {it.label}
              </Link>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
