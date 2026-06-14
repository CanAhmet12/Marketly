"use client";

import type {
  BistFundamentalsInsight,
  BistFundamentalsSlice,
} from "@/features/markets/bist/lib/bist-detail-types";
import { useBistDetailFundamentals } from "@/features/markets/bist/symbol-detail/hooks/use-bist-fundamentals";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  name?: string;
};

const SLICE_COLORS: Record<BistFundamentalsSlice["key"], string> = {
  stock: "#3b82f6",
  production: "#2563eb",
  seasonal: "#60a5fa",
};

function severityClass(severity: BistFundamentalsInsight["severity"]): string {
  if (severity === "high") return "cdr-tokenomics__signal--high";
  if (severity === "medium") return "cdr-tokenomics__signal--medium";
  return "cdr-tokenomics__signal--low";
}

function buildValuationRing(slices: BistFundamentalsSlice[]): string {
  let cursor = 0;
  const stops: string[] = [];

  for (const slice of slices) {
    if (slice.pct <= 0) continue;
    const next = cursor + slice.pct;
    stops.push(`${SLICE_COLORS[slice.key]} ${cursor}% ${next}%`);
    cursor = next;
  }

  if (stops.length === 0) return "conic-gradient(#64748b 0% 100%)";
  return `conic-gradient(${stops.join(", ")})`;
}

export function BistDetailFundamentalsSection({ symbol, name }: Props) {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const query = useBistDetailFundamentals(sym, name);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline" data-zone="fundamentals">
        <DetailSectionHead seriesKicker="Temel" label="Temel & Değerleme" accent="peak" />
        <div className="cdr-skeleton" style={{ height: 300, borderRadius: 8 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline" data-zone="fundamentals">
        <DetailSectionHead seriesKicker="Temel" label="Temel & Değerleme" accent="peak" />
        <p className="cdr-section-stub">Temel analiz verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const valuationSlice = data.slices.find((s) => s.key === "stock");
  const ringGradient = buildValuationRing(data.slices);

  return (
    <section
      className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline"
      data-zone="fundamentals"
      aria-label="Temel ve değerleme"
    >
      <DetailSectionHead
        seriesKicker={data.source === "yahoo" ? "Yahoo · 52H" : "Referans"}
        label="Temel & Değerleme"
        accent="peak"
        trailing={
          <span className="cdr-tokenomics__live-tag">
            <span className="cdr-tokenomics__live-dot" aria-hidden />
            {data.sectorLabel}
          </span>
        }
      />

      <div className="cdr-tokenomics__canvas">
        <div className="cdr-tokenomics__bento" role="list">
          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--circ" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">F/K oranı</span>
              <span className="cdr-tokenomics__tile-v">{data.peRatio}</span>
              <span className="cdr-tokenomics__tile-sub">{data.peSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--lock" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">PD/DD</span>
              <span className="cdr-tokenomics__tile-v">{data.pbRatio}</span>
              <span className="cdr-tokenomics__tile-sub">{data.pbSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--fdv" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Piyasa değeri</span>
              <span className="cdr-tokenomics__tile-v">{data.marketCap}</span>
              <span className="cdr-tokenomics__tile-sub">{data.marketCapSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--pressure cdr-tokenomics__tile--pressure-mid" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Büyüme</span>
              <span className="cdr-tokenomics__tile-v">{data.revenueGrowth}</span>
              <span className="cdr-tokenomics__tile-sub">{data.revenueSub}</span>
            </div>
          </div>
        </div>

        <div className="cdr-tokenomics__body">
          <div className="cdr-tokenomics__viz">
            <p className="cdr-tokenomics__viz-label">Profil dağılımı</p>
            <div className="cdr-tokenomics__ring-wrap">
              <div className="cdr-tokenomics__ring" style={{ background: ringGradient }} aria-hidden />
              <div className="cdr-tokenomics__ring-core">
                <span className="cdr-tokenomics__ring-pct">{valuationSlice?.pct.toFixed(0) ?? "—"}%</span>
                <span className="cdr-tokenomics__ring-k">değerleme</span>
              </div>
            </div>
            <div className="cdr-tokenomics__tags">
              {data.slices.map((slice) => (
                <span
                  key={slice.key}
                  className={cn("cdr-tokenomics__tag", `cdr-tokenomics__tag--${slice.key}`)}
                >
                  <i className={cn("cdr-tokenomics__tag-dot", `cdr-tokenomics__tag-dot--${slice.key}`)} />
                  {slice.label}
                  <strong>{slice.pct.toFixed(0)}%</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="cdr-tokenomics__facts">
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--mcap">
              <span className="cdr-tokenomics__fact-k">52H yüksek</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.fiftyTwoWeekHigh}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--ratio">
              <span className="cdr-tokenomics__fact-k">52H düşük</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.fiftyTwoWeekLow}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--lock">
              <span className="cdr-tokenomics__fact-k">Temettü</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.dividendYield}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--max">
              <span className="cdr-tokenomics__fact-k">Hedef</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.analystTarget}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--total">
              <span className="cdr-tokenomics__fact-k">Sembol</span>
              <span className="cdr-tokenomics__fact-v">{data.name}</span>
            </div>
          </div>
        </div>

        {data.insights.length > 0 ? (
          <div className="cdr-tokenomics__signals">
            <p className="cdr-tokenomics__signals-title">Temel analiz sinyalleri</p>
            <div className="cdr-tokenomics__signal-list">
              {data.insights.map((insight) => (
                <article
                  key={insight.id}
                  className={cn("cdr-tokenomics__signal", severityClass(insight.severity))}
                >
                  <span className="cdr-tokenomics__signal-accent" aria-hidden />
                  <div className="cdr-tokenomics__signal-main">
                    <div className="cdr-tokenomics__signal-head">
                      <span className="cdr-tokenomics__signal-dot" aria-hidden />
                      <h3 className="cdr-tokenomics__signal-title">{insight.title}</h3>
                    </div>
                    <p className="cdr-tokenomics__signal-desc">{insight.detail}</p>
                  </div>
                  <span className="cdr-tokenomics__signal-badge">
                    <em>{insight.metricLabel}</em>
                    {insight.metricValue}
                  </span>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
