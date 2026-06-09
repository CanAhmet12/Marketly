"use client";

import Link from "next/link";

import { MarketAssetTransitionLink } from "@/components/ui/market-asset-transition-link";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { changePercentTextClass, formatSignedChangePercent, trendToneLabel } from "@/features/markets/lib/market-display";
import type { MarketAssetCategory, MarketAssetView } from "@/features/markets/types";
import { marketVtStyle } from "@/lib/navigation/view-transition";
import { cn } from "@/lib/cn";

type Props = {
  asset: MarketAssetView;
  watched: boolean;
  pinned: boolean;
  onToggleWatch: () => void;
  onTogglePin: () => void;
  onOpenDetail: () => void;
  /** Arama sonuçları — pin/favori aksiyonları gizli */
  searchMode?: boolean;
};

function catLabel(c: MarketAssetCategory) {
  const m: Record<MarketAssetCategory, string> = {
    crypto: "Kripto",
    stocks: "Hisse",
    forex: "Döviz",
    commodity: "Emtia",
    index: "Endeks",
  };
  return m[c];
}

function formatPrice(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: n >= 1000 ? 2 : 4 });
}

function IconSearch(props: { className?: string }) {
  return (
    <svg className={props.className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron(props: { className?: string }) {
  return (
    <svg className={props.className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MarketAssetCard({
  asset,
  watched,
  pinned,
  onToggleWatch,
  onTogglePin,
  onOpenDetail,
  searchMode = false,
}: Props) {
  return (
    <article
      className="markets-asset-flow group flex cursor-pointer flex-col gap-[var(--sp-3)] rounded-2xl py-[var(--sp-3)] pl-[var(--sp-2)] pr-[var(--sp-2)] min-[480px]:gap-[var(--sp-4)] min-[480px]:py-[var(--sp-4)] min-[480px]:pl-[var(--sp-3)] min-[480px]:pr-[var(--sp-3)]"
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${asset.symbol} detay`}
    >
      <div className="flex items-stretch gap-[var(--sp-3)] min-[480px]:gap-[var(--sp-4)]">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--sp-2)]">
          <div className="flex flex-wrap items-center gap-x-[var(--sp-2)] gap-y-1">
            <h3 className="text-[17px] font-bold leading-none tracking-[-0.03em] text-[var(--color-text)] min-[480px]:text-[19px]">
              <MarketAssetTransitionLink
                href={`/markets/${encodeURIComponent(asset.symbol)}`}
                symbol={asset.symbol}
                className="hover:text-[var(--color-primary-dark)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {asset.symbol}
              </MarketAssetTransitionLink>
            </h3>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-meta)]">{catLabel(asset.category)}</span>
            <span
              className={cn(
                "text-[11px] font-semibold",
                asset.trend === "up" && "text-[var(--color-rise)]",
                asset.trend === "down" && "text-[var(--color-fall)]",
                asset.trend === "flat" && "text-[var(--color-meta)]",
              )}
            >
              {trendToneLabel(asset.trend)}
            </span>
          </div>
          <p className="truncate text-[13px] font-medium text-[var(--color-text-secondary)]">{asset.name}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center text-right" style={marketVtStyle(asset.symbol, "price")}>
          <p className="markets-mono ms-num-strong text-[20px] leading-none text-[var(--color-text)] min-[480px]:text-[22px]">{formatPrice(asset.price)}</p>
          <p className={cn("markets-mono mt-1 text-[13px] font-semibold tabular-nums", changePercentTextClass(asset.change_percent))}>
            {formatSignedChangePercent(asset.change_percent)}
          </p>
        </div>

        <div className="hidden w-[112px] shrink-0 sm:block" style={marketVtStyle(asset.symbol, "spark")}>
          <MiniSparkline series={asset.sparkline} trend={asset.trend} height={52} className="opacity-95" />
        </div>
      </div>

      <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] px-[var(--sp-2)] py-[var(--sp-2)]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Sinyal özeti</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-[var(--sp-3)] gap-y-1 text-[12px] font-semibold text-[var(--color-text)]">
          <Link href={`/signals?asset=${encodeURIComponent(asset.symbol)}`} className="hover:text-[var(--color-primary-dark)] hover:underline" onClick={(e) => e.stopPropagation()}>
            Aktif: {asset.signal_active_count}
          </Link>
          <span className="text-[var(--color-border)]">·</span>
          <span className="markets-mono text-[var(--color-text-secondary)]">Bull {asset.signal_bull_pct}%</span>
          <span className="text-[var(--color-border)]">·</span>
          <span className="max-w-[140px] truncate text-[var(--color-text-secondary)]">{asset.signal_top_analyst ?? "—"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[var(--sp-3)] px-px min-[480px]:px-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Hacim</p>
          <p className="markets-mono mt-1 truncate text-[13px] font-semibold text-[var(--color-text)]">{asset.volume}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Piyasa değeri</p>
          <p className="markets-mono mt-1 truncate text-[13px] font-semibold text-[var(--color-text)]">{asset.marketCapLabel}</p>
        </div>
      </div>

      {!searchMode ? (
      <div className="flex items-center justify-between gap-[var(--sp-2)] px-px min-[480px]:px-0">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="rounded-full p-2 text-[var(--color-meta)] opacity-80 transition-[opacity,color] hover:text-[var(--color-text)] hover:opacity-100"
            aria-pressed={pinned}
            title="Sabitle"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} aria-hidden>
              <path
                d="M12 17v5M5 17h14v-5l-4-4V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v8l-4 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-[var(--color-meta)] opacity-80 transition-[opacity,color] hover:text-[var(--color-danger)] hover:opacity-100"
            aria-pressed={watched}
            title="Favori"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={watched ? "currentColor" : "none"} aria-hidden>
              <path
                d="M12 21s-6.7-4.35-9-8c-1.5-2.5-1-5.5 1.5-7 2.2-1.3 5-.6 7 1.5 2-2.1 4.8-2.8 7-1.5 2.5 1.5 3 4.5 1.5 7-2.3 3.65-9 8-9 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <Link
            href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
            className="rounded-full p-2 text-[var(--color-meta)] opacity-80 transition-[opacity,color] hover:text-[var(--color-primary-dark)] hover:opacity-100"
            title="Sinyaller"
            aria-label="Sinyaller"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 12h4l2-6 4 12 2-6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href={`/results?q=${encodeURIComponent(asset.symbol)}`}
            className="rounded-full p-2 text-[var(--color-meta)] opacity-80 transition-[opacity,color] hover:text-[var(--color-text)] hover:opacity-100"
            title="Ara"
            aria-label="Ara"
            onClick={(e) => e.stopPropagation()}
          >
            <IconSearch />
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-[var(--color-meta)] opacity-80 transition-[opacity,color] hover:text-[var(--color-text)] hover:opacity-100"
            title="Detay"
            aria-label="Detay"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
          >
            <IconChevron />
          </button>
        </div>
      </div>
      ) : null}

      <div className="px-px pb-0 sm:hidden min-[480px]:px-0" style={marketVtStyle(asset.symbol, "spark")}>
        <MiniSparkline series={asset.sparkline} trend={asset.trend} height={44} />
      </div>
    </article>
  );
}
