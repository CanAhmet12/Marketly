"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SignalDetailConsensusPanel } from "@/features/signals/components/signal-detail-consensus-panel";
import { SignalAnalystTrustBlock } from "@/features/signals/components/unified-signal-primitives";
import type { SignalDetailExtension } from "@/features/signals/lib/signal-detail-types";
import { getSignalsRepository } from "@/features/signals/repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

type Props = {
  row: SignalsFeedRow;
  similar: SignalsFeedRow[];
  intel: SignalDetailExtension | null;
  onClose: () => void;
};

function formatCount(n: number): string {
  return n.toLocaleString("tr-TR");
}

export function SignalDetailContextColumn({ row, similar, intel, onClose }: Props) {
  const rep = useMemo(() => getSignalsRepository().getAnalystReputationProfile(row.creator_id), [row.creator_id]);

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

  return (
    <aside className="sdm-context" aria-label="Üretici ve piyasa özeti">
      <section className="sdm-panel-block sdm-analyst-card">
        <SignalAnalystTrustBlock
          analyst={row.analyst}
          channelHref={`/channel/${row.creator_id}`}
          onNavigate={onClose}
          signalHitRateLookbackPct={row.signal_hit_rate_lookback_pct}
          size="md"
          showSpecialties={false}
        />
        {rep ? (
          <div className="sdm-stat-pills" aria-label="Üretici skorları">
            <span className="sdm-stat-pill">
              Güven <strong>{rep.scores.trustScore}</strong>
            </span>
            <span className="sdm-stat-pill">
              Tutarlılık <strong>{rep.scores.consistencyScore}</strong>
            </span>
          </div>
        ) : null}
      </section>

      <div className="sdm-stat-pills sdm-stat-pills--row" aria-label="Etkileşim">
        <span className="sdm-stat-pill">
          Beğeni <strong>{formatCount(row.likes_count)}</strong>
        </span>
        <span className="sdm-stat-pill">
          Kopya <strong>{formatCount(row.copies_count)}</strong>
        </span>
        {row.community_copies_24h > 0 ? (
          <span className="sdm-stat-pill">
            24s <strong>{formatCount(row.community_copies_24h)}</strong>
          </span>
        ) : null}
      </div>

      <SignalDetailConsensusPanel symbol={row.symbol} title="Piyasa görüşü" />

      {relatedRows.length > 0 ? (
        <section className="sdm-panel-block">
          <h3 className="sdm-panel-block__title">Benzer çağrılar</h3>
          <ul className="sdm-related-list">
            {relatedRows.map((r) => (
              <li key={r.id}>
                <Link href={`/signals/${encodeURIComponent(r.id)}`} className="sdm-related-list__link" onClick={onClose}>
                  <span className={`sdm-related-list__dir sdm-related-list__dir--${r.direction.toLowerCase()}`}>{r.direction}</span>
                  <span className="sdm-related-list__sym">{r.symbol}</span>
                  <span className="sdm-related-list__conf">%{r.confidence}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link href={`/signals?asset=${encodeURIComponent(row.symbol)}`} className="sdm-context-cta" onClick={onClose}>
        {row.symbol} — tüm sinyaller
      </Link>
    </aside>
  );
}
