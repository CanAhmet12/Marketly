"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { SignalDetailContextColumn } from "@/features/signals/components/signal-detail-context-column";
import { SignalDetailHeroBand } from "@/features/signals/components/signal-detail-hero-band";
import { SignalDetailPrimaryColumn } from "@/features/signals/components/signal-detail-primary-column";
import { SignalsFeedSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { signalRowLocked } from "@/features/signals/components/signal-economy-ui";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";
import { deriveSignalDetailExtension } from "@/features/signals/lib/signal-detail-extension";
import { getSignalsRepository } from "@/features/signals/repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
type Props = { signalId: string };

function findSimilar(rows: SignalsFeedRow[], row: SignalsFeedRow): SignalsFeedRow[] {
  return rows
    .filter((r) => r.id !== row.id && (r.symbol === row.symbol || r.creator_id === row.creator_id))
    .slice(0, 6);
}

export function SignalDetailPageClient({ signalId }: Props) {
  const { rows, isLoading, isError } = useSignalsCatalog();
  const isSubscriber = useMockSignalSubscriber();

  const row = useMemo(() => rows.find((r) => r.id === signalId) ?? null, [rows, signalId]);
  const similar = useMemo(() => (row ? findSimilar(rows, row) : []), [rows, row]);

  const intel = useMemo(() => (row ? deriveSignalDetailExtension(row, rows) : null), [row, rows]);

  const threadPack = useMemo(() => {
    if (!row) return null;
    return getSignalsRepository().getSignalThreadPack(row.id);
  }, [row]);

  if (isLoading) {
    return (
      <div className="sdp-page ms-page-wrapper ms-container-standard min-w-0 py-8">
        <SignalsFeedSkeleton />
      </div>
    );
  }

  if (isError || !row) {
    return (
      <div className="sdp-page ms-page-wrapper ms-container-standard min-w-0 py-16">
        <EmptyState
          title="Sinyal bulunamadı"
          description="Bağlantı geçersiz veya sinyal kaldırılmış olabilir."
          actionLabel="Sinyal pazarına dön"
          actionHref="/signals"
          tone="market"
          compact
        />
      </div>
    );
  }

  const locked = signalRowLocked(row, isSubscriber);
  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);
  const panelDir =
    row.direction === "BUY" ? "sdm-panel--buy" : row.direction === "SELL" ? "sdm-panel--sell" : "sdm-panel--hold";

  return (
    <article className={`sdp-page ms-page-wrapper ms-container-standard min-w-0 ${panelDir}`}>
      <header className="sdp-topbar">
        <Link href="/signals" className="sdp-back">
          ← Sinyal Pazarı
        </Link>
        <Link href={`/channel/${row.creator_id}`} className="sdp-topbar-link">
          Analist profili
        </Link>
      </header>

      <div className="sdp-panel">
        <SignalDetailHeroBand
          row={row}
          locked={locked}
          entryLabel={entry}
          targetLabel={target}
          stopLabel={stop}
          rrLabel={row.riskRewardLabel}
          onClose={() => {}}
        />

        <div className="sdm-body-grid sdp-body-grid">
          <SignalDetailPrimaryColumn row={row} locked={locked} intel={intel} threadPack={threadPack} onClose={() => {}} />
          <SignalDetailContextColumn row={row} similar={similar} intel={intel} onClose={() => {}} />
        </div>
      </div>
    </article>
  );
}
