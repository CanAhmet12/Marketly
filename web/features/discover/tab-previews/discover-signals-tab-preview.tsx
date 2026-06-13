"use client";

import Link from "next/link";

import { DiscoverSignalsIntelStrip } from "@/features/discover/tab-previews/discover-signals-intel-strip";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { DiscoverSignalIntelCard, DiscoverSignalTile } from "@/features/discover/visual-reference/discover-signal-tile";
import { DiscoverSignalRailCard } from "@/features/discover/visual-reference/discover-signal-rail-card";
import { HScroll, Rail, RailSeeAll } from "@/features/discover/visual-reference/discover-vr-primitives";
import type { VRSignalItem } from "@/features/discover/visual-reference/discover-visual-reference-data";

type Props = {
  items: readonly VRSignalItem[];
};

/**
 * Keşfet → Sinyaller hub önizlemesi.
 * /signals kart dili (rail + intel + tape) — keşfet akışı: ray → mozaik → band.
 */
export function DiscoverSignalsTabPreview({ items }: Props) {
  const railItems = items.slice(0, 6);
  const mosaicItems = items.slice(0, 4);
  const flowItems = items.slice(0, 5);
  const buyRail = items.filter((s) => s.direction === "BUY").slice(0, 4);
  const sellRail = items.filter((s) => s.direction === "SELL").slice(0, 4);

  return (
    <div className="dsc-hub-tab dsc-hub-tab--signals">
      <header className="dsc-hub-tab__head">
        <div>
          <span className="dsc-hub-tab__kicker">Keşfet · Sinyaller</span>
          <h2 className="dsc-hub-tab__title">Analist çağrıları</h2>
          <p className="dsc-hub-tab__sub">Tam katalogda filtrele, detay aç ve işlem planı kur</p>
        </div>
        <span className="dsc-hub-tab__badge tabular-nums">{items.length} önizleme</span>
      </header>

      <DiscoverSignalsIntelStrip items={items} />

      {railItems.length > 0 ? (
        <div className="dsc-hub-tab__zone">
          <Rail
            seriesKicker="Trend tarama"
            label="Öne çıkan çağrılar"
            accent="signal"
            seeAllHref={DISCOVER_VERTICAL_ROUTES.signals}
          >
            <HScroll className="dvr-hscroll--sig-rail">
              {railItems.map((item, i) => (
                <div key={item.id} className="dvr-sig-rail-item shrink-0">
                  <DiscoverSignalRailCard item={item} index={i} />
                </div>
              ))}
            </HScroll>
          </Rail>
        </div>
      ) : null}

      {buyRail.length > 0 || sellRail.length > 0 ? (
        <div className="dsc-hub-tab__zone">
          {buyRail.length > 0 ? (
            <Rail seriesKicker="Yön" label="Alış rayı" accent="teal">
              <HScroll className="dvr-hscroll--sig-rail">
                {buyRail.map((item, i) => (
                  <div key={item.id} className="dvr-sig-rail-item shrink-0">
                    <DiscoverSignalRailCard item={item} index={i} hideDirection />
                  </div>
                ))}
              </HScroll>
            </Rail>
          ) : null}
          {sellRail.length > 0 ? (
            <Rail seriesKicker="Yön" label="Satış rayı" accent="live">
              <HScroll className="dvr-hscroll--sig-rail">
                {sellRail.map((item, i) => (
                  <div key={item.id} className="dvr-sig-rail-item shrink-0">
                    <DiscoverSignalRailCard item={item} index={i} hideDirection />
                  </div>
                ))}
              </HScroll>
            </Rail>
          ) : null}
        </div>
      ) : null}

      {mosaicItems.length > 0 ? (
        <section className="dsc-hub-tab__zone" aria-label="Keşif mozaği">
          <div className="dsc-hub-tab__zone-head">
            <div>
              <span className="dsc-hub-tab__kicker">Explore grid</span>
              <h3 className="dsc-hub-tab__title" style={{ fontSize: 14 }}>
                Kısa dilim
              </h3>
            </div>
            <RailSeeAll href={DISCOVER_VERTICAL_ROUTES.signals} label="Kataloğa git" />
          </div>
          <div className="dsc-hub-tab__mosaic">
            {mosaicItems.map((item, i) => (
              <DiscoverSignalIntelCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {flowItems.length > 0 ? (
        <section className="dsc-hub-tab__zone" aria-label="Akış bandı">
          <div className="dsc-hub-tab__zone-head">
            <div>
              <span className="dsc-hub-tab__kicker">Live tape</span>
              <h3 className="dsc-hub-tab__title" style={{ fontSize: 14 }}>
                Piyasa bandı
              </h3>
            </div>
          </div>
          <div className="dsc-hub-tab__flow">
            {flowItems.map((item, i) => (
              <DiscoverSignalTile key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      <Link href={DISCOVER_VERTICAL_ROUTES.signals} className="dsc-hub-tab__cta">
        <span>Sinyal kataloğunu aç</span>
        <span className="dsc-hub-tab__cta-arrow" aria-hidden>
          →
        </span>
      </Link>
    </div>
  );
}
