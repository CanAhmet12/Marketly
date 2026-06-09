"use client";

import type { MarketSignalIntelligence } from "@/features/signals/intelligence/types";
import { cn } from "@/lib/cn";

type Props = {
  intel: MarketSignalIntelligence;
  className?: string;
  variant?: "full" | "compact";
  buyCount?: number;
  sellCount?: number;
  holdCount?: number;
  updatedAt?: string | null;
};

function biasLabelCompact(b: MarketSignalIntelligence["marketBias"]) {
  if (b === "bullish") return "Alıcı";
  if (b === "bearish") return "Satıcı";
  return "Dengeli";
}

function biasLabelFull(b: MarketSignalIntelligence["marketBias"]) {
  if (b === "bullish") return "Boğa ağırlıklı";
  if (b === "bearish") return "Ayı ağırlıklı";
  return "Nötr denge";
}

function formatUpdatedAt(raw: string | null | undefined): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function SignalsMarketIntelStrip({
  intel,
  className,
  variant = "full",
  buyCount = 0,
  sellCount = 0,
  holdCount = 0,
  updatedAt,
}: Props) {
  if (variant === "compact") {
    const biasClass =
      intel.marketBias === "bullish"
        ? "sp-bias-value--buy"
        : intel.marketBias === "bearish"
          ? "sp-bias-value--sell"
          : "";

    return (
      <div className={cn("sp-intel-strip sp-intel-strip--compact", className)}>
        <div className="sp-intel-strip-inner">
          <div className="sp-bias-section">
            <span className="sp-bias-label">Piyasa biası</span>
            <span className={cn("sp-bias-value", biasClass)}>{biasLabelCompact(intel.marketBias)}</span>
            <div className="sp-bias-bar" aria-hidden>
              <div className="sp-bias-bar-buy" style={{ width: `${intel.bullBearSplitPct.bull}%` }} />
              <div className="sp-bias-bar-sell" style={{ width: `${intel.bullBearSplitPct.bear}%` }} />
              <div className="sp-bias-bar-hold" style={{ flex: 1 }} />
            </div>
          </div>

          <div className="sp-intel-divider" aria-hidden />

          <div className="sp-dist-section">
            <span className="sp-dist-item sp-dist-item--buy">
              <span className="sp-dist-pct">BUY %{intel.bullBearSplitPct.bull}</span>
              <span className="sp-dist-count">({buyCount})</span>
            </span>
            <span className="sp-dist-item sp-dist-item--sell">
              <span className="sp-dist-pct">SELL %{intel.bullBearSplitPct.bear}</span>
              <span className="sp-dist-count">({sellCount})</span>
            </span>
            <span className="sp-dist-item sp-dist-item--hold">
              <span className="sp-dist-pct">HOLD</span>
              <span className="sp-dist-count">({holdCount})</span>
            </span>
          </div>

          <div className="sp-update-section">
            <span className="sp-update-dot" aria-hidden />
            <span className="sp-update-text">{formatUpdatedAt(updatedAt)} güncellendi</span>
          </div>
        </div>
      </div>
    );
  }

  const top = intel.analystConcentrationTop.slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--ms-border-hairline)] bg-[var(--ms-card-surface)] px-[var(--sp-3)] py-[var(--sp-3)] shadow-[var(--ms-shadow-1)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Pazar istihbaratı</p>
          <p className="mt-1 text-[13px] font-bold text-[var(--color-text)]">{biasLabelFull(intel.marketBias)}</p>
          <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
            Aktif çağrı dağılımı · %{intel.bullBearSplitPct.bull} alış · %{intel.bullBearSplitPct.bear} satış
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <span className="rounded-full border border-[var(--ms-border-hairline)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            Tartışmalı varlık: {intel.activeDebateAssetCount}
          </span>
          <span className="rounded-full border border-[var(--ms-border-hairline)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            Çelişen küme: {intel.conflictingClusters}
          </span>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-[color-mix(in_srgb,var(--color-rise)_60%,var(--color-rise))]"
            style={{ width: `${intel.bullBearSplitPct.bull}%` }}
          />
          <div
            className="h-full bg-[color-mix(in_srgb,var(--color-fall)_58%,var(--color-fall))]"
            style={{ width: `${intel.bullBearSplitPct.bear}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
        <span>{intel.momentumLabel}</span>
        <span className="text-[var(--color-border)]">·</span>
        <span className="max-w-[min(100%,28rem)] truncate">{intel.themeAcceleration}</span>
      </div>
      {top.length ? (
        <div className="mt-2 border-t border-[var(--ms-border-hairline)] pt-2">
          <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">Sinyal yoğunluğu</p>
          <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
            {top.map((t) => (
              <li key={t.symbol} className="text-[11px] font-semibold text-[var(--color-text)]">
                {t.symbol} <span className="tabular-nums text-[var(--color-meta)]">%{t.sharePct}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-2 text-[11px] font-medium leading-snug text-[var(--color-meta)]">{intel.overlapPairsLabel}</p>
    </div>
  );
}
