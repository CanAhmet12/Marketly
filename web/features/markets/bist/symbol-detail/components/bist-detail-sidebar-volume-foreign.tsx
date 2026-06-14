"use client";

import { memo } from "react";

import { useBistDetailVolumeForeign } from "@/features/markets/bist/symbol-detail/hooks/use-bist-volume-foreign";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  changePct?: number;
};

function VolumeForeignInner({ symbol, changePct }: Props) {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const query = useBistDetailVolumeForeign(sym, changePct);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block bc-sidebar-block--volume" data-zone="volume-foreign">
        <DetailSectionHead seriesKicker="Akış" label="Hacim & Yabancı" accent="teal" />
        <div className="cdr-skeleton" style={{ height: 240, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block bc-sidebar-block--volume" data-zone="volume-foreign">
        <DetailSectionHead seriesKicker="Akış" label="Hacim & Yabancı" accent="teal" />
        <p className="cdr-section-stub">Hacim/yabancı verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const foreignUp = data.foreign.changePp >= 0;

  return (
    <section
      className="cdr-section cdr-sidebar-block bc-sidebar-block--volume"
      data-zone="volume-foreign"
      aria-label="Hacim ve yabancı akış"
    >
      <DetailSectionHead
        seriesKicker={data.source === "yahoo" ? "Yahoo · Canlı" : "Hesaplanmış"}
        label="Hacim & Yabancı"
        accent="teal"
        trailing={
          <span className="cdr-live-pill cdr-live-pill--on">
            <span className="cdr-live-pill__dot cdr-live-pill__dot--pulse" aria-hidden />
            <span className="cdr-live-pill__text">{data.foreign.flowLabel}</span>
          </span>
        }
      />

      <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val">{data.volume.dailyLabel}</span>
          <span className="cdr-sidebar-stat-label">Günlük hacim</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", foreignUp ? "cdr-up" : "cdr-down")}>
            {data.foreign.ratioPct.toFixed(1)}%
          </span>
          <span className="cdr-sidebar-stat-label">Yabancı pay · {data.foreign.label}</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">20g ort.</dt>
          <dd className="cdr-kv-v">{data.volume.avg20dLabel}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Hacim Δ</dt>
          <dd className={cn("cdr-kv-v", data.volume.changePct >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.volume.changePct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Yabancı Δ</dt>
          <dd className={cn("cdr-kv-v", foreignUp ? "cdr-up" : "cdr-down")}>
            {foreignUp ? "+" : ""}
            {data.foreign.changePp.toFixed(1)} puan
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">İşlem hacmi</dt>
          <dd className="cdr-kv-v">{data.volume.turnoverLabel}</dd>
        </div>
      </dl>

      {data.rows.length > 0 ? (
        <div className="bc-volume-ladder" aria-label="Son günler hacim">
          <div className="bc-volume-ladder__head" aria-hidden>
            <span>Gün</span>
            <span>Hacim</span>
            <span>Yabancı</span>
          </div>
          {data.rows.map((row) => (
            <div key={row.period} className="bc-volume-ladder__row">
              <span className="bc-volume-ladder__period">{row.period}</span>
              <span className="bc-volume-ladder__vol">{row.volumeLabel}</span>
              <span className="bc-volume-ladder__foreign">{row.foreignPct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export const BistDetailSidebarVolumeForeign = memo(VolumeForeignInner);
