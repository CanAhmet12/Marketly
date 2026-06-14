"use client";

import type {
  ForexMacroInsight,
  ForexMacroSlice,
} from "@/features/markets/forex/lib/forex-detail-types";
import { useForexDetailMacroRates } from "@/features/markets/forex/symbol-detail/hooks/use-forex-macro-rates";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

const SLICE_COLORS: Record<ForexMacroSlice["key"], string> = {
  policy: "#a78bfa",
  carry: "#8b5cf6",
  macro: "#c4b5fd",
};

function severityClass(severity: ForexMacroInsight["severity"]): string {
  if (severity === "high") return "cdr-tokenomics__signal--high";
  if (severity === "medium") return "cdr-tokenomics__signal--medium";
  return "cdr-tokenomics__signal--low";
}

function buildMacroRing(slices: ForexMacroSlice[]): string {
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

export function ForexDetailMacroRatesSection({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  const query = useForexDetailMacroRates(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline" data-zone="macro-rates">
        <DetailSectionHead seriesKicker="Makro" label="Makro & Faiz Korelasyonu" accent="peak" />
        <div className="cdr-skeleton" style={{ height: 300, borderRadius: 8 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline" data-zone="macro-rates">
        <DetailSectionHead seriesKicker="Makro" label="Makro & Faiz Korelasyonu" accent="peak" />
        <p className="cdr-section-stub">Makro faiz verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const policySlice = data.slices.find((s) => s.key === "policy");
  const ringGradient = buildMacroRing(data.slices);

  return (
    <section
      className="cdr-section cdr-tokenomics-section cdr-tokenomics-section--inline"
      data-zone="macro-rates"
      aria-label="Makro ve faiz korelasyonu"
    >
      <DetailSectionHead
        seriesKicker={data.source === "yahoo" ? "Yahoo · DXY" : "Referans"}
        label="Makro & Faiz Korelasyonu"
        accent="peak"
        trailing={
          <span className="cdr-tokenomics__live-tag">
            <span className="cdr-tokenomics__live-dot" aria-hidden />
            {data.categoryLabel}
          </span>
        }
      />

      <div className="cdr-tokenomics__canvas">
        <div className="cdr-tokenomics__bento" role="list">
          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--circ" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Faiz farkı</span>
              <span className="cdr-tokenomics__tile-v">{data.rateDiff}</span>
              <span className="cdr-tokenomics__tile-sub">{data.rateDiffSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--lock" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Baz faiz</span>
              <span className="cdr-tokenomics__tile-v">{data.baseRate}</span>
              <span className="cdr-tokenomics__tile-sub">{data.baseRateSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--fdv" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Karşıt faiz</span>
              <span className="cdr-tokenomics__tile-v">{data.quoteRate}</span>
              <span className="cdr-tokenomics__tile-sub">{data.quoteRateSub}</span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--pressure cdr-tokenomics__tile--pressure-mid" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Carry skoru</span>
              <span className="cdr-tokenomics__tile-v">{data.carryScore}</span>
              <span className="cdr-tokenomics__tile-sub">{data.carrySub}</span>
            </div>
          </div>
        </div>

        <div className="cdr-tokenomics__body">
          <div className="cdr-tokenomics__viz">
            <p className="cdr-tokenomics__viz-label">Makro ağırlık</p>
            <div className="cdr-tokenomics__ring-wrap">
              <div className="cdr-tokenomics__ring" style={{ background: ringGradient }} aria-hidden />
              <div className="cdr-tokenomics__ring-core">
                <span className="cdr-tokenomics__ring-pct">{policySlice?.pct.toFixed(0) ?? "—"}%</span>
                <span className="cdr-tokenomics__ring-k">politika</span>
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
              <span className="cdr-tokenomics__fact-k">DXY 30g</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.dxy30d}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--ratio">
              <span className="cdr-tokenomics__fact-k">Politika bias</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.policyBias}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--lock">
              <span className="cdr-tokenomics__fact-k">Carry bias</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.carryBias}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--max">
              <span className="cdr-tokenomics__fact-k">Makro skor</span>
              <span className="cdr-tokenomics__fact-v">{data.stats.macroScore}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--total">
              <span className="cdr-tokenomics__fact-k">Parite</span>
              <span className="cdr-tokenomics__fact-v">{data.pair}</span>
            </div>
          </div>
        </div>

        {data.insights.length > 0 ? (
          <div className="cdr-tokenomics__signals">
            <p className="cdr-tokenomics__signals-title">Makro sinyalleri</p>
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
