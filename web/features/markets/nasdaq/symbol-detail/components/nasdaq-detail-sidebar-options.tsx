"use client";

import { memo } from "react";

import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { useNasdaqDetailOptions } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-options";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function fmtPrice(price: number, symbol: string): string {
  return formatNasdaqTickerPrice(price, symbol);
}

function OptionsInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useNasdaqDetailOptions(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="options">
        <DetailSectionHead seriesKicker="Türev" label="Opsiyon Terminal" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives" data-zone="options">
        <DetailSectionHead seriesKicker="Türev" label="Opsiyon Terminal" accent="signal" />
        <p className="cdr-section-stub">Opsiyon verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const sourceLabel = data.source === "yahoo" ? "Yahoo Options" : "Referans";

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--derivatives"
      data-zone="options"
      aria-label="Opsiyon terminal"
    >
      <DetailSectionHead
        seriesKicker={sourceLabel}
        label="Opsiyon Terminal"
        accent="signal"
        trailing={<span className="cdr-sidebar-live-dot cdr-sidebar-live-dot--signal" aria-hidden />}
      />

      {data.proxyNote ? (
        <p className="nqx-options-note">{data.proxyNote}</p>
      ) : null}

      <div className="cdr-sidebar-stat-grid">
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">
            {data.impliedVolPct.toFixed(1)}%
          </span>
          <span className="cdr-sidebar-stat-label">Ort. IV</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val">{data.putCallRatio.toFixed(2)}</span>
          <span className="cdr-sidebar-stat-label">Put/Call</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Vade</dt>
          <dd className="cdr-kv-v">{data.expiry}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Max pain</dt>
          <dd className="cdr-kv-v">{fmtPrice(data.maxPain, sym)}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Toplam OI</dt>
          <dd className="cdr-kv-v">{data.totalOpenInterest}</dd>
        </div>
        {data.proxySymbol ? (
          <div className="cdr-kv-row">
            <dt className="cdr-kv-k">Proxy</dt>
            <dd className="cdr-kv-v">{data.proxySymbol}</dd>
          </div>
        ) : null}
      </dl>

      <div className="nqx-options-chain" aria-label="Opsiyon zinciri özeti">
        <div className="nqx-options-chain__head" aria-hidden>
          <span>Tip</span>
          <span>Strike</span>
          <span>IV</span>
          <span>OI</span>
        </div>
        {data.rows.map((row) => (
          <div key={`${row.type}-${row.strike}`} className="nqx-options-chain__row">
            <span className={cn("nqx-options-chain__type", row.type === "call" ? "cdr-up" : "cdr-down")}>
              {row.type === "call" ? "C" : "P"}
            </span>
            <span className="nqx-options-chain__strike">{fmtPrice(row.strike, sym)}</span>
            <span className="nqx-options-chain__iv">{row.iv.toFixed(1)}%</span>
            <span className="nqx-options-chain__oi">{row.oi}</span>
          </div>
        ))}
      </div>

      <div className="cdr-derivatives__liquidation">
        <p className="cdr-derivatives__liquidation-title">Opsiyon akış özeti</p>
        <div
          className={cn(
            "cdr-derivatives__bias",
            data.bias === "call" && "cdr-derivatives__bias--long",
            data.bias === "put" && "cdr-derivatives__bias--short",
          )}
        >
          <span className="cdr-derivatives__bias-dot" aria-hidden />
          {data.biasLabel}
        </div>
      </div>
    </section>
  );
}

export const NasdaqDetailSidebarOptions = memo(OptionsInner);
