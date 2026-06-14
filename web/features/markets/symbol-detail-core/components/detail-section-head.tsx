import Link from "next/link";
import type { ReactNode } from "react";

export type DetailSectionAccent = "live" | "teal" | "signal" | "peak" | "default";

type Props = {
  seriesKicker?: string;
  label: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accent?: DetailSectionAccent;
  className?: string;
  trailing?: ReactNode;
};

function titleClass(accent: DetailSectionAccent): string {
  const base = "cdr-section-head__title";
  if (accent === "live") return `${base} cdr-section-head__title--live`;
  if (accent === "teal") return `${base} cdr-section-head__title--teal`;
  if (accent === "signal") return `${base} cdr-section-head__title--signal`;
  if (accent === "peak") return `${base} cdr-section-head__title--peak`;
  return base;
}

export function DetailSectionHead({
  seriesKicker,
  label,
  seeAllHref,
  seeAllLabel = "Tümünü gör",
  accent = "default",
  className,
  trailing,
}: Props) {
  return (
    <header
      className={[
        "cdr-section-head",
        accent !== "default" ? `cdr-section-head--${accent}` : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="cdr-section-head__rail" aria-hidden />

      <div className="cdr-section-head__copy">
        {seriesKicker ? (
          <span className="cdr-section-head__kicker">{seriesKicker}</span>
        ) : null}
        <h2 className={titleClass(accent)}>
          {accent === "live" ? <span className="cdr-section-head__live-dot" aria-hidden /> : null}
          {label}
        </h2>
      </div>

      {trailing ??
        (seeAllHref ? (
          <Link href={seeAllHref} className="cdr-section-head__link">
            {seeAllLabel}
          </Link>
        ) : null)}
    </header>
  );
}
