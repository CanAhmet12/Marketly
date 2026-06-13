"use client";

import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";
import type { VRSignalItem } from "@/features/discover/visual-reference/discover-visual-reference-data";

function computePulse(buy: number, sell: number) {
  if (buy > sell * 1.1) return "Alış ağırlıklı";
  if (sell > buy * 1.1) return "Satış ağırlıklı";
  return "Dengeli pazar";
}

/** Keşfet sinyal tab — /signals pazar özeti strip (embed) */
export function DiscoverSignalsIntelStrip({ items }: { items: readonly VRSignalItem[] }) {
  const buy = items.filter((s) => s.direction === "BUY").length;
  const sell = items.filter((s) => s.direction === "SELL").length;
  const hold = items.filter((s) => s.direction === "HOLD").length;
  const active = items.length;
  const avgConf = Math.round(
    items.reduce((sum, s) => sum + s.confidence, 0) / Math.max(items.length, 1),
  );
  const highConf = items.filter((s) => s.confidence >= 75).length;
  const pulse = computePulse(buy, sell);
  const hasPulse = buy > sell * 1.1 || sell > buy * 1.1;

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
          {pulse}
        </span>
      </header>

      <div className="sig-canvas__deck">
        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--active">
          <span className="sig-canvas__deck-kicker">Önizleme</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--active tabular-nums">
            {formatCompactCount(active)}
          </span>
          <span className="sig-canvas__deck-sub">Aktif çağrı</span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--buy">
          <span className="sig-canvas__deck-kicker">
            {buy > sell ? <span className="sig-canvas__deck-dot sig-canvas__deck-dot--buy" aria-hidden /> : null}
            Al
          </span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--buy tabular-nums">
            {formatCompactCount(buy)}
          </span>
          <span className="sig-canvas__deck-sub">
            Sat {formatCompactCount(sell)} · Bekle {formatCompactCount(hold)}
          </span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--confidence">
          <span className="sig-canvas__deck-kicker">Güven</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--confidence tabular-nums">
            %{avgConf}
          </span>
          <span className="sig-canvas__deck-meter" aria-hidden>
            <span className="sig-canvas__deck-meter-fill" style={{ width: `${avgConf}%` }} />
          </span>
          <span className="sig-canvas__deck-sub">Ortalama skor</span>
        </article>

        <article className="sig-canvas__deck-tile sig-canvas__deck-tile--peak">
          <span className="sig-canvas__deck-kicker">Yüksek</span>
          <span className="sig-canvas__deck-value sig-canvas__deck-value--peak tabular-nums">
            {formatCompactCount(highConf)}
          </span>
          <span className="sig-canvas__deck-sub">Güven ≥ %75</span>
        </article>
      </div>
    </section>
  );
}
