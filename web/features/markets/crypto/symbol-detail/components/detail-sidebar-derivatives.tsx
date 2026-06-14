"use client";

import { memo } from "react";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { DetailFundingCountdown } from "@/features/markets/crypto/symbol-detail/components/detail-funding-countdown";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { useDetailDerivatives } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-derivatives";
import {
  fmtCompactUsd,
  fmtFundingRate,
  fmtSignedPct,
} from "@/features/markets/crypto/symbol-detail/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function liquidationBiasLabel(bias: "long" | "short" | "neutral"): string {
  if (bias === "long") return "Long likidasyon baskısı";
  if (bias === "short") return "Short likidasyon baskısı";
  return "Dengeli agresyon";
}

export function DetailSidebarDerivativesInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useDetailDerivatives(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="derivatives">
        <DetailSectionHead seriesKicker="Vadeli" label="Türev Terminali" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="derivatives">
        <DetailSectionHead seriesKicker="Vadeli" label="Türev Terminali" accent="signal" />
        <p className="cdr-section-stub">Türev verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  if (!data) return null;

  const fundingUp = data.fundingRate >= 0;
  const oiUp = data.openInterestChange24hPct >= 0;
  const longLiqPct = Math.round(data.takerSellPct24h);
  const shortLiqPct = Math.round(data.takerBuyPct24h);
  const longAccountPct = Math.round(data.longAccountPct);
  const shortAccountPct = Math.round(data.shortAccountPct);

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives"
      data-zone="derivatives"
      aria-label="Türev terminali"
    >
      <DetailSectionHead
        seriesKicker={
          data.source === "okx"
            ? "OKX USDT"
            : data.source === "bybit"
              ? "Bybit USDT"
              : "Binance USDT-M"
        }
        label="Türev Terminali"
        accent="signal"
        trailing={<span className="cdr-sidebar-live-dot cdr-sidebar-live-dot--signal" aria-hidden />}
      />

      <div className="cdr-sidebar-stat-grid">
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", fundingUp ? "cdr-up" : "cdr-down")}>
            {fmtFundingRate(data.fundingRatePct)}
          </span>
          <span className="cdr-sidebar-stat-label">Funding (8s)</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">{fmtCompactUsd(data.openInterestUsd)}</span>
          <span className="cdr-sidebar-stat-label">Açık Pozisyon</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Yıllık funding</dt>
          <dd className={cn("cdr-kv-v", fundingUp ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.fundingAnnualizedPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">OI değişim (24s)</dt>
          <dd className={cn("cdr-kv-v", oiUp ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.openInterestChange24hPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Sonraki funding</dt>
          <dd className="cdr-kv-v">
            <DetailFundingCountdown nextFundingTime={data.nextFundingTime} />
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Long/Short oran</dt>
          <dd className="cdr-kv-v">{data.longShortRatio.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="cdr-derivatives__liquidation">
        <p className="cdr-derivatives__liquidation-title">Likidasyon özeti (24s taker)</p>

        <div className="cdr-dir-stack">
          <div className="cdr-dir-stack-row cdr-dir-stack-row--sell">
            <span className="cdr-dir-stack-label">Long</span>
            <div className="cdr-dir-stack-bar">
              <div className="cdr-dir-stack-fill" style={{ width: `${longLiqPct}%` }} />
            </div>
            <span className="cdr-dir-stack-pct">{longLiqPct}%</span>
          </div>
          <div className="cdr-dir-stack-row cdr-dir-stack-row--buy">
            <span className="cdr-dir-stack-label">Short</span>
            <div className="cdr-dir-stack-bar">
              <div className="cdr-dir-stack-fill" style={{ width: `${shortLiqPct}%` }} />
            </div>
            <span className="cdr-dir-stack-pct">{shortLiqPct}%</span>
          </div>
        </div>

        <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
          <div className="cdr-sidebar-stat">
            <span className="cdr-sidebar-stat-val cdr-up">%{longAccountPct}</span>
            <span className="cdr-sidebar-stat-label">Long hesap</span>
          </div>
          <div className="cdr-sidebar-stat">
            <span className="cdr-sidebar-stat-val cdr-down">%{shortAccountPct}</span>
            <span className="cdr-sidebar-stat-label">Short hesap</span>
          </div>
        </div>

        <div
          className={cn(
            "cdr-derivatives__bias",
            data.liquidationBias === "long" && "cdr-derivatives__bias--long",
            data.liquidationBias === "short" && "cdr-derivatives__bias--short",
          )}
        >
          <span className="cdr-derivatives__bias-dot" aria-hidden />
          {liquidationBiasLabel(data.liquidationBias)}
        </div>
      </div>
    </section>
  );
}

export const DetailSidebarDerivatives = memo(DetailSidebarDerivativesInner);
