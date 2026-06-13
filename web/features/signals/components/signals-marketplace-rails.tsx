"use client";

import {
  SignalCatalogCard,
} from "@/features/signals/components/signals-market-sections";
import type { SignalsFeedRow, SignalsMarketplaceRail } from "@/features/signals/repository/types";

type Props = {
  rails: SignalsMarketplaceRail[];
  onOpen: (row: SignalsFeedRow) => void;
};

export function SignalsMarketplaceRails({ rails, onOpen }: Props) {
  if (!rails.length) return null;

  return (
    <div className="sp-featured-rails dvr-surface">
      {rails.map((rail) => (
        <section key={rail.id} className="sp-featured-rail" aria-labelledby={`sp-rail-${rail.id}`}>
          <header className="sp-featured-rail__head">
            <div className="sp-featured-rail__copy">
              {rail.subtitle ? <span className="sp-featured-rail__kicker">{rail.subtitle}</span> : null}
              <h2 id={`sp-rail-${rail.id}`} className="sp-featured-rail__title">
                {rail.title}
              </h2>
            </div>
            <span className="sp-featured-rail__count">{rail.rows.length} sinyal</span>
          </header>
          <div className="sp-featured-rail__scroll dvr-hscroll--sig-rail">
            {rail.rows.map((row, i) => (
              <div key={`${rail.id}-${row.id}`} className="dvr-sig-rail-item shrink-0">
                <SignalCatalogCard row={row} index={i} onOpen={() => onOpen(row)} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
