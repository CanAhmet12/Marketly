"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { AnalystLeaderboardSection } from "@/features/signals/intelligence/types";
import type { MarketSignalIntelligence } from "@/features/signals/intelligence/types";
import type { SignalsHeroPayload } from "@/features/signals/types";
import { cn } from "@/lib/cn";

type Props = {
  intel: MarketSignalIntelligence;
  hero: SignalsHeroPayload;
  leaderboardSections: AnalystLeaderboardSection[];
  focusAsset: string | null;
  onAssetPick: (symbol: string) => void;
  className?: string;
};

function biasLabel(bias: MarketSignalIntelligence["marketBias"]) {
  if (bias === "bullish") return "Alıcı baskısı";
  if (bias === "bearish") return "Satıcı baskısı";
  return "Dengeli akış";
}

function parseMetricPct(value: string): number | null {
  const m = value.match(/(\d+)/);
  return m ? Math.min(100, Number(m[1])) : null;
}

function AccBar({ value }: { value: number }) {
  const tone = value >= 75 ? "high" : value >= 55 ? "mid" : "low";
  return (
    <span className="sig-canvas__ctx-acc" aria-hidden>
      <span
        className={cn("sig-canvas__ctx-acc-fill", `sig-canvas__ctx-acc-fill--${tone}`)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </span>
  );
}

/** Bağlam paneli — bias, yoğun semboller, top analistler */
export function SignalsContextRail({
  intel,
  hero,
  leaderboardSections,
  focusAsset,
  onAssetPick,
  className,
}: Props) {
  const isMobile = className?.includes("sig-canvas__context-rail--mobile");
  const topAnalysts = leaderboardSections[0]?.rows?.slice(0, 5) ?? [];
  const hotSymbols = intel.analystConcentrationTop.slice(0, 6);
  const hasLiveBias = intel.marketBias !== "neutral";

  return (
    <aside
      className={cn("sig-canvas__context-rail sig-canvas__context-zone", className)}
      aria-label="Sinyal bağlamı"
    >
      {!isMobile ? (
        <header className="sig-canvas__context-head">
          <div>
            <span className="sig-canvas__context-kicker">Context</span>
            <h2 className="sig-canvas__context-title">Bağlam paneli</h2>
          </div>
          {hasLiveBias ? (
            <span className="sig-canvas__context-live-pill">
              <span className="sig-canvas__context-live-dot" aria-hidden />
              {biasLabel(intel.marketBias)}
            </span>
          ) : null}
        </header>
      ) : null}

      <section className="sig-canvas__ctx-panel sig-canvas__ctx-panel--bias">
        <header className="sig-canvas__ctx-head">
          <span className="sig-canvas__ctx-dot sig-canvas__ctx-dot--pulse" aria-hidden />
          <div className="sig-canvas__ctx-head-copy">
            <span className="sig-canvas__ctx-kicker">Pulse</span>
            <h2 className="sig-canvas__ctx-title">Piyasa biası</h2>
          </div>
          <span className="sig-canvas__ctx-count tabular-nums">{hero.activeCount}</span>
        </header>

        <div className="sig-canvas__ctx-bias-block">
          <div className="sig-canvas__ctx-bias-row">
            <span className="sig-canvas__ctx-bias-label">Alış</span>
            <div className="sig-canvas__ctx-bias-track">
              <span
                className="sig-canvas__ctx-bias-fill sig-canvas__ctx-bias-fill--buy"
                style={{ width: `${intel.bullBearSplitPct.bull}%` }}
              />
            </div>
            <span className="sig-canvas__ctx-bias-pct tabular-nums">%{intel.bullBearSplitPct.bull}</span>
          </div>
          <div className="sig-canvas__ctx-bias-row">
            <span className="sig-canvas__ctx-bias-label">Satış</span>
            <div className="sig-canvas__ctx-bias-track">
              <span
                className="sig-canvas__ctx-bias-fill sig-canvas__ctx-bias-fill--sell"
                style={{ width: `${intel.bullBearSplitPct.bear}%` }}
              />
            </div>
            <span className="sig-canvas__ctx-bias-pct tabular-nums">%{intel.bullBearSplitPct.bear}</span>
          </div>
        </div>

        <p className="sig-canvas__ctx-bias-meta">
          {intel.momentumLabel}
          {intel.themeAcceleration ? ` · ${intel.themeAcceleration}` : ""}
        </p>
      </section>

      {hotSymbols.length > 0 ? (
        <section className="sig-canvas__ctx-panel sig-canvas__ctx-panel--symbols">
          <header className="sig-canvas__ctx-head">
            <div className="sig-canvas__ctx-head-copy">
              <span className="sig-canvas__ctx-kicker">Focus</span>
              <h2 className="sig-canvas__ctx-title">Yoğun semboller</h2>
            </div>
          </header>
          <div className="sig-canvas__ctx-symbols">
            {hotSymbols.map((item) => (
              <button
                key={item.symbol}
                type="button"
                className={cn(
                  "sig-canvas__ctx-symbol",
                  focusAsset === item.symbol && "sig-canvas__ctx-symbol--active",
                )}
                onClick={() => onAssetPick(item.symbol)}
              >
                {item.symbol}
                <span className="sig-canvas__ctx-symbol-pct tabular-nums">%{item.sharePct}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!isMobile && topAnalysts.length > 0 ? (
        <section className="sig-canvas__ctx-panel sig-canvas__ctx-panel--analysts">
          <header className="sig-canvas__ctx-head">
            <div className="sig-canvas__ctx-head-copy">
              <span className="sig-canvas__ctx-kicker">Track</span>
              <h2 className="sig-canvas__ctx-title">Top analistler</h2>
            </div>
            <Link href="/creators" className="sig-canvas__ctx-link">
              Tümü
            </Link>
          </header>
          <ul className="sig-canvas__ctx-list">
            {topAnalysts.map((row, i) => {
              const acc = parseMetricPct(row.primaryMetricValue);
              return (
                <li key={row.analystId}>
                  <Link
                    href={row.href}
                    className={cn(
                      "sig-canvas__ctx-row sig-canvas__ctx-row--ranked",
                      i < 3 && `sig-canvas__ctx-row--rank-${i + 1}`,
                    )}
                  >
                    <span className="sig-canvas__ctx-rank tabular-nums">{i + 1}</span>
                    <SafeAvatar
                      src={row.avatarUrl}
                      alt={row.display}
                      size={28}
                      fallbackId={row.analystId}
                      fallbackName={row.display}
                      className="sig-canvas__ctx-avatar"
                    />
                    <span className="sig-canvas__ctx-copy min-w-0 flex-1">
                      <span className="sig-canvas__ctx-name truncate">{row.display}</span>
                      {acc != null ? <AccBar value={acc} /> : (
                        <span className="sig-canvas__ctx-meta truncate">{row.primaryMetricLabel}</span>
                      )}
                    </span>
                    <span className="sig-canvas__ctx-pct tabular-nums">{row.primaryMetricValue}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

export function SignalsContextRailSkeleton({ className }: { className?: string }) {
  return (
    <aside className={cn("sig-canvas__context-zone sig-canvas__sk-context", className)} aria-hidden>
      <div className="sig-canvas__sk-context-head motion-shimmer" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sig-canvas__sk-context-panel motion-shimmer" />
      ))}
    </aside>
  );
}
