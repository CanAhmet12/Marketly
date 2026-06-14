"use client";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { useDetailMarketsComparison } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-markets-comparison";
import {
  fmtCompactUsd,
  fmtPriceUsd,
  fmtSignedPct,
} from "@/features/markets/crypto/symbol-detail/lib/format";
import type {
  MarketsComparisonRow,
  MarketsComparisonTrust,
} from "@/features/markets/crypto/lib/crypto-markets-comparison-types";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  variant?: "inline" | "wide";
};

const VOLUME_RING_COLORS = ["#2dd4a8", "#34d399", "#5eead4", "#14b8a6", "#64748b"];

function trustLabel(score: MarketsComparisonTrust): string {
  if (score === "green") return "Yüksek";
  if (score === "yellow") return "Orta";
  if (score === "red") return "Düşük";
  return "—";
}

function trustClass(score: MarketsComparisonTrust): string {
  if (score === "green") return "cdr-markets__trust--green";
  if (score === "yellow") return "cdr-markets__trust--yellow";
  if (score === "red") return "cdr-markets__trust--red";
  return "cdr-markets__trust--unknown";
}

function spreadTone(spread: number): "tight" | "mid" | "wide" {
  if (spread <= 0.05) return "tight";
  if (spread <= 0.15) return "mid";
  return "wide";
}

function spreadClass(spread: number): string {
  return `cdr-markets__spread--${spreadTone(spread)}`;
}

function buildVolumeRing(rows: MarketsComparisonRow[]): { gradient: string; leaderPct: string } {
  const sorted = [...rows].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 5);
  const total = sorted.reduce((sum, row) => sum + row.volumeUsd, 0);

  if (total <= 0 || sorted.length === 0) {
    return { gradient: "conic-gradient(#64748b 0% 100%)", leaderPct: "—" };
  }

  let cursor = 0;
  const stops: string[] = [];

  sorted.forEach((row, index) => {
    const pct = (row.volumeUsd / total) * 100;
    const next = cursor + pct;
    stops.push(`${VOLUME_RING_COLORS[index] ?? "#64748b"} ${cursor}% ${next}%`);
    cursor = next;
  });

  const leaderPct = ((sorted[0].volumeUsd / total) * 100).toFixed(0);

  return { gradient: `conic-gradient(${stops.join(", ")})`, leaderPct };
}

function rowAccentClass(row: MarketsComparisonRow): string {
  if (row.isBestPrice) return "cdr-markets__cell--best";
  if (row.isTopVolume) return "cdr-markets__cell--volume";
  return "";
}

export function DetailMarketsComparisonSection({ symbol, variant = "wide" }: Props) {
  const sym = symbol.trim().toUpperCase();
  const isInline = variant === "inline";
  const sectionClass = cn(
    "cdr-section cdr-markets-section",
    isInline ? "cdr-markets-section--inline" : "cdr-markets-section--wide",
  );
  const query = useDetailMarketsComparison(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className={sectionClass} data-zone="markets">
        <DetailSectionHead seriesKicker="Likidite" label="Borsa Karşılaştırması" accent="teal" />
        <div className="cdr-skeleton" style={{ height: isInline ? 240 : 300, borderRadius: 8 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className={sectionClass} data-zone="markets">
        <DetailSectionHead seriesKicker="Likidite" label="Borsa Karşılaştırması" accent="teal" />
        <p className="cdr-section-stub">Borsa karşılaştırması şu an kullanılamıyor.</p>
      </section>
    );
  }

  const maxVolume = Math.max(...data.rows.map((row) => row.volumeUsd), 1);
  const totalVolume = data.rows.reduce((sum, row) => sum + row.volumeUsd, 0);
  const minSpread = Math.min(...data.rows.map((row) => row.spreadPct));
  const maxSpread = Math.max(...data.rows.map((row) => row.spreadPct));
  const trustedCount = data.rows.filter((row) => row.trustScore === "green").length;
  const uniquePairs = new Set(data.rows.map((row) => row.pair)).size;
  const { gradient: volumeRing, leaderPct } = buildVolumeRing(data.rows);
  const topVolumeRows = [...data.rows]
    .sort((a, b) => b.volumeUsd - a.volumeUsd)
    .slice(0, 3);

  return (
    <section className={sectionClass} data-zone="markets" aria-label="Borsa karşılaştırması">
      <DetailSectionHead
        seriesKicker="CoinGecko"
        label="Borsa Karşılaştırması"
        accent="teal"
        trailing={
          <span className="cdr-markets__live-tag">
            <span className="cdr-markets__live-dot" aria-hidden />
            {data.exchangeCount} borsa
          </span>
        }
      />

      <div className="cdr-markets__canvas">
        <div className="cdr-markets__bento" role="list">
          <div className="cdr-markets__tile cdr-markets__tile--best" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">En iyi fiyat</span>
              <span className="cdr-markets__tile-v">{fmtPriceUsd(data.bestPrice)}</span>
              <span className="cdr-markets__tile-sub">{data.bestPriceExchange}</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--volume" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Hacim lideri</span>
              <span className="cdr-markets__tile-v">{data.topVolumeExchange}</span>
              <span className="cdr-markets__tile-sub">24s en yüksek hacim</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--spread" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Ort. spread</span>
              <span className="cdr-markets__tile-v">{data.avgSpreadPct.toFixed(3)}%</span>
              <span className="cdr-markets__tile-sub">Parite fark ortalaması</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--count" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Likidite ağı</span>
              <span className="cdr-markets__tile-v">{data.exchangeCount}</span>
              <span className="cdr-markets__tile-sub">{uniquePairs} aktif parite</span>
            </div>
          </div>
        </div>

        <div className="cdr-markets__body">
          <div className="cdr-markets__viz">
            <p className="cdr-markets__viz-label">Hacim dağılımı</p>
            <div className="cdr-markets__ring-wrap">
              <div className="cdr-markets__ring" style={{ background: volumeRing }} aria-hidden />
              <div className="cdr-markets__ring-core">
                <span className="cdr-markets__ring-pct">{leaderPct}%</span>
                <span className="cdr-markets__ring-k">lider pay</span>
              </div>
            </div>
            <div className="cdr-markets__tags">
              {topVolumeRows.map((row, index) => (
                <span key={row.exchangeId} className="cdr-markets__tag-pill">
                  <i
                    className="cdr-markets__tag-dot"
                    style={{ background: VOLUME_RING_COLORS[index] ?? "#64748b" }}
                  />
                  {row.exchangeName}
                  <strong>{Math.round((row.volumeUsd / maxVolume) * 100)}%</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="cdr-markets__facts">
            <div className="cdr-markets__fact cdr-markets__fact--total">
              <span className="cdr-markets__fact-k">Toplam hacim</span>
              <span className="cdr-markets__fact-v">{fmtCompactUsd(totalVolume)}</span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--spread">
              <span className="cdr-markets__fact-k">Spread aralığı</span>
              <span className="cdr-markets__fact-v">
                {minSpread.toFixed(3)}–{maxSpread.toFixed(3)}%
              </span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--trust">
              <span className="cdr-markets__fact-k">Güvenilir borsa</span>
              <span className="cdr-markets__fact-v">
                {trustedCount}/{data.rows.length}
              </span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--best">
              <span className="cdr-markets__fact-k">En iyi fiyat</span>
              <span className="cdr-markets__fact-v">{fmtPriceUsd(data.bestPrice)}</span>
            </div>
          </div>
        </div>

        <div className="cdr-markets__list-wrap">
          <p className="cdr-markets__list-title">Borsa listesi</p>
          <div className="cdr-markets__grid">
            {data.rows.map((row) => {
              const volPct = Math.round((row.volumeUsd / maxVolume) * 100);
              const exchangeName = row.tradeUrl ? (
                <a href={row.tradeUrl} target="_blank" rel="noopener noreferrer">
                  {row.exchangeName}
                </a>
              ) : (
                row.exchangeName
              );

              return (
                <article
                  key={row.exchangeId}
                  className={cn("cdr-markets__cell", rowAccentClass(row))}
                >
                  <div className="cdr-markets__cell-top">
                    <span className="cdr-markets__rank-num">{row.rank}</span>
                    <div className="cdr-markets__cell-id">
                      <span className="cdr-markets__name-row">
                        <span className="cdr-markets__exchange-main">{exchangeName}</span>
                        {row.isBestPrice ? (
                          <span className="cdr-markets__badge cdr-markets__badge--best">En iyi</span>
                        ) : null}
                        {row.isTopVolume ? (
                          <span className="cdr-markets__badge cdr-markets__badge--volume">Hacim</span>
                        ) : null}
                      </span>
                      <span className="cdr-markets__pair">{row.pair}</span>
                    </div>
                    <span className="cdr-markets__cell-price">{fmtPriceUsd(row.price)}</span>
                  </div>

                  <div className="cdr-markets__cell-bottom">
                    <span className="cdr-markets__chip cdr-markets__chip--vol">
                      {fmtCompactUsd(row.volumeUsd)}
                    </span>
                    <span className={cn("cdr-markets__chip", spreadClass(row.spreadPct))}>
                      {row.spreadPct.toFixed(3)}%
                    </span>
                    <span className={cn("cdr-markets__delta", row.priceDeltaPct >= 0 ? "cdr-up" : "cdr-down")}>
                      {fmtSignedPct(row.priceDeltaPct)}
                    </span>
                    <span className={cn("cdr-markets__trust", trustClass(row.trustScore))}>
                      <span className="cdr-markets__trust-dot" aria-hidden />
                      {trustLabel(row.trustScore)}
                    </span>
                  </div>

                  <span className="cdr-markets__vol-bar" aria-hidden>
                    <span className="cdr-markets__vol-fill" style={{ width: `${volPct}%` }} />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
