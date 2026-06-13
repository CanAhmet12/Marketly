"use client";

import type { ReactElement } from "react";

import { moodBandFromValue } from "@/features/markets/nasdaq/lib/nasdaq-regime-utils";
import { signedPct } from "@/features/markets/nasdaq/lib/nasdaq-sparkline-utils";
import type { NasdaqPulseMetrics, NasdaqRegimePayload } from "@/features/markets/nasdaq/types";
import { cn } from "@/lib/cn";

type Props = {
  regime: NasdaqRegimePayload;
  pulse?: NasdaqPulseMetrics;
  live?: boolean;
};

const REGIME_LABEL: Record<NasdaqRegimePayload["regime"], string> = {
  "tech-rally": "TECH RALLY",
  "growth-momentum": "GROWTH MOMENTUM",
  karisik: "KARIŞIK PİYASA",
  duzeltme: "DÜZELTME",
};

function RegimeMark({ regime }: { regime: NasdaqRegimePayload["regime"] }) {
  const icons: Record<NasdaqRegimePayload["regime"], ReactElement> = {
    "tech-rally": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 18 10 10l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "growth-momentum": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 17l6-6 4 4 8-10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    karisik: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 12h6M14 12h6M10 8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    duzeltme: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 6l6 6-6 6M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <span className="cc-regime-icon nq-regime-icon">{icons[regime]}</span>;
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

function TrendBiasMeter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="cc-regime-meter cc-regime-risk-meter" aria-hidden>
      <div className="cc-regime-risk-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function statTone(value: string): string | undefined {
  if (value.includes("Güçlü") || value.includes("Yukarı") || value.includes("Var")) return "var(--cc-teal)";
  if (value.includes("Zayıf") || value.includes("Aşağı")) return "var(--cc-rose)";
  return undefined;
}

export function NasdaqMarketRegime({ regime, pulse, live }: Props) {
  const { tech, health, other } = regime.distribution;
  const isUp = regime.ndxChange >= 0;
  const moodBand = pulse ? moodBandFromValue(pulse.marketMood.value) : "neutral";

  return (
    <div className="cc-section cc-regime-section nq-regime-section" role="region" aria-label="NASDAQ piyasa rejimi">
      <div className="cc-regime-top">
        <div className="cc-regime-main">
          <p className="cc-section-label cc-section-label--spaced">Piyasa Rejimi</p>

          <div className="cc-regime-headline-row">
            <div className="cc-regime-headline-wrap">
              <RegimeMark regime={regime.regime} />
              <span
                className={cn(
                  "cc-regime-headline nq-regime-headline",
                  regime.regime === "tech-rally" && "cc-regime-headline--bull nq-regime-headline--rally",
                  regime.regime === "growth-momentum" && "nq-regime-headline--growth",
                  regime.regime === "duzeltme" && "cc-regime-headline--chop nq-regime-headline--correction",
                  regime.regime === "karisik" && "nq-regime-headline--mixed",
                )}
              >
                {REGIME_LABEL[regime.regime]}
              </span>
            </div>
            {live ? (
              <span className="cc-regime-live-chip nq-regime-live-chip">
                <span className="cc-regime-live-dot nq-regime-live-dot" aria-hidden />
                CANLI
              </span>
            ) : null}
          </div>

          {pulse ? (
            <div className="cc-regime-chip-row">
              <span className="cc-regime-chip">
                Ruh Hali
                <strong>{pulse.marketMood.value}</strong>
                <em>{pulse.marketMood.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--violet">
                Fed Pivot
                <strong>{pulse.fedPivot.value}</strong>
                <em>{pulse.fedPivot.label}</em>
              </span>
              <span className="cc-regime-chip cc-regime-chip--muted">
                NDX
                <strong>{regime.ndxValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                <em className={cn(isUp ? "cc-up" : "cc-down")}>{signedPct(regime.ndxChange)}</em>
              </span>
            </div>
          ) : null}

          <p className="cc-regime-summary">{regime.summary}</p>
        </div>

        <aside className="cc-dom-panel nq-dom-panel">
          <span className="cc-dom-label">NASDAQ 100</span>
          <span className="cc-dom-value">{regime.ndxValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          <span className={cn("cc-dom-change", isUp ? "cc-up" : "cc-down")}>
            {signedPct(regime.ndxChange)} (gün)
          </span>

          <div className="cc-dom-bar cc-dom-bar--full">
            <div className="cc-dom-bar-btc nq-dom-bar-tech" style={{ width: `${tech}%` }} title={`Tech ${tech}%`} />
            <div className="cc-dom-bar-eth nq-dom-bar-health" style={{ width: `${health}%` }} title={`Sağlık ${health}%`} />
            <div className="cc-dom-bar-alt nq-dom-bar-other" style={{ width: `${other}%` }} title={`Diğer ${other}%`} />
          </div>

          <div className="cc-dom-legend cc-dom-legend--left">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot nq-dom-legend-dot--tech" />
              Teknoloji {tech}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot nq-dom-legend-dot--health" />
              Sağlık {health}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot nq-dom-legend-dot--other" />
              Diğer {other}%
            </div>
          </div>
        </aside>
      </div>

      <div className="cc-regime-stats-row cc-regime-stats-row--full">
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Big Tech</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.bigTechHareket) }}>
            {regime.stats.bigTechHareket}
          </span>
          <MoodMeter band={moodBand} />
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Faiz Beklentisi</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.faizBeklentisi) }}>
            {regime.stats.faizBeklentisi}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Büyüme Momentumu</span>
          <span className="cc-regime-stat-value" style={{ color: statTone(regime.stats.buyumeMomentu) }}>
            {regime.stats.buyumeMomentu}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Teknik</span>
          <span className="cc-regime-stat-value">{regime.stats.teknik}</span>
          <TrendBiasMeter value={pulse?.marketMood.value ?? 50} />
        </div>
      </div>
    </div>
  );
}
