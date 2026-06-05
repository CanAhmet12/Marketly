"use client";

import Link from "next/link";
import { memo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { NasdaqScreenerAsset, NasdaqScreenerCategory, NasdaqScreenerPayload } from "@/features/markets/nasdaq/types";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = { screener: NasdaqScreenerPayload };
type SortKey = "rank" | "changeDay" | "changeWeek" | "pe";
type FilterId = "all" | NasdaqScreenerCategory;

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all",        label: "Tumu" },
  { id: "ai-tech",    label: "AI & Tech" },
  { id: "yariletken", label: "Yariletken" },
  { id: "cloud",      label: "Cloud" },
  { id: "biotech",    label: "Biotech" },
  { id: "diger",      label: "Diger" },
];

const SECTOR_LABEL: Record<string, string> = {
  "ai-tech":    "AI & Tech",
  "yariletken": "Yariletken",
  "cloud":      "Cloud",
  "biotech":    "Biotech",
  "software":   "Yazilim",
  "media":      "Medya",
  "diger":      "Diger",
};

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)"; if (v < 0) return "var(--cc-rose)"; return "var(--cc-meta)";
}
function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}
function peBadgeClass(pe: number | null) {
  if (pe === null) return "nq-pe-badge";
  if (pe > 80) return "nq-pe-badge nq-pe-badge--high";
  if (pe < 20) return "nq-pe-badge nq-pe-badge--low";
  return "nq-pe-badge";
}

export function NasdaqScreener({ screener }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(key === "rank" ? 1 : -1); }
  }

  const filtered = activeFilter === "all" ? screener.assets
    : screener.assets.filter((a) => a.sector === activeFilter);

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    switch (sortKey) {
      case "rank":       av = a.rank;       bv = b.rank;       break;
      case "changeDay":  av = a.changeDay;  bv = b.changeDay;  break;
      case "changeWeek": av = a.changeWeek; bv = b.changeWeek; break;
      case "pe":         av = a.pe ?? 9999; bv = b.pe ?? 9999; break;
      default: return 0;
    }
    return (av - bv) * sortDir;
  });

  const vt = useVirtualTableRows({ count: sorted.length, rowHeight: MARKETS_SCREENER_ROW_HEIGHT });
  const tableRows = renderVirtualTableRows({
    items: sorted,
    vt,
    getKey: (a) => a.symbol,
    renderRow: (asset) => <ScreenerRow asset={asset} />,
  });

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th onClick={() => handleSort(k)} style={{ cursor: "pointer", userSelect: "none", textAlign: "right",
        padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        borderBottom: "1px solid var(--cc-border-subtle)", whiteSpace: "nowrap", color: active ? "#06b6d4" : undefined }}>
        {label}{active ? (sortDir === 1 ? " ↑" : " ↓") : ""}
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section" role="region" aria-label="NASDAQ hisse screener">
      <div className="cc-zone-label">NASDAQ Hisse Tarayici</div>

      <div className="cc-screener-filter-row">
        {FILTER_CHIPS.map((chip) => (
          <button key={chip.id} type="button"
            className={cn("cc-screener-chip", activeFilter === chip.id && "cc-screener-chip--active")}
            onClick={() => setActiveFilter(chip.id)} aria-pressed={activeFilter === chip.id}>
            {chip.label}
          </button>
        ))}
      </div>

      <div ref={vt.scrollRef} className={cn("cc-screener-table-wrap", vt.enabled && "mkt-vt-scroll")} style={vt.scrollStyle}>
        <table className="cc-screener-table" aria-label="NASDAQ hisseler" style={{ minWidth: 800 }}>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)",
                cursor: "pointer", color: sortKey === "rank" ? "#06b6d4" : undefined }}
                onClick={() => handleSort("rank")}>#</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Hisse</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Fiyat</th>
              <SortTh label="Gun %" k="changeDay" />
              <SortTh label="Hafta %" k="changeWeek" />
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Piyasa Degeri</th>
              <SortTh label="F/K" k="pe" />
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Grafik</th>
            </tr>
          </thead>
          <tbody className="cc-screener-tbody" style={vt.tbodyStyle}>
            {tableRows}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ScreenerRow = memo(function ScreenerRow({ asset }: { asset: NasdaqScreenerAsset }) {
  const isFeatured = asset.symbol === "NVDA";
  const href = `/markets/${encodeURIComponent(asset.symbol)}`;

  return (
    <tr className={isFeatured ? "cc-screener-row--featured" : undefined}>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-rank">{asset.rank}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol" style={{ color: isFeatured ? "#06b6d4" : undefined }}>{asset.symbol}</span>
            </Link>
            <span className="nq-sector-chip">{SECTOR_LABEL[asset.sector]}</span>
          </div>
          <span className="cc-screener-name">{asset.name}</span>
        </div>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-price">{fmtPrice(asset.price)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeDay) }}>{signed(asset.changeDay)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeWeek) }}>{signed(asset.changeWeek)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-mcap">{asset.marketCap}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className={peBadgeClass(asset.pe)}>
          {asset.pe !== null ? asset.pe.toFixed(1) : "—"}
        </span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ width: 72 }}>
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={32} className="w-[72px]" />
        </div>
      </td>
    </tr>
  );
});
