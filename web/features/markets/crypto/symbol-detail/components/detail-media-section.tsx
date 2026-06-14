"use client";

import { useMemo } from "react";

import { DiscoverLiveCard } from "@/features/discover/visual-reference/discover-live-card";
import { DiscoverPulseCard } from "@/features/discover/visual-reference/discover-pulse-card";
import { DiscoverVideoCard } from "@/features/discover/visual-reference/discover-video-card";
import { HScroll } from "@/features/discover/visual-reference/discover-vr-primitives";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { buildDetailMediaPools } from "@/features/markets/crypto/symbol-detail/lib/map-asset-media";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  variant?: "inline" | "wide";
};

export function DetailMediaSection({ bundle, variant = "inline" }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const pools = useMemo(() => buildDetailMediaPools(bundle.media, sym), [bundle.media, sym]);
  const wide = variant === "wide";

  return (
    <section
      className={cn("cdr-section cdr-media-section", wide && "cdr-media-section--wide")}
      data-zone="media"
      aria-label="Medya"
    >
      <DetailSectionHead seriesKicker="İçerik" label="Medya" accent="teal" />

      <div className={cn("cdr-media-stack dvr-surface dvr-surface--embed", wide && "dvr-surface--embed-full")}>
        <div className="cdr-media-block">
          <DetailSectionHead
            seriesKicker="Canlı"
            label="Canlı Yayınlar"
            accent="live"
            seeAllHref="/live"
            seeAllLabel="Tüm canlı yayınlar"
          />
          <div className={cn("cdr-media-rail", wide && "cdr-wide-rail")}>
            <div className="dvr-live-peak-band dvr-live-peak-band--stream-start">
              <HScroll
                className={cn(
                  wide ? "cdr-wide-rail-scroll" : "cdr-media-rail-scroll",
                  "dvr-hscroll--live-rail",
                )}
              >
                {pools.live.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "dvr-live-rail-item shrink-0",
                      index === 0 && "dvr-live-rail-item--hero",
                    )}
                  >
                    <DiscoverLiveCard item={item} index={index} urgencyLead={index === 0} />
                  </div>
                ))}
              </HScroll>
            </div>
          </div>
        </div>

        <div className="cdr-media-block">
          <DetailSectionHead
            seriesKicker="Video"
            label="Videolar"
            accent="teal"
            seeAllHref="/videos"
            seeAllLabel="Tüm videolar"
          />
          <div className={cn("cdr-media-rail", wide && "cdr-wide-rail")}>
            <HScroll
              className={cn(
                wide ? "cdr-wide-rail-scroll" : "cdr-media-rail-scroll",
                "dvr-hscroll--video-rail",
              )}
            >
              {pools.video.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "dvr-video-rail-item shrink-0",
                    index === 0 && "dvr-video-rail-item--hero",
                  )}
                >
                  <DiscoverVideoCard
                    item={item}
                    index={index}
                    editorialLead={index === 0}
                    prestige={index % 3 === 0}
                  />
                </div>
              ))}
            </HScroll>
          </div>
        </div>

        <div className="cdr-media-block">
          <DetailSectionHead
            seriesKicker="Pulse"
            label="Pulse"
            accent="peak"
            seeAllHref="/pulse"
            seeAllLabel="Tüm pulse"
          />
          <div className={cn("cdr-media-rail", wide && "cdr-wide-rail")}>
            <HScroll
              className={cn(
                wide ? "cdr-wide-rail-scroll" : "cdr-media-rail-scroll",
                "dvr-hscroll--pulse-rail",
              )}
            >
              {pools.pulse.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "dvr-pulse-rail-item shrink-0",
                    index === 0 && "dvr-pulse-rail-item--hero",
                    index === 2 && "dvr-pulse-rail-item--tall",
                  )}
                >
                  <DiscoverPulseCard
                    item={item}
                    index={index}
                    tier={index === 2 ? "tall" : index === 0 ? "featured" : "standard"}
                    variant={index === 1 ? "trending" : "default"}
                    editorialLead={index === 0}
                  />
                </div>
              ))}
            </HScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
