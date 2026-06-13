"use client";

import type { ReactElement } from "react";

import { moodBandFromValue } from "@/features/markets/bist/lib/bist-regime-utils";
import { signedPct } from "@/features/markets/bist/lib/bist-sparkline-utils";
import type { BistMarketStatePayload, BistPulseMetrics } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = {
  state: BistMarketStatePayload;
  pulse?: BistPulseMetrics;
  live?: boolean;
};

const TREND_LABEL: Record<BistMarketStatePayload["trend"], string> = {
  bull: "YÜKSELİŞ PİYASASI",
  bear: "SATIŞ PİYASASI",
  yatay: "YATAY SEYİR",
};

function TrendMark({ trend }: { trend: BistMarketStatePayload["trend"] }) {
  const icons: Record<BistMarketStatePayload["trend"], ReactElement> = {
    bull: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 18 10 10l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bear: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 6l6 6-6 6M14 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    yatay: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 12h16" strokeLinecap="round" />
      </svg>
    ),
  };
  return <span className="cc-regime-icon bc-regime-icon">{icons[trend]}</span>;
}

function MoodMeter({ band }: { band: "risk-on" | "neutral" | "risk-off" }) {
  const levels: ("risk-on" | "neutral" | "risk-off")[] = ["risk-off", "neutral", "risk-on"];
  return (
    <div className="cc-regime-meter cc-regime-vol-meter" aria-hidden>
      {levels.map((level) => (
        <span
          key={level}
          className={cn(
            "cc-regime-vol-seg",
            level === band && "cc-regime-vol-seg--active",
            level === "risk-off" && "cc-regime-vol-seg--low",
            level === "neutral" && "cc-regime-vol-seg--med",
            level === "risk-on" && "cc-regime-vol-seg--high",
          )}
        />
      ))}
    </div>
  );
}

function statTone(value: string): string | undefined {
  if (value.includes("Pozitif") || value.includes("Yükseliş")) return "var(--cc-teal)";
  if (value.includes("Negatif") || value.includes("Düşüş")) return "var(--cc-rose)";
  return undefined;
}

export function BistMarketState({ state, pulse, live }: Props) {
  const { mali, sanayi, diger } = state.sectorDistribution;
  const isUp = state.bist100Change >= 0;
  const moodBand = pulse ? moodBandFromValue(pulse.piyasaDurumu.value) : "neutral";

  return (
    <div className="cc-section cc-regime-section bc-regime-section" role="region" aria-label="BIST piyasa durumu">
      <div className="cc-regime-top">
        <div className="cc-regime-main">
          <p className="cc-section-label cc-section-label--spaced">Piyasa Durumu</p>

          <div className="cc-regime-headline-row">
            <div className="cc-regime-headline-wrap">
              <TrendMark trend={state.trend} />
              <span
                className={cn(
                  "cc-regime-headline bc-regime-headline",
                  state.trend === "bull" && "cc-regime-headline--bull bc-regime-headline--bull",
                  state.trend === "bear" && "cc-regime-headline--bear bc-regime-headline--bear",
                  state.trend === "yatay" && "bc-regime-headline--flat",
                )}
              >
                {TREND_LABEL[state.trend]}
              </span>
            </div>
            {live ? (
              <span className="cc-regime-live-chip bc-regime-live-chip">
                <span className="cc-regime-live-dot bc-regime-live-dot" aria-hidden />
                CANLI
              </span>
            ) : null}
          </div>

          {pulse ? (
            <div className="cc-regime-chip-row">
              <span className="cc-regime-chip">
                Piyasa
                <strong>{pulse.piyasaDurumu.value}</strong>
                <em>{pulse.piyasaDurumu.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--violet">
                Yabancı
                <strong>{pulse.yabancıOran.value.toFixed(1)}%</strong>
                <em>{pulse.yabancıOran.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--muted">
                BIST 100
                <strong>{state.bist100Value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</strong>
                <em className={cn(isUp ? "cc-up" : "cc-down")}>{signedPct(state.bist100Change)}</em>
              </span>
            </div>
          ) : null}

          <p className="cc-regime-summary">{state.summary}</p>
        </div>

        <aside className="cc-dom-panel bc-dom-panel">
          <span className="cc-dom-label">BIST 100</span>
          <span className="cc-dom-value">
            {state.bist100Value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={cn("cc-dom-change", isUp ? "cc-up" : "cc-down")}>
            {signedPct(state.bist100Change)} (gün)
          </span>

          <div className="cc-dom-bar cc-dom-bar--full">
            <div className="cc-dom-bar-btc bc-dom-bar-mali" style={{ width: `${mali}%` }} title={`Mali ${mali}%`} />
            <div className="cc-dom-bar-eth bc-dom-bar-sanayi" style={{ width: `${sanayi}%` }} title={`Sanayi ${sanayi}%`} />
            <div className="cc-dom-bar-alt bc-dom-bar-diger" style={{ width: `${diger}%` }} title={`Diğer ${diger}%`} />
          </div>

          <div className="cc-dom-legend cc-dom-legend--left">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot bc-dom-legend-dot--mali" />
              Mali {mali}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot bc-dom-legend-dot--sanayi" />
              Sanayi {sanayi}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot bc-dom-legend-dot--diger" />
              Diğer {diger}%
            </div>
          </div>
        </aside>
      </div>

      <div className="cc-regime-stats-row cc-regime-stats-row--full">
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Volatilite</span>
          <span className="cc-regime-stat-value">{state.stats.volatilite}</span>
          <MoodMeter band={moodBand} />
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Yabancı Net Alım</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(state.stats.yabancıNetAlım) }}>
            {state.stats.yabancıNetAlım}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Teknik Görünüm</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(state.stats.teknikGorunum) }}>
            {state.stats.teknikGorunum}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Momentum</span>
          <span className="cc-regime-stat-value">{state.stats.momentum}</span>
        </div>
      </div>
    </div>
  );
}
