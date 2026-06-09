"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SignalDetailConsensusPanel } from "@/features/signals/components/signal-detail-consensus-panel";
import { SignalDetailCreatorTrack } from "@/features/signals/components/signal-detail-creator-track";
import { SignalAnalystTrustBlock } from "@/features/signals/components/unified-signal-primitives";
import type { SignalDetailExtension } from "@/features/signals/lib/signal-detail-types";
import {
  describeRelatedSignalOutcome,
  SIGNAL_METRIC_LABELS,
} from "@/features/signals/lib/signal-detail-narrative";
import {
  aggregateAnalystRows,
  buildAnalystReputationProfile,
  findAgg,
} from "@/features/signals/lib/signal-intelligence-build";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

type Props = {
  row: SignalsFeedRow;
  catalog: readonly SignalsFeedRow[];
  similar: SignalsFeedRow[];
  intel: SignalDetailExtension | null;
  onClose: () => void;
};

function formatCount(n: number): string {
  return n.toLocaleString("tr-TR");
}

export function SignalDetailContextColumn({ row, catalog, similar, intel, onClose }: Props) {
  const rep = useMemo(() => {
    const agg = findAgg(aggregateAnalystRows([...catalog]), row.creator_id);
    return buildAnalystReputationProfile(agg);
  }, [catalog, row.creator_id]);

  const relatedRows = useMemo(() => {
    const seen = new Set<string>([row.id]);
    const out: SignalsFeedRow[] = [];
    for (const r of similar) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
      if (out.length >= 3) break;
    }
    if (intel) {
      for (const pool of [intel.related.creatorFollowUps, intel.related.historicalSameAsset]) {
        for (const r of pool) {
          if (seen.has(r.id)) continue;
          seen.add(r.id);
          out.push(r);
          if (out.length >= 3) break;
        }
        if (out.length >= 3) break;
      }
    }
    return out;
  }, [similar, intel, row.id]);

  const showTrack = intel && (intel.creatorRecord.closedGreen + intel.creatorRecord.closedRed > 0 || intel.creatorRecord.last20Total > 0 || intel.creatorRecord.activeSignals > 0);

  return (
    <aside className="sdm-context" aria-label="Üretici ve piyasa özeti">
      <section className="sdm-panel-block sdm-producer-trust" aria-label="Üretici güveni">
        <h3 className="sdm-panel-block__title">Üretici güveni</h3>
        <SignalAnalystTrustBlock
          analyst={row.analyst}
          channelHref={`/channel/${row.creator_id}`}
          onNavigate={onClose}
          suppressSignalLookback
          size="md"
          showSpecialties={false}
        />
        {showTrack && intel ? <SignalDetailCreatorTrack record={intel.creatorRecord} embedded /> : null}
        {rep ? (
          <div className="sdm-stat-pills sdm-producer-trust__pills" aria-label="Üretici skorları">
            <span className="sdm-stat-pill" title="İsabet, doğrulama ve takipçi bileşenli üretici skoru">
              {SIGNAL_METRIC_LABELS.analystTrust} <strong>{rep.scores.trustScore}</strong>
            </span>
            <span className="sdm-stat-pill" title="Çağrılar arası tez gücü oynaklığı — düşük σ yüksek istikrar">
              {SIGNAL_METRIC_LABELS.confidenceStability} <strong>{rep.scores.consistencyScore}</strong>
            </span>
            {row.analyst.accuracy != null ? (
              <span className="sdm-stat-pill" title="Platform geneli kümülatif isabet">
                {SIGNAL_METRIC_LABELS.platformAccuracy} <strong>%{row.analyst.accuracy}</strong>
              </span>
            ) : null}
            {row.analyst.follower_count > 0 ? (
              <span className="sdm-stat-pill">
                Takipçi <strong>{formatCount(row.analyst.follower_count)}</strong>
              </span>
            ) : null}
            {row.analyst.verified ? (
              <span className="sdm-stat-pill sdm-stat-pill--verified">Doğrulanmış</span>
            ) : null}
          </div>
        ) : null}
      </section>

      <SignalDetailConsensusPanel symbol={row.symbol} catalog={catalog} currentDirection={row.direction} title="Piyasa görüşü" />

      <div className="sdm-stat-pills sdm-stat-pills--row" aria-label="Etkileşim">
        <span className="sdm-stat-pill">
          Beğeni <strong>{formatCount(row.likes_count)}</strong>
        </span>
        <span className="sdm-stat-pill">
          Kopya <strong>{formatCount(row.copies_count)}</strong>
        </span>
        {row.community_copies_24h > 0 ? (
          <span className="sdm-stat-pill" title="Tahmini son dönem kopya payı">
            Son dönem <strong>{formatCount(row.community_copies_24h)}</strong>
          </span>
        ) : null}
      </div>

      {relatedRows.length > 0 ? (
        <section className="sdm-panel-block">
          <h3 className="sdm-panel-block__title">Benzer çağrılar</h3>
          <ul className="sdm-related-list">
            {relatedRows.map((r) => {
              const outcome = describeRelatedSignalOutcome(r);
              return (
                <li key={r.id}>
                  <Link href={`/signals/${encodeURIComponent(r.id)}`} className="sdm-related-list__link" onClick={onClose}>
                    <span className={`sdm-related-list__dir sdm-related-list__dir--${r.direction.toLowerCase()}`}>{r.direction}</span>
                    <span className="sdm-related-list__sym">{r.symbol}</span>
                    <span className={cn("sdm-related-list__outcome", `sdm-related-list__outcome--${outcome.tone}`)}>
                      {outcome.label}
                    </span>
                    <span className="sdm-related-list__conf" title={SIGNAL_METRIC_LABELS.signalConfidence}>
                      %{r.confidence}
                    </span>
                    <span className="sdm-related-list__time">{formatTimeAgo(r.created_at)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Link href={`/signals?asset=${encodeURIComponent(row.symbol)}`} className="sdm-context-cta" onClick={onClose}>
        {row.symbol} — tüm sinyaller
      </Link>
    </aside>
  );
}
