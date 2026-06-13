"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  countLabel: string;
  ctaHref: string;
  ctaLabel: string;
  children: ReactNode;
};

/** Keşfet tab önizleme kabuğu — explore mantığı, eski DVR intro değil */
export function DiscoverTabPreviewShell({
  title,
  subtitle,
  countLabel,
  ctaHref,
  ctaLabel,
  children,
}: Props) {
  return (
    <div className="dsc-explore">
      <header className="dsc-explore__head">
        <div>
          <h2 className="dsc-explore__title">{title}</h2>
          <p className="dsc-explore__sub">{subtitle}</p>
        </div>
        <span className="dsc-explore__pill">{countLabel}</span>
      </header>

      {children}

      <Link href={ctaHref} className="dsc-explore__cta">
        <span>{ctaLabel}</span>
        <span className="dsc-explore__cta-arrow" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
