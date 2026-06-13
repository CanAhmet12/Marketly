"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { HScroll } from "@/features/discover/visual-reference/discover-vr-primitives";
import type { BistSignalStripPayload } from "@/features/markets/bist/types";
import { SignalsLiveRailCard } from "@/features/signals/components/signals-live-rail-card";
import { SignalsEngagementProvider } from "@/features/signals/contexts/signals-engagement-context";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";
import { mapFeedRowToLiveCardItem } from "@/features/signals/lib/map-feed-row-to-live-card";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import { getSignalsRepository } from "@/features/signals/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  signals: BistSignalStripPayload;
  useMockCatalog?: boolean;
};

function BistSignalRailSkeleton() {
  return (
    <div className="cc-signal-rail-scroll cc-signal-rail-scroll--loading bc-signal-rail-scroll--loading" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="cc-signal-rail-skeleton-card bc-signal-rail-skeleton-card" />
      ))}
    </div>
  );
}

export function BistSignalStrip({ signals, useMockCatalog = false }: Props) {
  const router = useRouter();
  const mockOn = isMockDataEnabled();
  const catalogFromMock = mockOn || useMockCatalog;
  const { rows: liveRows, isLoading } = useSignalsCatalog({ scope: "live", sort: "trending" });

  const items = useMemo(() => {
    const pool = catalogFromMock ? getSignalsRepository().getFeedRows() : liveRows;
    const priority = new Set(signals.topAssets.map((asset) => asset.symbol));

    const bistRows = pool
      .filter((row) => {
        const cat = resolveSignalAssetCategory(row);
        return cat === "stocks" && (row.symbol.endsWith(".IS") || priority.has(row.symbol));
      })
      .sort((a, b) => {
        const aPriority = priority.has(a.symbol.replace(".IS", "")) ? 0 : 1;
        const bPriority = priority.has(b.symbol.replace(".IS", "")) ? 0 : 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return b.confidence - a.confidence;
      })
      .slice(0, 14);

    return bistRows.map(mapFeedRowToLiveCardItem);
  }, [catalogFromMock, liveRows, signals.topAssets]);

  if (!signals.totalActiveSignals && items.length === 0) return null;

  const showSkeleton = !catalogFromMock && isLoading && items.length === 0;

  return (
    <SignalsEngagementProvider>
      <section className="cc-section cc-signal-rail bc-signal-rail" role="region" aria-label="BIST sinyal istihbaratı">
        <div className="cc-signal-rail-head">
          <div className="cc-zone-label cc-zone-label--flush">
            Sinyal istihbaratı
            <Link href="/signals" className="cc-zone-label-link">
              Tüm sinyaller →
            </Link>
          </div>

          <div className="cc-signal-rail-meta">
            <span className="cc-signal-rail-meta-stat">
              <span className="cc-signal-rail-meta-k">Aktif</span>
              <span className="cc-signal-rail-meta-v">{signals.totalActiveSignals}</span>
            </span>
            <span className="cc-signal-rail-meta-divider" aria-hidden />
            <span className="cc-signal-rail-meta-stat cc-signal-rail-meta-stat--bull">
              <span className="cc-signal-rail-meta-k">Alış</span>
              <span className="cc-signal-rail-meta-v">{signals.bullPct}%</span>
            </span>
            <span className="cc-signal-rail-meta-stat cc-signal-rail-meta-stat--bear">
              <span className="cc-signal-rail-meta-k">Satış</span>
              <span className="cc-signal-rail-meta-v">{signals.bearPct}%</span>
            </span>
            {signals.marketBiasLabel && signals.marketBiasLabel !== "—" ? (
              <>
                <span className="cc-signal-rail-meta-divider" aria-hidden />
                <span className="cc-signal-rail-meta-note">{signals.marketBiasLabel}</span>
              </>
            ) : null}
            <div className="cc-signal-rail-bias-bar bc-signal-rail-bias-bar" aria-hidden>
              <div
                className="cc-signal-rail-bias-fill bc-signal-rail-bias-fill"
                style={{ width: `${Math.min(100, Math.max(8, signals.bullPct))}%` }}
              />
            </div>
          </div>
        </div>

        {showSkeleton ? (
          <BistSignalRailSkeleton />
        ) : items.length > 0 ? (
          <HScroll className="cc-signal-rail-scroll dvr-hscroll--sig-rail bc-signal-rail-scroll">
            {items.map((item, index) => (
              <div key={item.id} className="cc-signal-rail-item bc-signal-rail-item shrink-0">
                <div className="cc-signal-rail-card-wrap bc-signal-rail-card-wrap">
                  <SignalsLiveRailCard
                    item={item}
                    index={index}
                    layout="rail-horizontal"
                    onSelect={() => router.push(item.href)}
                  />
                </div>
              </div>
            ))}
          </HScroll>
        ) : null}
      </section>
    </SignalsEngagementProvider>
  );
}
