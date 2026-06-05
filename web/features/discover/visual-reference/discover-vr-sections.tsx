"use client";

import Link from "next/link";

import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { cn } from "@/lib/cn";
import { DiscoverLiveCard, DiscoverLiveCardCompact } from "./discover-live-card";
import { DiscoverPulseCard, type PulseTier, type PulseVariant } from "./discover-pulse-card";
import { DiscoverVideoCard } from "./discover-video-card";
import { DiscoverSignalTile, DiscoverSignalFeedLine } from "./discover-signal-tile";
import { DiscoverCreatorCard } from "./discover-creator-strip";
import { TopicEcosystemCluster } from "./discover-topic-ecosystem";
import { CreatorNetworkStrip } from "./discover-creator-network";
import { HScroll, Rail } from "./discover-vr-primitives";
import {
  VR_LIVE_ITEMS,
  VR_PULSE_ITEMS,
  VR_VIDEO_ITEMS,
  VR_SIGNAL_ITEMS,
  VR_CREATOR_ITEMS,
  VR_TOPIC_ECOSYSTEMS,
  VR_CREATOR_GRAPH_BLURBS,
  type VRLiveItem,
  type VRPulseItem,
  type VRCreatorItem,
  type VRSignalItem,
} from "./discover-visual-reference-data";
import type { DiscoverViewModel } from "./discover-view-model-adapter";

/** 3. sıra grid ile aynı kart hiyerarşisi */
function pulseGridTier(index: number): PulseTier {
  return index % 6 === 0 ? "tall" : "standard";
}

function pulseGridVariant(index: number): PulseVariant {
  return index % 7 === 2 ? "trending" : "default";
}

function videoGridPrestige(index: number): boolean {
  return index % 5 === 0;
}

/* ─── Rails ─────────────────────────────────────────────────────────────── */

export function LiveRail({
  items = VR_LIVE_ITEMS,
  peak = false,
  hideSeeAll = false,
}: {
  items?: typeof VR_LIVE_ITEMS;
  peak?: boolean;
  hideSeeAll?: boolean;
}) {
  return (
    <div className={cn("dvr-live-peak-band", peak && "dvr-live-peak-band--stream-start")}>
      <Rail
        label="Şu an canlı"
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.live}
        accent="live"
      >
        <HScroll className="dvr-hscroll--live-rail">
          {items.map((item, i) => (
            <div key={item.id} className="dvr-live-rail-item shrink-0">
              <DiscoverLiveCard item={item} index={i} urgencyLead={peak && i === 0} />
            </div>
          ))}
        </HScroll>
      </Rail>
    </div>
  );
}

export function LiveCompactRail({
  label = "Canlı devam ediyor",
  items = VR_LIVE_ITEMS.slice(2),
  hideSeeAll = false,
}: {
  label?: string;
  items?: VRLiveItem[];
  hideSeeAll?: boolean;
}) {
  const row = items.length > 0 ? items : VR_LIVE_ITEMS.slice(2);
  return (
    <Rail
      label={label}
      seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.live}
      accent="live"
    >
      <HScroll>
        {row.map((item, i) => (
          <div key={item.id} className="dvr-live-compact-item shrink-0">
            <DiscoverLiveCardCompact item={item} index={i} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}

export function PulseRail({
  label = "Kısa Görüşler",
  items = VR_PULSE_ITEMS,
  startIdx = 0,
  tierFor,
  variantFor,
  hideSeeAll = false,
  gridLayout = false,
}: {
  label?: string;
  items?: typeof VR_PULSE_ITEMS;
  startIdx?: number;
  tierFor?: (item: (typeof VR_PULSE_ITEMS)[number], index: number) => PulseTier;
  variantFor?: (item: (typeof VR_PULSE_ITEMS)[number], index: number) => PulseVariant;
  hideSeeAll?: boolean;
  /** Tam sayfa: 3. sıra ile aynı grid + kart stili */
  gridLayout?: boolean;
}) {
  const cards = items.map((item, i) => {
    const idx = startIdx + i;
    return (
      <DiscoverPulseCard
        key={item.id}
        item={item}
        tier={gridLayout ? pulseGridTier(idx) : (tierFor?.(item, i) ?? "standard")}
        variant={gridLayout ? pulseGridVariant(idx) : (variantFor?.(item, i) ?? "default")}
        index={idx}
      />
    );
  });

  if (gridLayout) {
    return (
      <Rail label={label} seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.pulse}>
        <div className="dvr-vertical-grid-section dvr-vertical-grid-section--in-rail">
          <div className="dvr-pulse-full-grid">{cards}</div>
        </div>
      </Rail>
    );
  }

  return (
    <Rail label={label} seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.pulse}>
      <HScroll>
        {items.map((item, i) => (
          <div key={item.id} className="dvr-pulse-rail-item shrink-0">
            <DiscoverPulseCard
              item={item}
              tier={tierFor?.(item, i) ?? "standard"}
              variant={variantFor?.(item, i) ?? "default"}
              index={startIdx + i}
            />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}

export function VideoRail({
  label = "Günün analizleri",
  items = VR_VIDEO_ITEMS,
  prestige = false,
  seriesKicker,
  hideSeeAll = false,
  gridLayout = false,
}: {
  label?: string;
  items?: typeof VR_VIDEO_ITEMS;
  prestige?: boolean;
  seriesKicker?: string;
  hideSeeAll?: boolean;
  /** Tam sayfa: 3. sıra ile aynı grid + kart stili */
  gridLayout?: boolean;
}) {
  const cards = items.map((item, i) => (
    <DiscoverVideoCard
      key={item.id}
      item={item}
      index={i}
      prestige={gridLayout ? videoGridPrestige(i) : prestige}
    />
  ));

  if (gridLayout) {
    return (
      <Rail
        seriesKicker={seriesKicker}
        label={label}
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.videos}
        accent="teal"
      >
        <div className="dvr-vertical-grid-section dvr-vertical-grid-section--in-rail">
          <div className="dvr-video-full-grid">{cards}</div>
        </div>
      </Rail>
    );
  }

  const rail = (
    <Rail
      seriesKicker={prestige ? seriesKicker : undefined}
      label={label}
      seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.videos}
      accent="teal"
    >
      <HScroll>
        {items.map((item, i) => (
          <div key={item.id} className="dvr-video-rail-item shrink-0">
            <DiscoverVideoCard item={item} index={i} prestige={prestige} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
  return prestige ? <div className="dvr-deep-prestige-wrap">{rail}</div> : rail;
}

export function SignalStreamSection({
  label = "Piyasa Nabzı",
  tape = false,
  density = "full",
  signalItems = VR_SIGNAL_ITEMS,
}: {
  label?: string;
  tape?: boolean;
  density?: "full" | "ambient";
  signalItems?: VRSignalItem[];
}) {
  const sig = signalItems.length > 0 ? signalItems : VR_SIGNAL_ITEMS;
  if (density === "ambient") {
    return (
      <section className="dvr-sig-stream-section dvr-sig-stream-section--ambient" aria-label={label}>
        <div className="dvr-sig-stream-header">
          <span className="dvr-rail-label dvr-rail-label--signal">{label}</span>
          <Link href={DISCOVER_VERTICAL_ROUTES.signals} className="dvr-rail-see-all">
            Tümünü gör
          </Link>
        </div>
        <div className="dvr-sig-ambient-feed">
          {sig.slice(0, 3).map((item, i) => (
            <DiscoverSignalFeedLine key={item.id} item={item} index={i} featured={i === 0} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("dvr-sig-stream-section", tape && "dvr-sig-stream-section--tape")}
      aria-label={label}
    >
      <div className="dvr-sig-stream-header">
        <span className="dvr-rail-label dvr-rail-label--signal">{label}</span>
        <Link href={DISCOVER_VERTICAL_ROUTES.signals} className="dvr-rail-see-all">
          Tümünü gör
        </Link>
      </div>
      <div className={cn("dvr-sig-stream", tape && "dvr-sig-stream--tape")}>
        {sig.map((item, i) => (
          <DiscoverSignalTile key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

export function CreatorRail({
  label = "Analist Ağı",
  creators = VR_CREATOR_ITEMS,
  hideSeeAll = false,
}: {
  label?: string;
  creators?: VRCreatorItem[];
  hideSeeAll?: boolean;
}) {
  const row = creators.length > 0 ? creators : VR_CREATOR_ITEMS;
  return (
    <Rail
      label={label}
      seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.creators}
      accent="teal"
    >
      <HScroll>
        {row.map((item, i) => (
          <div key={item.id} className="dvr-creator-rail-item shrink-0">
            <DiscoverCreatorCard item={item} index={i} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}

export function HotPulsePeakBand({
  pulseItems,
  gridLayout = false,
}: {
  pulseItems: VRPulseItem[];
  gridLayout?: boolean;
}) {
  const fb = VR_PULSE_ITEMS;
  const peakItems = [
    pulseItems[5] ?? fb[5]!,
    pulseItems[6] ?? fb[6]!,
    pulseItems[0] ?? fb[0]!,
  ];

  const header = (
    <div className="dvr-rail-header">
      <span className="dvr-rail-label dvr-rail-label--peak">Sıcak başlıklar</span>
      <Link href={DISCOVER_VERTICAL_ROUTES.pulse} className="dvr-rail-see-all">
        Tümünü gör
      </Link>
    </div>
  );

  if (gridLayout) {
    return (
      <section
        className="dvr-discovery-hot-peak dvr-vertical-grid-section"
        aria-label="Sıcak başlıklar"
      >
        {header}
        <div className="dvr-pulse-full-grid">
          {peakItems.map((item, i) => (
            <DiscoverPulseCard
              key={item.id}
              item={item}
              tier={pulseGridTier(i)}
              variant={pulseGridVariant(i)}
              index={i}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="dvr-discovery-hot-peak" aria-label="Sıcak başlıklar">
      {header}
      <HScroll>
        <div className="dvr-pulse-rail-item shrink-0">
          <DiscoverPulseCard item={peakItems[0]!} tier="tall" variant="breaking" index={0} />
        </div>
        <div className="dvr-pulse-rail-item shrink-0">
          <DiscoverPulseCard item={peakItems[1]!} tier="featured" variant="trending" index={1} />
        </div>
        <div className="dvr-pulse-rail-item shrink-0">
          <DiscoverPulseCard item={peakItems[2]!} tier="featured" variant="default" index={2} />
        </div>
      </HScroll>
    </section>
  );
}

/* ─── Hub stream (Keşfet Tümü) ──────────────────────────────────────────── */

export function DiscoveryStream({ vm }: { vm: DiscoverViewModel }) {
  const live = vm.liveItems;
  const pulse = vm.pulseItems;
  const vid = vm.videoItems;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);

  return (
    <div className="dvr-stream">
      <LiveRail items={live.slice(0, 4)} peak />
      <PulseRail
        label="Piyasada konuşulanlar"
        items={pulse.slice(0, 6)}
        tierFor={(_, i) => (i === 0 ? "tall" : i === 2 ? "featured" : "standard")}
        variantFor={(_, i) => (i === 0 ? "breaking" : i === 2 ? "trending" : "default")}
      />
      <VideoRail label="Günün analizleri" items={vid.slice(0, 3)} />
      <TopicEcosystemCluster topic={vm.topicEcosystems[0] ?? VR_TOPIC_ECOSYSTEMS[0]!} />
      <HotPulsePeakBand pulseItems={pulse} />
      <LiveCompactRail label="Canlı devam ediyor" items={compactLive} />
      <PulseRail
        label="Hızlı yorumlar"
        items={pulse.slice(4, 9)}
        startIdx={4}
        tierFor={(_, i) => (i % 3 === 0 ? "tall" : "standard")}
        variantFor={(_, i) => (i % 4 === 0 ? "trending" : "default")}
      />
      <VideoRail
        seriesKicker="Makro masası"
        label="Haftanın büyük resmi"
        items={vid.slice(3, 6)}
        prestige
      />
    </div>
  );
}

/* ─── Keşfet sekme önizlemeleri (hub içi) ───────────────────────────────── */

export function LiveTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const live = vm.liveItems;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);
  return (
    <div className="dvr-stream">
      <LiveRail items={live} peak />
      <LiveCompactRail label="Diğer canlılar" items={compactLive} />
    </div>
  );
}

export function PulseTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const pulse = vm.pulseItems;
  return (
    <div className="dvr-stream">
      <PulseRail
        label="Piyasada konuşulanlar"
        items={pulse.slice(0, 6)}
        tierFor={(_, i) => (i === 0 ? "tall" : i === 3 ? "featured" : "standard")}
        variantFor={(_, i) => (i === 1 ? "trending" : "default")}
      />
      <PulseRail
        label="Hızlı yorumlar"
        items={pulse.slice(3)}
        startIdx={3}
        tierFor={(_, i) => (i % 3 === 0 ? "featured" : "standard")}
      />
    </div>
  );
}

export function VideosTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const vid = vm.videoItems;
  return (
    <div className="dvr-stream">
      <VideoRail label="Günün analizleri" items={vid.slice(0, 4)} />
      <VideoRail label="Piyasa derinliği" items={vid.slice(2)} prestige />
    </div>
  );
}

export function SignalsTabPreview({ vm }: { vm: DiscoverViewModel }) {
  return (
    <div className="dvr-stream">
      <SignalStreamSection label="Sinyal Akışı" tape signalItems={vm.signalItems} />
    </div>
  );
}

export function CreatorsTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const creators = vm.creatorItems;
  const graphNodes = creators.slice(0, 5).map((item) => ({
    item,
    context: VR_CREATOR_GRAPH_BLURBS[item.id] ?? item.specialty,
  }));
  return (
    <div className="dvr-stream">
      <CreatorNetworkStrip label="Gündemin içinden" nodes={graphNodes} />
      <CreatorRail label="Piyasayı konuşanlar" creators={creators} />
      <section className="dvr-section-padded" aria-label="Tüm Üreticiler">
        <div className="dvr-creators-grid">
          {creators.map((item, i) => (
            <DiscoverCreatorCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Tam sayfa içerikleri (bağımsız rotalar) ───────────────────────────── */

export function LiveFullPageContent({ vm }: { vm: DiscoverViewModel }) {
  const live = vm.liveItems;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);
  return (
    <div className="dvr-stream">
      <LiveRail items={live} peak hideSeeAll />
      <LiveCompactRail label="Diğer canlı yayınlar" items={compactLive} hideSeeAll />
      <section className="dvr-vertical-grid-section" aria-label="Tüm canlı yayınlar">
        <div className="dvr-live-full-grid">
          {live.map((item, i) => (
            <DiscoverLiveCardCompact key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function PulseFullPageContent({ vm }: { vm: DiscoverViewModel }) {
  const pulse = vm.pulseItems;
  return (
    <div className="dvr-stream">
      <HotPulsePeakBand pulseItems={pulse} gridLayout />
      <PulseRail label="Piyasada konuşulanlar" items={pulse} hideSeeAll gridLayout />
      <section className="dvr-vertical-grid-section" aria-label="Tüm Pulse içerikleri">
        <div className="dvr-pulse-full-grid">
          {pulse.map((item, i) => (
            <DiscoverPulseCard
              key={item.id}
              item={item}
              tier={pulseGridTier(i)}
              variant={pulseGridVariant(i)}
              index={i}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function VideosFullPageContent({ vm }: { vm: DiscoverViewModel }) {
  const vid = vm.videoItems;
  return (
    <div className="dvr-stream">
      <VideoRail label="Öne çıkan analizler" items={vid.slice(0, 4)} hideSeeAll gridLayout />
      <VideoRail
        seriesKicker="Makro masası"
        label="Piyasa derinliği"
        items={vid.slice(2)}
        hideSeeAll
        gridLayout
      />
      <section className="dvr-vertical-grid-section" aria-label="Tüm videolar">
        <div className="dvr-video-full-grid">
          {vid.map((item, i) => (
            <DiscoverVideoCard key={item.id} item={item} index={i} prestige={videoGridPrestige(i)} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CreatorsFullPageContent({ vm }: { vm: DiscoverViewModel }) {
  const creators = vm.creatorItems;
  const graphNodes = creators.map((item) => ({
    item,
    context: VR_CREATOR_GRAPH_BLURBS[item.id] ?? item.specialty,
  }));
  return (
    <div className="dvr-stream">
      <CreatorNetworkStrip label="Gündemin içinden" nodes={graphNodes.slice(0, 8)} />
      <CreatorRail label="Öne çıkan üreticiler" creators={creators} hideSeeAll />
      <section className="dvr-section-padded" aria-label="Tüm üreticiler">
        <div className="dvr-creators-grid dvr-creators-grid--full">
          {creators.map((item, i) => (
            <DiscoverCreatorCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
