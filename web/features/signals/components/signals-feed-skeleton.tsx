"use client";

import { SignalsCanvasShell } from "@/features/signals/components/signals-canvas-shell";
import { SignalsCatalogSkeleton } from "@/features/signals/components/signals-catalog-skeleton";

/** Eski API — stream band iskeleti (refining vb.) */
export function SignalsFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="sp-discovery-stream sp-skeleton-stream" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sp-stream-band">
          <div className="sp-skeleton-stream__head motion-shimmer" />
          <div className="sp-skeleton-stream__rail">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="sp-skeleton-stream__card motion-shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** `/signals` SSR Suspense + ilk yükleme fallback */
export function SignalsPageSkeleton() {
  return (
    <SignalsCanvasShell>
      <SignalsCatalogSkeleton />
    </SignalsCanvasShell>
  );
}
