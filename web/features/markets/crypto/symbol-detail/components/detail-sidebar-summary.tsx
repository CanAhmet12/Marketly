"use client";

import { memo } from "react";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  liveSummary?: { change_percent: number; volume: string } | null;
};

function findStat(stats: AssetIntelligenceBundle["stats"], keys: string[]): string {
  const row = stats.find((s) => keys.some((k) => s.key.includes(k) || s.label.toLowerCase().includes(k)));
  return row?.value ?? "—";
}

function SidebarSummaryInner({ bundle, liveSummary }: Props) {
  const { asset, stats, heroIntel } = bundle;
  const change = liveSummary?.change_percent ?? asset.change_percent;
  const volume = liveSummary?.volume ?? asset.volume;
  const isUp = change >= 0;
  const changeLabel = fmtSignedPct(change);

  const rows = [
    { label: "Piyasa Değeri", value: asset.marketCapLabel ?? findStat(stats, ["market", "piyasa"]) },
    { label: "Dominans", value: findStat(stats, ["dominans", "dominance"]) },
    { label: "ATH", value: findStat(stats, ["ath"]) },
    { label: "ATL", value: findStat(stats, ["atl"]) },
    { label: "Volatilite", value: heroIntel.volatilityLabel || findStat(stats, ["volatil"]) },
    { label: "Destek", value: findStat(stats, ["destek", "support"]) },
    { label: "Direnç", value: findStat(stats, ["direnç", "resistance"]) },
  ];

  return (
    <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--pulse" data-zone="summary" aria-label="Piyasa özeti">
      <DetailSectionHead
        seriesKicker="Canlı"
        label="Piyasa Özeti"
        accent="teal"
        trailing={<span className="cdr-sidebar-live-dot" aria-hidden />}
      />

      <div className="cdr-sidebar-stat-grid">
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", isUp ? "cdr-up" : "cdr-down")}>{changeLabel}</span>
          <span className="cdr-sidebar-stat-label">24s Değişim</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">
            {volume ?? findStat(stats, ["hacim", "volume"])}
          </span>
          <span className="cdr-sidebar-stat-label">24s Hacim</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        {rows.map((row) => (
          <div key={row.label} className="cdr-kv-row">
            <dt className="cdr-kv-k">{row.label}</dt>
            <dd className="cdr-kv-v">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export const DetailSidebarSummary = memo(SidebarSummaryInner, (prev, next) => {
  if (prev.bundle !== next.bundle) return false;
  if (prev.liveSummary?.change_percent !== next.liveSummary?.change_percent) return false;
  if (prev.liveSummary?.volume !== next.liveSummary?.volume) return false;
  return true;
});
