"use client";

import { memo } from "react";

import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import { useNasdaqDetailSpreadSession } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-spread-session";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function fmtPrice(price: number, symbol: string): string {
  return formatNasdaqTickerPrice(price, symbol);
}

function sessionPillClass(status: "open" | "closed" | "pre"): string {
  if (status === "open") return "cdr-live-pill--on";
  if (status === "pre") return "cdr-live-pill--wait";
  return "cdr-live-pill--off";
}

function sessionPillText(status: "open" | "closed" | "pre", phase: string): string {
  if (status === "open") return "Açık";
  if (phase === "pre") return "Pre";
  if (phase === "after") return "After";
  if (status === "pre") return "Extended";
  return "Kapalı";
}

function SpreadSessionInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useNasdaqDetailSpreadSession(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--orderbook nqx-sidebar-block--spread" data-zone="spread">
        <DetailSectionHead seriesKicker="Likidite" label="Spread & Seans" accent="teal" />
        <div className="cdr-skeleton" style={{ height: 260, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--orderbook nqx-sidebar-block--spread" data-zone="spread">
        <DetailSectionHead seriesKicker="Likidite" label="Spread & Seans" accent="teal" />
        <p className="cdr-section-stub">Spread/seans verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const isOpen = data.session.status === "open";

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--orderbook nqx-sidebar-block--spread"
      data-zone="spread"
      aria-label="Spread ve seans"
    >
      <DetailSectionHead
        seriesKicker={data.session.venue}
        label="Spread & Seans"
        accent="teal"
        trailing={
          <span className={cn("cdr-live-pill", sessionPillClass(data.session.status))}>
            <span
              className={cn("cdr-live-pill__dot", isOpen && "cdr-live-pill__dot--pulse")}
              aria-hidden
            />
            <span className="cdr-live-pill__text">
              {sessionPillText(data.session.status, data.session.phase)}
            </span>
          </span>
        }
      />

      <div className="cdr-orderbook__meta">
        <div className="cdr-orderbook__meta-item cdr-orderbook__meta-item--spread">
          <span className="cdr-orderbook__meta-k">Spread</span>
          <span className="cdr-orderbook__meta-v">
            {data.spread.spreadBps.toFixed(1)} bps
            <em>{data.spread.spreadLabel}</em>
          </span>
        </div>
        <div className="cdr-orderbook__meta-item cdr-orderbook__meta-item--mid">
          <span className="cdr-orderbook__meta-k">Orta fiyat</span>
          <span className="cdr-orderbook__meta-v">{fmtPrice(data.spread.mid, sym)}</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Seans</dt>
          <dd className="cdr-kv-v">{data.session.label}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Sonraki</dt>
          <dd className="cdr-kv-v">{data.session.nextEvent}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Benchmark</dt>
          <dd className={cn("cdr-kv-v", data.benchmark.deltaPct >= 0 ? "cdr-up" : "cdr-down")}>
            {data.benchmark.name} · {fmtSignedPct(data.benchmark.deltaPct)}
          </dd>
        </div>
      </dl>

      <div className="nqx-spread-ladder" aria-label="Seans spread merdiveni">
        <div className="nqx-spread-ladder__head" aria-hidden>
          <span>Seans</span>
          <span>Spread</span>
        </div>
        {data.rows.map((row) => (
          <div key={`${row.venueName}-${row.pair}`} className="nqx-spread-ladder__row">
            <div className="nqx-spread-ladder__id">
              <span className="nqx-spread-ladder__name">{row.venueName}</span>
              <span className="nqx-spread-ladder__pair">{row.pair}</span>
            </div>
            <div className="nqx-spread-ladder__bar-wrap">
              <span
                className="nqx-spread-ladder__bar"
                style={{ width: `${row.depthPct}%` }}
                aria-hidden
              />
            </div>
            <span className="nqx-spread-ladder__bps">{row.spreadBps.toFixed(1)} bps</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export const NasdaqDetailSidebarSpreadSession = memo(SpreadSessionInner);
