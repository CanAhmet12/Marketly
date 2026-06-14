"use client";

import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import { CryptoScreenerRowActions } from "@/features/markets/crypto/components/crypto-screener-row-actions";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import type { CryptoScreenerAsset, CryptoScreenerPayload } from "@/features/markets/crypto/types";
import { parseVolumeLabel } from "@/features/markets/lib/live-category/parse-volume-label";
import { MARKETS_SCREENER_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { cn } from "@/lib/cn";

type Props = {
  screener: CryptoScreenerPayload;
  isWatched?: (symbol: string) => boolean;
  onToggleWatch?: (symbol: string) => void;
  watchPending?: string | null;
};

type SortKey = "rank" | "change24h" | "change7d" | "marketCap" | "volume24h";

type ScreenerRowAsset = CryptoScreenerAsset & { displayRank: number };

const ANCHOR_SYMBOLS = new Set(["BTC", "ETH", "SOL"]);

function signedChange(v: number) {
  const s = v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function changeClass(v: number): string {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
}

function formatPrice(n: number): string {
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
}

function sortValue(asset: CryptoScreenerAsset, key: SortKey): number {
  switch (key) {
    case "rank":
      return asset.rank;
    case "change24h":
      return asset.change24h;
    case "change7d":
      return asset.change7d;
    case "marketCap":
      return parseVolumeLabel(asset.marketCap);
    case "volume24h":
      return parseVolumeLabel(asset.volume24h);
    default:
      return 0;
  }
}

const FILTER_CHIPS = [
  { id: "all", label: "Tümü" },
  { id: "l1", label: "Layer 1" },
  { id: "defi", label: "DeFi" },
  { id: "l2", label: "Layer 2" },
  { id: "meme", label: "Meme" },
  { id: "stablecoin", label: "Stablecoin" },
] as const;

type FilterId = (typeof FILTER_CHIPS)[number]["id"];

const FILTER_SYMBOLS: Record<FilterId, string[]> = {
  all: [],
  l1: ["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX", "NEAR", "TIA", "SUI"],
  defi: ["UNI", "LINK", "INJ", "ARB", "OP"],
  l2: ["ARB", "OP"],
  meme: ["DOGE", "SHIB", "PEPE"],
  stablecoin: ["USDC"],
};

export function CryptoScreenerBoard({ screener, isWatched, onToggleWatch, watchPending }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
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
        : screener.assets.filter((a) => FILTER_SYMBOLS[activeFilter].includes(a.symbol));

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
    <div className="cc-screener cc-section" role="region" aria-label="Kripto tarayıcı">
      <div className="cc-zone-label">Kripto tarayıcı</div>

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

      <div
        ref={vt.scrollRef}
        className={cn("cc-screener-table-wrap", vt.enabled && "mkt-vt-scroll")}
        style={vt.scrollStyle}
      >
        <table className="cc-screener-table" aria-label="Kripto varlıklar">
          <colgroup>
            <col className="cc-screener-col-rank" />
            <col className="cc-screener-col-asset" />
            <col className="cc-screener-col-price" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-change" />
            <col className="cc-screener-col-mcap" />
            <col className="cc-screener-col-vol" />
            <col className="cc-screener-col-spark" />
            <col className="cc-screener-col-actions" />
          </colgroup>
          <thead className={cn("cc-screener-thead", vt.enabled && "mkt-vt-sticky-thead")}>
            <tr>
              <SortTh label="#" k="rank" align="left" />
              <th className="cc-screener-thead-th cc-screener-th--left">Varlık</th>
              <th className="cc-screener-thead-th cc-screener-th--right">Fiyat</th>
              <SortTh label="24s %" k="change24h" />
              <SortTh label="7g %" k="change7d" />
              <SortTh label="Piyasa Değeri" k="marketCap" />
              <SortTh label="24s Hacim" k="volume24h" />
              <th className="cc-screener-thead-th cc-screener-th--right">7g Grafik</th>
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
  const href = marketSymbolPath(asset.symbol);
  const isAnchor = ANCHOR_SYMBOLS.has(asset.symbol);
  const showActions = Boolean(onToggleWatch && isWatched);
  const anchorClass =
    asset.symbol === "BTC"
      ? "cc-screener-row--anchor-btc"
      : asset.symbol === "ETH"
        ? "cc-screener-row--anchor-eth"
        : asset.symbol === "SOL"
          ? "cc-screener-row--anchor-sol"
          : undefined;

  return (
    <tr className={cn(isAnchor && "cc-screener-row--anchor", anchorClass)}>
      <td className="cc-screener-td cc-screener-td--rank">
        <span className="cc-screener-rank">{asset.displayRank}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--asset">
        <div className="cc-screener-symbol-cell">
          <MarketSymbolIcon symbol={asset.symbol} size={28} />
          <div className="cc-screener-symbol-copy">
            <Link href={href} className="cc-screener-symbol-link">
              <span className="cc-screener-symbol">{asset.symbol}</span>
            </Link>
            <span className="cc-screener-name">{asset.name}</span>
          </div>
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-price">${formatPrice(asset.price)}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.change24h))}>
          {signedChange(asset.change24h)}
        </span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className={cn("cc-screener-change", changeClass(asset.change7d))}>
          {signedChange(asset.change7d)}
        </span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-mcap">{asset.marketCap}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--num">
        <span className="cc-screener-vol">{asset.volume24h}</span>
      </td>
      <td className="cc-screener-td cc-screener-td--spark">
        <div className="cc-screener-spark">
          <MiniSparkline
            series={asset.sparkline}
            trend={asset.trend}
            height={32}
            className="w-[72px]"
          />
        </div>
      </td>
      <td className="cc-screener-td cc-screener-td--actions">
        {showActions ? (
          <CryptoScreenerRowActions
            symbol={asset.symbol}
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
