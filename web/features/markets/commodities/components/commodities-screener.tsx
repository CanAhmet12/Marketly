"use client";

import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import { CommoditiesScreenerRowActions } from "@/features/markets/commodities/components/commodities-screener-row-actions";
import { formatCommodityTickerPrice } from "@/features/markets/commodities/lib/map-commodity-tickers";
import type { CommodityCategory, CommodityScreenerAsset, CommodityScreenerPayload } from "@/features/markets/commodities/types";
import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = {
  screener: CommodityScreenerPayload;
  isWatched?: (symbol: string) => boolean;
  onToggleWatch?: (symbol: string) => void;
  watchPending?: string | null;
};

type SortKey = "rank" | "changeDay" | "changeWeek" | "changeMonth" | "volume";
type FilterId = "all" | CommodityCategory;

type ScreenerRowAsset = CommodityScreenerAsset & { displayRank: number };

const ANCHOR_SYMBOLS = new Set(["ALTIN", "XAU", "XAUUSD", "GUMUS", "XAG", "XAGUSD", "WTI"]);

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "degerli-metal", label: "Değerli Metaller" },
  { id: "enerji", label: "Enerji" },
  { id: "tarim", label: "Tarım" },
  { id: "endustri", label: "Endüstri" },
];

const CATEGORY_LABEL: Record<CommodityCategory, string> = {
  "degerli-metal": "Değerli",
  enerji: "Enerji",
  tarim: "Tarım",
  endustri: "Endüstri",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

function fmtPrice(n: number, symbol: string, unit: string) {
  if (!n) return "—";
  if (unit === "c/bu") return `${n.toFixed(0)}¢`;
  return formatCommodityTickerPrice(n, symbol);
}

function sortValue(asset: CommodityScreenerAsset, key: SortKey): number {
  switch (key) {
    case "rank":
      return asset.rank;
    case "changeDay":
      return asset.changeDay;
    case "changeWeek":
      return asset.changeWeek;
    case "changeMonth":
      return asset.changeMonth;
    case "volume":
      return parseVolumeLabel(asset.volume ?? "0");
    default:
      return 0;
  }
}

function anchorClass(symbol: string): string | undefined {
  const key = symbol.toUpperCase();
  if (key.includes("XAU") || key === "ALTIN") return "cm-screener-row--gold";
  if (key.includes("XAG") || key === "GUMUS" || key === "GÜMÜŞ") return "cm-screener-row--silver";
  if (key.includes("WTI") || key === "PETROL") return "cm-screener-row--oil";
  return undefined;
}

export function CommoditiesScreenerBoard({ screener, isWatched, onToggleWatch, watchPending }: Props) {
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
    <div className="cc-screener cc-section cm-screener-board" role="region" aria-label="Emtia tarayıcı">
      <div className="cc-zone-label">Emtia Tarayıcı</div>

      <div className="cc-screener-filter-row" role="group" aria-label="Emtia filtresi">
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
        <table className="cc-screener-table cm-screener-table" aria-label="Emtia listesi">
          <colgroup>
            <col className="cc-screener-col-rank" />
            <col className="cc-screener-col-asset" />
            <col className="cc-screener-col-price" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-vol" />
            <col className="cc-screener-col-spark" />
            <col className="cc-screener-col-actions" />
          </colgroup>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <SortTh label="#" k="rank" align="left" />
              <th className="cc-screener-thead-th cc-screener-th--left">Emtia</th>
              <th className="cc-screener-thead-th cc-screener-th--right">Fiyat</th>
              <SortTh label="Gün %" k="changeDay" />
              <SortTh label="Hafta %" k="changeWeek" />
              <SortTh label="Ay %" k="changeMonth" />
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

/** @deprecated CommoditiesScreenerBoard kullanın */
export const CommoditiesScreener = CommoditiesScreenerBoard;

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
  const isAnchor = ANCHOR_SYMBOLS.has(asset.symbol.toUpperCase());
  const showActions = Boolean(onToggleWatch && isWatched);

  return (
    <tr className={cn(isAnchor && "cc-screener-row--featured", anchorClass(asset.symbol))}>
      <td className="cc-screener-td cc-screener-td--rank">
        <span className="cc-screener-rank">{asset.displayRank}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--asset">
        <div className="cc-screener-symbol-cell cm-screener-symbol-cell">
          <span className="cm-screener-symbol-badge">{asset.symbol.slice(0, 2)}</span>
          <div className="cc-screener-symbol-copy">
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol">{asset.symbol}</span>
            </Link>
            <span className="cc-screener-name cm-screener-category">{CATEGORY_LABEL[asset.category]}</span>
          </div>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <div className="cm-screener-price-cell">
          <span className="cc-screener-price">{fmtPrice(asset.price, asset.symbol, asset.unit)}</span>
          <span className="cm-unit-badge">{asset.unit}</span>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changeDay))}>{signed(asset.changeDay)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changeWeek))}>{signed(asset.changeWeek)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changeMonth))}>{signed(asset.changeMonth)}</span>
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
          <CommoditiesScreenerRowActions
            symbol={asset.symbol}
            name={asset.name}
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
