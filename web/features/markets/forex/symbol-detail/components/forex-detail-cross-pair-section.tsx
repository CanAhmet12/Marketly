"use client";

import { formatForexTickerPrice } from "@/features/markets/forex/lib/map-forex-tickers";
import type { ForexCrossPairRow } from "@/features/markets/forex/lib/forex-detail-types";
import { useForexDetailCrossPair } from "@/features/markets/forex/symbol-detail/hooks/use-forex-cross-pair";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

const SPREAD_RING_COLORS = ["#a78bfa", "#8b5cf6", "#c4b5fd", "#7c3aed", "#64748b"];

function spreadTone(spread: number): "tight" | "mid" | "wide" {
  if (spread <= 2) return "tight";
  if (spread <= 8) return "mid";
  return "wide";
}

function spreadClass(spread: number): string {
  return `cdr-markets__spread--${spreadTone(spread)}`;
}

function buildSpreadRing(rows: ForexCrossPairRow[]): { gradient: string; leaderPct: string } {
  const sorted = [...rows].sort((a, b) => a.spreadPct - b.spreadPct).slice(0, 5);
  const total = sorted.reduce((sum, row) => sum + Math.max(row.spreadPct, 0.01), 0);

  if (total <= 0 || sorted.length === 0) {
    return { gradient: "conic-gradient(#64748b 0% 100%)", leaderPct: "—" };
  }

  let cursor = 0;
  const stops: string[] = [];

  sorted.forEach((row, index) => {
    const pct = (Math.max(row.spreadPct, 0.01) / total) * 100;
    const next = cursor + pct;
    stops.push(`${SPREAD_RING_COLORS[index] ?? "#64748b"} ${cursor}% ${next}%`);
    cursor = next;
  });

  const leaderPct = ((Math.max(sorted[0]!.spreadPct, 0.01) / total) * 100).toFixed(0);
  return { gradient: `conic-gradient(${stops.join(", ")})`, leaderPct };
}

function rowAccentClass(row: ForexCrossPairRow): string {
  if (row.isSubject) return "cdr-markets__cell--best";
  if (row.isBenchmark) return "cdr-markets__cell--volume";
  return "";
}

function fmtPrice(price: number, symbol: string): string {
  return formatForexTickerPrice(price, symbol);
}

export function ForexDetailCrossPairSection({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const query = useForexDetailCrossPair(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-markets-section cdr-markets-section--inline" data-zone="cross-pair">
        <DetailSectionHead seriesKicker="Matrix" label="Cross-Pair Matrix" accent="teal" />
        <div className="cdr-skeleton" style={{ height: 300, borderRadius: 8 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-markets-section cdr-markets-section--inline" data-zone="cross-pair">
        <DetailSectionHead seriesKicker="Matrix" label="Cross-Pair Matrix" accent="teal" />
        <p className="cdr-section-stub">Cross-pair matrisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const minSpread = Math.min(...data.rows.map((row) => row.spreadPct));
  const maxSpread = Math.max(...data.rows.map((row) => row.spreadPct));
  const { gradient: spreadRing, leaderPct } = buildSpreadRing(data.rows);
  const tightestRows = [...data.rows].sort((a, b) => a.spreadPct - b.spreadPct).slice(0, 3);

  return (
    <section
      className="cdr-section cdr-markets-section cdr-markets-section--inline"
      data-zone="cross-pair"
      aria-label="Cross-pair matrisi"
    >
      <DetailSectionHead
        seriesKicker="Yahoo Finance"
        label="Cross-Pair Matrix"
        accent="teal"
        trailing={
          <span className="cdr-markets__live-tag">
            <span className="cdr-markets__live-dot" aria-hidden />
            {data.pairCount} parite
          </span>
        }
      />

      <div className="cdr-markets__canvas">
        <div className="cdr-markets__bento" role="list">
          <div className="cdr-markets__tile cdr-markets__tile--best" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">En düşük fiyat</span>
              <span className="cdr-markets__tile-v">{fmtPrice(data.bestPrice, sym)}</span>
              <span className="cdr-markets__tile-sub">{data.bestPricePair}</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--volume" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Benchmark</span>
              <span className="cdr-markets__tile-v">{data.benchmarkPair}</span>
              <span className="cdr-markets__tile-sub">{data.categoryLabel}</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--spread" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Ort. sapma</span>
              <span className="cdr-markets__tile-v">{data.avgSpreadPct.toFixed(2)}%</span>
              <span className="cdr-markets__tile-sub">Medyan fiyata göre</span>
            </div>
          </div>

          <div className="cdr-markets__tile cdr-markets__tile--count" role="listitem">
            <span className="cdr-markets__tile-accent" aria-hidden />
            <div className="cdr-markets__tile-body">
              <span className="cdr-markets__tile-k">Karşılaştırma</span>
              <span className="cdr-markets__tile-v">{data.pairCount}</span>
              <span className="cdr-markets__tile-sub">İlişkili majör çapraz</span>
            </div>
          </div>
        </div>

        <div className="cdr-markets__body">
          <div className="cdr-markets__viz">
            <p className="cdr-markets__viz-label">Sapma dağılımı</p>
            <div className="cdr-markets__ring-wrap">
              <div className="cdr-markets__ring" style={{ background: spreadRing }} aria-hidden />
              <div className="cdr-markets__ring-core">
                <span className="cdr-markets__ring-pct">{leaderPct}%</span>
                <span className="cdr-markets__ring-k">dar sapma</span>
              </div>
            </div>
            <div className="cdr-markets__tags">
              {tightestRows.map((row, index) => (
                <span key={row.pairId} className="cdr-markets__tag-pill">
                  <i
                    className="cdr-markets__tag-dot"
                    style={{ background: SPREAD_RING_COLORS[index] ?? "#64748b" }}
                  />
                  {row.pair}
                  <strong>{row.spreadPct.toFixed(2)}%</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="cdr-markets__facts">
            <div className="cdr-markets__fact cdr-markets__fact--spread">
              <span className="cdr-markets__fact-k">Sapma aralığı</span>
              <span className="cdr-markets__fact-v">
                {minSpread.toFixed(2)}–{maxSpread.toFixed(2)}%
              </span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--best">
              <span className="cdr-markets__fact-k">En düşük</span>
              <span className="cdr-markets__fact-v">{fmtPrice(data.bestPrice, sym)}</span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--trust">
              <span className="cdr-markets__fact-k">Benchmark</span>
              <span className="cdr-markets__fact-v">{data.benchmarkPair}</span>
            </div>
            <div className="cdr-markets__fact cdr-markets__fact--total">
              <span className="cdr-markets__fact-k">Grup</span>
              <span className="cdr-markets__fact-v">{data.categoryLabel}</span>
            </div>
          </div>
        </div>

        <div className="cdr-markets__list-wrap">
          <p className="cdr-markets__list-title">Parite listesi</p>
          <div className="cdr-markets__grid">
            {data.rows.map((row) => (
              <article key={row.pairId} className={cn("cdr-markets__cell", rowAccentClass(row))}>
                <div className="cdr-markets__cell-top">
                  <span className="cdr-markets__rank-num">{row.rank}</span>
                  <div className="cdr-markets__cell-id">
                    <span className="cdr-markets__name-row">
                      <span className="cdr-markets__exchange-main">{row.pairName}</span>
                      {row.isSubject ? (
                        <span className="cdr-markets__badge cdr-markets__badge--best">Parite</span>
                      ) : null}
                      {row.isBenchmark ? (
                        <span className="cdr-markets__badge cdr-markets__badge--volume">DXY</span>
                      ) : null}
                    </span>
                    <span className="cdr-markets__pair">{row.pair}</span>
                  </div>
                  <span className="cdr-markets__cell-price">{fmtPrice(row.price, row.symbol)}</span>
                </div>

                <div className="cdr-markets__cell-bottom">
                  <span className={cn("cdr-markets__chip", spreadClass(row.spreadPct))}>
                    {row.spreadPct.toFixed(2)}% sapma
                  </span>
                  <span className={cn("cdr-markets__delta", row.changePct >= 0 ? "cdr-up" : "cdr-down")}>
                    {fmtSignedPct(row.changePct)}
                  </span>
                </div>

                <span className="cdr-markets__vol-bar" aria-hidden>
                  <span
                    className="cdr-markets__vol-fill"
                    style={{ width: `${Math.max(8, 100 - row.spreadPct * 8)}%` }}
                  />
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
