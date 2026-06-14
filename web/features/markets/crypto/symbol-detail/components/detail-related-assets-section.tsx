"use client";

import Link from "next/link";
import { memo } from "react";

import { DetailSparkline } from "@/features/markets/crypto/symbol-detail/components/detail-sparkline";
import { DetailSymbolIcon } from "@/features/markets/crypto/symbol-detail/components/detail-symbol-icon";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useStableRelatedCards } from "@/features/markets/crypto/symbol-detail/hooks/use-stable-related-cards";
import { fmtPriceUsd, fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { marketsCategoryPath } from "@/features/markets/markets-routes";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  variant?: "wide" | "sidebar";
};

function RelatedAssetsSectionInner({ symbol, variant = "wide" }: Props) {
  const isSidebar = variant === "sidebar";
  const limit = isSidebar ? 6 : 8;
  const cards = useStableRelatedCards(symbol, limit);

  if (isSidebar) {
    return (
      <section
        className="cdr-section cdr-sidebar-block cdr-sidebar-block--correlation"
        data-zone="related-sidebar"
        aria-label="Korelasyon"
      >
        <DetailSectionHead
          seriesKicker="İlgili"
          label="Korelasyon"
          accent="teal"
          seeAllHref={marketsCategoryPath("crypto")}
          seeAllLabel="Tümü →"
        />
        <ul className="cdr-corr-stack">
          {cards.map((card) => {
            const up = card.change >= 0;
            return (
              <li key={card.symbol}>
                <Link href={card.href} className="cdr-corr-card">
                  <span className="cdr-corr-card__icon">
                    <DetailSymbolIcon symbol={card.symbol} size={20} plain />
                  </span>
                  <span className="cdr-corr-card__meta">
                    <span className="cdr-corr-card__sym">{card.symbol}</span>
                    <span className="cdr-corr-card__name">{card.name}</span>
                  </span>
                  <span className="cdr-corr-card__spark">
                    <DetailSparkline series={card.spark} width={50} height={16} sparkKey={card.symbol} />
                  </span>
                  <span className="cdr-corr-card__vals">
                    <span className="cdr-corr-card__price">{fmtPriceUsd(card.price)}</span>
                    <span className={cn("cdr-corr-card__chg", up ? "cdr-up" : "cdr-down")}>
                      {fmtSignedPct(card.change)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="cdr-section cdr-bottom-section" data-zone="related-bottom" aria-label="İlgili varlıklar">
      <DetailSectionHead
        seriesKicker="Ağ"
        label="İlgili Varlıklar & Korelasyon"
        accent="teal"
        seeAllHref={marketsCategoryPath("crypto")}
        seeAllLabel="Tüm varlıkları gör"
      />
      <div className="cdr-section-body">
        <div className="cdr-related-scroll">
          {cards.map((card) => {
            const up = card.change >= 0;
            return (
              <Link key={card.symbol} href={card.href} className="cdr-asset-mini">
                <div className="cdr-asset-mini__top">
                  <DetailSymbolIcon symbol={card.symbol} size={24} />
                  <span className="cdr-asset-mini__sym">{card.symbol}</span>
                </div>
                <div className="cdr-asset-mini__name">{card.name}</div>
                <div className="cdr-asset-mini__price">{fmtPriceUsd(card.price)}</div>
                <div className={cn("cdr-asset-mini__chg", up ? "cdr-up" : "cdr-down")}>
                  {fmtSignedPct(card.change)}
                </div>
                <div className="cdr-asset-mini__spark">
                  <DetailSparkline series={card.spark} width={120} height={24} sparkKey={card.symbol} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const DetailRelatedAssetsSection = memo(RelatedAssetsSectionInner);
