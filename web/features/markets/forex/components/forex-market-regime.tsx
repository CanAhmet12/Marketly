"use client";

import type { ForexMarketRegimePayload } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = { regime: ForexMarketRegimePayload };

const REGIME_ICON: Record<string, string> = {
  "usd-dominant": "💵",
  "risk-on":      "📈",
  "risk-off":     "🛡️",
  "range":        "↔",
};

const REGIME_HEADLINE: Record<string, string> = {
  "usd-dominant": "USD BASKIN",
  "risk-on":      "RISK-ON",
  "risk-off":     "RISK-OFF",
  "range":        "YATAY PIYASA",
};

export function ForexMarketRegime({ regime }: Props) {
  const { safe, risky, em } = regime.distribution;
  const isDxyUp = regime.dxyChange >= 0;

  return (
    <div className="cc-section" role="region" aria-label="Forex piyasa rejimi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Rejimi</p>

      <div className="cc-regime-dom-grid">
        {/* Sol: manşet */}
        <div className="min-w-0">
          <div className="cc-regime-headline-wrap flex items-center gap-2 flex-wrap">
            <span className="cc-regime-icon" aria-hidden>{REGIME_ICON[regime.regime]}</span>
            <span className="cc-regime-headline cc-regime-headline--bull">
              {REGIME_HEADLINE[regime.regime]}
            </span>
          </div>

          <p className="cc-regime-summary">{regime.summary}</p>

          <div className="cc-regime-stats-row">
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Fed Tutumu</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-rose)" }}>
                {regime.stats.fedTutumu}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Risk Istahi</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-rose)" }}>
                {regime.stats.riskIstahi}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Carry Trade</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-gold)" }}>
                {regime.stats.carryTrade}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Trend Gucu</span>
              <span className="cc-regime-stat-value">{regime.stats.trendGucu}</span>
            </div>
          </div>
        </div>

        {/* Sağ: DXY hero */}
        <div className="cc-dom-hero">
          <span className="cc-dom-label">DXY Endeksi</span>
          <span className="cc-dom-value">{regime.dxyValue.toFixed(2)}</span>
          <span className="cc-dom-change" style={{ color: isDxyUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {regime.dxyChange > 0 ? "+" : ""}{regime.dxyChange.toFixed(2)}% (gun)
          </span>

          {/* Para birimi dağılım bar */}
          <div className="cc-dom-bar" style={{ width: "100%", minWidth: 140 }}>
            <div className="cc-dom-bar-btc" style={{ width: `${safe}%` }} title={`Guvenli ${safe}%`} />
            <div className="cc-dom-bar-eth" style={{ width: `${risky}%` }} title={`Riskli ${risky}%`} />
            <div className="cc-dom-bar-alt" style={{ width: `${em}%` }} title={`Gelismekte ${em}%`} />
          </div>

          <div className="cc-dom-legend">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-gold)" }} />
              Guvenli {safe}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-teal)" }} />
              Riskli {risky}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "rgba(167,139,250,0.5)" }} />
              GOE {em}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
