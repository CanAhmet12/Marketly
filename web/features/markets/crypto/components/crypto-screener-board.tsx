"use client";

import Link from "next/link";
import { memo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { CryptoScreenerAsset, CryptoScreenerPayload } from "@/features/markets/crypto/types";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = {
  screener: CryptoScreenerPayload;
};

type SortKey = "rank" | "change24h" | "change7d" | "marketCap" | "volume24h";

function signedChange(v: number) {
  const s = v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function changeColor(v: number): string {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function formatPrice(n: number): string {
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)     return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
}

function parseMcap(s: string): number {
  const n = parseFloat(s.replace(/[$,]/g, ""));
  if (s.includes("T")) return n * 1e12;
  if (s.includes("B")) return n * 1e9;
  if (s.includes("M")) return n * 1e6;
  return n;
}

const FILTER_CHIPS = [
  { id: "all",   label: "Tümü" },
  { id: "l1",    label: "Layer 1" },
  { id: "defi",  label: "DeFi" },
  { id: "l2",    label: "Layer 2" },
  { id: "meme",  label: "Meme" },
  { id: "stablecoin", label: "Stablecoin" },
] as const;

type FilterId = (typeof FILTER_CHIPS)[number]["id"];

const FILTER_SYMBOLS: Record<FilterId, string[]> = {
  all: [],
  l1:  ["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX", "NEAR", "TIA", "SUI"],
  defi: ["UNI", "LINK", "INJ", "ARB", "OP"],
  l2:  ["ARB", "OP"],
  meme: ["DOGE", "SHIB", "PEPE"],
  stablecoin: ["USDC"],
};

export function CryptoScreenerBoard({ screener }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? 1 : -1);
    }
  }

  const filtered = activeFilter === "all"
    ? screener.assets
    : screener.assets.filter((a) =>
        FILTER_SYMBOLS[activeFilter].includes(a.symbol),
      );

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    switch (sortKey) {
      case "rank":      av = a.rank;            bv = b.rank;            break;
      case "change24h": av = a.change24h;       bv = b.change24h;       break;
      case "change7d":  av = a.change7d;        bv = b.change7d;        break;
      case "marketCap": av = parseMcap(a.marketCap); bv = parseMcap(b.marketCap); break;
      case "volume24h": av = parseMcap(a.volume24h); bv = parseMcap(b.volume24h); break;
      default:          return 0;
    }
    return (av - bv) * sortDir;
  });

  const vt = useVirtualTableRows({
    count: sorted.length,
    rowHeight: MARKETS_SCREENER_ROW_HEIGHT,
  });

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
        className="cc-screener-thead-th"
        style={{
          color: active ? "var(--cc-gold)" : undefined,
          cursor: "pointer",
          userSelect: "none",
          textAlign: k === "rank" ? "left" : "right",
        }}
        onClick={() => handleSort(k)}
        aria-sort={active ? (sortDir === 1 ? "ascending" : "descending") : "none"}
      >
        {label}
        {active && (
          <span style={{ marginLeft: 3, opacity: 0.7 }}>
            {sortDir === 1 ? "↑" : "↓"}
          </span>
        )}
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section" role="region" aria-label="Kripto tarayıcı">
      {/* Header */}
      <div className="cc-zone-label">Kripto tarayıcı</div>

      {/* Filter chips */}
      <div className="cc-screener-filter-row" role="group" aria-label="Segment filtresi">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={cn(
              "cc-screener-chip",
              activeFilter === chip.id && "cc-screener-chip--active",
            )}
            onClick={() => setActiveFilter(chip.id)}
            aria-pressed={activeFilter === chip.id}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        ref={vt.scrollRef}
        className={cn("cc-screener-table-wrap", vt.enabled && "mkt-vt-scroll")}
        style={vt.scrollStyle}
      >
        <table className="cc-screener-table" aria-label="Kripto varlıklar">
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <th
                className="cc-screener-thead-th"
                style={{ textAlign: "left", cursor: "pointer", userSelect: "none", color: sortKey === "rank" ? "var(--cc-gold)" : undefined }}
                onClick={() => handleSort("rank")}
              >
                #
              </th>
              <th className="cc-screener-thead-th" style={{ textAlign: "left" }}>Varlık</th>
              <th className="cc-screener-thead-th" style={{ textAlign: "right" }}>Fiyat</th>
              <SortTh label="24s %" k="change24h" />
              <SortTh label="7g %"  k="change7d" />
              <SortTh label="Piyasa Değeri" k="marketCap" />
              <SortTh label="24s Hacim"     k="volume24h" />
              <th className="cc-screener-thead-th" style={{ textAlign: "right" }}>7g Grafik</th>
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

const ScreenerRow = memo(function ScreenerRow({ asset }: { asset: CryptoScreenerAsset }) {
  const href = `/markets/${encodeURIComponent(asset.symbol)}`;
  const isBtc = asset.symbol === "BTC";

  return (
    <tr className={isBtc ? "cc-screener-row--btc" : undefined}>
      <td>
        <span className="cc-screener-rank">{asset.rank}</span>
      </td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Link href={href} className="cc-screener-symbol-link">
            <span className="cc-screener-symbol">{asset.symbol}</span>
          </Link>
          <span className="cc-screener-name">{asset.name}</span>
        </div>
      </td>
      <td>
        <span className="cc-screener-price">${formatPrice(asset.price)}</span>
      </td>
      <td>
        <span
          className="cc-screener-change"
          style={{ color: changeColor(asset.change24h) }}
        >
          {signedChange(asset.change24h)}
        </span>
      </td>
      <td>
        <span
          className="cc-screener-change"
          style={{ color: changeColor(asset.change7d) }}
        >
          {signedChange(asset.change7d)}
        </span>
      </td>
      <td>
        <span className="cc-screener-mcap">{asset.marketCap}</span>
      </td>
      <td>
        <span className="cc-screener-vol">{asset.volume24h}</span>
      </td>
      <td>
        <div className="cc-screener-spark">
          <MiniSparkline
            series={asset.sparkline}
            trend={asset.trend}
            height={32}
            className="w-[72px]"
          />
        </div>
      </td>
    </tr>
  );
});
