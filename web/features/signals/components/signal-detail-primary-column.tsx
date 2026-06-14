"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { SignalDetailMetricsStrip } from "@/features/signals/components/signal-detail-metrics-strip";
import { SignalDetailArchiveOutcomeStrip } from "@/features/signals/components/signal-detail-intel-panels";
import { SignalDiscussionPanel } from "@/features/signals/components/signal-discussion-panel";
import type { SignalDetailExtension } from "@/features/signals/lib/signal-detail-types";
import type { SignalThreadPack } from "@/features/signals/community/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { thesisGradeLabel } from "@/features/signals/components/unified-signal-primitives";
import { filterHonestTimelineEvents, SIGNAL_METRIC_LABELS } from "@/features/signals/lib/signal-detail-narrative";
import { formatTimeAgo } from "@/lib/format-time-ago";

type Props = {
  row: SignalsFeedRow;
  locked: boolean;
  intel: SignalDetailExtension | null;
  threadPack: SignalThreadPack | null;
  onClose: () => void;
};

export function SignalDetailPrimaryColumn({ row, locked, intel, threadPack, onClose }: Props) {
  const trend: "up" | "down" | "flat" = row.direction === "BUY" ? "up" : row.direction === "SELL" ? "down" : "flat";

  const thesisBody = locked
    ? row.premium_preview_snippet ?? "Tam tez abonelik sonrası açılır."
    : row.rationale ?? "Tez henüz eklenmedi.";

  const pnl = intel?.performance.currentPnlPct;
  const timeline = filterHonestTimelineEvents(intel?.timeline ?? [])
    .slice(-3)
    .reverse();
  const watchers = Math.max(1, row.community_copies_24h + Math.floor(row.copies_count / 8));

  return (
    <div className="sdm-primary">
      <SignalDetailMetricsStrip row={row} watchers={watchers} />

      <section className="sdm-zone sdm-thesis-block">
        <div className="sdm-thesis-block__head">
          <h3 className="sdm-panel-block__title">Neden bu çağrı?</h3>
          <span className="sdm-thesis-block__grade">{thesisGradeLabel(row.thesis_grade)}</span>
        </div>
        <p className="sdm-thesis-body">{thesisBody}</p>
      </section>

      <section className="sdm-zone sdm-visual-zone" aria-label="Fiyat grafiği">
        <div className="sdm-visual-card__top">
          {!locked && pnl != null ? (
            <div className="sdm-pnl-badge">
              <span className="sdm-pnl-badge__label">Performans</span>
              <span
                className={
                  pnl > 0.5 ? "sdm-pnl-badge__value sdm-pnl-badge__value--up" : pnl < -0.5 ? "sdm-pnl-badge__value sdm-pnl-badge__value--down" : "sdm-pnl-badge__value"
                }
              >
                {pnl > 0 ? "+" : ""}
                {pnl.toFixed(1)}%
              </span>
            </div>
          ) : (
            <span className="sdm-visual-card__hint">
              {SIGNAL_METRIC_LABELS.signalConfidence} %{row.confidence}
            </span>
          )}
        </div>
        <div className="sdm-visual-card__chart">
          <MiniSparkline series={row.sparkline} trend={trend} height={140} />
        </div>
      </section>

      <div className="sdm-archive-wrap">
        <SignalDetailArchiveOutcomeStrip row={row} />
      </div>

      {timeline.length > 0 ? (
        <section className="sdm-zone">
          <h3 className="sdm-panel-block__title">Doğrulanan gelişmeler</h3>
          <ol className="sdm-timeline-mini">
            {timeline.map((ev, i) => (
              <li key={`${ev.kind}-${ev.at}-${i}`} className="sdm-timeline-mini__item">
                <span className="sdm-timeline-mini__dot" aria-hidden />
                <div className="sdm-timeline-mini__body">
                  <p className="sdm-timeline-mini__label">{ev.label}</p>
                  <p className="sdm-timeline-mini__time">{formatTimeAgo(ev.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="sdm-zone sdm-discussion-wrap">
        <SignalDiscussionPanel
          pack={threadPack}
          symbol={row.symbol}
          assetHref={marketSymbolPath(row.symbol)}
          signalsHref={`/signals?signal=${encodeURIComponent(row.id)}`}
          locked={locked}
          onNavigate={onClose}
          signalId={row.id}
        />
      </section>

      <p className="sdm-disclaimer">Yatırım tavsiyesi değildir.</p>
    </div>
  );
}
