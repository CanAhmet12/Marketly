"use client";

import { memo } from "react";

import { useForexDetailMacroSentiment } from "@/features/markets/forex/symbol-detail/hooks/use-forex-macro-sentiment";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function macroGaugeColor(score: number): string {
  if (score >= 68) return "#a78bfa";
  if (score >= 45) return "#8b5cf6";
  return "#7c3aed";
}

function MacroSentimentInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const query = useForexDetailMacroSentiment(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="macro-sentiment">
        <DetailSectionHead seriesKicker="Makro" label="Makro Sentiment" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 240, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="macro-sentiment">
        <DetailSectionHead seriesKicker="Makro" label="Makro Sentiment" accent="signal" />
        <p className="cdr-section-stub">Makro sentiment verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const score = data.macroScore.value;
  const scoreColor = macroGaugeColor(score);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment"
      data-zone="macro-sentiment"
      aria-label="Makro sentiment"
    >
      <DetailSectionHead
        seriesKicker="DXY · VIX"
        label="Makro Sentiment"
        accent="signal"
        trailing={<span className="cdr-sidebar-live-dot" aria-hidden />}
      />

      <div className="cdr-sentiment__fg">
        <div className="cdr-sentiment__fg-gauge" aria-hidden>
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="cdr-sentiment__fg-center">
            <span className="cdr-sentiment__fg-value">{score}</span>
            <span className="cdr-sentiment__fg-label">{data.macroScore.label}</span>
          </div>
        </div>

        <div className="cdr-sentiment__fg-copy">
          <p className="cdr-sentiment__fg-title">FX makro skoru</p>
          <p className="cdr-sentiment__fg-desc">DXY, VIX ve parite korelasyonundan türetilmiş bileşik gösterge</p>
          <div className="cdr-sentiment__fg-spark" aria-hidden>
            {data.history.map((point) => (
              <span
                key={point.label}
                className="cdr-sentiment__fg-bar"
                style={{
                  height: `${Math.max(18, point.score)}%`,
                  background: macroGaugeColor(point.score),
                }}
                title={`${point.label} · ${point.score}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", data.dxy.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {data.dxy.value.toFixed(2)}
          </span>
          <span className="cdr-sidebar-stat-label">DXY · {data.dxy.label}</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">{data.riskRegime.vix.toFixed(1)}</span>
          <span className="cdr-sidebar-stat-label">VIX · {data.riskRegime.label}</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">DXY 24s</dt>
          <dd className={cn("cdr-kv-v", data.dxy.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {fmtSignedPct(data.dxy.change24hPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Risk rejimi</dt>
          <dd className="cdr-kv-v">{data.riskRegime.label}</dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">DXY korelasyon</dt>
          <dd className="cdr-kv-v">
            {data.correlation.dxySensitivity.toFixed(2)} · {data.correlation.label}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export const ForexDetailSidebarMacroSentiment = memo(MacroSentimentInner);
