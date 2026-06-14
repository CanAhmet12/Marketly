"use client";

import Link from "next/link";
import { memo } from "react";

import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { forexDisplayLabel } from "@/features/markets/forex/lib/forex-symbol-meta";
import { useForexRelatedCards } from "@/features/markets/forex/symbol-detail/hooks/use-forex-related-cards";
import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { marketsHubPathForCategory } from "@/features/markets/markets-routes";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  assets: readonly MarketAssetView[];
};

function RelatedSectionInner({ symbol, assets }: Props) {
  const cards = useForexRelatedCards(assets, symbol, 6);

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--correlation"
      data-zone="related-sidebar"
      aria-label="İlgili pariteler"
    >
      <DetailSectionHead
        seriesKicker="Parite"
        label="İlgili Pariteler"
        accent="teal"
        seeAllHref={marketsHubPathForCategory("forex")}
        seeAllLabel="Tümü →"
      />

      {cards.length === 0 ? (
        <p className="cdr-section-stub">İlgili forex kotasyonu şu an kullanılamıyor.</p>
      ) : (
        <ul className="cdr-corr-stack">
          {cards.map((card) => {
            const up = card.change >= 0;
            const label = forexDisplayLabel(card.symbol, card.name);
            return (
              <li key={card.symbol}>
                <Link href={card.href} className="cdr-corr-card">
                  <span className="cdr-corr-card__icon fx-corr-card__icon">{card.pair.slice(0, 3)}</span>
                  <span className="cdr-corr-card__meta">
                    <span className="cdr-corr-card__sym">{card.pair}</span>
                    <span className="cdr-corr-card__name">{label}</span>
                  </span>
                  <span className="cdr-corr-card__quote">
                    <span className="cdr-corr-card__price">{formatForexTickerPrice(card.price, card.symbol)}</span>
                    <span className={cn("cdr-corr-card__chg", up ? "cdr-up" : "cdr-down")}>
                      {fmtSignedPct(card.change)}
                    </span>
                  </span>
                  <DetailSparkline series={card.spark} width={52} height={22} sparkKey={card.symbol} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export const ForexDetailRelatedSection = memo(RelatedSectionInner);
