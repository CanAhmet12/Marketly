"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type RailAccent = "live" | "teal" | "signal" | "peak" | "default";

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

function railLabelClass(accent: RailAccent) {
  return cn(
    "dvr-rail-label",
    accent === "live" && "dvr-rail-label--live",
    accent === "teal" && "dvr-rail-label--teal",
    accent === "signal" && "dvr-rail-label--signal",
    accent === "peak" && "dvr-rail-label--peak",
  );
}

export function RailSeeAll({ href, label = "Tümünü gör" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="dvr-rail-see-all">
      <span>{label}</span>
      <span className="dvr-rail-see-all__arrow" aria-hidden>
        →
      </span>
    </Link>
  );
}

export function RailHeader({
  seriesKicker,
  label,
  seeAllHref,
  seeAllLabel,
  accent = "default",
  className,
}: {
  seriesKicker?: string;
  label: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accent?: RailAccent;
  className?: string;
}) {
  return (
    <div className={cn("dvr-rail-header", className)} data-rail-accent={accent}>
      <div className="dvr-rail-header__left">
        {seriesKicker ? <span className="dvr-rail-series">{seriesKicker}</span> : null}
        <h2 className={railLabelClass(accent)}>
          {accent === "live" ? <span className="dvr-rail-live-dot" aria-hidden /> : null}
          {label}
        </h2>
      </div>
      {seeAllHref ? <RailSeeAll href={seeAllHref} label={seeAllLabel} /> : null}
    </div>
  );
}

export function Rail({
  seriesKicker,
  label,
  seeAllHref,
  seeAllLabel,
  accent = "default",
  className,
  children,
}: {
  seriesKicker?: string;
  label: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accent?: RailAccent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("dvr-rail-section", className)} aria-label={label} data-rail-accent={accent}>
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
