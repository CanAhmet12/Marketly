"use client";

import { memo } from "react";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { useDetailSentimentOnchain } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-sentiment-onchain";
import { fearGreedColor } from "@/features/markets/crypto/lib/fear-greed";
import { fmtCompactUsd } from "@/features/markets/crypto/symbol-detail/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function concentrationLabel(level: "low" | "medium" | "high"): string {
  if (level === "high") return "Yüksek konsantrasyon";
  if (level === "medium") return "Orta konsantrasyon";
  return "Dağınık sahiplik";
}

function fmtHolderCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function DetailSidebarSentimentInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase();
  const query = useDetailSentimentOnchain(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="sentiment">
        <DetailSectionHead seriesKicker="Piyasa" label="Duygu & On-Chain" accent="live" />
        <div className="cdr-skeleton" style={{ height: 240, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="sentiment">
        <DetailSectionHead seriesKicker="Piyasa" label="Duygu & On-Chain" accent="live" />
        <p className="cdr-section-stub">Duygu verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const fg = data.fearGreed.current;
  const fgColor = fearGreedColor(fg.value);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (fg.value / 100) * circumference;
  const onchain = data.onchain;
  const dist = onchain.distribution;

  return (
    <section
      className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment"
      data-zone="sentiment"
      aria-label="Duygu ve on-chain"
    >
      <DetailSectionHead
        seriesKicker="Global + Token"
        label="Duygu & On-Chain"
        accent="live"
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
              stroke={fgColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="cdr-sentiment__fg-center">
            <span className="cdr-sentiment__fg-value">{fg.value}</span>
            <span className="cdr-sentiment__fg-label">{fg.labelTr}</span>
          </div>
        </div>

        <div className="cdr-sentiment__fg-copy">
          <p className="cdr-sentiment__fg-title">Fear & Greed Index</p>
          <p className="cdr-sentiment__fg-desc">Kripto piyasası genel duygu göstergesi (Alternative.me)</p>
          {data.fearGreed.change7d != null ? (
            <p className={cn("cdr-sentiment__fg-change", data.fearGreed.change7d >= 0 ? "cdr-up" : "cdr-down")}>
              7g değişim {data.fearGreed.change7d >= 0 ? "+" : ""}
              {data.fearGreed.change7d.toFixed(0)} puan
            </p>
          ) : null}
          <div className="cdr-sentiment__fg-spark" aria-hidden>
            {data.fearGreed.history.map((point) => (
              <span
                key={point.timestamp}
                className="cdr-sentiment__fg-bar"
                style={{
                  height: `${Math.max(18, point.value)}%`,
                  background: fearGreedColor(point.value),
                }}
                title={`${point.labelTr} · ${point.value}`}
              />
            ))}
          </div>
        </div>
      </div>

      {onchain.available && dist ? (
        <div className="cdr-sentiment__onchain">
          <p className="cdr-sentiment__onchain-title">On-chain sahiplik</p>

          <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
            <div className="cdr-sidebar-stat">
              <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--accent">
                {onchain.holderCount ? fmtHolderCount(onchain.holderCount) : "—"}
              </span>
              <span className="cdr-sidebar-stat-label">Holder</span>
            </div>
            <div className="cdr-sidebar-stat">
              <span className="cdr-sidebar-stat-val">{dist.top10Pct.toFixed(1)}%</span>
              <span className="cdr-sidebar-stat-label">Top 10</span>
            </div>
          </div>

          <div className="cdr-sentiment__dist-bar" aria-hidden>
            <span className="cdr-sentiment__dist-seg cdr-sentiment__dist-seg--top10" style={{ width: `${dist.top10Pct}%` }} />
            <span
              className="cdr-sentiment__dist-seg cdr-sentiment__dist-seg--mid"
              style={{ width: `${dist.mid11_30Pct}%` }}
            />
            <span
              className="cdr-sentiment__dist-seg cdr-sentiment__dist-seg--mid2"
              style={{ width: `${dist.mid31_50Pct}%` }}
            />
            <span className="cdr-sentiment__dist-seg cdr-sentiment__dist-seg--rest" style={{ width: `${dist.restPct}%` }} />
          </div>

          <dl className="cdr-kv-list cdr-section-body">
            <div className="cdr-kv-row">
              <dt className="cdr-kv-k">Konsantrasyon</dt>
              <dd className="cdr-kv-v">{concentrationLabel(onchain.concentration)}</dd>
            </div>
            {onchain.platform ? (
              <div className="cdr-kv-row">
                <dt className="cdr-kv-k">Veri kaynağı</dt>
                <dd className="cdr-kv-v">{onchain.platform}</dd>
              </div>
            ) : null}
            {onchain.marketCapRank ? (
              <div className="cdr-kv-row">
                <dt className="cdr-kv-k">MC sırası</dt>
                <dd className="cdr-kv-v">#{onchain.marketCapRank}</dd>
              </div>
            ) : null}
            {onchain.tvlUsd ? (
              <div className="cdr-kv-row">
                <dt className="cdr-kv-k">TVL</dt>
                <dd className="cdr-kv-v">{fmtCompactUsd(onchain.tvlUsd)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <dl className="cdr-kv-list cdr-section-body">
          {onchain.marketCapRank ? (
            <div className="cdr-kv-row">
              <dt className="cdr-kv-k">MC sırası</dt>
              <dd className="cdr-kv-v">#{onchain.marketCapRank}</dd>
            </div>
          ) : null}
          {onchain.tvlUsd ? (
            <div className="cdr-kv-row">
              <dt className="cdr-kv-k">TVL</dt>
              <dd className="cdr-kv-v">{fmtCompactUsd(onchain.tvlUsd)}</dd>
            </div>
          ) : null}
          <div className="cdr-kv-row">
            <dt className="cdr-kv-k">On-chain</dt>
            <dd className="cdr-kv-v">Holder verisi yok</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

export const DetailSidebarSentiment = memo(DetailSidebarSentimentInner);
