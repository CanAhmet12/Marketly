"use client";

import { memo } from "react";

import { useBistDetailMacroFx } from "@/features/markets/bist/symbol-detail/hooks/use-bist-macro-fx";
import { fmtSignedPct } from "@/features/markets/crypto/symbol-detail/lib/format";
import { DetailSectionHead } from "@/features/markets/symbol-detail-core/components/detail-section-head";
import { useDetailSectionSurface } from "@/features/markets/symbol-detail-core/hooks/use-detail-section-surface";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
};

function macroGaugeColor(score: number): string {
  if (score >= 68) return "#2563eb";
  if (score >= 45) return "#3b82f6";
  return "#60a5fa";
}

function MacroFxInner({ symbol }: Props) {
  const sym = symbol.trim().toUpperCase().replace(".IS", "");
  const query = useBistDetailMacroFx(sym);
  const { data } = query;
  const surface = useDetailSectionSurface(query);

  if (surface.showInitialSkeleton) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="macro-fx">
        <DetailSectionHead seriesKicker="Makro" label="Makro & Kur" accent="signal" />
        <div className="cdr-skeleton" style={{ height: 240, borderRadius: 10 }} />
      </section>
    );
  }

  if (surface.showUnavailableStub || !data) {
    return (
      <section className="cdr-section cdr-sidebar-block cdr-sidebar-block--sentiment" data-zone="macro-fx">
        <DetailSectionHead seriesKicker="Makro" label="Makro & Kur" accent="signal" />
        <p className="cdr-section-stub">Makro/kur verisi şu an kullanılamıyor.</p>
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
      data-zone="macro-fx"
      aria-label="Makro ve kur"
    >
      <DetailSectionHead
        seriesKicker="USD/TRY · EUR/TRY"
        label="Makro & Kur"
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
          <p className="cdr-sentiment__fg-title">BIST makro skoru</p>
          <p className="cdr-sentiment__fg-desc">USD/TRY, EUR/TRY ve sembol kur duyarlılığından türetilmiş gösterge</p>
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
          <span className={cn("cdr-sidebar-stat-val", data.usdTry.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {data.usdTry.value.toFixed(4)}
          </span>
          <span className="cdr-sidebar-stat-label">USD/TRY · {data.usdTry.label}</span>
        </div>
        <div className="cdr-sidebar-stat">
          <span className={cn("cdr-sidebar-stat-val", data.eurTry.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {data.eurTry.value.toFixed(4)}
          </span>
          <span className="cdr-sidebar-stat-label">EUR/TRY · {data.eurTry.label}</span>
        </div>
      </div>

      <dl className="cdr-kv-list cdr-section-body">
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">USD/TRY 24s</dt>
          <dd className={cn("cdr-kv-v", data.usdTry.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {fmtSignedPct(data.usdTry.change24hPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">EUR/TRY 24s</dt>
          <dd className={cn("cdr-kv-v", data.eurTry.change24hPct >= 0 ? "cdr-down" : "cdr-up")}>
            {fmtSignedPct(data.eurTry.change24hPct)}
          </dd>
        </div>
        <div className="cdr-kv-row">
          <dt className="cdr-kv-k">Kur duyarlılığı</dt>
          <dd className="cdr-kv-v">
            {data.sensitivity.fxBeta.toFixed(2)} · {data.sensitivity.label}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export const BistDetailSidebarMacroFx = memo(MacroFxInner);
