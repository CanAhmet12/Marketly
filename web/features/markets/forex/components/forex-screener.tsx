"use client";

import { memo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { ForexScreenerAsset, ForexScreenerPayload } from "@/features/markets/forex/types";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = { screener: ForexScreenerPayload };

type SortKey = "rank" | "changePct" | "pipChange" | "spread";
type FilterId = "all" | "major" | "minor" | "exotic" | "try";

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all",    label: "Tumu" },
  { id: "major",  label: "Major" },
  { id: "minor",  label: "Minor" },
  { id: "exotic", label: "Egzotik" },
  { id: "try",    label: "TRY Pariteleri" },
];

const SESSION_BADGE_CLASS: Record<string, string> = {
  LDN:    "fc-session-badge fc-session-badge--active",
  NY:     "fc-session-badge fc-session-badge--active",
  TKY:    "fc-session-badge fc-session-badge--active",
  ALL:    "fc-session-badge fc-session-badge--active",
  CLOSED: "fc-session-badge fc-session-badge--closed",
};

const SESSION_LABEL: Record<string, string> = {
  LDN: "LDN", NY: "NY", TKY: "TKY", ALL: "ALL", CLOSED: "Kapali",
};

function signed(v: number) { return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`; }
function signedPip(v: number) { return `${v > 0 ? "+" : ""}${v}`; }
function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)"; if (v < 0) return "var(--cc-rose)"; return "var(--cc-meta)";
}
function fmtRate(n: number, pair: string) {
  if (pair.includes("JPY")) return n.toFixed(2);
  if (pair.includes("TRY") || pair.includes("MXN") || pair.includes("ZAR")) return n.toFixed(4);
  return n.toFixed(4);
}

export function ForexScreener({ screener }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(key === "rank" ? 1 : -1); }
  }

  const filtered = activeFilter === "all"     ? screener.assets :
                   activeFilter === "try"      ? screener.assets.filter((a) => a.pair.includes("TRY")) :
                   screener.assets.filter((a) => a.category === activeFilter);

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    switch (sortKey) {
      case "rank":      av = a.rank;       bv = b.rank;       break;
      case "changePct": av = a.changePct;  bv = b.changePct;  break;
      case "pipChange": av = a.pipChange;  bv = b.pipChange;  break;
      case "spread":    av = a.spread;     bv = b.spread;     break;
      default: return 0;
    }
    return (av - bv) * sortDir;
  });

  const vt = useVirtualTableRows({ count: sorted.length, rowHeight: MARKETS_SCREENER_ROW_HEIGHT });
  const tableRows = renderVirtualTableRows({
    items: sorted,
    vt,
    getKey: (a) => a.pair,
    renderRow: (asset) => <ScreenerRow asset={asset} />,
  });

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th onClick={() => handleSort(k)} style={{ cursor: "pointer", userSelect: "none", textAlign: "right",
        padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        borderBottom: "1px solid var(--cc-border-subtle)", whiteSpace: "nowrap", color: active ? "#8b5cf6" : undefined }}>
        {label}{active ? (sortDir === 1 ? " ↑" : " ↓") : ""}
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section" role="region" aria-label="FX parite tarayici">
      <div className="cc-zone-label">FX Parite Tarayici</div>

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
        <table className="cc-screener-table" aria-label="Forex pariteleri" style={{ minWidth: 780 }}>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: sortKey === "rank" ? "#8b5cf6" : undefined,
                cursor: "pointer" }} onClick={() => handleSort("rank")}>#</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Parite</th>
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Bid / Ask</th>
              <SortTh label="Spread" k="spread" />
              <SortTh label="Pip Degisim" k="pipChange" />
              <SortTh label="24s %" k="changePct" />
              <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)", whiteSpace: "nowrap" }}>Gun Araligi</th>
              <th style={{ textAlign: "center", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", borderBottom: "1px solid var(--cc-border-subtle)", color: "var(--cc-meta)" }}>Seans</th>
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

const ScreenerRow = memo(function ScreenerRow({ asset }: { asset: ForexScreenerAsset }) {
  const isFeatured = asset.pair === "EUR/USD";
  const isActive = asset.session !== "CLOSED";

  return (
    <tr className={isFeatured ? "cc-screener-row--featured" : undefined}>
      <td style={{ padding: "10px 12px" }}>
        <span className="cc-screener-rank">{asset.rank}</span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="cc-screener-symbol" style={{ color: isFeatured ? "#8b5cf6" : undefined }}>
            {asset.pair}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
            background: "rgba(255,255,255,0.04)", color: "var(--cc-meta)", width: "fit-content",
            textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {asset.category === "major" ? "Major" : asset.category === "minor" ? "Minor" : "Egzotik"}
          </span>
        </div>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div className="fc-bid-ask">
          <span className="fc-bid">{fmtRate(asset.bid, asset.pair)}</span>
          <span className="fc-ask">{fmtRate(asset.ask, asset.pair)}</span>
        </div>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="fc-spread">{asset.spread.toFixed(1)}</span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.pipChange) }}>
          {signedPip(asset.pipChange)}
        </span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span className="cc-screener-change" style={{ color: changeColor(asset.changePct) }}>
          {signed(asset.changePct)}
        </span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span style={{ fontSize: 11, color: "var(--cc-text-secondary)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {fmtRate(asset.dayLow, asset.pair)} – {fmtRate(asset.dayHigh, asset.pair)}
        </span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        <span className={SESSION_BADGE_CLASS[asset.session] ?? "fc-session-badge fc-session-badge--closed"}>
          {SESSION_LABEL[asset.session] ?? asset.session}
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
