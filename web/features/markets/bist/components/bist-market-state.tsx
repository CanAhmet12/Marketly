"use client";

import type { BistMarketStatePayload } from "@/features/markets/bist/types";
import { cn } from "@/lib/cn";

type Props = { state: BistMarketStatePayload };

const TREND_ICON: Record<string, string> = {
  bull:  "🐂",
  bear:  "🐻",
  yatay: "↔",
};

const TREND_LABEL: Record<string, string> = {
  bull:  "YUKSELIS PIYASASI",
  bear:  "SATIS PIYASASI",
  yatay: "YATAY PIYASA",
};

function fmtIndex(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function BistMarketState({ state }: Props) {
  const { mali, sanayi, diger } = state.sectorDistribution;
  const isUp = state.bist100Change >= 0;

  return (
    <div className="cc-section" role="region" aria-label="BIST piyasa durumu">
      <p className="cc-section-label" style={{ marginBottom: 12 }}>Piyasa Durumu</p>

      <div className="cc-regime-dom-grid">
        {/* Sol: manşet */}
        <div className="min-w-0">
          <div className="cc-regime-headline-wrap flex items-center gap-2 flex-wrap">
            <span className="cc-regime-icon" aria-hidden>{TREND_ICON[state.trend]}</span>
            <span className={cn(
              "cc-regime-headline",
              state.trend === "bull" && "cc-regime-headline--bull",
              state.trend === "bear" && "cc-regime-headline--bear",
              state.trend === "yatay" && "cc-regime-headline--chop",
            )}>
              {TREND_LABEL[state.trend]}
            </span>
          </div>

          <p className="cc-regime-summary">{state.summary}</p>

          <div className="cc-regime-stats-row">
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Volatilite</span>
              <span className="cc-regime-stat-value">{state.stats.volatilite}</span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Yabanci Net Alim</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-teal)" }}>
                {state.stats.yabancıNetAlım}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Teknik Gorunum</span>
              <span className="cc-regime-stat-value" style={{ color: "var(--cc-gold)" }}>
                {state.stats.teknikGorunum}
              </span>
            </div>
            <div className="cc-regime-stat">
              <span className="cc-regime-stat-label">Momentum</span>
              <span className="cc-regime-stat-value">{state.stats.momentum}</span>
            </div>
          </div>
        </div>

        {/* Sağ: BIST 100 hero */}
        <div className="cc-dom-hero">
          <span className="cc-dom-label">BIST 100</span>
          <span className="cc-dom-value">{fmtIndex(state.bist100Value)}</span>
          <span className="cc-dom-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {signed(state.bist100Change)} (gun)
          </span>

          {/* Sektör dağılım bar */}
          <div className="cc-dom-bar" style={{ width: "100%", minWidth: 140 }}>
            <div className="cc-dom-bar-btc" style={{ width: `${mali}%` }} title={`Mali ${mali}%`} />
            <div className="cc-dom-bar-eth" style={{ width: `${sanayi}%` }} title={`Sanayi ${sanayi}%`} />
            <div className="cc-dom-bar-alt" style={{ width: `${diger}%` }} title={`Diger ${diger}%`} />
          </div>

          <div className="cc-dom-legend">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-gold)" }} />
              Mali {mali}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "var(--cc-teal)" }} />
              Sanayi {sanayi}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot" style={{ background: "rgba(167,139,250,0.5)" }} />
              Diger {diger}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
