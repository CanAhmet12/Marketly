"use client";

import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import { ForexScreenerRowActions } from "@/features/markets/forex/components/forex-screener-row-actions";
import type { ForexScreenerAsset, ForexScreenerPayload } from "@/features/markets/forex/types";
import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = {
  screener: ForexScreenerPayload;
  isWatched?: (symbol: string) => boolean;
  onToggleWatch?: (symbol: string) => void;
  watchPending?: string | null;
};

type SortKey = "rank" | "changePct" | "pipChange" | "spread" | "volume";
type FilterId = "all" | "major" | "minor" | "exotic" | "try";

type ScreenerRowAsset = ForexScreenerAsset & { displayRank: number };

const ANCHOR_PAIRS = new Set(["EUR/USD", "GBP/USD", "USD/JPY"]);

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "exotic", label: "Egzotik" },
  { id: "try", label: "TRY Pariteleri" },
];

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function signedPip(v: number) {
  return `${v > 0 ? "+" : ""}${Math.round(v)}`;
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

function fmtRate(n: number, pair: string) {
  if (!n) return "—";
  return formatForexTickerPrice(n, pair.replace("/", ""));
}

function sortValue(asset: ForexScreenerAsset, key: SortKey): number {
  switch (key) {
    case "rank":
      return asset.rank;
    case "changePct":
      return asset.changePct;
    case "pipChange":
      return asset.pipChange;
    case "spread":
      return asset.spread;
    case "volume":
      return parseVolumeLabel(asset.volume ?? "0");
    default:
      return 0;
  }
}

export function ForexScreenerBoard({ screener, isWatched, onToggleWatch, watchPending }: Props) {
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

  const sorted = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? screener.assets
        : activeFilter === "try"
          ? screener.assets.filter((a) => a.pair.includes("TRY"))
          : screener.assets.filter((a) => a.category === activeFilter);

    return [...filtered]
      .sort((a, b) => (sortValue(a, sortKey) - sortValue(b, sortKey)) * sortDir)
      .map((asset, index) => ({ ...asset, displayRank: index + 1 }));
  }, [activeFilter, screener.assets, sortDir, sortKey]);

  const vt = useVirtualTableRows({
    count: sorted.length,
    rowHeight: MARKETS_SCREENER_ROW_HEIGHT,
  });

  const tableRows = renderVirtualTableRows({
    items: sorted,
    vt,
    getKey: (a) => a.symbol,
    renderRow: (asset) => (
      <ScreenerRow
        asset={asset}
        isWatched={isWatched}
        onToggleWatch={onToggleWatch}
        watchPending={watchPending}
      />
    ),
  });

  function SortTh({ label, k, align = "right" }: { label: string; k: SortKey; align?: "left" | "right" }) {
    const active = sortKey === k;
    return (
      <th
        className={cn(
          "cc-screener-thead-th cc-screener-th--sortable",
          align === "left" ? "cc-screener-th--left" : "cc-screener-th--right",
          active && "cc-screener-th--active",
        )}
        onClick={() => handleSort(k)}
        aria-sort={active ? (sortDir === 1 ? "ascending" : "descending") : "none"}
      >
        <span className="cc-screener-th-label">
          {label}
          {active ? (
            <span className="cc-screener-th-sort" aria-hidden>
              {sortDir === 1 ? "↑" : "↓"}
            </span>
          ) : null}
        </span>
      </th>
    );
  }

  return (
    <div className="cc-screener cc-section fc-screener-board" role="region" aria-label="FX parite tarayıcı">
      <div className="cc-zone-label">FX Parite Tarayıcı</div>

      <div className="cc-screener-filter-row" role="group" aria-label="Parite filtresi">
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

      <div
        ref={vt.scrollRef}
        className={cn("cc-screener-table-wrap", vt.enabled && "mkt-vt-scroll")}
        style={vt.scrollStyle}
      >
        <table className="cc-screener-table fc-screener-table" aria-label="Forex pariteleri">
          <colgroup>
            <col className="cc-screener-col-rank" />
            <col className="cc-screener-col-asset" />
            <col className="cc-screener-col-price" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-vol" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-spark" />
            <col className="cc-screener-col-actions" />
          </colgroup>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <SortTh label="#" k="rank" align="left" />
              <th className="cc-screener-thead-th cc-screener-th--left">Parite</th>
              <th className="cc-screener-thead-th cc-screener-th--right">Bid / Ask</th>
              <SortTh label="Spread" k="spread" />
              <SortTh label="Pip" k="pipChange" />
              <SortTh label="24s %" k="changePct" />
              <SortTh label="Hacim" k="volume" />
              <th className="cc-screener-thead-th cc-screener-th--right">Grafik</th>
              <th className="cc-screener-thead-th cc-screener-th--right cc-screener-thead-th--actions">
                İşlem
              </th>
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

/** @deprecated ForexScreenerBoard kullanın */
export const ForexScreener = ForexScreenerBoard;

const ScreenerRow = memo(function ScreenerRow({
  asset,
  isWatched,
  onToggleWatch,
  watchPending,
}: {
  asset: ScreenerRowAsset;
  isWatched?: (symbol: string) => boolean;
  onToggleWatch?: (symbol: string) => void;
  watchPending?: string | null;
}) {
  const href = `/markets/${encodeURIComponent(asset.symbol)}`;
  const isAnchor = ANCHOR_PAIRS.has(asset.pair);
  const showActions = Boolean(onToggleWatch && isWatched);
  const anchorClass =
    asset.pair === "EUR/USD"
      ? "fc-screener-row--eur"
      : asset.pair === "GBP/USD"
        ? "fc-screener-row--gbp"
        : asset.pair === "USD/JPY"
          ? "fc-screener-row--jpy"
          : undefined;

  return (
    <tr className={cn(isAnchor && "cc-screener-row--featured", anchorClass)}>
      <td className="cc-screener-td cc-screener-td--rank">
        <span className="cc-screener-rank">{asset.displayRank}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--asset">
        <div className="cc-screener-symbol-cell fc-screener-symbol-cell">
          <span className="fc-screener-pair-badge">{asset.pair.split("/")[0]}</span>
          <div className="cc-screener-symbol-copy">
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol">{asset.pair}</span>
            </Link>
            <span className="cc-screener-name fc-screener-category">
              {asset.category === "major" ? "Major" : asset.category === "minor" ? "Minor" : "Egzotik"}
            </span>
          </div>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <div className="fc-bid-ask">
          <span className="fc-bid">{fmtRate(asset.bid, asset.pair)}</span>
          <span className="fc-ask">{fmtRate(asset.ask, asset.pair)}</span>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="fc-spread">{asset.spread.toFixed(1)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.pipChange))}>
          {signedPip(asset.pipChange)}
        </span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changePct))}>
          {signed(asset.changePct)}
        </span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-vol">{asset.volume ?? "—"}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--spark">
        <div className="cc-screener-spark">
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={32} className="w-[72px]" />
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--actions">
        {showActions ? (
          <ForexScreenerRowActions
            symbol={asset.symbol}
            pair={asset.pair}
            watched={isWatched!(asset.symbol)}
            pending={watchPending === asset.symbol}
            onToggleWatch={onToggleWatch!}
          />
        ) : (
          <Link href={href} className="cc-screener-btn cc-screener-btn--pill cc-screener-btn--primary">
            Detay
          </Link>
        )}
      </td>
    </tr>
  );
});
