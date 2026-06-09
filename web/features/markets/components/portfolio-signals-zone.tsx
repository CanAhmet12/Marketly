"use client";

import Link from "next/link";

import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  overlaps: PortfolioIntelligenceBundle["overlaps"];
  personalized: PersonalizedSignalRelevance;
};

export function PortfolioSignalsZone({ overlaps, personalized }: Props) {
  return (
    <div className="pf-bottom-zone" data-pf-block-zone="signals">
      <div className="pf-block">
        <div className="pf-block-header">
          <div className="pf-block-title">
            <span className="pf-block-stripe" />
            Analist Örtüşmesi
          </div>
        </div>
        <div className="pf-analyst-rows">
          {overlaps.overlappingAnalysts.length === 0 ? (
            <p className="pf-empty-hint">Portföy sembollerinde aktif sinyal yok.</p>
          ) : (
            overlaps.overlappingAnalysts.map((a) => (
              <Link key={a.href} href={a.href} className="pf-analyst-row">
                <div className="pf-analyst-avatar">{a.display.slice(0, 1).toUpperCase()}</div>
                <span className="pf-analyst-name">{a.display}</span>
                <span className="pf-analyst-count">{a.count} sinyal</span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="pf-block">
        <div className="pf-block-header">
          <div className="pf-block-title">
            <span className="pf-block-stripe" />
            Portföy Sinyalleri
          </div>
          <Link href="/signals" className="pf-block-link">
            Tümü →
          </Link>
        </div>
        <div className="pf-signal-rows">
          {personalized.rows.length === 0 ? (
            <p className="pf-empty-hint">Sinyal örtüşmesi bulunamadı.</p>
          ) : (
            personalized.rows.slice(0, 5).map((row) => (
              <Link key={row.id} href={row.href} className="pf-signal-row">
                <span className="pf-signal-sym">{row.symbol}</span>
                <div className="pf-signal-info">
                  <div className="pf-signal-reason">{row.reason}</div>
                  <div className="pf-signal-meta">
                    {row.analystDisplay} · {row.direction}
                  </div>
                </div>
                <span
                  className={cn(
                    "pf-signal-dir",
                    row.direction === "BUY" ? "pf-signal-dir--buy" : "pf-signal-dir--sell",
                  )}
                >
                  {row.direction}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
