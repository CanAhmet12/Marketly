"use client";

import { memo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { CommodityCategory, CommodityScreenerAsset, CommodityScreenerPayload } from "@/features/markets/commodities/types";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = { screener: CommodityScreenerPayload };

type SortKey = "rank" | "changeDay" | "changeWeek" | "changeMonth";
type FilterId = "all" | CommodityCategory;

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all",           label: "Tumu" },
  { id: "degerli-metal", label: "Degerli Metaller" },
  { id: "enerji",        label: "Enerji" },
  { id: "tarim",         label: "Tarim" },
  { id: "endustri",      label: "Endustri" },
];

const CATEGORY_LABEL: Record<string, string> = {
  "degerli-metal": "Degerli",
  "enerji":        "Enerji",
  "tarim":         "Tarim",
  "endustri":      "Endustri",
};

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)"; if (v < 0) return "var(--cc-rose)"; return "var(--cc-meta)";
}
function fmtPrice(n: number) {
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 100) return n.toFixed(1);
  return n.toFixed(3);
}

export function CommoditiesScreener({ screener }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(key === "rank" ? 1 : -1); }
  }

  const filtered = activeFilter === "all" ? screener.assets
    : screener.assets.filter((a) => a.category === activeFilter);

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    switch (sortKey) {
      case "rank":        av = a.rank;         bv = b.rank;         break;
      case "changeDay":   av = a.changeDay;    bv = b.changeDay;    break;
      case "changeWeek":  av = a.changeWeek;   bv = b.changeWeek;   break;
      case "changeMonth": av = a.changeMonth;  bv = b.changeMonth;  break;
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
        padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        borderBottom: "1px solid var(--cc-border-subtle)", whiteSpace: "nowrap", color: active ? "#f97316" : undefined }}>
        {label}{active ? (sortDir === 1 ? " ↑" : " ↓") : ""}
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section" role="region" aria-label="Emtia tarayici">
      <div className="cc-zone-label">Emtia Tarayici</div>

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
        <table className="cc-screener-table" aria-label="Emtia listesi" style={{ minWidth: 780 }}>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)",
                cursor: "pointer", color: sortKey === "rank" ? "#f97316" : undefined }}
                onClick={() => handleSort("rank")}>#</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Emtia</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Fiyat</th>
              <th style={{ textAlign: "center", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Birim</th>
              <SortTh label="Gun %" k="changeDay" />
              <SortTh label="Hafta %" k="changeWeek" />
              <SortTh label="Ay %" k="changeMonth" />
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Hacim</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
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

const ScreenerRow = memo(function ScreenerRow({ asset }: { asset: CommodityScreenerAsset }) {
  const isFeatured = asset.symbol === "ALTIN";
  const catLabel = { "degerli-metal": "Degerli", "enerji": "Enerji", "tarim": "Tarim", "endustri": "Endustri" }[asset.category];

  return (
    <tr className={isFeatured ? "cc-screener-row--featured" : undefined}>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-rank">{asset.rank}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cc-screener-symbol" style={{ color: isFeatured ? "#f97316" : undefined }}>{asset.symbol}</span>
            <span className="cm-unit-badge">{catLabel}</span>
          </div>
          <span className="cc-screener-name">{asset.name}</span>
        </div>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-price">{fmtPrice(asset.price)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        <span className="cm-unit-badge">{asset.unit}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeDay) }}>{signed(asset.changeDay)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeWeek) }}>{signed(asset.changeWeek)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeMonth) }}>{signed(asset.changeMonth)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-vol">{asset.volume}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ width: 72 }}>
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={32} className="w-[72px]" />
        </div>
      </td>
    </tr>
  );
});
