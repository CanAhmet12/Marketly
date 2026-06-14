"use client";

import { HScroll } from "@/features/discover/visual-reference/discover-vr-primitives";
import { DetailNewsRailCard } from "@/features/markets/crypto/symbol-detail/components/detail-news-rail-card";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  variant?: "inline" | "wide";
};

export function DetailNewsSection({ bundle, variant = "inline" }: Props) {
  const items = bundle.news.slice(0, 8);
  if (items.length === 0) return null;

  const wide = variant === "wide";

  return (
    <section
      className={cn("cdr-section cdr-news-section", wide && "cdr-news-section--wide")}
      data-zone="news"
      aria-label="Haberler ve piyasa etkisi"
    >
      <DetailSectionHead
        seriesKicker="Desk"
        label="Haberler & Piyasa Etkisi"
        accent="live"
        seeAllHref="/market-news"
        seeAllLabel="Tüm haberleri gör"
      />
      <div className="cdr-section-body">
        <div className={cn("cdr-news-rail", wide && "cdr-wide-rail")}>
          <div className={cn("dvr-surface dvr-surface--embed", wide && "dvr-surface--embed-full")}>
            <HScroll
              className={cn(
                wide ? "cdr-wide-rail-scroll" : "cdr-news-rail-scroll",
                "dvr-hscroll--video-rail",
              )}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "dvr-video-rail-item shrink-0",
                    index === 0 && "dvr-video-rail-item--hero",
                  )}
                >
                  <DetailNewsRailCard item={item} index={index} editorialLead={index === 0} />
                </div>
              ))}
            </HScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
