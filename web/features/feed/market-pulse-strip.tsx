"use client";

import Link from "next/link";

import { getHomeRepository } from "@/features/home/repository";
import { cn } from "@/lib/cn";

type MarketPulseStripProps = {
  /** `editorial`: Home `hv-ref` yüzeyiyle uyumlu tipografi / ayrım */
  tone?: "default" | "editorial";
};

export function MarketPulseStrip({ tone = "default" }: MarketPulseStripProps) {
  const tickers = getHomeRepository().getMarketPulse();
  const editorial = tone === "editorial";

  return (
    <div
      className={cn(
        "flex min-h-8 w-full min-w-0 items-center gap-[var(--sp-2)] pb-[var(--sp-2)]",
        editorial ? "border-b-0" : "border-b border-[var(--color-divider)]",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-[12px] font-semibold tracking-tight",
          editorial ? "text-[var(--hv-text-3)]" : "text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]",
        )}
      >
        Piyasalar
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-[var(--sp-2)] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll">
        {tickers.map((x) => (
          <Link
            key={x.label}
            href={x.href}
            className={cn(
              "shrink-0 text-[12px] font-semibold transition-colors",
              editorial
                ? "text-[var(--hv-text-2)] hover:text-[var(--hv-text)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]",
            )}
          >
            {x.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
