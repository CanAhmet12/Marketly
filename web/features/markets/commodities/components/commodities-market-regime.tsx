"use client";

import type { ReactElement } from "react";

import type { CommodityPulseMetrics, CommodityRegimePayload } from "@/features/markets/commodities/types";
import {
  signedPct,
} from "@/features/markets/commodities/lib/commodity-sparkline-utils";
import { volatilityBandFromValue } from "@/features/markets/commodities/lib/commodity-regime-utils";
import { cn } from "@/lib/cn";

type Props = {
  regime: CommodityRegimePayload;
  pulse?: CommodityPulseMetrics;
  live?: boolean;
};

const REGIME_LABEL: Record<CommodityRegimePayload["regime"], string> = {
  "altin-sezonu": "ALTIN SEZONU",
  "enerji-lider": "ENERJİ YÜKSELİŞ",
  "tarim-rallisi": "TARIM RALLİSİ",
  karma: "KARMA PİYASA",
};

function RegimeMark({ regime }: { regime: CommodityRegimePayload["regime"] }) {
  const icons: Record<CommodityRegimePayload["regime"], ReactElement> = {
    "altin-sezonu": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16M4 12h16" strokeLinecap="round" />
      </svg>
    ),
    "enerji-lider": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" strokeLinejoin="round" />
      </svg>
    ),
    "tarim-rallisi": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 22V8M8 12l4-4 4 4M4 10c2-4 6-6 8-6s6 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    karma: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 12h6M14 12h6M10 8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return <span className="cc-regime-icon cm-regime-icon">{icons[regime]}</span>;
}

function VolatilityMeter({ band }: { band: "low" | "medium" | "high" }) {
  const levels: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
  return (
    <div className="cc-regime-meter cc-regime-vol-meter" aria-hidden>
      {levels.map((level) => (
        <span
          key={level}
          className={cn(
            "cc-regime-vol-seg",
            level === band && "cc-regime-vol-seg--active",
            level === "low" && "cc-regime-vol-seg--low",
            level === "medium" && "cc-regime-vol-seg--med",
            level === "high" && "cc-regime-vol-seg--high",
          )}
        />
      ))}
    </div>
  );
}

function TrendBiasMeter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="cc-regime-meter cc-regime-risk-meter" aria-hidden>
      <div className="cc-regime-risk-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function statTone(value: string): string | undefined {
  if (value.includes("Güçlü") || value.includes("Yükseliş") || value.includes("Ters")) return "var(--cc-gold)";
  if (value.includes("Zayıf") || value.includes("Düşük")) return "var(--cc-rose)";
  if (value.includes("Ilımlı") || value.includes("Sabit") || value.includes("Nötr")) return "var(--cc-teal)";
  return undefined;
}

export function CommoditiesMarketRegime({ regime, pulse, live }: Props) {
  const { metal, enerji, tarim } = regime.distribution;
  const isGoldUp = regime.altinChange >= 0;
  const volBand = pulse ? volatilityBandFromValue(pulse.volatility.value) : "medium";
  const trendBias = pulse?.trendScore.value ?? 50;

  return (
    <div className="cc-section cc-regime-section cm-regime-section" role="region" aria-label="Emtia piyasa rejimi">
      <div className="cc-regime-top">
        <div className="cc-regime-main">
          <p className="cc-section-label cc-section-label--spaced">Piyasa Rejimi</p>

          <div className="cc-regime-headline-row">
            <div className="cc-regime-headline-wrap">
              <RegimeMark regime={regime.regime} />
              <span
                className={cn(
                  "cc-regime-headline cm-regime-headline",
                  regime.regime === "altin-sezonu" && "cc-regime-headline--bull cm-regime-headline--gold",
                  regime.regime === "enerji-lider" && "cm-regime-headline--energy",
                  regime.regime === "tarim-rallisi" && "cm-regime-headline--agri",
                  regime.regime === "karma" && "cc-regime-headline--chop cm-regime-headline--mixed",
                )}
              >
                {REGIME_LABEL[regime.regime]}
              </span>
            </div>
            {live ? (
              <span className="cc-regime-live-chip cm-regime-live-chip">
                <span className="cc-regime-live-dot cm-regime-live-dot" aria-hidden />
                CANLI
              </span>
            ) : null}
          </div>

          {pulse ? (
            <div className="cc-regime-chip-row">
              <span className="cc-regime-chip">
                Emtia Volatilite
                <strong>{pulse.volatility.value}</strong>
                <em>{pulse.volatility.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--violet">
                Trend
                <strong>{pulse.trendScore.value}</strong>
                <em>{pulse.trendScore.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--muted">
                ALTIN
                <strong>${regime.altinValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                <em className={cn(isGoldUp ? "cc-up" : "cc-down")}>{signedPct(regime.altinChange)}</em>
              </span>
            </div>
          ) : null}

          <p className="cc-regime-summary">{regime.summary}</p>
        </div>

        <aside className="cc-dom-panel cm-dom-panel">
          <span className="cc-dom-label">ALTIN ($/oz)</span>
          <span className="cc-dom-value">
            ${regime.altinValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className={cn("cc-dom-change", isGoldUp ? "cc-up" : "cc-down")}>
            {signedPct(regime.altinChange)} (gün)
          </span>

          <div className="cc-dom-bar cc-dom-bar--full">
            <div className="cc-dom-bar-btc cm-dom-bar-metal" style={{ width: `${metal}%` }} title={`Metal ${metal}%`} />
            <div className="cc-dom-bar-eth cm-dom-bar-energy" style={{ width: `${enerji}%` }} title={`Enerji ${enerji}%`} />
            <div className="cc-dom-bar-alt cm-dom-bar-agri" style={{ width: `${tarim}%` }} title={`Tarım ${tarim}%`} />
          </div>

          <div className="cc-dom-legend cc-dom-legend--left">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cm-dom-legend-dot--metal" />
              Metal {metal}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cm-dom-legend-dot--energy" />
              Enerji {enerji}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cm-dom-legend-dot--agri" />
              Tarım {tarim}%
            </div>
          </div>
        </aside>
      </div>

      <div className="cc-regime-stats-row cc-regime-stats-row--full">
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">USD Korelasyon</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.usdKorelasyon) }}>
            {regime.stats.usdKorelasyon}
          </span>
          <VolatilityMeter band={volBand} />
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Talep Görünümü</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.talepGorunumu) }}>
            {regime.stats.talepGorunumu}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Enflasyon Bekl.</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.enflasyonBekl) }}>
            {regime.stats.enflasyonBekl}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Trend Gücü</span>
          <span className="cc-regime-stat-value">{regime.stats.trendGucu}</span>
          <TrendBiasMeter value={trendBias} />
        </div>
      </div>
    </div>
  );
}
