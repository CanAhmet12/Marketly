"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { HScroll } from "@/features/discover/visual-reference/discover-vr-primitives";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { marketAssetSignalsPath } from "@/features/markets/markets-routes";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { SignalsLiveRailCard } from "@/features/signals/components/signals-live-rail-card";
import { SignalsEngagementProvider } from "@/features/signals/contexts/signals-engagement-context";
import { mapFeedRowToLiveCardItem } from "@/features/signals/lib/map-feed-row-to-live-card";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { getSignalsRepository } from "@/features/signals/repository";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  bundle: AssetIntelligenceBundle;
  variant?: "inline" | "wide";
};

function avgTargetReturn(signals: SignalsFeedRow[]): number {
  const active = signals.filter((s) => s.is_active && s.entry_price && s.target_price);
  if (active.length === 0) return 0;
  const sum = active.reduce((acc, s) => {
    const entry = s.entry_price!;
    const target = s.target_price!;
    return acc + ((target - entry) / entry) * 100;
  }, 0);
  return sum / active.length;
}

function resolveSymbolRows(bundle: AssetIntelligenceBundle, sym: string, mockOn: boolean): SignalsFeedRow[] {
  const fromBundle = bundle.signals
    .filter((row) => row.symbol.trim().toUpperCase() === sym)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 14);

  if (fromBundle.length > 0) return fromBundle;

  if (mockOn) {
    return getSignalsRepository()
      .getFeedRows()
      .filter((row) => row.symbol.trim().toUpperCase() === sym)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 14);
  }

  return [];
}

export function DetailSignalsSection({ bundle, variant = "inline" }: Props) {
  const router = useRouter();
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const mockOn = isMockDataEnabled();
  const wide = variant === "wide";
  const { signalSummary } = bundle;

  const rows = useMemo(() => resolveSymbolRows(bundle, sym, mockOn), [bundle.signals, sym, mockOn]);
  const items = useMemo(() => rows.map(mapFeedRowToLiveCardItem), [rows]);
  const avgReturn = useMemo(() => avgTargetReturn(rows.filter((s) => s.is_active)), [rows]);

  const rail = items.length > 0 ? (
    <SignalsEngagementProvider>
      <div className={cn("cc-signal-rail cdr-signals-rail", wide && "cdr-signals-rail--wide")} role="presentation">
        <div className={cn(wide && "cdr-wide-rail")}>
          <HScroll
            className={cn(
              "cc-signal-rail-scroll dvr-hscroll--sig-rail",
              wide && "cdr-wide-rail-scroll",
            )}
          >
            {items.map((item, index) => (
              <div key={item.id} className="cc-signal-rail-item shrink-0">
                <div className="cc-signal-rail-card-wrap">
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
        </div>
      </div>
    </SignalsEngagementProvider>
  ) : (
    <p className="cdr-signals__empty">{sym} için aktif sinyal bulunamadı.</p>
  );

  return (
    <section
      className={cn("cdr-section", wide && "cdr-signals-section--wide")}
      data-zone="signals"
      aria-label="Sinyal istihbaratı"
    >
      <DetailSectionHead
        seriesKicker="Sinyal"
        label="Sinyal İstihbaratı"
        accent="signal"
        seeAllHref={marketAssetSignalsPath(sym)}
        seeAllLabel="Tüm sinyalleri gör"
      />

      <div className="cdr-section-body">
        <div className="cdr-signals__meta">
          <span className="cdr-stat-pill">
            Aktif Sinyal <strong>{signalSummary.activeTotal}</strong>
          </span>
          <span className="cdr-stat-pill">
            Ort. Güven <strong>%{signalSummary.avgConfidenceActive}</strong>
          </span>
          <span className="cdr-stat-pill">
            Ort. Hedef Getiri{" "}
            <strong className={avgReturn >= 0 ? "cdr-up" : "cdr-down"}>
              {avgReturn >= 0 ? "+" : ""}
              {avgReturn.toFixed(1)}%
            </strong>
          </span>
        </div>
        {rail}
      </div>
    </section>
  );
}
