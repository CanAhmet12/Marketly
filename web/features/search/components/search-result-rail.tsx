"use client";

import type { ReactNode } from "react";

import type { RailAccent } from "@/features/discover/visual-reference/discover-vr-primitives";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  count?: number;
  accent?: RailAccent;
  onSeeAll?: () => void;
  children: ReactNode;
};

export function SearchResultRail({ label, count, accent = "default", onSeeAll, children }: Props) {
  return (
    <section className="dvr-rail-section sch-rail" aria-label={label}>
      <div className="dvr-rail-header">
        <div className="dvr-rail-header__left">
          <span
            className={cn(
              "dvr-rail-label",
              accent === "live" && "dvr-rail-label--live",
              accent === "teal" && "dvr-rail-label--teal",
              accent === "signal" && "dvr-rail-label--signal",
            )}
          >
            {accent === "live" ? (
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"
                style={{ animation: "dvr-live-dot-pulse 1.2s ease-in-out infinite" }}
                aria-hidden
              />
            ) : null}
            {label}
          </span>
          {count != null && count > 0 ? <span className="sch-rail-count">{count}</span> : null}
        </div>
        {onSeeAll ? (
          <button type="button" className="dvr-rail-see-all sch-rail-see-all" onClick={onSeeAll}>
            Tümünü gör
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
