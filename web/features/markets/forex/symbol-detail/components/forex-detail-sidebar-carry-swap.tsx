"use client";

import { memo } from "react";

import { useForexDetailCarrySwap } from "@/features/markets/forex/symbol-detail/hooks/use-forex-carry-swap";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function CarrySwapInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const query = useForexDetailCarrySwap(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="carry-swap">
        <DetailSectionHead seriesKicker="Türev" label="Carry & Swap" accent="peak" />
        <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="carry-swap">
        <DetailSectionHead seriesKicker="Türev" label="Carry & Swap" accent="peak" />
        <p className="cdr-section-stub">Carry/swap verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const longPositive = data.longSwapPips >= 0;

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives"
      data-zone="carry-swap"
      aria-label="Carry ve swap"
    >
      <DetailSectionHead
        seriesKicker={`${data.baseBank} · ${data.quoteBank}`}
        label="Carry & Swap"
        accent="peak"
        trailing={<span className="cdr-sidebar-live-dot cdr-sidebar-live-dot--signal" aria-hidden />}
      />

      <div className="cdr-sidebar-stat-grid">
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", longPositive ? "cdr-up" : "cdr-down")}>
            {data.longSwapPips >= 0 ? "+" : ""}
            {data.longSwapPips.toFixed(1)} pip
          </span>
          <span className="cdr-sidebar-stat-label">{data.swapLongLabel}</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", data.rateDiffBps >= 0 ? "cdr-up" : "cdr-down")}>
            {data.rateDiffBps >= 0 ? "+" : ""}
            {data.rateDiffBps} bp
          </span>
          <span className="cdr-sidebar-stat-label">Faiz farkı</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Short swap</dt>
          <dd className={cn("cdr-kv-v", data.shortSwapPips >= 0 ? "cdr-up" : "cdr-down")}>
            {data.shortSwapPips >= 0 ? "+" : ""}
            {data.shortSwapPips.toFixed(1)} pip
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Forward bias</dt>
          <dd className="cdr-kv-v">{data.forwardBias}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Forward prim</dt>
          <dd className={cn("cdr-kv-v", data.forwardPremiumPct >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.forwardPremiumPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Roll maliyeti (yıllık)</dt>
          <dd className={cn("cdr-kv-v", data.rollCostAnnualPct >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.rollCostAnnualPct)}
          </dd>
        </div>
      </dl>

      <div className="cdr-derivatives__liquidation">
        <p className="cdr-derivatives__liquidation-title">Carry özeti</p>
        <div
          className={cn(
            "cdr-derivatives__bias",
            data.bias === "long" && "cdr-derivatives__bias--long",
            data.bias === "short" && "cdr-derivatives__bias--short",
          )}
        >
          <span className="cdr-derivatives__bias-dot" aria-hidden />
          {data.biasLabel}
        </div>
      </div>
    </section>
  );
}

export const ForexDetailSidebarCarrySwap = memo(CarrySwapInner);
