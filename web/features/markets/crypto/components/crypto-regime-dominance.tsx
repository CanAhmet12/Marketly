"use client";

import type { CryptoPulseMetrics, CryptoRegimePayload } from "@/features/markets/crypto/types";
import { RegimeMark } from "@/features/markets/crypto/components/crypto-editorial-icons";
import {
  regimeMomentum,
  signedPct,
} from "@/features/markets/crypto/lib/crypto-sparkline-utils";
import { cn } from "@/lib/cn";

type Props = {
  regime: CryptoRegimePayload;
  pulse?: CryptoPulseMetrics;
  live?: boolean;
};

const REGIME_LABEL: Record<string, string> = {
  bull: "BULL MARKET",
  bear: "BEAR MARKET",
  chop: "RANGE PİYASA",
};

function VolatilityMeter({ band }: { band: CryptoRegimePayload["volatilityBand"] }) {
  const levels: CryptoRegimePayload["volatilityBand"][] = ["low", "medium", "high"];
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

export function CryptoRegimeDominance({ regime, pulse, live }: Props) {
  const altWidth = Math.max(0, 100 - regime.btcDominanceNumeric - regime.ethDominanceNumeric);
  const momentum = regimeMomentum(
    regime.regime,
    regime.riskBias,
    regime.momentumLabel,
    regime.momentumSubLabel,
  );
  const hasDominanceChange = regime.btcDominanceChange24h != null;
  const altSeason = pulse ? pulse.altcoinSeasonIndex >= 75 : false;
  const btcSeason = pulse ? pulse.altcoinSeasonIndex <= 25 : false;

  return (
    <div className="cc-section cc-regime-section" role="region" aria-label="Piyasa rejimi ve BTC hakimiyeti">
      <div className="cc-regime-top">
        <div className="cc-regime-main">
          <p className="cc-section-label cc-section-label--spaced">Piyasa Rejimi</p>

          <div className="cc-regime-headline-row">
            <div className="cc-regime-headline-wrap">
              <RegimeMark regime={regime.regime} />
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
            {live ? (
              <span className="cc-regime-live-chip">
                <span className="cc-regime-live-dot" aria-hidden />
                CANLI
              </span>
            ) : null}
          </div>

          {pulse ? (
            <div className="cc-regime-chip-row">
              <span className="cc-regime-chip">
                Korku &amp; Açgözlülük
                <strong>{pulse.fearGreed.value}</strong>
                <em>{pulse.fearGreed.label}</em>
              </span>
              {altSeason ? (
                <span className="cc-regime-chip cc-regime-chip--violet">Altcoin Sezonu</span>
              ) : btcSeason ? (
                <span className="cc-regime-chip cc-regime-chip--gold">BTC Sezonu</span>
              ) : (
                <span className="cc-regime-chip cc-regime-chip--muted">
                  Piyasa Dengesi
                  <strong>{pulse.altcoinSeasonIndex}</strong>
                </span>
              )}
              {pulse.totalMarketCap !== "—" ? (
                <span className="cc-regime-chip cc-regime-chip--muted">
                  Toplam Piyasa
                  <strong>{pulse.totalMarketCap}</strong>
                </span>
              ) : null}
            </div>
          ) : null}

          <p className="cc-regime-summary">{regime.summary}</p>
        </div>

        <aside className="cc-dom-panel">
          <span className="cc-dom-label">BTC Hakimiyeti</span>
          <span className="cc-dom-value">{regime.btcDominanceNumeric}%</span>
          {hasDominanceChange ? (
            <span
              className={cn(
                "cc-dom-change",
                regime.btcDominanceChange24h! >= 0 ? "cc-up" : "cc-down",
              )}
            >
              {signedPct(regime.btcDominanceChange24h!)} (24s)
            </span>
          ) : (
            <span className="cc-dom-change cc-neutral">— (24s)</span>
          )}

          <div className="cc-dom-bar cc-dom-bar--full">
            <div className="cc-dom-bar-btc" style={{ width: `${regime.btcDominanceNumeric}%` }} />
            <div className="cc-dom-bar-eth" style={{ width: `${regime.ethDominanceNumeric}%` }} />
            <div className="cc-dom-bar-alt" style={{ width: `${altWidth}%` }} />
          </div>

          <div className="cc-dom-legend cc-dom-legend--left">
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cc-dom-legend-dot--btc" />
              BTC {regime.btcDominanceNumeric}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cc-dom-legend-dot--eth" />
              ETH {regime.ethDominanceNumeric}%
            </div>
            <div className="cc-dom-legend-item">
              <div className="cc-dom-legend-dot cc-dom-legend-dot--alt" />
              Diğer {altWidth.toFixed(1)}%
            </div>
          </div>
        </aside>
      </div>

      <div className="cc-regime-stats-row cc-regime-stats-row--full">
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Volatilite Bandı</span>
          <span className="cc-regime-stat-value">{regime.volatilityLabel}</span>
          <VolatilityMeter band={regime.volatilityBand} />
          <span className="cc-regime-stat-sub cc-regime-stat-sub--meta">
            {regime.volatilityBand === "low" ? "Düşük" : regime.volatilityBand === "medium" ? "Orta" : "Yüksek"}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Risk Biası</span>
          <span className="cc-regime-stat-value cc-regime-stat-value--teal">{regime.riskBiasLabel}</span>
          <RiskBiasMeter value={regime.riskBias} />
          <span className="cc-regime-stat-sub">{regime.riskBias}%</span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Stablecoin Akışı</span>
          <span className="cc-regime-stat-value cc-regime-stat-value--teal cc-regime-stat-value--sm">
            {regime.stablecoinFlowLabel}
          </span>
        </div>
        <div className="cc-regime-stat">
          <span className="cc-regime-stat-label">Piyasa Momentumu</span>
          <span className="cc-regime-stat-value cc-regime-stat-value--gold">{momentum.label}</span>
          <span className="cc-regime-stat-sub">{momentum.sub}</span>
        </div>
      </div>
    </div>
  );
}
