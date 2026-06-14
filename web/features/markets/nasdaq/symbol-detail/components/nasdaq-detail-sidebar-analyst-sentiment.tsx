"use client";

import { memo } from "react";

import { useNasdaqDetailAnalystSentiment } from "@/features/markets/nasdaq/symbol-detail/hooks/use-nasdaq-analyst-sentiment";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function sentimentGaugeColor(score: number): string {
  if (score >= 68) return "#22d3ee";
  if (score >= 45) return "#38bdf8";
  return "#3b82f6";
}

function AnalystSentimentInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useNasdaqDetailAnalystSentiment(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="analyst-sentiment">
        <DetailSectionHead seriesKicker="Analist" label="Analist & Makro" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 240, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="analyst-sentiment">
        <DetailSectionHead seriesKicker="Analist" label="Analist & Makro" accent="signal" />
        <p className="cdr-section-stub">Analist sentiment verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const score = data.sentimentScore.value;
  const scoreColor = sentimentGaugeColor(score);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment"
      data-zone="analyst-sentiment"
      aria-label="Analist ve makro sentiment"
    >
      <DetailSectionHead
        seriesKicker="SPX · VIX"
        label="Analist & Makro"
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
            <span className="cdr-sentiment__fg-label">{data.sentimentScore.label}</span>
          </div>
        </div>

        <div className="cdr-sentiment__fg-copy">
          <p className="cdr-sentiment__fg-title">NASDAQ sentiment skoru</p>
          <p className="cdr-sentiment__fg-desc">SPX, VIX ve SPX korelasyonundan türetilmiş bileşik gösterge</p>
          <div className="cdr-sentiment__fg-spark" aria-hidden>
            {data.history.map((point) => (
              <span
                key={point.label}
                className="cdr-sentiment__fg-bar"
                style={{
                  height: `${Math.max(18, point.score)}%`,
                  background: sentimentGaugeColor(point.score),
                }}
                title={`${point.label} · ${point.score}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val">{data.priceTarget.avg}</span>
          <span className="cdr-sidebar-stat-label">PT · {data.priceTarget.upside}</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">{data.vix.value.toFixed(1)}</span>
          <span className="cdr-sidebar-stat-label">VIX · {data.vix.label}</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">SPX 24s</dt>
          <dd className={cn("cdr-kv-v", data.spx.change24hPct >= 0 ? "cdr-up" : "cdr-down")}>
            {fmtSignedPct(data.spx.change24hPct)} · {data.spx.label}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Kazanç</dt>
          <dd className="cdr-kv-v">
            {data.earnings.date} · {data.earnings.timing}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">SPX korelasyon</dt>
          <dd className="cdr-kv-v">
            {data.correlation.spxCorrelation.toFixed(2)} · {data.correlation.label}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export const NasdaqDetailSidebarAnalystSentiment = memo(AnalystSentimentInner);
