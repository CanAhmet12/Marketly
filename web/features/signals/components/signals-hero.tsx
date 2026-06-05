"use client";

import type { SignalsHeroPayload } from "@/features/signals/types";

type Props = {
  hero: SignalsHeroPayload;
};

export function SignalsHero({ hero }: Props) {
  return (
    <section className="sp-hero sp-hero--compact">
      <svg
        className="sp-hero-bg"
        viewBox="0 0 420 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="210" cy="150" r="140" stroke="#0f9d75" strokeWidth="0.5" strokeDasharray="4 8" />
        <circle cx="210" cy="150" r="100" stroke="#0f9d75" strokeWidth="0.5" strokeDasharray="3 6" />
        <path d="M80 200 L120 170 L160 185 L200 140 L240 160 L280 120 L320 100 L360 80" stroke="#0f9d75" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="sp-hero-inner">
        <div className="sp-hero-left">
          <div className="sp-hero-label-row">
            <span className="sp-hero-label">Sinyal Merkezi</span>
            <span className="sp-live-badge">
              <span className="sp-live-dot" aria-hidden>
                <span className="sp-live-dot-ping" />
                <span className="sp-live-dot-core" />
              </span>
              LIVE
            </span>
          </div>

          <h1 className="sp-hero-title">Sinyaller</h1>

          <p className="sp-hero-sub">
            {hero.pulseLabel} — ortalama güven{" "}
            <strong className="sp-hero-sub-accent">%{hero.avgConfidence}</strong>
          </p>
        </div>

        <div className="sp-hero-right">
          <div className="sp-hero-stats-grid">
            <div className="sp-hero-stat-cell">
              <span className="sp-hero-stat-label">Aktif</span>
              <span className="sp-hero-stat-value">{hero.activeCount}</span>
            </div>
            <div className="sp-hero-stat-cell">
              <span className="sp-hero-stat-label">BUY</span>
              <span className="sp-hero-stat-value sp-hero-stat-value--buy">{hero.buyCount}</span>
            </div>
            <div className="sp-hero-stat-cell">
              <span className="sp-hero-stat-label">SELL</span>
              <span className="sp-hero-stat-value sp-hero-stat-value--sell">{hero.sellCount}</span>
            </div>
            <div className="sp-hero-stat-cell">
              <span className="sp-hero-stat-label">Ort.Güven</span>
              <span className="sp-hero-stat-value sp-hero-stat-value--accent">%{hero.avgConfidence}</span>
            </div>
          </div>

          <div className="sp-hero-extra-row">
            <div className="sp-hero-extra-cell">
              <span className="sp-hero-extra-label">Başarı Oranı</span>
              <span className="sp-hero-extra-value">%{hero.successRate ?? "—"}</span>
            </div>
            {hero.lastStrong ? (
              <div className="sp-hero-extra-cell">
                <span className="sp-hero-extra-label">Son Güçlü</span>
                <div className="sp-hero-last-strong">
                  <div className="sp-hero-last-strong-icon">{hero.lastStrong.symbol.slice(0, 1)}</div>
                  <div>
                    <div className="sp-hero-last-strong-symbol">{hero.lastStrong.symbol}</div>
                    <div className="sp-hero-last-strong-dir">{hero.lastStrong.direction}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
