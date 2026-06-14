"use client";

import { memo } from "react";

import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import { useCommodityDetailDerivatives } from "@/features/markets/commodities/symbol-detail/hooks/use-commodity-derivatives";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function fmtPrice(price: number, symbol: string): string {
  return formatCommodityTickerPrice(price, symbol);
}

function DerivativesInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useCommodityDetailDerivatives(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="derivatives">
        <DetailSectionHead seriesKicker="Vadeli" label="Vadeli Terminal" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="derivatives">
        <DetailSectionHead seriesKicker="Vadeli" label="Vadeli Terminal" accent="signal" />
        <p className="cdr-section-stub">Vadeli verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const up = data.change24hPct >= 0;
  const contangoUp = data.contangoPct >= 0;

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives"
      data-zone="derivatives"
      aria-label="Vadeli terminal"
    >
      <DetailSectionHead
        seriesKicker="Yahoo · CME"
        label="Vadeli Terminal"
        accent="signal"
        trailing={<span className="cdr-sidebar-live-dot cdr-sidebar-live-dot--signal" aria-hidden />}
      />

      <div className="cdr-sidebar-stat-grid">
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", up ? "cdr-up" : "cdr-down")}>
            {fmtPrice(data.markPrice, sym)}
          </span>
          <span className="cdr-sidebar-stat-label">Mark fiyat</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", contangoUp ? "cdr-down" : "cdr-up")}>
            {fmtSignedPct(data.contangoPct)}
          </span>
          <span className="cdr-sidebar-stat-label">Contango</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Kontrat</dt>
          <dd className="cdr-kv-v">{data.contract}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">24s değişim</dt>
          <dd className={cn("cdr-kv-v", up ? "cdr-up" : "cdr-down")}>{fmtSignedPct(data.change24hPct)}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Basis</dt>
          <dd className={cn("cdr-kv-v", data.basisPct >= 0 ? "cdr-down" : "cdr-up")}>
            {fmtSignedPct(data.basisPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Roll getirisi (yıllık)</dt>
          <dd className={cn("cdr-kv-v", data.rollYieldAnnualPct >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.rollYieldAnnualPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Açık pozisyon</dt>
          <dd className="cdr-kv-v">{data.openInterestLabel}</dd>
        </div>
      </dl>

      <div className="cdr-derivatives__liquidation">
        <p className="cdr-derivatives__liquidation-title">Vade eğrisi özeti</p>
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

export const CommodityDetailSidebarDerivatives = memo(DerivativesInner);
