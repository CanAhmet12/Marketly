"use client";

import Link from "next/link";
import { useEffect } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { MarketAssetView } from "@/features/markets/types";
import { getMarketsRepository } from "@/features/markets/repository";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  asset: MarketAssetView | null;
  onClose: () => void;
};

const TF = ["1S", "4S", "1G", "1H"] as const;

export function MarketDetailDrawer({ open, asset, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !asset) return null;

  const x = getMarketsRepository().getMarketDetailExtras(asset.price, asset.change_percent);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="market-drawer-title">
      <button
        type="button"
        className="motion-backdrop-enter absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-colors duration-[var(--motion-fast)] hover:bg-black/48"
        aria-label="Kapat"
        onClick={onClose}
      />
      <aside className="motion-drawer-enter-right relative z-10 flex h-full w-full max-w-md min-w-0 flex-col overflow-x-hidden bg-[color-mix(in_srgb,var(--ms-card-surface)_78%,transparent)] shadow-none backdrop-blur-[28px] dark:bg-[color-mix(in_srgb,var(--ms-card-surface)_55%,transparent)] md:rounded-l-3xl">
        <header className="flex items-start justify-between gap-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-3)]">
          <div>
            <p id="market-drawer-title" className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">
              Varlık detayı
            </p>
            <p className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-[var(--color-text)]">{asset.symbol}</p>
            <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">{asset.name}</p>
          </div>
          <button
            type="button"
            className="motion-active-press inline-flex h-10 min-w-10 items-center justify-center rounded-full px-[var(--sp-3)] text-[12px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
            onClick={onClose}
          >
            Kapat
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[var(--sp-3)] py-[var(--sp-3)]">
          <div className="ms-metric-block p-[var(--sp-3)]">
            <div className="flex flex-wrap items-end justify-between gap-[var(--sp-2)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Son fiyat</p>
                <p className="markets-mono ms-num-strong text-[26px] leading-none text-[var(--color-text)]">
                  {asset.price.toLocaleString("tr-TR", { maximumFractionDigits: asset.price >= 1000 ? 2 : 4 })}
                </p>
              </div>
              <p className={cn("markets-mono text-[15px] font-semibold tabular-nums", changePercentTextClass(asset.change_percent))}>
                {formatSignedChangePercent(asset.change_percent)}
              </p>
            </div>
            <div className="mt-[var(--sp-3)] h-[120px] w-full min-w-0">
              <MiniSparkline series={asset.sparkline} trend={asset.trend} height={120} />
            </div>
            <div className="mt-[var(--sp-3)] flex flex-wrap gap-[var(--sp-2)]" role="tablist" aria-label="Zaman dilimi">
              {TF.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-full px-[var(--sp-2)] py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-text)]"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-[var(--sp-3)] grid grid-cols-2 gap-[var(--sp-2)] text-[12px] font-semibold">
            <div className="ms-metric-block">
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-meta)]">Destek</dt>
              <dd className="ms-num-strong mt-1 text-[var(--color-text)]">{x.support.toLocaleString("tr-TR")}</dd>
            </div>
            <div className="ms-metric-block">
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-meta)]">Direnç</dt>
              <dd className="ms-num-strong mt-1 text-[var(--color-text)]">{x.resistance.toLocaleString("tr-TR")}</dd>
            </div>
            <div className="ms-metric-block">
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-meta)]">Hacim</dt>
              <dd className="mt-1 text-[var(--color-text)]">{asset.volume}</dd>
            </div>
            <div className="ms-metric-block">
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-meta)]">Piyasa değeri</dt>
              <dd className="mt-1 text-[var(--color-text)]">{asset.marketCapLabel}</dd>
            </div>
          </dl>

          <div className="mt-[var(--sp-3)] ms-metric-block p-[var(--sp-3)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Topluluk hissiyatı</p>
            <div className="mt-[var(--sp-2)] flex items-center gap-[var(--sp-3)]">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                <div
                  className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_52%,var(--color-meta)_48%)]"
                  style={{ width: `${x.sentimentScore}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-[var(--color-text)]">{x.sentimentLabel}</span>
            </div>
            <p className="mt-[var(--sp-2)] text-[12px] font-medium text-[var(--color-text-secondary)]">
              İlgili sinyal önerileri (mock): <span className="font-semibold text-[var(--color-text)]">{x.relatedSignalsCount}</span> akış · aktif kart:{" "}
              <span className="font-semibold text-[var(--color-text)]">{asset.signal_active_count}</span> · bull{" "}
              <span className="markets-mono font-semibold">{asset.signal_bull_pct}%</span>
            </p>
          </div>

          <div className="mt-[var(--sp-4)] flex flex-wrap gap-[var(--sp-2)]">
            <Link
              href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-[var(--sp-4)] py-[var(--sp-2)] text-[13px] font-bold text-[var(--color-chip-active-text)]"
              onClick={onClose}
            >
              Sinyallere git
            </Link>
            <Link
              href={`/markets/${encodeURIComponent(asset.symbol)}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--sp-4)] py-[var(--sp-2)] text-[13px] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              onClick={onClose}
            >
              Tam sayfa
            </Link>
            <Link
              href={`/results?q=${encodeURIComponent(asset.symbol)}`}
              className="inline-flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-[var(--sp-4)] py-[var(--sp-2)] text-[13px] font-semibold text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)]"
              onClick={onClose}
            >
              Arama
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
