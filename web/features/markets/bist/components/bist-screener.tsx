"use client";

import Link from "next/link";
import { memo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { BistScreenerAsset, BistScreenerPayload } from "@/features/markets/bist/types";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = { screener: BistScreenerPayload };

type SortKey = "rank" | "changeDay" | "changeWeek" | "volume" | "marketCap";

const FILTER_CHIPS = [
  { id: "all",        label: "Tumu" },
  { id: "bankacilik", label: "Bankacilik" },
  { id: "holding",    label: "Holding" },
  { id: "sanayi",     label: "Sanayi" },
  { id: "ulasim",     label: "Ulasim" },
  { id: "enerji",     label: "Enerji" },
] as const;

type FilterId = (typeof FILTER_CHIPS)[number]["id"];

const FILTER_MAP: Record<FilterId, string[]> = {
  all:        [],
  bankacilik: ["GARAN", "ISCTR", "AKBNK", "YKBNK"],
  holding:    ["KCHOL", "SAHOL", "DOHOL"],
  sanayi:     ["EREGL", "ARCLK", "VESTL"],
  ulasim:     ["THYAO", "TOASO", "FROTO"],
  enerji:     ["TUPRS", "ODAS"],
};

function fmtTL(n: number) {
  if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function parseVol(s: string) {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (s.includes("TRL")) return n * 1e12;
  if (s.includes("MLRD")) return n * 1e9;
  if (s.includes("MLN")) return n * 1e6;
  return n;
}

export function BistScreener({ screener }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(key === "rank" ? 1 : -1); }
  }

  const filtered = activeFilter === "all"
    ? screener.assets
    : screener.assets.filter((a) => FILTER_MAP[activeFilter].includes(a.symbol));

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    switch (sortKey) {
      case "rank":       av = a.rank;                    bv = b.rank;                    break;
      case "changeDay":  av = a.changeDay;               bv = b.changeDay;               break;
      case "changeWeek": av = a.changeWeek;              bv = b.changeWeek;              break;
      case "volume":     av = parseVol(a.volume);        bv = parseVol(b.volume);        break;
      case "marketCap":  av = parseVol(a.marketCap);     bv = parseVol(b.marketCap);     break;
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
      <th
        style={{
          color: active ? "var(--cc-gold)" : undefined,
          cursor: "pointer",
          userSelect: "none",
          textAlign: "right",
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          borderBottom: "1px solid var(--cc-border-subtle)",
          whiteSpace: "nowrap",
        }}
        onClick={() => handleSort(k)}
        aria-sort={active ? (sortDir === 1 ? "ascending" : "descending") : "none"}
      >
        {label}{active ? (sortDir === 1 ? " ↑" : " ↓") : ""}
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section" role="region" aria-label="BIST tarayici">
      <div className="cc-zone-label">
        BIST Tarama
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--cc-meta)", fontWeight: 500 }}>
          Son guncelleme: 17:40:12
        </span>
      </div>

      {/* Filter chips */}
      <div className="cc-screener-filter-row" role="group" aria-label="Sektor filtresi">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={cn("cc-screener-chip", activeFilter === chip.id && "cc-screener-chip--active")}
            onClick={() => setActiveFilter(chip.id)}
            aria-pressed={activeFilter === chip.id}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div ref={vt.scrollRef} className={cn("cc-screener-table-wrap", vt.enabled && "mkt-vt-scroll")} style={vt.scrollStyle}>
        <table className="cc-screener-table" aria-label="BIST hisseleri">
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <th style={{ textAlign: "left", cursor: "pointer", userSelect: "none", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: sortKey === "rank" ? "var(--cc-gold)" : undefined }}
                onClick={() => handleSort("rank")}>#</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Senet / Sirket</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Fiyat (TL)</th>
              <SortTh label="Gunluk %" k="changeDay" />
              <SortTh label="Haftalik %" k="changeWeek" />
              <SortTh label="Hacim" k="volume" />
              <SortTh label="Piyasa Degeri" k="marketCap" />
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Grafik</th>
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

const ScreenerRow = memo(function ScreenerRow({ asset }: { asset: BistScreenerAsset }) {
  const href = `/markets/${encodeURIComponent(asset.symbol)}`;
  const isFeatured = asset.rank === 1;

  return (
    <tr className={isFeatured ? "cc-screener-row--featured" : undefined}>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-rank">{asset.rank}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol">{asset.symbol}</span>
            </Link>
            <span className="bc-screener-sector">{asset.sector}</span>
          </div>
          <span className="cc-screener-name">{asset.name}</span>
        </div>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-price">{fmtTL(asset.price)}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeDay) }}>
          {signed(asset.changeDay)}
        </span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changeWeek) }}>
          {signed(asset.changeWeek)}
        </span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-vol">{asset.volume}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-mcap">{asset.marketCap}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div className="cc-screener-spark">
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={32} className="w-[72px]" />
        </div>
      </td>
    </tr>
  );
});
