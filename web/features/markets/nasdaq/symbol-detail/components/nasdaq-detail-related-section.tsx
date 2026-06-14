"use client";

import Link from "next/link";
import { memo } from "react";

import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { nasdaqDisplayLabel } from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { useNasdaqRelatedCards } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-related-cards";
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
  const cards = useNasdaqRelatedCards(assets, symbol, 6);

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--correlation"
      data-zone="related-sidebar"
      aria-label="İlgili hisseler"
    >
      <DetailSectionHead
        seriesKicker="Sektör"
        label="İlgili Hisseler"
        accent="teal"
        seeAllHref={marketsHubPathForCategory("stocks")}
        seeAllLabel="Tümü →"
      />

      {cards.length === 0 ? (
        <p className="cdr-section-stub">İlgili NASDAQ kotasyonu şu an kullanılamıyor.</p>
      ) : (
        <ul className="cdr-corr-stack">
          {cards.map((card) => {
            const up = card.change >= 0;
            const label = nasdaqDisplayLabel(card.symbol, card.name);
            return (
              <li key={card.symbol}>
                <Link href={card.href} className="cdr-corr-card">
                  <span className="cdr-corr-card__icon nqx-corr-card__icon">{label.slice(0, 2)}</span>
                  <span className="cdr-corr-card__meta">
                    <span className="cdr-corr-card__sym">{label}</span>
                    <span className="cdr-corr-card__name">{card.symbol}</span>
                  </span>
                  <span className="cdr-corr-card__quote">
                    <span className="cdr-corr-card__price">{formatNasdaqTickerPrice(card.price, card.symbol)}</span>
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

export const NasdaqDetailRelatedSection = memo(RelatedSectionInner);
