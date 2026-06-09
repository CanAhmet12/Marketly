"use client";

import Link from "next/link";

import type { PortfolioIntelContext } from "@/features/markets/types/portfolio-intel-context";
import { cn } from "@/lib/cn";

type Props = {
  intel: PortfolioIntelContext;
};

function ImpactDot({ tier }: { tier: 1 | 2 | 3 }) {
  return <span className={cn("pf-intel-impact", `pf-intel-impact--${tier}`)} aria-hidden />;
}

export function PortfolioIntelZone({ intel }: Props) {
  const hasChips = intel.newsChips.length > 0 || intel.calendarChips.length > 0;
  if (!hasChips) return null;

  return (
    <section className="pf-intel-zone" data-pf-block-zone="signals" aria-label="Portföy etki özeti">
      <div className="pf-intel-zone__header">
        <span className="pf-intel-zone__eyebrow">Portföy etkisi</span>
        <p className="pf-intel-zone__headline">{intel.headline}</p>
      </div>
      <div className="pf-intel-zone__chips">
        {intel.newsChips.map((chip) => (
          <Link key={chip.id} href={chip.href} className="pf-intel-chip pf-intel-chip--news">
            <ImpactDot tier={chip.impact} />
            <span className="pf-intel-chip__kind">Haber</span>
            <span className="pf-intel-chip__label">{chip.label}</span>
            {chip.symbol ? <span className="pf-intel-chip__meta">{chip.symbol}</span> : null}
          </Link>
        ))}
        {intel.calendarChips.map((chip) => (
          <Link key={chip.id} href={chip.href} className="pf-intel-chip pf-intel-chip--calendar">
            <ImpactDot tier={chip.impact} />
            <span className="pf-intel-chip__kind">Takvim</span>
            <span className="pf-intel-chip__label">{chip.label}</span>
            <span className="pf-intel-chip__meta">{chip.meta}</span>
          </Link>
        ))}
      </div>
      <div className="pf-intel-zone__links">
        <Link href="/market-news" className="pf-intel-zone__link">
          Haberler →
        </Link>
        <Link href="/economic-calendar" className="pf-intel-zone__link">
          Ekonomik takvim →
        </Link>
      </div>
    </section>
  );
}
