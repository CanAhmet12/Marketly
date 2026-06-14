"use client";

import { SearchMarketHit } from "@/features/search/components/hits/search-market-hit";
import { SearchSignalHit } from "@/features/search/components/hits/search-signal-hit";
import type { SearchAssetHit, SearchSignalHit as SearchSignalHitType } from "@/features/search/types";
import { ResultsMarketsCommunityHint } from "@/features/markets/components/results-markets-community-hint";

type Props = {
  markets: SearchAssetHit[];
  signals: SearchSignalHitType[];
  limit?: number | null;
  showCommunityHint?: boolean;
};

export function SearchMarketsGrid({ markets, signals, limit = null, showCommunityHint = true }: Props) {
  const rail = limit != null;
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  if (rail) {
    return (
      <div className="srch-rail-entities">
        {slice(markets).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Piyasalar">
            <div className="srch-rail-track srch-rail-track--stack">
              {slice(markets).map((a) => (
                <SearchMarketHit key={a.id} asset={a} />
              ))}
            </div>
          </section>
        ) : null}
        {slice(signals).length > 0 ? (
          <section className="srch-rail-entity" aria-label="Sinyaller">
            <div className="srch-rail-track srch-rail-track--signal">
              {slice(signals).map((s) => (
                <SearchSignalHit key={s.id} signal={s} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="srch-tab-panel">
      {markets.length > 0 ? (
        <section className="srch-tab-section" aria-label="Piyasalar">
          <h2 className="srch-tab-section__title">Piyasalar</h2>
          {showCommunityHint ? <ResultsMarketsCommunityHint marketSymbols={markets.map((a) => a.symbol)} /> : null}
          <div className="srch-hit-list">
            {markets.map((a) => (
              <SearchMarketHit key={a.id} asset={a} />
            ))}
          </div>
        </section>
      ) : null}

      {signals.length > 0 ? (
        <section className="srch-tab-section" aria-label="Sinyaller">
          <h2 className="srch-tab-section__title">Sinyaller</h2>
          <div className="srch-hit-list">
            {signals.map((s) => (
              <SearchSignalHit key={s.id} signal={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
