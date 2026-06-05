"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type RailAccent = "live" | "teal" | "signal" | "default";

export function HScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollStep = useCallback(() => {
    const el = ref.current;
    if (!el) return 260;
    return Math.min(320, Math.max(200, el.clientWidth * 0.42));
  }, []);
  const scrollByDir = useCallback(
    (dir: -1 | 1) => {
      ref.current?.scrollBy({ left: dir * scrollStep(), behavior: "smooth" });
    },
    [scrollStep],
  );
  return (
    <div className="dvr-hscroll-wrap">
      <div
        ref={ref}
        className={cn(
          "dvr-hscroll dvr-hscroll--snap",
          "flex gap-(--dvr-rail-gap) overflow-x-auto",
          "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>
      <button
        type="button"
        className="dvr-hscroll-nav dvr-hscroll-nav--prev"
        aria-label="Önceki kartlar"
        onClick={() => scrollByDir(-1)}
      />
      <button
        type="button"
        className="dvr-hscroll-nav dvr-hscroll-nav--next"
        aria-label="Sonraki kartlar"
        onClick={() => scrollByDir(1)}
      />
    </div>
  );
}

export function RailHeader({
  seriesKicker,
  label,
  seeAllHref,
  seeAllLabel,
  accent = "default",
}: {
  seriesKicker?: string;
  label: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accent?: RailAccent;
}) {
  return (
    <div className="dvr-rail-header">
      <div className="dvr-rail-header__left">
        {seriesKicker ? <span className="dvr-rail-series">{seriesKicker}</span> : null}
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
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-400"
              style={{ animation: "dvr-live-dot-pulse 1.2s ease-in-out infinite" }}
              aria-hidden
            />
          ) : null}
          {label}
        </span>
      </div>
      {seeAllHref ? (
        <Link href={seeAllHref} className="dvr-rail-see-all">
          {seeAllLabel ?? "Tümünü gör"}
        </Link>
      ) : null}
    </div>
  );
}

export function Rail({
  seriesKicker,
  label,
  seeAllHref,
  seeAllLabel,
  accent = "default",
  children,
}: {
  seriesKicker?: string;
  label: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accent?: RailAccent;
  children: ReactNode;
}) {
  return (
    <section className="dvr-rail-section" aria-label={label}>
      <RailHeader
        seriesKicker={seriesKicker}
        label={label}
        seeAllHref={seeAllHref}
        seeAllLabel={seeAllLabel}
        accent={accent}
      />
      {children}
    </section>
  );
}
