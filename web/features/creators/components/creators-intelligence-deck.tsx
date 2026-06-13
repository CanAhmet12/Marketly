"use client";

import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

type DeckCounts = {
  total: number;
  live: number;
  rising: number;
  editor: number;
  avgAccuracy: number | null;
};

type Props = {
  counts: DeckCounts;
};

/** BÖLÜM 1 — Ağ özeti intelligence strip */
export function CreatorsIntelligenceDeck({ counts }: Props) {
  const hasLive = counts.live > 0;
  const accPct = counts.avgAccuracy != null ? Math.min(100, Math.max(0, counts.avgAccuracy)) : null;

  return (
    <section className="crt-canvas__intel-zone" aria-label="Üretici ağı özeti">
      <header className="crt-canvas__intel-head">
        <div className="crt-canvas__intel-head-main">
          <span className="crt-canvas__intel-kicker">Creator Network</span>
          <h2 className="crt-canvas__intel-title">Ağ özeti</h2>
        </div>
        <span className="crt-canvas__intel-status">
          <span
            className={cn("crt-canvas__intel-pulse", hasLive && "crt-canvas__intel-pulse--live")}
            aria-hidden
          />
          {hasLive ? `${formatCompactCount(counts.live)} canlı masa` : "Piyasa masası"}
        </span>
      </header>

      <div className="crt-canvas__deck">
        <article className="crt-canvas__deck-tile crt-canvas__deck-tile--live">
          <span className="crt-canvas__deck-kicker">
            {hasLive ? <span className="crt-canvas__deck-dot crt-canvas__deck-dot--live" aria-hidden /> : null}
            Canlı
          </span>
          <span className="crt-canvas__deck-value crt-canvas__deck-value--live tabular-nums">
            {formatCompactCount(counts.live)}
          </span>
          <span className="crt-canvas__deck-sub">Şu an yayında</span>
        </article>

        <article className="crt-canvas__deck-tile crt-canvas__deck-tile--total">
          <span className="crt-canvas__deck-kicker">Toplam</span>
          <span className="crt-canvas__deck-value crt-canvas__deck-value--total tabular-nums">
            {formatCompactCount(counts.total)}
          </span>
          <span className="crt-canvas__deck-sub">Kayıtlı analist</span>
        </article>

        <article className="crt-canvas__deck-tile crt-canvas__deck-tile--signal">
          <span className="crt-canvas__deck-kicker">İsabet</span>
          <span className="crt-canvas__deck-value crt-canvas__deck-value--signal tabular-nums">
            {accPct != null ? `%${Math.round(accPct)}` : "—"}
          </span>
          {accPct != null ? (
            <span className="crt-canvas__deck-meter" aria-hidden>
              <span className="crt-canvas__deck-meter-fill" style={{ width: `${accPct}%` }} />
            </span>
          ) : null}
          <span className="crt-canvas__deck-sub">Ortalama doğruluk</span>
        </article>

        <article className="crt-canvas__deck-tile crt-canvas__deck-tile--peak">
          <span className="crt-canvas__deck-kicker">Yükselen</span>
          <span className="crt-canvas__deck-value crt-canvas__deck-value--peak tabular-nums">
            {formatCompactCount(counts.rising)}
          </span>
          <span className="crt-canvas__deck-sub">
            {counts.editor > 0 ? `${counts.editor} editör seçkisi` : "Momentum yüksek"}
          </span>
        </article>
      </div>
    </section>
  );
}
