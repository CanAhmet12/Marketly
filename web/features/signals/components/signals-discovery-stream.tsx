"use client";

import { memo, useMemo } from "react";

import { HScroll, RailHeader } from "@/features/discover/visual-reference/discover-vr-primitives";
import {
  SignalCatalogCard,
  type SignalMarketSectionDef,
} from "@/features/signals/components/signals-market-sections";
import { SignalsHeroBento } from "@/features/signals/components/signals-hero-bento";
import { buildSignalsDiscoveryStream } from "@/features/signals/lib/build-signals-discovery-stream";
import type { SignalsFeedRow, SignalsMarketplaceRail } from "@/features/signals/repository/types";
import type { MarketAssetCategory } from "@/features/markets/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type Props = {
  rows: SignalsFeedRow[];
  catalogRows?: SignalsFeedRow[];
  featuredRails?: SignalsMarketplaceRail[];
  showHeroBento?: boolean;
  onOpen: (row: SignalsFeedRow) => void;
  onSelectMarket: (category: MarketAssetCategory | "all") => void;
};

type SectionTone = SignalMarketSectionDef["tone"];

function FeaturedRails({
  rails,
  onOpen,
}: {
  rails: SignalsMarketplaceRail[];
  onOpen: (row: SignalsFeedRow) => void;
}) {
  if (!rails.length) return null;

  return (
    <>
      {rails.map((rail) => (
        <section key={rail.id} className="sp-stream-band sp-stream-band--featured" aria-label={rail.title}>
          <div className="sp-stream-band__head">
            <RailHeader
              seriesKicker={rail.subtitle ?? "Öne çıkan"}
              label={rail.title}
              accent="signal"
              className="sp-stream-rail-head"
            />
          </div>
          <HScroll className="dvr-hscroll--sig-rail">
            {rail.rows.map((row, i) => (
              <div key={`${rail.id}-${row.id}`} className="dvr-sig-rail-item shrink-0">
                <SignalCatalogCard row={row} index={i} onOpen={() => onOpen(row)} />
              </div>
            ))}
          </HScroll>
        </section>
      ))}
    </>
  );
}

function StreamBand({
  kicker,
  label,
  tone,
  items,
  blockKey,
  onOpen,
  onSeeAll,
  fullWidth = false,
}: {
  kicker: string;
  label: string;
  tone: SectionTone;
  items: SignalsFeedRow[];
  blockKey: string;
  onOpen: (row: SignalsFeedRow) => void;
  onSeeAll?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <section
      className={cn(
        "sp-stream-band sp-stream-band--market-rail",
        `sp-stream-band--${tone}`,
        fullWidth && "sp-stream-band--full-bleed",
      )}
      aria-label={label}
      data-stream-block={blockKey}
    >
      <div className="sp-stream-band__head">
        <RailHeader seriesKicker={kicker} label={label} accent="signal" className="sp-stream-rail-head" />
        {onSeeAll ? (
          <button type="button" className="sp-stream-band__see-all" onClick={onSeeAll}>
            Tümünü gör
          </button>
        ) : null}
      </div>
      <HScroll className="dvr-hscroll--sig-rail">
        {items.map((row, i) => (
          <div key={row.id} className="dvr-sig-rail-item shrink-0">
            <SignalCatalogCard row={row} index={i} onOpen={() => onOpen(row)} />
          </div>
        ))}
      </HScroll>
    </section>
  );
}

function useStreamBlocks(rows: SignalsFeedRow[]) {
  return useMemo(() => buildSignalsDiscoveryStream(rows), [rows]);
}

/** Sidebar hizası — hero bento + öne çıkan raylar */
export function SignalsDiscoveryStreamColumn({
  catalogRows = [],
  featuredRails = [],
  showHeroBento = false,
  onOpen,
}: Pick<Props, "catalogRows" | "featuredRails" | "showHeroBento" | "onOpen">) {
  const hasHero = showHeroBento && catalogRows.length > 0;
  if (!hasHero && !featuredRails.length) return null;

  return (
    <div className="sp-discovery-stream sp-discovery-stream--full sp-discovery-stream--edge dvr-surface">
      {hasHero ? <SignalsHeroBento catalogRows={catalogRows} onOpen={onOpen} /> : null}
      <FeaturedRails rails={featuredRails} onOpen={onOpen} />
    </div>
  );
}

function DiscoveryZoneHeader({ totalCount, segmentCount }: { totalCount: number; segmentCount: number }) {
  return (
    <header className="sig-canvas__discovery-head">
      <div>
        <span className="sig-canvas__discovery-kicker">Discovery</span>
        <h2 className="sig-canvas__discovery-title">Piyasa rayları</h2>
      </div>
      <span className="sig-canvas__discovery-badge tabular-nums">
        {formatCompactCount(totalCount)} sinyal · {segmentCount} segment
      </span>
    </header>
  );
}

function MarketDiscoveryRails({
  blocks,
  onOpen,
  onSelectMarket,
}: {
  blocks: ReturnType<typeof buildSignalsDiscoveryStream>;
  onOpen: (row: SignalsFeedRow) => void;
  onSelectMarket: (category: MarketAssetCategory | "all") => void;
}) {
  return (
    <>
      {blocks.map(({ section, items, round }) => (
        <StreamBand
          key={`${section.id}-r${round}`}
          blockKey={`${section.id}-r${round}`}
          kicker={section.kicker}
          label={section.label}
          tone={section.tone}
          items={items}
          onOpen={onOpen}
          onSeeAll={() => onSelectMarket(section.id)}
          fullWidth
        />
      ))}
    </>
  );
}

/** Sidebar altı tam genişlik — piyasa bantları */
export function SignalsDiscoveryStreamFull({ rows, onOpen, onSelectMarket }: Pick<Props, "rows" | "onOpen" | "onSelectMarket">) {
  const blocks = useStreamBlocks(rows);
  if (!blocks.length) return null;

  const totalCount = blocks.reduce((n, block) => n + block.items.length, 0);
  const segmentCount = new Set(blocks.map((block) => block.section.id)).size;

  return (
    <section className="sig-canvas__discovery-zone sig-canvas__discovery-zone--full" aria-label="Piyasa keşif rayları">
      <DiscoveryZoneHeader totalCount={totalCount} segmentCount={segmentCount} />
      <div className="sig-canvas__discovery-rails sp-discovery-stream sp-discovery-stream--full sp-discovery-stream--edge dvr-surface">
        <MarketDiscoveryRails blocks={blocks} onOpen={onOpen} onSelectMarket={onSelectMarket} />
      </div>
    </section>
  );
}

export function SignalsDiscoveryZoneSkeleton() {
  return (
    <section className="sig-canvas__discovery-zone sig-canvas__discovery-zone--full" aria-hidden>
      <div className="sig-canvas__sk-discovery-head">
        <div>
          <div className="sig-canvas__sk-discovery-kicker motion-shimmer" />
          <div className="sig-canvas__sk-discovery-title motion-shimmer" />
        </div>
        <div className="sig-canvas__sk-discovery-badge motion-shimmer" />
      </div>
      <div className="sig-canvas__sk-discovery-rails">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="sig-canvas__sk-discovery-rail">
            <div className="sig-canvas__sk-discovery-rail-head motion-shimmer" />
            <div className="sig-canvas__sk-discovery-rail-line motion-shimmer" />
            <div className="sig-canvas__sk-discovery-cards">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="sig-canvas__sk-discovery-card motion-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Mobil / tek sütun */
export function SignalsDiscoveryStream({
  rows,
  catalogRows = [],
  featuredRails = [],
  showHeroBento = false,
  onOpen,
  onSelectMarket,
}: Props) {
  const blocks = useStreamBlocks(rows);
  const hasHero = showHeroBento && catalogRows.length > 0;

  if (!blocks.length && !featuredRails.length && !hasHero) return null;

  return (
    <div className="sp-discovery-stream dvr-surface">
      {hasHero ? <SignalsHeroBento catalogRows={catalogRows} onOpen={onOpen} /> : null}
      <FeaturedRails rails={featuredRails} onOpen={onOpen} />

      {blocks.length > 0 ? (
        <section className="sig-canvas__discovery-zone" aria-label="Piyasa keşif rayları">
          <DiscoveryZoneHeader
            totalCount={blocks.reduce((n, block) => n + block.items.length, 0)}
            segmentCount={new Set(blocks.map((block) => block.section.id)).size}
          />
          <div className="sig-canvas__discovery-rails">
            <MarketDiscoveryRails blocks={blocks} onOpen={onOpen} onSelectMarket={onSelectMarket} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export const SignalsMarketSections = memo(function SignalsMarketSectionsLegacy(props: Props) {
  return <SignalsDiscoveryStream {...props} />;
});
