"use client";

import { useRouter } from "next/navigation";

import { MarketAssetCard } from "@/features/markets/components/market-asset-card";
import { UnifiedSignalCompactCard } from "@/features/signals/components/unified-signal-primitives";
import { searchAssetToMarketView } from "@/features/search/adapters/search-asset-to-market-view";
import { searchSignalToFeedRow } from "@/features/search/adapters/search-signal-to-feed-row";
import type { SearchAssetHit, SearchSignalHit } from "@/features/search/types";
import { ResultsMarketsCommunityHint } from "@/features/markets/components/results-markets-community-hint";

type Props = {
  markets: SearchAssetHit[];
  signals: SearchSignalHit[];
  limit?: number | null;
  showCommunityHint?: boolean;
};

export function SearchMarketsGrid({ markets, signals, limit = null, showCommunityHint = true }: Props) {
  const router = useRouter();
  const slice = <T,>(arr: T[]) => (limit != null ? arr.slice(0, limit) : arr);

  return (
    <div className="sch-entity-stack">
      {slice(markets).length > 0 ? (
        <section className="sch-entity-section" aria-label="Piyasalar">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Piyasalar</h2> : null}
          {showCommunityHint ? <ResultsMarketsCommunityHint marketSymbols={markets.map((a) => a.symbol)} /> : null}
          <div className="flex flex-col gap-2">
            {slice(markets).map((a) => {
              const view = searchAssetToMarketView(a);
              return (
                <MarketAssetCard
                  key={a.id}
                  asset={view}
                  watched={false}
                  pinned={false}
                  searchMode
                  onToggleWatch={() => {}}
                  onTogglePin={() => {}}
                  onOpenDetail={() => router.push(`/markets/${encodeURIComponent(a.symbol)}`)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {slice(signals).length > 0 ? (
        <section className="sch-entity-section" aria-label="Sinyaller">
          {limit == null ? <h2 className="creators-page__section-title sch-entity-section__title">Sinyaller</h2> : null}
          <div className="flex flex-col gap-3">
            {slice(signals).map((s) => {
              const row = searchSignalToFeedRow(s);
              return (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
                >
                  <UnifiedSignalCompactCard
                    embedded
                    row={row}
                    onActivate={() => router.push(`/signals?asset=${encodeURIComponent(s.symbol)}`)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
