"use client";

import type { CommodityRegimePayload } from "@/features/markets/commodities/types";
import { cn } from "@/lib/cn";

type Props = { regime: CommodityRegimePayload };

const REGIME_ICON: Record<string, string> = {
  "altin-sezonu":  "🥇",
  "enerji-lider":  "⚡",
  "tarim-rallisi": "🌾",
  "karma":         "📊",
};

const REGIME_HEADLINE: Record<string, string> = {
  "altin-sezonu":  "ALTIN SEZONU",
  "enerji-lider":  "ENERJI YUKSELIS",
  "tarim-rallisi": "TARIM RALLISI",
  "karma":         "KARMA PIYASA",
};

export function CommoditiesMarketRegime({ regime }: Props) {
  const { metal, enerji, tarim } = regime.distribution;
  const isUp = regime.altinChange >= 0;

  return (
    <div className="cc-section" role="region" aria-label="Emtia piyasa durumu">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Durumu</p>

      <div className="cc-regime-dom-grid">
        {/* Sol */}
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
              <span className="cc-regime-stat-label">USD Korelasyon</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-rose)", fontSize: 12 }}>
                {regime.stats.usdKorelasyon}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Talep Gorunumu</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-teal)" }}>
                {regime.stats.talepGorunumu}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Enflasyon Bekl.</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-gold)" }}>
                {regime.stats.enflasyonBekl}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Trend Gucu</span>
              <span className="cc-regime-stat-value">{regime.stats.trendGucu}</span>
            </div>
          </div>
        </div>

        {/* Sağ: Altın hero */}
        <div className="cc-dom-hero">
          <span className="cc-dom-label">ALTIN ($/oz)</span>
          <span className="cc-dom-value">${regime.altinValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          <span className="cc-dom-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {regime.altinChange > 0 ? "+" : ""}{regime.altinChange.toFixed(2)}% (gun)
          </span>

          <div className="cc-dom-bar" style={{ width: "100%", minWidth: 140 }}>
            <div className="cc-dom-bar-btc" style={{ width: `${metal}%` }} title={`Metal ${metal}%`} />
            <div className="cc-dom-bar-eth" style={{ width: `${enerji}%` }} title={`Enerji ${enerji}%`} />
            <div className="cc-dom-bar-alt" style={{ width: `${tarim}%` }} title={`Tarim ${tarim}%`} />
          </div>

          <div className="cc-dom-legend">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-gold)" }} />
              Metal {metal}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-teal)" }} />
              Enerji {enerji}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "rgba(167,139,250,0.5)" }} />
              Tarim {tarim}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
