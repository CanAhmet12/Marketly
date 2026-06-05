"use client";

import Link from "next/link";

import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection } from "@/features/home/types";
import { cn } from "@/lib/cn";

type Props = { section: HomeSection };

export function MarketMoversSection({ section }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <div className="grid grid-cols-2 gap-[var(--sp-2)] md:grid-cols-4">
        {section.items.map((item) =>
          item.kind === "market_mover" ? (
            <Link
              key={item.row.symbol}
              href={item.row.href}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-[var(--sp-2)] py-[var(--sp-2)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-border))] hover:shadow-[var(--shadow-card)]"
            >
              <p className="text-[13px] font-semibold text-[var(--color-text)]">{item.row.symbol}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{item.row.name}</p>
              <p className="mt-1 text-[14px] font-semibold tabular-nums text-[var(--color-text)]">
                {item.row.price.toLocaleString("tr-TR", { maximumFractionDigits: item.row.price >= 1000 ? 0 : 2 })}
              </p>
              <p
                className={cn(
                  "text-[12px] font-semibold tabular-nums",
                  item.row.change_percent > 0
                    ? "text-[var(--color-primary-dark)]"
                    : item.row.change_percent < 0
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-muted)]",
                )}
              >
                {item.row.change_percent >= 0 ? "+" : ""}
                {item.row.change_percent.toFixed(1)}%
              </p>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--color-meta)]">Hacim {item.row.volume}</p>
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}
