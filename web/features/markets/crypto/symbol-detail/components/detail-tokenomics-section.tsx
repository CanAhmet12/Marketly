"use client";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-section-surface";
import { useDetailTokenomics } from "@/features/markets/crypto/symbol-detail/hooks/use-detail-tokenomics";
import {
  fmtCompactQty,
  fmtCompactUsd,
  fmtSignedPct,
} from "@/features/markets/crypto/symbol-detail/lib/format";
import type {
  TokenomicsSupplySlice,
  TokenomicsUnlockInsight,
} from "@/features/markets/crypto/lib/crypto-tokenomics-types";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  variant?: "inline" | "wide";
};

const SLICE_COLORS: Record<TokenomicsSupplySlice["key"], string> = {
  circulating: "#2dd4a8",
  locked: "#fbbf24",
  remaining: "#64748b",
};

function pressureShort(pressure: "low" | "medium" | "high"): string {
  if (pressure === "high") return "Yüksek";
  if (pressure === "medium") return "Orta";
  return "Düşük";
}

function pressureSub(pressure: "low" | "medium" | "high"): string {
  if (pressure === "high") return "Güçlü baskı";
  if (pressure === "medium") return "Orta seviye";
  return "Sınırlı baskı";
}

function severityClass(severity: TokenomicsUnlockInsight["severity"]): string {
  if (severity === "high") return "cdr-tokenomics__signal--high";
  if (severity === "medium") return "cdr-tokenomics__signal--medium";
  return "cdr-tokenomics__signal--low";
}

function buildSupplyRing(slices: TokenomicsSupplySlice[]): string {
  let cursor = 0;
  const stops: string[] = [];

  for (const slice of slices) {
    if (slice.pct <= 0) continue;
    const next = cursor + slice.pct;
    stops.push(`${SLICE_COLORS[slice.key]} ${cursor}% ${next}%`);
    cursor = next;
  }

  if (stops.length === 0) {
    return "conic-gradient(#64748b 0% 100%)";
  }

  return `conic-gradient(${stops.join(", ")})`;
}

export function DetailTokenomicsSection({ symbol, variant = "wide" }: Props) {
  const sym = symbol.trim().toUpperCase();
  const isInline = variant === "inline";
  const sectionClass = cn(
    "cdr-section cdr-tokenomics-section",
    isInline ? "cdr-tokenomics-section--inline" : "cdr-tokenomics-section--wide",
  );
  const query = useDetailTokenomics(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className={sectionClass} data-zone="tokenomics">
        <DetailSectionHead seriesKicker="Arz" label="Tokenomics & Kilitler" accent="peak" />
        <div className="cdr-skeleton" style={{ height: isInline ? 240 : 300, borderRadius: 8 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className={sectionClass} data-zone="tokenomics">
        <DetailSectionHead seriesKicker="Arz" label="Tokenomics & Kilitler" accent="peak" />
        <p className="cdr-section-stub">Tokenomics verisi şu an kullanılamıyor.</p>
      </section>
    );
  }

  const growth = data.supplyGrowth30dPct;
  const circulatingSlice = data.slices.find((s) => s.key === "circulating");
  const lockedSlice = data.slices.find((s) => s.key === "locked");
  const ringGradient = buildSupplyRing(data.slices);
  const ringCenterPct = circulatingSlice?.pct.toFixed(1) ?? "—";

  return (
    <section className={sectionClass} data-zone="tokenomics" aria-label="Tokenomics ve kilitler">
      <DetailSectionHead
        seriesKicker="CoinGecko"
        label="Tokenomics & Kilitler"
        accent="peak"
        trailing={
          <span className="cdr-tokenomics__live-tag">
            <span className="cdr-tokenomics__live-dot" aria-hidden />
            {data.name}
          </span>
        }
      />

      <div className="cdr-tokenomics__canvas">
        <div className="cdr-tokenomics__bento" role="list">
          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--circ" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Dolaşımdaki arz</span>
              <span className="cdr-tokenomics__tile-v">{fmtCompactQty(data.circulatingQty)}</span>
              <span className="cdr-tokenomics__tile-sub">
                {circulatingSlice ? `${circulatingSlice.pct.toFixed(1)}% toplam` : "Canlı arz"}
              </span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--lock" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Kilitli arz</span>
              <span className="cdr-tokenomics__tile-v">
                {data.lockedQty > 0 ? fmtCompactQty(data.lockedQty) : "Yok"}
              </span>
              <span className="cdr-tokenomics__tile-sub">{data.lockedPct.toFixed(1)}% kilitli</span>
              <span className="cdr-tokenomics__tile-bar" aria-hidden>
                <span
                  className="cdr-tokenomics__tile-bar-fill cdr-tokenomics__tile-bar-fill--gold"
                  style={{ width: `${Math.min(data.lockedPct, 100)}%` }}
                />
              </span>
            </div>
          </div>

          <div className="cdr-tokenomics__tile cdr-tokenomics__tile--fdv" role="listitem">
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">FDV</span>
              <span className="cdr-tokenomics__tile-v">{fmtCompactUsd(data.fdvUsd)}</span>
              <span className="cdr-tokenomics__tile-sub">
                Tam seyreltilmiş değer
              </span>
            </div>
          </div>

          <div
            className={cn(
              "cdr-tokenomics__tile cdr-tokenomics__tile--pressure",
              data.unlockPressure === "high" && "cdr-tokenomics__tile--pressure-high",
              data.unlockPressure === "medium" && "cdr-tokenomics__tile--pressure-mid",
              data.unlockPressure === "low" && "cdr-tokenomics__tile--pressure-low",
            )}
            role="listitem"
          >
            <span className="cdr-tokenomics__tile-accent" aria-hidden />
            <div className="cdr-tokenomics__tile-body">
              <span className="cdr-tokenomics__tile-k">Unlock baskısı</span>
              <span className="cdr-tokenomics__tile-v">{pressureShort(data.unlockPressure)}</span>
              <span className="cdr-tokenomics__tile-sub">{pressureSub(data.unlockPressure)}</span>
            </div>
          </div>
        </div>

        <div className="cdr-tokenomics__body">
          <div className="cdr-tokenomics__viz">
            <p className="cdr-tokenomics__viz-label">Arz dağılımı</p>
            <div className="cdr-tokenomics__ring-wrap">
              <div
                className="cdr-tokenomics__ring"
                style={{ background: ringGradient }}
                aria-hidden
              />
              <div className="cdr-tokenomics__ring-core">
                <span className="cdr-tokenomics__ring-pct">{ringCenterPct}%</span>
                <span className="cdr-tokenomics__ring-k">dolaşımda</span>
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
                  <strong>{slice.pct.toFixed(1)}%</strong>
                </span>
              ))}
            </div>
            {lockedSlice && lockedSlice.pct > 0 ? (
              <p className="cdr-tokenomics__viz-note">{lockedSlice.pct.toFixed(1)}% kilitli arz</p>
            ) : null}
          </div>

          <div className="cdr-tokenomics__facts">
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--mcap">
              <span className="cdr-tokenomics__fact-k">Piyasa değeri</span>
              <span className="cdr-tokenomics__fact-v">{fmtCompactUsd(data.marketCapUsd)}</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--ratio">
              <span className="cdr-tokenomics__fact-k">MC / FDV</span>
              <span className="cdr-tokenomics__fact-v">{(data.mcFdvRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--lock">
              <span className="cdr-tokenomics__fact-k">Kilitli oran</span>
              <span className="cdr-tokenomics__fact-v">{data.lockedPct.toFixed(1)}%</span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--max">
              <span className="cdr-tokenomics__fact-k">Max arz</span>
              <span className="cdr-tokenomics__fact-v">
                {data.maxQty ? fmtCompactQty(data.maxQty) : "Sınırsız"}
              </span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--growth">
              <span className="cdr-tokenomics__fact-k">30g arz değişimi</span>
              <span
                className={cn(
                  "cdr-tokenomics__fact-v",
                  growth != null && growth >= 0 ? "cdr-up" : "cdr-down",
                )}
              >
                {growth != null ? fmtSignedPct(growth) : "—"}
              </span>
            </div>
            <div className="cdr-tokenomics__fact cdr-tokenomics__fact--total">
              <span className="cdr-tokenomics__fact-k">Toplam arz</span>
              <span className="cdr-tokenomics__fact-v">
                {data.totalQty ? fmtCompactQty(data.totalQty) : fmtCompactQty(data.circulatingQty)}
              </span>
            </div>
          </div>
        </div>

        {data.insights.length > 0 ? (
          <div className="cdr-tokenomics__signals">
            <p className="cdr-tokenomics__signals-title">Unlock & baskı sinyalleri</p>
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
