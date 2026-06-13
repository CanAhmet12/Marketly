"use client";

import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { DiscoverTabIntro } from "@/features/discover/visual-reference/discover-tab-intro";
import { cn } from "@/lib/cn";
import { DiscoverLiveCard, DiscoverLiveCardCompact } from "./discover-live-card";
import { DiscoverPulseCard, type PulseTier, type PulseVariant } from "./discover-pulse-card";
import { DiscoverVideoCard } from "./discover-video-card";
import { DiscoverSignalTile, DiscoverSignalFeedLine } from "./discover-signal-tile";
import { DiscoverSignalsTabPreview } from "@/features/discover/tab-previews/discover-signals-tab-preview";
import { SIGNALS_DISCOVER_PREVIEW_LIMIT } from "@/features/signals/hooks/use-signals-discover-preview";
import { DiscoverSignalRailCard } from "./discover-signal-rail-card";
import { DiscoverCreatorCard } from "./discover-creator-strip";
import { HScroll, Rail, RailHeader } from "./discover-vr-primitives";
import {
  VR_LIVE_ITEMS,
  VR_PULSE_ITEMS,
  VR_VIDEO_ITEMS,
  VR_SIGNAL_ITEMS,
  VR_CREATOR_ITEMS,
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
    <div className={cn("dvr-live-peak-band", peak && "dvr-live-peak-band--stream-start dvr-live-peak-band--hero")}>
      <Rail
        label="Şu an canlı"
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.live}
        accent="live"
      >
        <HScroll className="dvr-hscroll--live-rail">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={cn("dvr-live-rail-item shrink-0", peak && i === 0 && "dvr-live-rail-item--hero")}
            >
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
  seriesKicker,
  items = VR_LIVE_ITEMS.slice(2),
  hideSeeAll = false,
}: {
  label?: string;
  seriesKicker?: string;
  items?: VRLiveItem[];
  hideSeeAll?: boolean;
}) {
  const row = items.length > 0 ? items : VR_LIVE_ITEMS.slice(2);
  return (
    <div className="dvr-live-compact-band dvr-stream-valley">
      <Rail
        label={label}
        seriesKicker={seriesKicker}
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.live}
        accent="live"
      >
        <HScroll className="dvr-hscroll--live-compact-rail">
          {row.map((item, i) => (
            <div key={item.id} className="dvr-live-compact-item shrink-0">
              <DiscoverLiveCardCompact item={item} index={i} />
            </div>
          ))}
        </HScroll>
      </Rail>
    </div>
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
  peak = false,
  valley = false,
  seriesKicker,
}: {
  label?: string;
  items?: typeof VR_PULSE_ITEMS;
  startIdx?: number;
  tierFor?: (item: (typeof VR_PULSE_ITEMS)[number], index: number) => PulseTier;
  variantFor?: (item: (typeof VR_PULSE_ITEMS)[number], index: number) => PulseVariant;
  hideSeeAll?: boolean;
  /** Tam sayfa: 3. sıra ile aynı grid + kart stili */
  gridLayout?: boolean;
  peak?: boolean;
  /** İkincil pulse rail — valley ambient, daha sakin ritim */
  valley?: boolean;
  seriesKicker?: string;
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
        editorialLead={peak && i === 0}
        valleyLead={valley && i === 0}
      />
    );
  });

  if (gridLayout) {
    return (
      <Rail
        seriesKicker={seriesKicker}
        label={label}
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.pulse}
        accent="teal"
      >
        <div className="dvr-vertical-grid-section dvr-vertical-grid-section--in-rail">
          <div className="dvr-pulse-full-grid">{cards}</div>
        </div>
      </Rail>
    );
  }

  const hscrollClass = valley ? "dvr-hscroll--pulse-valley-rail" : "dvr-hscroll--pulse-rail";

  const rail = (
    <Rail
      seriesKicker={seriesKicker}
      label={label}
      seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.pulse}
      accent="teal"
    >
      <HScroll className={hscrollClass}>
        {items.map((item, i) => {
          const tier = tierFor?.(item, i) ?? "standard";
          return (
            <div
              key={item.id}
              className={cn(
                "dvr-pulse-rail-item shrink-0",
                peak && i === 0 && "dvr-pulse-rail-item--hero",
                valley && i === 0 && "dvr-pulse-rail-item--valley-lead",
                tier === "tall" && "dvr-pulse-rail-item--tall",
                tier === "featured" && "dvr-pulse-rail-item--featured",
              )}
            >
              <DiscoverPulseCard
                item={item}
                tier={tier}
                variant={variantFor?.(item, i) ?? "default"}
                index={startIdx + i}
                editorialLead={peak && i === 0}
                valleyLead={valley && i === 0}
              />
            </div>
          );
        })}
      </HScroll>
    </Rail>
  );

  if (peak) {
    return (
      <div className={cn("dvr-pulse-peak-band", "dvr-pulse-peak-band--stream-start", "dvr-pulse-peak-band--hero")}>
        {rail}
      </div>
    );
  }

  if (valley) {
    return <div className="dvr-pulse-valley-band dvr-stream-valley">{rail}</div>;
  }

  return rail;
}

export function VideoRail({
  label = "Günün analizleri",
  items = VR_VIDEO_ITEMS,
  prestige = false,
  seriesKicker,
  hideSeeAll = false,
  gridLayout = false,
  peak = false,
}: {
  label?: string;
  items?: typeof VR_VIDEO_ITEMS;
  prestige?: boolean;
  seriesKicker?: string;
  hideSeeAll?: boolean;
  /** Tam sayfa: 3. sıra ile aynı grid + kart stili */
  gridLayout?: boolean;
  peak?: boolean;
}) {
  const cards = items.map((item, i) => (
    <DiscoverVideoCard
      key={item.id}
      item={item}
      index={i}
      prestige={gridLayout ? videoGridPrestige(i) : prestige}
      editorialLead={peak && i === 0}
      prestigeLead={prestige && i === 0}
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
      <HScroll className={prestige ? "dvr-hscroll--video-prestige-rail" : "dvr-hscroll--video-rail"}>
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "dvr-video-rail-item shrink-0",
              peak && i === 0 && "dvr-video-rail-item--hero",
              prestige && i === 0 && "dvr-video-rail-item--prestige-hero",
            )}
          >
            <DiscoverVideoCard
              item={item}
              index={i}
              prestige={prestige}
              editorialLead={peak && i === 0}
              prestigeLead={prestige && i === 0}
            />
          </div>
        ))}
      </HScroll>
    </Rail>
  );

  if (prestige) {
    return (
      <div className="dvr-deep-prestige-wrap dvr-deep-prestige-wrap--hero dvr-deep-prestige-wrap--finale">
        {rail}
      </div>
    );
  }

  if (!peak) return rail;

  return (
    <div className={cn("dvr-video-peak-band", "dvr-video-peak-band--stream-start", "dvr-video-peak-band--hero")}>
      {rail}
    </div>
  );
}

export function SignalBandRail({
  label = "Analist sinyalleri",
  seriesKicker = "Piyasa nabzı",
  items = VR_SIGNAL_ITEMS,
  hideSeeAll = false,
}: {
  label?: string;
  seriesKicker?: string;
  items?: VRSignalItem[];
  hideSeeAll?: boolean;
}) {
  const row = items.length > 0 ? items : VR_SIGNAL_ITEMS;

  return (
    <div className="dvr-sig-valley-band">
      <Rail
        seriesKicker={seriesKicker}
        label={label}
        seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.signals}
        accent="signal"
      >
        <HScroll className="dvr-hscroll--sig-rail">
          {row.map((item, i) => (
            <div key={item.id} className="dvr-sig-rail-item shrink-0">
              <DiscoverSignalRailCard item={item} index={i} />
            </div>
          ))}
        </HScroll>
      </Rail>
    </div>
  );
}

export function SignalStreamSection({
  label = "Piyasa Nabzı",
  seriesKicker,
  tape = false,
  density = "full",
  signalItems = VR_SIGNAL_ITEMS,
}: {
  label?: string;
  seriesKicker?: string;
  tape?: boolean;
  density?: "full" | "ambient";
  signalItems?: VRSignalItem[];
}) {
  const sig = signalItems.length > 0 ? signalItems : VR_SIGNAL_ITEMS;
  if (density === "ambient") {
    return (
      <section className="dvr-sig-stream-section dvr-sig-stream-section--ambient" aria-label={label}>
        <RailHeader
          label={label}
          seriesKicker={seriesKicker}
          seeAllHref={DISCOVER_VERTICAL_ROUTES.signals}
          accent="signal"
        />
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
      <RailHeader
        label={label}
        seriesKicker={seriesKicker}
        seeAllHref={DISCOVER_VERTICAL_ROUTES.signals}
        accent="signal"
      />
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
  seriesKicker,
  creators = VR_CREATOR_ITEMS,
  hideSeeAll = false,
  limit,
}: {
  label?: string;
  seriesKicker?: string;
  creators?: VRCreatorItem[];
  hideSeeAll?: boolean;
  limit?: number;
}) {
  const row = creators.length > 0 ? creators : VR_CREATOR_ITEMS;
  const visible = limit != null ? row.slice(0, limit) : row;
  return (
    <Rail
      label={label}
      seriesKicker={seriesKicker}
      seeAllHref={hideSeeAll ? undefined : DISCOVER_VERTICAL_ROUTES.creators}
      accent="teal"
    >
      <HScroll>
        {visible.map((item, i) => (
          <div key={item.id} className="dvr-creator-rail-item shrink-0">
            <DiscoverCreatorCard item={item} index={i} />
          </div>
        ))}
      </HScroll>
    </Rail>
  );
}

/** Keşfet Tümü — üretici teaser bandı */
export function CreatorBandRail({
  label = "Analist ağı",
  seriesKicker = "Üreticiler",
  creators,
  hideSeeAll = false,
}: {
  label?: string;
  seriesKicker?: string;
  creators?: VRCreatorItem[];
  hideSeeAll?: boolean;
}) {
  return (
    <CreatorRail
      label={label}
      seriesKicker={seriesKicker}
      creators={creators}
      hideSeeAll={hideSeeAll}
      limit={6}
    />
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
    <RailHeader label="Sıcak başlıklar" seeAllHref={DISCOVER_VERTICAL_ROUTES.pulse} accent="peak" />
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
          <DiscoverPulseCard item={peakItems[0]!} tier="standard" variant="breaking" index={0} />
        </div>
        <div className="dvr-pulse-rail-item shrink-0">
          <DiscoverPulseCard item={peakItems[1]!} tier="standard" variant="trending" index={1} />
        </div>
        <div className="dvr-pulse-rail-item shrink-0">
          <DiscoverPulseCard item={peakItems[2]!} tier="standard" variant="default" index={2} />
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
  const signals = vm.signalItems.length > 0 ? vm.signalItems : VR_SIGNAL_ITEMS;
  const creators = vm.creatorItems.length > 0 ? vm.creatorItems : VR_CREATOR_ITEMS;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);

  return (
    <div className="dvr-stream">
      <LiveRail items={live.slice(0, 4)} peak />
      <PulseRail
        label="Piyasada konuşulanlar"
        items={pulse.slice(0, 6)}
        peak
        variantFor={(_, i) => (i === 0 ? "breaking" : i === 2 ? "trending" : "default")}
      />
      <VideoRail label="Günün analizleri" items={vid.slice(0, 3)} peak />
      <CreatorBandRail creators={creators} />
      <SignalBandRail label="Analist sinyalleri" seriesKicker="Piyasa çağrıları" items={signals.slice(0, 6)} />
      <HotPulsePeakBand pulseItems={pulse} />
      <LiveCompactRail label="Canlı devam ediyor" items={compactLive} />
      <PulseRail
        label="Hızlı yorumlar"
        seriesKicker="Kısa format"
        items={pulse.slice(4, 9)}
        startIdx={4}
        valley
        variantFor={(_, i) => (i % 4 === 0 ? "trending" : "default")}
      />
    </div>
  );
}

/* ─── Keşfet sekme önizlemeleri (hub içi) ───────────────────────────────── */

export function LiveTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const live = vm.liveItems.length > 0 ? vm.liveItems : VR_LIVE_ITEMS;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);
  return (
    <div className="dvr-tab-stream dvr-tab-stream--live dvr-tab-stream--tab-v2">
      <DiscoverTabIntro
        variant="live"
        kicker="Canlı Yayınlar"
        line="Piyasa masaları, analist yayınları ve sohbet akışı"
        count={live.length}
        countSuffix="yayın"
        seeAllHref={DISCOVER_VERTICAL_ROUTES.live}
        seeAllLabel="Tüm canlılar"
      />
      <LiveRail items={live} peak />
      <LiveCompactRail
        label="Diğer canlılar"
        seriesKicker="Yayın devam ediyor"
        items={compactLive}
      />
    </div>
  );
}

export function PulseTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const pulse = vm.pulseItems.length > 0 ? vm.pulseItems : VR_PULSE_ITEMS;
  return (
    <div className="dvr-tab-stream dvr-tab-stream--pulse dvr-tab-stream--tab-v2">
      <DiscoverTabIntro
        variant="pulse"
        kicker="Pulse"
        line="Kısa format piyasa yorumları ve sıcak başlıklar"
        count={pulse.length}
        countSuffix="içerik"
        seeAllHref={DISCOVER_VERTICAL_ROUTES.pulse}
        seeAllLabel="Tüm pulse"
      />
      <PulseRail
        label="Piyasada konuşulanlar"
        items={pulse.slice(0, 6)}
        peak
        variantFor={(_, i) => (i === 0 ? "breaking" : i === 2 ? "trending" : "default")}
      />
      <HotPulsePeakBand pulseItems={pulse} />
      <PulseRail
        label="Hızlı yorumlar"
        seriesKicker="Kısa format"
        items={pulse.slice(4, 9)}
        startIdx={4}
        valley
        variantFor={(_, i) => (i % 4 === 0 ? "trending" : "default")}
      />
    </div>
  );
}

export function VideosTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const vid = vm.videoItems.length > 0 ? vm.videoItems : VR_VIDEO_ITEMS;
  return (
    <div className="dvr-tab-stream dvr-tab-stream--videos dvr-tab-stream--tab-v2">
      <DiscoverTabIntro
        variant="videos"
        kicker="Videolar"
        line="Günün analizleri ve uzun format içerikler"
        count={vid.length}
        countSuffix="video"
        seeAllHref={DISCOVER_VERTICAL_ROUTES.videos}
        seeAllLabel="Tüm videolar"
      />
      <VideoRail label="Günün analizleri" items={vid.slice(0, 4)} peak />
    </div>
  );
}

/** Feed VM fallback — canlı tab client gerçek Supabase verisi kullanır */
export function SignalsTabPreview({ vm }: { vm: DiscoverViewModel }) {
  const signals = (vm.signalItems.length > 0 ? vm.signalItems : VR_SIGNAL_ITEMS).slice(
    0,
    SIGNALS_DISCOVER_PREVIEW_LIMIT,
  );
  return <DiscoverSignalsTabPreview items={signals} />;
}

/* ─── Tam sayfa içerikleri (bağımsız rotalar) ───────────────────────────── */

export function LiveFullPageContent({ vm }: { vm: DiscoverViewModel }) {
  const live = vm.liveItems.length > 0 ? vm.liveItems : VR_LIVE_ITEMS;
  const compactLive = live.length > 2 ? live.slice(2) : VR_LIVE_ITEMS.slice(2);
  return (
    <div className="dvr-vertical-stream dvr-vertical-stream--live">
      <LiveRail items={live} peak hideSeeAll />
      <LiveCompactRail
        label="Diğer canlı yayınlar"
        seriesKicker="Yayın devam ediyor"
        items={compactLive}
        hideSeeAll
      />
      <section className="dvr-vertical-grid-section dvr-vertical-grid-section--live" aria-label="Tüm canlı yayınlar">
        <div className="dvr-vertical-grid-head">
          <span className="dvr-vertical-grid-kicker">Tam liste</span>
          <h2 className="dvr-vertical-grid-title">Tüm canlı yayınlar</h2>
        </div>
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
  const pulse = vm.pulseItems.length > 0 ? vm.pulseItems : VR_PULSE_ITEMS;
  return (
    <div className="dvr-vertical-stream dvr-vertical-stream--pulse">
      <PulseRail
        label="Piyasada konuşulanlar"
        items={pulse.slice(0, 6)}
        peak
        hideSeeAll
        variantFor={(_, i) => (i === 0 ? "breaking" : i === 2 ? "trending" : "default")}
      />
      <HotPulsePeakBand pulseItems={pulse} />
      <PulseRail
        label="Hızlı yorumlar"
        seriesKicker="Kısa format"
        items={pulse.slice(4, 9)}
        startIdx={4}
        valley
        hideSeeAll
        variantFor={(_, i) => (i % 4 === 0 ? "trending" : "default")}
      />
      <section className="dvr-vertical-grid-section dvr-vertical-grid-section--pulse" aria-label="Tüm Pulse içerikleri">
        <div className="dvr-vertical-grid-head">
          <span className="dvr-vertical-grid-kicker">Tam liste</span>
          <h2 className="dvr-vertical-grid-title">Tüm Pulse içerikleri</h2>
        </div>
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
  const vid = vm.videoItems.length > 0 ? vm.videoItems : VR_VIDEO_ITEMS;
  return (
    <div className="dvr-vertical-stream dvr-vertical-stream--videos">
      <VideoRail label="Günün analizleri" items={vid.slice(0, 4)} peak hideSeeAll />
      <section className="dvr-vertical-grid-section dvr-vertical-grid-section--videos" aria-label="Tüm videolar">
        <div className="dvr-vertical-grid-head">
          <span className="dvr-vertical-grid-kicker">Tam liste</span>
          <h2 className="dvr-vertical-grid-title">Tüm videolar</h2>
        </div>
        <div className="dvr-video-full-grid">
          {vid.map((item, i) => (
            <DiscoverVideoCard key={item.id} item={item} index={i} prestige={videoGridPrestige(i)} />
          ))}
        </div>
      </section>
    </div>
  );
}
