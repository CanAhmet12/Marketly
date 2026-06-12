"use client";

import type { ReactElement } from "react";

import { signedPct } from "@/features/markets/crypto/lib/crypto-sparkline-utils";
import { volatilityBandFromValue } from "@/features/markets/forex/lib/forex-regime-utils";
import type { ForexMarketRegimePayload, ForexPulseMetrics } from "@/features/markets/forex/types";
import { cn } from "@/lib/cn";

type Props = {
  regime: ForexMarketRegimePayload;
  pulse?: ForexPulseMetrics;
  live?: boolean;
};

const REGIME_LABEL: Record<ForexMarketRegimePayload["regime"], string> = {
  "usd-dominant": "USD BASKIN",
  "risk-on": "RISK-ON",
  "risk-off": "RISK-OFF",
  range: "YATAY PİYASA",
};

function RegimeMark({ regime }: { regime: ForexMarketRegimePayload["regime"] }) {
  const icons: Record<ForexMarketRegimePayload["regime"], ReactElement> = {
    "usd-dominant": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3v18M8 7h8M7 12h10M8 17h8" strokeLinecap="round" />
      </svg>
    ),
    "risk-on": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 18l4-6 4 3 5-8 3 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "risk-off": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3 14 9h6l-5 4 2 6-7-4-7 4 2-6-5-4h6z" strokeLinejoin="round" />
      </svg>
    ),
    range: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 12h6M14 12h6M10 8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return <span className="cc-regime-icon fc-regime-icon">{icons[regime]}</span>;
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

function RiskBiasMeter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="cc-regime-meter cc-regime-risk-meter" aria-hidden>
      <div className="cc-regime-risk-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function statTone(value: string): string | undefined {
  if (value.includes("Yüksek") || value.includes("Aktif") || value.includes("Güçlü") || value.includes("Şahin")) {
    return "var(--cc-gold)";
  }
  if (value.includes("Düşük") || value.includes("Zayıf") || value.includes("Güvercin") || value.includes("Baskı")) {
    return "var(--cc-rose)";
  }
  if (value.includes("Ilımlı") || value.includes("Orta") || value.includes("Nötr") || value.includes("Yatay")) {
    return "var(--cc-teal)";
  }
  return undefined;
}

function computeForexRiskBiasFromPulse(pulse: ForexPulseMetrics): { value: number; label: string } {
  const riskyAvg =
    (pulse.gbpusd.changePct + pulse.eurusd.changePct * -0.5 + pulse.usdjpy.changePct * 0.3) / 2.8;
  const value = Math.min(100, Math.max(0, Math.round(50 + riskyAvg * 12)));
  const label = riskyAvg > 0.2 ? "Risk-on" : riskyAvg < -0.2 ? "Risk-off" : "Nötr";
  return { value, label };
}

export function ForexMarketRegime({ regime, pulse, live }: Props) {
  const { safe, risky, em } = regime.distribution;
  const isDxyUp = regime.dxyChange >= 0;
  const riskBias = pulse
    ? computeForexRiskBiasFromPulse(pulse)
    : { value: 50, label: regime.stats.riskIstahi };
  const volBand = pulse ? volatilityBandFromValue(pulse.volatility.value) : "medium";
  const activeSessions = pulse?.sessions.filter((s) => s.status === "active") ?? [];

  return (
    <div className="cc-section cc-regime-section fc-regime-section" role="region" aria-label="Forex piyasa rejimi">
      <div className="cc-regime-top">
        <div className="cc-regime-main">
          <p className="cc-section-label cc-section-label--spaced">Piyasa Rejimi</p>

          <div className="cc-regime-headline-row">
            <div className="cc-regime-headline-wrap">
              <RegimeMark regime={regime.regime} />
              <span
                className={cn(
                  "cc-regime-headline fc-regime-headline",
                  regime.regime === "usd-dominant" && "cc-regime-headline--bull fc-regime-headline--usd",
                  regime.regime === "risk-on" && "fc-regime-headline--risk-on",
                  regime.regime === "risk-off" && "cc-regime-headline--bear fc-regime-headline--risk-off",
                  regime.regime === "range" && "cc-regime-headline--chop fc-regime-headline--range",
                )}
              >
                {REGIME_LABEL[regime.regime]}
              </span>
            </div>
            {live ? (
              <span className="cc-regime-live-chip fc-regime-live-chip">
                <span className="cc-regime-live-dot fc-regime-live-dot" aria-hidden />
                CANLI
              </span>
            ) : null}
          </div>

          {pulse ? (
            <div className="cc-regime-chip-row">
              <span className="cc-regime-chip">
                FX Volatilite
                <strong>{pulse.volatility.value}</strong>
                <em>{pulse.volatility.label}</em>
              </span>
              {activeSessions.length > 0 ? (
                <span className="cc-regime-chip cc-regime-chip--violet">
                  {activeSessions.map((s) => s.label).join(" · ")} açık
                </span>
              ) : (
                <span className="cc-regime-chip cc-regime-chip--muted">Seans geçişi</span>
              )}
              <span className="cc-regime-chip cc-regime-chip--muted">
                DXY
                <strong>{regime.dxyValue.toFixed(2)}</strong>
                <em className={cn(isDxyUp ? "cc-up" : "cc-down")}>{signedPct(regime.dxyChange)}</em>
              </span>
            </div>
          ) : null}

          <p className="cc-regime-summary">{regime.summary}</p>
        </div>

        <aside className="cc-dom-panel fc-dom-panel">
          <span className="cc-dom-label">DXY Endeksi</span>
          <span className="cc-dom-value">{regime.dxyValue.toFixed(2)}</span>
          <span className={cn("cc-dom-change", isDxyUp ? "cc-up" : "cc-down")}>
            {signedPct(regime.dxyChange)} (gün)
          </span>

          <div className="cc-dom-bar cc-dom-bar--full">
            <div className="cc-dom-bar-btc fc-dom-bar-safe" style={{ width: `${safe}%` }} title={`Güvenli ${safe}%`} />
            <div className="cc-dom-bar-eth fc-dom-bar-risky" style={{ width: `${risky}%` }} title={`Riskli ${risky}%`} />
            <div className="cc-dom-bar-alt fc-dom-bar-em" style={{ width: `${em}%` }} title={`GOÜ ${em}%`} />
          </div>

          <div className="cc-dom-legend cc-dom-legend--left">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot fc-dom-legend-dot--safe" />
              Güvenli {safe}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot fc-dom-legend-dot--risky" />
              Riskli {risky}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot fc-dom-legend-dot--em" />
              GOÜ {em}%
            </div>
          </div>
        </aside>
      </div>

      <div className="cc-regime-stats-row cc-regime-stats-row--full">
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Volatilite Bandı</span>
          <span className="cc-regime-stat-value">{pulse?.volatility.label ?? "—"}</span>
          <VolatilityMeter band={volBand} />
          <span className="cc-regime-stat-sub cc-regime-stat-sub--meta">
            {volBand === "low" ? "Düşük" : volBand === "medium" ? "Orta" : "Yüksek"}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Risk Biası</span>
          <span className="cc-regime-stat-value cc-regime-stat-value--teal">{riskBias.label}</span>
          <RiskBiasMeter value={riskBias.value} />
          <span className="cc-regime-stat-sub">{riskBias.value}%</span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Fed Tutumu</span>
          <span
            className="cc-regime-stat-value cc-regime-stat-value--sm"
            style={{ color: statTone(regime.stats.fedTutumu) }}
          >
            {regime.stats.fedTutumu}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Carry Trade</span>
          <span
            className="cc-regime-stat-value cc-regime-stat-value--gold cc-regime-stat-value--sm"
            style={{ color: statTone(regime.stats.carryTrade) }}
          >
            {regime.stats.carryTrade}
          </span>
          <span className="cc-regime-stat-sub">{regime.stats.trendGucu} trend</span>
        </div>
      </div>
    </div>
  );
}
