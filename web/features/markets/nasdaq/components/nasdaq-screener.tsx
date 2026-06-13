"use client";

import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import { NasdaqScreenerRowActions } from "@/features/markets/nasdaq/components/nasdaq-screener-row-actions";
import type {
  NasdaqScreenerAsset,
  NasdaqScreenerCategory,
  NasdaqScreenerPayload,
} from "@/features/markets/nasdaq/types";
import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = {
  screener: NasdaqScreenerPayload;
  isWatched?: (symbol: string) => boolean;
  onToggleWatch?: (symbol: string) => void;
  watchPending?: string | null;
};

type SortKey = "rank" | "changeDay" | "changeWeek" | "pe" | "marketCap";
type FilterId = "all" | NasdaqScreenerCategory;

type ScreenerRowAsset = NasdaqScreenerAsset & { displayRank: number };

const ANCHOR_SYMBOLS = new Set(["NVDA", "AAPL", "MSFT", "AMZN", "META"]);

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "ai-tech", label: "AI & Tech" },
  { id: "yariletken", label: "Yarıiletken" },
  { id: "cloud", label: "Cloud" },
  { id: "biotech", label: "Biotech" },
  { id: "diger", label: "Diğer" },
];

const SECTOR_LABEL: Record<NasdaqScreenerCategory, string> = {
  "ai-tech": "AI & Tech",
  yariletken: "Yarıiletken",
  cloud: "Cloud",
  biotech: "Biotech",
  software: "Yazılım",
  media: "Medya",
  diger: "Diğer",
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
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

function sortValue(asset: NasdaqScreenerAsset, key: SortKey): number {
  switch (key) {
    case "rank":
      return asset.rank;
    case "changeDay":
      return asset.changeDay;
    case "changeWeek":
      return asset.changeWeek;
    case "pe":
      return asset.pe ?? 9999;
    case "marketCap":
      return parseVolumeLabel(asset.marketCap ?? "0");
    default:
      return 0;
  }
}

function anchorClass(symbol: string): string | undefined {
  const key = symbol.toUpperCase();
  if (key === "NVDA") return "nq-screener-row--nvda";
  if (key === "AAPL") return "nq-screener-row--aapl";
  if (key === "MSFT") return "nq-screener-row--msft";
  return undefined;
}

export function NasdaqScreenerBoard({ screener, isWatched, onToggleWatch, watchPending }: Props) {
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
        : screener.assets.filter((a) => a.sector === activeFilter);

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
    <div className="cc-screener cc-section nq-screener-board" role="region" aria-label="NASDAQ hisse tarayıcı">
      <div className="cc-zone-label">NASDAQ Hisse Tarayıcı</div>

      <div className="cc-screener-filter-row" role="group" aria-label="Sektör filtresi">
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
        <table className="cc-screener-table nq-screener-table" aria-label="NASDAQ hisseler">
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
              <th className="cc-screener-thead-th cc-screener-th--left">Hisse</th>
              <th className="cc-screener-thead-th cc-screener-th--right">Fiyat</th>
              <SortTh label="Gün %" k="changeDay" />
              <SortTh label="Hafta %" k="changeWeek" />
              <SortTh label="Piyasa Değeri" k="marketCap" />
              <SortTh label="F/K" k="pe" />
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

/** @deprecated NasdaqScreenerBoard kullanın */
export const NasdaqScreener = NasdaqScreenerBoard;

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
  const isFeatured = ANCHOR_SYMBOLS.has(asset.symbol.toUpperCase());
  const showActions = Boolean(onToggleWatch && isWatched);

  return (
    <tr className={cn(isFeatured && "cc-screener-row--featured", anchorClass(asset.symbol))}>
      <td className="cc-screener-td cc-screener-td--rank">
        <span className="cc-screener-rank">{asset.displayRank}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--asset">
        <div className="cc-screener-symbol-cell nq-screener-symbol-cell">
          <span className="nq-screener-symbol-badge">{asset.symbol.slice(0, 2)}</span>
          <div className="cc-screener-symbol-copy">
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol">{asset.symbol}</span>
            </Link>
            <span className="nq-screener-sector">{SECTOR_LABEL[asset.sector]}</span>
          </div>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-price">{fmtPrice(asset.price)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changeDay))}>{signed(asset.changeDay)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.changeWeek))}>{signed(asset.changeWeek)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-mcap">{asset.marketCap}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={peBadgeClass(asset.pe)}>
          {asset.pe !== null ? asset.pe.toFixed(1) : "—"}
        </span>
      </td>
      <td className="cc-screener-td cc-screener-td--spark">
        <div className="cc-screener-spark">
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={32} className="w-[72px]" />
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--actions">
        {showActions ? (
          <NasdaqScreenerRowActions
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
