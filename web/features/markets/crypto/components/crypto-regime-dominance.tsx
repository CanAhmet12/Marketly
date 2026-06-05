"use client";

import type { CryptoRegimePayload } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = { regime: CryptoRegimePayload };

const REGIME_ICON: Record<string, string> = {
  bull: "🐂",
  bear: "🐻",
  chop: "↔",
};

const REGIME_LABEL: Record<string, string> = {
  bull: "BULL MARKET",
  bear: "BEAR MARKET",
  chop: "RANGE PİYASA",
};

export function CryptoRegimeDominance({ regime }: Props) {
  const altWidth = Math.max(0, 100 - regime.btcDominanceNumeric - regime.ethDominanceNumeric);

  const dominanceChange = "+0.41%";

  return (
    <div className="cc-section" role="region" aria-label="Piyasa rejimi ve BTC hakimiyeti">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Rejimi</p>

      <div className="cc-regime-dom-grid">
        {/* Sol: Regime manşet */}
        <div className="min-w-0">
          {/* Icon + Headline */}
          <div className="cc-regime-headline-wrap flex items-center gap-2 flex-wrap">
            <span className="cc-regime-icon" aria-hidden>{REGIME_ICON[regime.regime]}</span>
            <span
              className={cn(
                "cc-regime-headline",
                regime.regime === "bull" && "cc-regime-headline--bull",
                regime.regime === "bear" && "cc-regime-headline--bear",
                regime.regime === "chop" && "cc-regime-headline--chop",
              )}
            >
              {REGIME_LABEL[regime.regime]}
            </span>
          </div>

          {/* Summary */}
          <p className="cc-regime-summary">{regime.summary}</p>

          {/* Stats row */}
          <div className="cc-regime-stats-row">
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Volatilite Bandı</span>
              <span className="cc-regime-stat-value">{regime.volatilityLabel}</span>
              <span className="cc-regime-stat-sub" style={{ color: "var(--cc-meta)" }}>
                {regime.volatilityBand === "low" ? "Düşük" : regime.volatilityBand === "medium" ? "Orta" : "Yüksek"}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Risk Biası</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-teal)" }}>
                {regime.riskBiasLabel}
              </span>
              <span className="cc-regime-stat-sub">{regime.riskBias}%</span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Stablecoin Akışı</span>
              <span
                className="cc-regime-stat-value"
                style={{ color: "var(--cc-teal)", fontSize: 11 }}
              >
                {regime.stablecoinFlowLabel}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Piyasa Momentumu</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-gold)" }}>
                Güçlü
              </span>
              <span className="cc-regime-stat-sub">Yükseliş</span>
            </div>
          </div>
        </div>

        {/* Sağ: BTC Dominance hero */}
        <div className="cc-dom-hero">
          <span className="cc-dom-label">BTC Hakimiyeti</span>
          <span className="cc-dom-value">{regime.btcDominanceNumeric}%</span>
          <span className="cc-dom-change" style={{ color: "var(--cc-teal)" }}>
            {dominanceChange} (24s)
          </span>

          {/* Stacked bar */}
          <div className="cc-dom-bar" style={{ width: "100%", minWidth: 120 }}>
            <div className="cc-dom-bar-btc" style={{ width: `${regime.btcDominanceNumeric}%` }} />
            <div className="cc-dom-bar-eth" style={{ width: `${regime.ethDominanceNumeric}%` }} />
            <div className="cc-dom-bar-alt" style={{ width: `${altWidth}%` }} />
          </div>

          {/* Legend */}
          <div className="cc-dom-legend">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-gold)" }} />
              BTC {regime.btcDominanceNumeric}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-teal)" }} />
              ETH {regime.ethDominanceNumeric}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "rgba(167,139,250,0.5)" }} />
              Diğer {altWidth.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
