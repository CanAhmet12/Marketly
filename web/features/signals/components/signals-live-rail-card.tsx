"use client";

import { memo } from "react";

import { SignalEngagementActions } from "@/features/signals/components/signal-engagement-actions";
import { useSignalsEngagementContext } from "@/features/signals/contexts/signals-engagement-context";
import type { SignalsLiveCardItem } from "@/features/signals/lib/map-feed-row-to-live-card";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

function ConfBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const tone = pct >= 75 ? "high" : pct >= 55 ? "mid" : "low";
  return (
    <div className="sig-live-card__conf-bar">
      <div className="sig-live-card__conf-track" aria-hidden>
        <span
          className={cn("sig-live-card__conf-fill", `sig-live-card__conf-fill--${tone}`)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="sig-live-card__conf-pct tabular-nums">%{pct}</span>
    </div>
  );
}

function MiniSparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 96;
  const h = 36;
  const step = w / (points.length - 1);
  const coords = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className={cn("sig-live-card__spark", positive ? "sig-live-card__spark--up" : "sig-live-card__spark--down")}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      <polyline points={coords} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(points.length - 1) * step}
        cy={h - ((points[points.length - 1]! - min) / range) * (h - 6) - 3}
        r="3"
        className="sig-live-card__spark-dot"
      />
    </svg>
  );
}

function PriceTape({ position, progress }: { position: number; progress: number }) {
  return (
    <div className="sig-live-card__tape">
      <div className="sig-live-card__tape-head">
        <span className="sig-live-card__tape-title">Fiyat konumu</span>
        <span className="sig-live-card__tape-pct tabular-nums">Hedefe %{progress}</span>
      </div>
      <div className="sig-live-card__tape-track" aria-hidden>
        <span className="sig-live-card__tape-pin sig-live-card__tape-pin--stop" />
        <span className="sig-live-card__tape-pin sig-live-card__tape-pin--entry" />
        <span className="sig-live-card__tape-pin sig-live-card__tape-pin--target" />
        <span className="sig-live-card__tape-fill" style={{ width: `${progress}%` }} />
        <span className="sig-live-card__tape-marker" style={{ left: `${position}%` }} />
      </div>
      <div className="sig-live-card__tape-labels" aria-hidden>
        <span>Stop</span>
        <span>Giriş</span>
        <span>Hedef</span>
      </div>
    </div>
  );
}

type Props = {
  item: SignalsLiveCardItem;
  index?: number;
  onSelect?: () => void;
  /** Kripto şerit — yatay kompakt yerleşim */
  layout?: "default" | "rail-horizontal";
};

function SignalsLiveRailCardInner({ item, index = 0, onSelect, layout = "default" }: Props) {
  const engagement = useSignalsEngagementContext();
  const isLive = item.trackingMode === "live" || item.trackingMode === "update";
  const isRailHorizontal = layout === "rail-horizontal";

  return (
    <article
      className={cn(
        "sig-live-card group motion-entrance",
        `sig-live-card--market-${item.marketTone}`,
        `sig-live-card--status-${item.statusTone}`,
        isLive && "sig-live-card--tracking-live",
        isRailHorizontal && "sig-live-card--rail-horizontal",
        onSelect && "cursor-pointer",
      )}
      style={motionEntranceDelay(index)}
      onClick={onSelect ? () => onSelect() : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`${item.symbol} — ${item.trackingLabel}`}
    >
      <div className="sig-live-card__accent" aria-hidden />

      <div className="sig-live-card__inner">
        {/* Üst: kimlik + canlı fiyat */}
        <header className="sig-live-card__hero">
          <div className="sig-live-card__hero-left min-w-0">
            <div className="sig-live-card__hero-top">
              <span
                className={cn(
                  "sig-live-card__live-pill",
                  item.trackingMode === "live" && "sig-live-card__live-pill--pulse",
                  item.trackingMode === "update" && "sig-live-card__live-pill--update",
                )}
              >
                <span className="sig-live-card__live-dot" aria-hidden />
                {item.trackingLabel}
              </span>
              <span className={cn("sig-live-card__status", `sig-live-card__status--${item.statusTone}`)}>
                {item.statusLabel}
              </span>
            </div>
            {isRailHorizontal ? (
              <div className="sig-live-card__identity-row">
                <p className="sig-live-card__symbol tabular-nums">{item.symbol}</p>
                <p className="sig-live-card__asset truncate">{item.assetName}</p>
              </div>
            ) : (
              <>
                <p className="sig-live-card__symbol tabular-nums">{item.symbol}</p>
                <p className="sig-live-card__asset truncate">{item.assetName}</p>
              </>
            )}
            <div className="sig-live-card__chips">
              <span className={cn("sig-live-card__chip", `sig-live-card__chip--${item.marketTone}`)}>
                {item.marketLabel}
              </span>
              <span className="sig-live-card__chip sig-live-card__chip--neutral tabular-nums">{item.timeframe}</span>
              <span className="sig-live-card__chip sig-live-card__chip--neutral">{item.strategyLabel}</span>
            </div>
          </div>

          <div className="sig-live-card__quote-panel">
            <div className="sig-live-card__quote-chart">
              <MiniSparkline points={item.sparkline} positive={item.changePositive} />
            </div>
            <div className="sig-live-card__quote-values">
              <p className="sig-live-card__spot tabular-nums">{item.spotPrice}</p>
              <p
                className={cn(
                  "sig-live-card__change tabular-nums",
                  item.changePositive ? "sig-live-card__change--up" : "sig-live-card__change--down",
                )}
              >
                {item.changePct}
              </p>
            </div>
          </div>
        </header>

        {/* Güven + tazelik */}
        <section className="sig-live-card__intel">
          <div className="sig-live-card__intel-item">
            <span className="sig-live-card__intel-k">Güven</span>
            <ConfBar value={item.confidence} />
          </div>
          <div className="sig-live-card__intel-item sig-live-card__intel-item--fresh">
            <span className="sig-live-card__intel-k">Tazelik</span>
            <span className="sig-live-card__intel-v tabular-nums">%{item.freshnessScore}</span>
          </div>
        </section>

        {/* Seviyeler */}
        <section className="sig-live-card__levels" aria-label="Fiyat seviyeleri">
          <div className="sig-live-card__level">
            <span className="sig-live-card__level-k">Giriş</span>
            <span className="sig-live-card__level-v tabular-nums">{item.entry}</span>
          </div>
          <div className="sig-live-card__level sig-live-card__level--target">
            <span className="sig-live-card__level-k">Hedef</span>
            <span className="sig-live-card__level-v tabular-nums">{item.target}</span>
          </div>
          <div className="sig-live-card__level sig-live-card__level--stop">
            <span className="sig-live-card__level-k">Stop</span>
            <span className="sig-live-card__level-v tabular-nums">{item.stop}</span>
          </div>
        </section>

        {/* İlerleme bandı */}
        <PriceTape position={item.pricePosition} progress={item.progressPct} />

        {/* Alt: analist sol + metrikler sağ */}
        <footer className="sig-live-card__footer">
          <div className="sig-live-card__analyst min-w-0">
            <span
              className="sig-live-card__avatar"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${item.analystColor}ee, ${item.analystColor}88)`,
              }}
              aria-hidden
            >
              {item.analyst[0]}
            </span>
            <div className="sig-live-card__analyst-copy min-w-0">
              <p className="sig-live-card__analyst-name truncate">
                {item.analyst}
                {item.analystVerified ? (
                  <span className="sig-live-card__verified" aria-label="Doğrulanmış">
                    ✓
                  </span>
                ) : null}
              </p>
              <p className="sig-live-card__analyst-meta truncate">
                {item.analystHandle} · {item.age}
              </p>
            </div>
          </div>

          <div className="sig-live-card__stats">
            <div className="sig-live-card__stat">
              <span className="sig-live-card__stat-k">R/R</span>
              <span className="sig-live-card__stat-v tabular-nums">{item.rr}</span>
            </div>
            <div className="sig-live-card__stat">
              <span className="sig-live-card__stat-k">Takip</span>
              <span className="sig-live-card__stat-v tabular-nums">{item.watchers}</span>
            </div>
            {item.thesisGrade ? (
              <div className="sig-live-card__stat sig-live-card__stat--grade">
                <span className="sig-live-card__stat-k">Tez</span>
                <span className="sig-live-card__stat-v tabular-nums">{item.thesisGrade}</span>
              </div>
            ) : null}
          </div>
        </footer>

        <div className="sig-live-card__engage" onClick={(e) => e.stopPropagation()}>
          <SignalEngagementActions
            likesCount={item.likesCount}
            copiesCount={item.copiesCount}
            liked={engagement.isLiked(item.id)}
            copied={engagement.isCopied(item.id)}
            canEngage={engagement.canEngage}
            liking={engagement.likingId === item.id}
            copying={engagement.copyingId === item.id}
            onLike={() => engagement.toggleLike(item.id)}
            onCopy={() => engagement.copySignal(item.id)}
            compact
          />
        </div>
      </div>
    </article>
  );
}

export const SignalsLiveRailCard = memo(SignalsLiveRailCardInner);
