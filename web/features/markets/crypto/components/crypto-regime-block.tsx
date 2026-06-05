"use client";

import type { CryptoRegimePayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = {
  regime: CryptoRegimePayload;
};

const REGIME_LABELS: Record<string, string> = {
  bull: "BULL",
  chop: "RANGE",
  bear: "BEAR",
};

const VOLATILITY_DOT: Record<string, string> = {
  low: "bg-[var(--cc-teal-muted)]",
  medium: "bg-[var(--cc-gold-amber)]",
  high: "bg-[var(--cc-rose)]",
};

export function CryptoRegimeBlock({ regime }: Props) {
  const badgeClass = cn(
    "cc-regime-badge",
    regime.regime === "bull" && "cc-regime-badge--bull",
    regime.regime === "chop" && "cc-regime-badge--chop",
    regime.regime === "bear" && "cc-regime-badge--bear",
  );

  const btcWidth = Math.min(100, Math.max(0, regime.btcDominanceNumeric));
  const ethWidth = Math.min(100 - btcWidth, Math.max(0, regime.ethDominanceNumeric));
  const altWidth = Math.max(0, 100 - btcWidth - ethWidth);

  return (
    <div className="cc-section" role="region" aria-label="Piyasa rejimi">
      <div className="cc-regime">
        {/* Left: regime badge + summary */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className={badgeClass}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    regime.regime === "bull"
                      ? "var(--cc-teal)"
                      : regime.regime === "bear"
                        ? "var(--cc-rose)"
                        : "var(--cc-gold-amber)",
                }}
                aria-hidden
              />
              {REGIME_LABELS[regime.regime]}
            </span>

            <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--cc-meta)" }}>
              <span
                className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", VOLATILITY_DOT[regime.volatilityBand])}
                aria-hidden
              />
              {regime.volatilityLabel}
            </span>

            <span className="text-[11px] font-semibold" style={{ color: "var(--cc-meta)" }}>
              {regime.riskBiasLabel}
            </span>

            <span className="text-[11px] font-medium" style={{ color: "var(--cc-meta)" }}>
              {regime.stablecoinFlowLabel}
            </span>
          </div>

          <p className="max-w-prose text-[13px] font-medium leading-snug" style={{ color: "var(--cc-text-secondary)" }}>
            {regime.summary}
          </p>
        </div>

        {/* Right: dominance bars */}
        <div className="flex shrink-0 flex-col gap-2 min-[480px]:w-48">
          <p className="cc-section-label">Piyasa dağılımı</p>

          {/* Stacked dominance bar */}
          <div className="flex h-[5px] overflow-hidden rounded-full" style={{ background: "var(--cc-border)" }}>
            <div
              className="cc-dominance-bar-fill"
              style={{ width: `${btcWidth}%` }}
              title={`BTC ${regime.btcDominanceNumeric}%`}
            />
            <div
              className="cc-dominance-bar-fill cc-dominance-bar-fill--eth"
              style={{ width: `${ethWidth}%` }}
              title={`ETH ${regime.ethDominanceNumeric}%`}
            />
            <div
              style={{
                width: `${altWidth}%`,
                background: "rgba(167,139,250,0.35)",
              }}
              title={`Alt ${altWidth.toFixed(1)}%`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--cc-text-secondary)" }}>
              <span className="inline-block h-1.5 w-2.5 rounded-sm" style={{ background: "var(--cc-gold)" }} />
              BTC {regime.btcDominanceNumeric}%
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--cc-text-secondary)" }}>
              <span className="inline-block h-1.5 w-2.5 rounded-sm" style={{ background: "var(--cc-teal)" }} />
              ETH {regime.ethDominanceNumeric}%
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--cc-meta)" }}>
              <span className="inline-block h-1.5 w-2.5 rounded-sm" style={{ background: "rgba(167,139,250,0.5)" }} />
              Alt {altWidth.toFixed(1)}%
            </span>
          </div>

          {/* Risk bias bar */}
          <div className="mt-1">
            <p className="cc-section-label mb-1.5">Risk biası</p>
            <div className="cc-dominance-bar-track">
              <div
                className="cc-dominance-bar-fill"
                style={{ width: `${regime.riskBias}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
