"use client";

import { SignalsDiscoveryZoneSkeleton } from "@/features/signals/components/signals-discovery-stream";
import { SignalsHeroBentoSkeleton } from "@/features/signals/components/signals-hero-bento";
import { SignalsIntelligenceDeckSkeleton } from "@/features/signals/components/signals-intelligence-deck";

function SignalsToolbarSkeleton() {
  return (
    <div className="sig-canvas__sk-toolbar" aria-hidden>
      <div className="sig-canvas__sk-toolbar-row motion-shimmer" />
      <div className="sig-canvas__sk-toolbar-segments motion-shimmer" />
    </div>
  );
}

function SignalsFeaturedRailSkeleton() {
  return (
    <div className="sp-stream-band sp-skeleton-stream" aria-hidden>
      <div className="sp-skeleton-stream__head motion-shimmer" />
      <div className="sp-skeleton-stream__rail">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="sp-skeleton-stream__card sp-skeleton-stream__card--col motion-shimmer" />
        ))}
      </div>
    </div>
  );
}

function SignalsCatalogBodySkeleton() {
  return (
    <div className="sig-canvas__body sig-canvas__body--full">
      <SignalsDiscoveryZoneSkeleton />
    </div>
  );
}

/** Filtre değişiminde hafif stream iskeleti */
export function SignalsStreamRefiningSkeleton() {
  return (
    <div className="sig-canvas__sk-refining" aria-hidden>
      <SignalsFeaturedRailSkeleton />
    </div>
  );
}

type Props = {
  embed?: boolean;
  /** Sadece gövde — üst deck/toolbar hariç */
  bodyOnly?: boolean;
};

/** Tam sayfa — zone yapısına uyumlu iskelet */
export function SignalsCatalogSkeleton({ embed = false, bodyOnly = false }: Props) {
  if (bodyOnly) {
    return (
      <div aria-busy="true">
        <SignalsCatalogBodySkeleton />
      </div>
    );
  }

  return (
    <div aria-busy="true">
      <SignalsIntelligenceDeckSkeleton />
      <SignalsToolbarSkeleton />
      <div className="sig-canvas__upper-band">
        {!embed ? <SignalsHeroBentoSkeleton /> : null}
        <SignalsFeaturedRailSkeleton />
      </div>
      <SignalsCatalogBodySkeleton />
    </div>
  );
}
