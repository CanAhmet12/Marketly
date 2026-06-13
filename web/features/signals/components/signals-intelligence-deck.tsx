"use client";

import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";
import type { SignalsHeroPayload } from "@/features/signals/types";

type Props = {
  hero: SignalsHeroPayload;
  highConfCount: number;
};

/** FAZ A — Pazar özeti intelligence strip */
export function SignalsIntelligenceDeck({ hero, highConfCount }: Props) {
  const confPct = Math.min(100, Math.max(0, hero.avgConfidence));
  const bullish = hero.buyCount > hero.sellCount * 1.1;
  const bearish = hero.sellCount > hero.buyCount * 1.1;
  const hasPulse = bullish || bearish;

  return (
    <section className="sig-canvas__intel-zone" aria-label="Sinyal pazarı özeti">
      <header className="sig-canvas__intel-head">
        <div className="sig-canvas__intel-head-main">
          <span className="sig-canvas__intel-kicker">Signal Market</span>
          <h2 className="sig-canvas__intel-title">Pazar özeti</h2>
        </div>
        <span className="sig-canvas__intel-status">
          <span
            className={cn("sig-canvas__intel-pulse", hasPulse && "sig-canvas__intel-pulse--live")}
            aria-hidden
          />
          {hero.pulseLabel}
        </span>
      </header>

      <div className="sig-canvas__deck">
        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--active">
          <span className="sig-canvas__deck-kicker">Aktif</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--active tabular-nums">
            {formatCompactCount(hero.activeCount)}
          </span>
          <span className="sig-canvas__deck-sub">Yayındaki sinyal</span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--buy">
          <span className="sig-canvas__deck-kicker">
            {bullish ? <span className="sig-canvas__deck-dot sig-canvas__deck-dot--buy" aria-hidden /> : null}
            Al
          </span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--buy tabular-nums">
            {formatCompactCount(hero.buyCount)}
          </span>
          <span className="sig-canvas__deck-sub">
            {hero.sellCount > 0 ? `Sat ${formatCompactCount(hero.sellCount)}` : "Alış yönlü"}
          </span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--confidence">
          <span className="sig-canvas__deck-kicker">Güven</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--confidence tabular-nums">
            %{confPct}
          </span>
          <span className="sig-canvas__deck-meter" aria-hidden>
            <span className="sig-canvas__deck-meter-fill" style={{ width: `${confPct}%` }} />
          </span>
          <span className="sig-canvas__deck-sub">Ortalama skor</span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--peak">
          <span className="sig-canvas__deck-kicker">Yüksek</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--peak tabular-nums">
            {formatCompactCount(highConfCount)}
          </span>
          <span className="sig-canvas__deck-sub">
            {hero.successRate != null ? `%${hero.successRate} başarı` : "Güven ≥ %75"}
          </span>
        </article>
      </div>
    </section>
  );
}

export function SignalsIntelligenceDeckSkeleton() {
  return (
    <div className="sig-canvas__intel-zone" aria-hidden>
      <div className="sig-canvas__sk-intel-head">
        <div>
          <div className="sig-canvas__sk-intel-kicker motion-shimmer" />
          <div className="sig-canvas__sk-intel-title motion-shimmer" />
        </div>
        <div className="sig-canvas__sk-intel-pill motion-shimmer" />
      </div>
      <div className="sig-canvas__deck sig-canvas__sk-deck">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sig-canvas__sk-tile motion-shimmer" aria-hidden />
        ))}
      </div>
    </div>
  );
}
