"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SearchRailAccent = "default" | "teal" | "live" | "signal";

type Props = {
  label: string;
  count?: number;
  accent?: SearchRailAccent;
  onSeeAll?: () => void;
  children: ReactNode;
};

export function SearchResultRail({ label, count, accent = "default", onSeeAll, children }: Props) {
  return (
    <section className="srch-rail" data-accent={accent} aria-label={label}>
      <div className="srch-rail__header">
        <div className="srch-rail__head-left">
          <span
            className={cn(
              "srch-rail__label",
              accent === "live" && "srch-rail__label--live",
              accent === "teal" && "srch-rail__label--teal",
              accent === "signal" && "srch-rail__label--signal",
            )}
          >
            {accent === "live" ? <span className="srch-rail__live-dot" aria-hidden /> : null}
            {label}
          </span>
          {count != null && count > 0 ? <span className="srch-rail__count">{count}</span> : null}
        </div>
        {onSeeAll ? (
          <button type="button" className="srch-rail__see-all" onClick={onSeeAll}>
            Tümünü gör
          </button>
        ) : null}
      </div>
      <div className="srch-rail__body">{children}</div>
    </section>
  );
}
