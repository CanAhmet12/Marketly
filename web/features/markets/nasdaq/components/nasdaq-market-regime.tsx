"use client";

import type { NasdaqRegimePayload } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = { regime: NasdaqRegimePayload };

const REGIME_ICON: Record<string, string> = {
  "tech-rally":       "🚀",
  "growth-momentum":  "📈",
  "karisik":          "↔",
  "duzeltme":         "📉",
};

const REGIME_HEADLINE: Record<string, string> = {
  "tech-rally":       "TECH RALLY",
  "growth-momentum":  "GROWTH MOMENTUM",
  "karisik":          "KARISIK PIYASA",
  "duzeltme":         "DUZELTME",
};

export function NasdaqMarketRegime({ regime }: Props) {
  const { tech, health, other } = regime.distribution;
  const isUp = regime.ndxChange >= 0;

  return (
    <div className="cc-section" role="region" aria-label="NASDAQ piyasa rejimi">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Rejimi</p>

      <div className="cc-regime-dom-grid">
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
              <span className="cc-regime-stat-label">Big Tech</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-teal)" }}>{regime.stats.bigTechHareket}</span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Faiz Beklentisi</span>
              <span className="cc-regime-stat-value" style={{ color: "#06b6d4" }}>{regime.stats.faizBeklentisi}</span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Buyume Momentu</span>
              <span className="cc-regime-stat-value">{regime.stats.buyumeMomentu}</span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Teknik</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-teal)" }}>{regime.stats.teknik}</span>
            </div>
          </div>
        </div>

        <div className="cc-dom-hero">
          <span className="cc-dom-label">NASDAQ 100</span>
          <span className="cc-dom-value">{regime.ndxValue.toLocaleString("en-US")}</span>
          <span className="cc-dom-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {isUp ? "+" : ""}{regime.ndxChange.toFixed(2)}% (gun)
          </span>
          <div className="cc-dom-bar" style={{ width: "100%", minWidth: 140 }}>
            <div className="cc-dom-bar-btc" style={{ width: `${tech}%` }} title={`Tech ${tech}%`} />
            <div className="cc-dom-bar-eth" style={{ width: `${health}%` }} title={`Saglik ${health}%`} />
            <div className="cc-dom-bar-alt" style={{ width: `${other}%` }} title={`Diger ${other}%`} />
          </div>
          <div className="cc-dom-legend">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-gold)" }} />
              Teknoloji {tech}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-teal)" }} />
              Saglik {health}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "rgba(167,139,250,0.5)" }} />
              Diger {other}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
