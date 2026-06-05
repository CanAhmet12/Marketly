"use client";

import { memo } from "react";

import { PrefetchOnHoverLink } from "@/components/ui/prefetch-on-hover-link";
import { MarketAssetTransitionLink } from "@/components/ui/market-asset-transition-link";
import { marketVtStyle } from "@/lib/navigation/view-transition";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import { usePriceFlash } from "@/hooks/use-price-flash";
import {
  MARKETS_DENSE_TABLE_ROW_HEIGHT,
  MARKETS_VIRTUAL_TABLE_MAX_HEIGHT,
} from "@/hooks/use-virtual-table-rows";
import { changePercentTextClass, formatSignedChangePercent, trendToneLabel } from "@/features/markets/lib/market-display";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  assets: MarketAssetView[];
  watchlisted: (symbol: string) => boolean;
  pendingSymbol?: string | null;
  onToggleWatch: (symbol: string) => void;
  onOpenDetail: (asset: MarketAssetView) => void;
};

type RowProps = {
  asset: MarketAssetView;
  watchlisted: (symbol: string) => boolean;
  watchPending: boolean;
  onToggleWatch: (symbol: string) => void;
  onOpenDetail: (asset: MarketAssetView) => void;
};

function PriceFlashCell({ price, symbol }: { price: number; symbol: string }) {
  const flash = usePriceFlash(price);
  return (
    <td
      className={cn(
        "markets-mono px-[var(--sp-2)] py-[var(--sp-1)] text-right font-semibold text-[var(--color-text)]",
        flash === "rise" && "mkt-price-flash--rise",
        flash === "fall" && "mkt-price-flash--fall",
      )}
      style={marketVtStyle(symbol, "price")}
    >
      {price.toLocaleString("tr-TR", { maximumFractionDigits: price >= 1000 ? 2 : 4 })}
    </td>
  );
}

const MarketsDenseTableRow = memo(function MarketsDenseTableRow({
  asset: a,
  watchlisted,
  watchPending,
  onToggleWatch,
  onOpenDetail,
}: RowProps) {
  const href = `/markets/${encodeURIComponent(a.symbol)}`;
  return (
    <tr className="border-b border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] last:border-0 hover:bg-[var(--color-surface-hover)]">
      <td className="px-[var(--sp-2)] py-[var(--sp-1)]">
        <button
          type="button"
          aria-label={watchlisted(a.symbol) ? "Takipten çık" : "Takip et"}
          aria-pressed={watchlisted(a.symbol)}
          aria-busy={watchPending}
          disabled={watchPending}
          className={cn(
            "rounded-md p-1.5 text-[var(--color-meta)] hover:text-[var(--color-danger)]",
            watchlisted(a.symbol) && "text-[var(--color-danger)]",
            watchPending && "engagement-pending",
          )}
          onClick={() => onToggleWatch(a.symbol)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={watchlisted(a.symbol) ? "currentColor" : "none"} aria-hidden>
            <path
              d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </td>
      <td className="px-[var(--sp-2)] py-[var(--sp-1)]">
        <MarketAssetTransitionLink href={href} symbol={a.symbol} className="font-bold tabular-nums text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
          {a.symbol}
        </MarketAssetTransitionLink>
      </td>
      <td className="max-w-[200px] truncate px-[var(--sp-2)] py-[var(--sp-1)] text-[var(--color-text-secondary)]">{a.name}</td>
      <PriceFlashCell price={a.price} symbol={a.symbol} />
      <td
        className={cn(
          "markets-mono px-[var(--sp-2)] py-[var(--sp-1)] text-right font-semibold tabular-nums",
          changePercentTextClass(a.change_percent),
        )}
      >
        {formatSignedChangePercent(a.change_percent)}
      </td>
      <td className="markets-mono px-[var(--sp-2)] py-[var(--sp-1)] text-right text-[var(--color-text-secondary)]">{a.volume}</td>
      <td className="px-[var(--sp-2)] py-[var(--sp-1)] text-center text-[12px] font-semibold text-[var(--color-text-secondary)]">
        {trendToneLabel(a.trend)}
      </td>
      <td className="px-[var(--sp-2)] py-[var(--sp-1)] text-center">
        <PrefetchOnHoverLink href={`/signals?asset=${encodeURIComponent(a.symbol)}`} className="font-semibold text-[var(--color-primary-dark)] hover:underline">
          {a.signal_active_count}
        </PrefetchOnHoverLink>
      </td>
      <td className="markets-mono px-[var(--sp-2)] py-[var(--sp-1)] text-center text-[var(--color-text)]">{a.signal_bull_pct}%</td>
      <td className="max-w-[120px] truncate px-[var(--sp-2)] py-[var(--sp-1)] text-[12px] text-[var(--color-text-secondary)]">
        {a.signal_top_analyst ?? "—"}
      </td>
      <td className="px-[var(--sp-2)] py-[var(--sp-1)]" style={marketVtStyle(a.symbol, "spark")}>
        <MiniSparkline series={a.sparkline} trend={a.trend} height={32} className="w-[88px] opacity-95" />
      </td>
      <td className="px-[var(--sp-2)] py-[var(--sp-1)] text-right">
        <button
          type="button"
          className="text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline"
          onClick={() => onOpenDetail(a)}
        >
          Özet
        </button>
      </td>
    </tr>
  );
});

export function MarketsDenseTable({ assets, watchlisted, pendingSymbol = null, onToggleWatch, onOpenDetail }: Props) {
  const vt = useVirtualTableRows({
    count: assets.length,
    rowHeight: MARKETS_DENSE_TABLE_ROW_HEIGHT,
    maxHeight: MARKETS_VIRTUAL_TABLE_MAX_HEIGHT,
  });

  const rows = renderVirtualTableRows({
    items: assets,
    vt,
    getKey: (a) => a.id,
    renderRow: (a) => (
      <MarketsDenseTableRow
        asset={a}
        watchlisted={watchlisted}
        watchPending={pendingSymbol === a.symbol}
        onToggleWatch={onToggleWatch}
        onOpenDetail={onOpenDetail}
      />
    ),
  });

  return (
    <div className="hidden min-[900px]:block min-w-0">
      <div
        ref={vt.scrollRef}
        className={cn(
          "markets-dense-table-wrap max-w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
          vt.enabled && "mkt-vt-scroll",
        )}
        style={vt.scrollStyle}
      >
        <table className="w-full min-w-[820px] max-w-full border-collapse text-left text-[13px]">
          <thead className={cn(vt.enabled && "mkt-vt-sticky-thead")}>
            <tr className="border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
              <th className="px-[var(--sp-2)] py-[var(--sp-2)]">Takip</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)]">Sembol</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)]">Ad</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-right">Son</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-right">%Fark</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-right">Hacim</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-center">Sent.</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-center">Sinyal</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-center">Bull%</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)]">Analist</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)]">Eğri</th>
              <th className="px-[var(--sp-2)] py-[var(--sp-2)] text-right">İşlem</th>
            </tr>
          </thead>
          <tbody style={vt.tbodyStyle}>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}
