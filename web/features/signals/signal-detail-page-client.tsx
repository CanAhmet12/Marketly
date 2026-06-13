"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { SignalDetailContextColumn } from "@/features/signals/components/signal-detail-context-column";
import { SignalDetailHeroBand } from "@/features/signals/components/signal-detail-hero-band";
import { SignalDetailPrimaryColumn } from "@/features/signals/components/signal-detail-primary-column";
import { SignalDetailRelatedRail } from "@/features/signals/components/signal-detail-related-rail";
import { SignalsFeedSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { signalDetailRowLocked } from "@/features/signals/domain/signal-economy";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import { SignalsEngagementProvider, useSignalsEngagementContext } from "@/features/signals/contexts/signals-engagement-context";
import { useSignalThreadPack } from "@/features/signals/hooks/use-signal-thread-pack";
import { useSignalById } from "@/features/signals/hooks/use-signal-by-id";
import { useSignalsCatalog } from "@/features/signals/hooks/use-signals-catalog";
import { deriveSignalDetailExtension } from "@/features/signals/lib/signal-detail-extension";
import { buildSignalDetailVerdict } from "@/features/signals/lib/signal-detail-narrative";
import { signalMarketTone } from "@/features/signals/lib/signal-market-tone";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { useRouter } from "next/navigation";

type Props = { signalId: string };

function findSimilar(rows: SignalsFeedRow[], row: SignalsFeedRow): SignalsFeedRow[] {
  return rows
    .filter((r) => r.id !== row.id && (r.symbol === row.symbol || r.creator_id === row.creator_id))
    .slice(0, 6);
}

function SignalDetailPageBody({ signalId }: Props) {
  const router = useRouter();
  const { rows, isLoading: catalogLoading, isError: catalogError } = useSignalsCatalog();
  const isSubscriber = useMockSignalSubscriber();

  const inCatalog = useMemo(() => rows.find((r) => r.id === signalId) ?? null, [rows, signalId]);
  const needsFetch = !inCatalog;
  const byIdQuery = useSignalById(signalId, needsFetch);
  const row = inCatalog ?? byIdQuery.data ?? null;
  const isLoading = catalogLoading || (needsFetch && byIdQuery.isFetching && !row);
  const isError = catalogError || byIdQuery.isError;
  const similar = useMemo(() => (row ? findSimilar(rows, row) : []), [rows, row]);

  const intel = useMemo(() => (row ? deriveSignalDetailExtension(row, rows) : null), [row, rows]);

  const verdict = useMemo(
    () => (row ? buildSignalDetailVerdict(row, rows, intel?.creatorRecord) : null),
    [row, rows, intel?.creatorRecord],
  );

  const threadPack = useSignalThreadPack(row);
  const engagementApi = useSignalsEngagementContext();

  const engagement = useMemo(() => {
    if (!row) return null;
    return {
      canEngage: engagementApi.canEngage,
      liked: engagementApi.isLiked(row.id),
      copied: engagementApi.isCopied(row.id),
      liking: engagementApi.likingId === row.id,
      copying: engagementApi.copyingId === row.id,
      onLike: () => engagementApi.toggleLike(row.id),
      onCopy: () => engagementApi.copySignal(row.id),
    };
  }, [row, engagementApi]);

  const openRelated = useCallback(
    (r: SignalsFeedRow) => {
      router.push(`/signals/${encodeURIComponent(r.id)}`);
    },
    [router],
  );

  const relatedRail = useMemo(() => {
    if (!row) return [];
    return findSimilar(rows, row).slice(0, 6);
  }, [row, rows]);

  if (isLoading) {
    return (
      <div className="sdp-page ms-page-wrapper ms-container-markets min-w-0 py-8">
        <SignalsFeedSkeleton />
      </div>
    );
  }

  if (isError || !row) {
    return (
      <div className="sdp-page ms-page-wrapper ms-container-markets min-w-0 py-16">
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

  const locked = signalDetailRowLocked(row, isSubscriber);
  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);
  const panelDir =
    row.direction === "BUY" ? "sdm-panel--buy" : row.direction === "SELL" ? "sdm-panel--sell" : "sdm-panel--hold";
  const marketTone = signalMarketTone(row.assetCategory);

  return (
    <article className={`sdp-page sdp-page--${marketTone} ms-page-wrapper ms-container-markets min-w-0 ${panelDir}`}>
      <header className="sdp-topbar sdp-topbar--v2">
        <Link href="/signals" className="sdp-back sdp-back--pill">
          <span aria-hidden>←</span> Sinyal Pazarı
        </Link>
        <div className="sdp-topbar-meta">
          <span className={`sdp-market-badge sdp-market-badge--${marketTone}`}>{row.symbol}</span>
          <Link href={`/channel/${row.creator_id}`} className="sdp-topbar-link">
            Analist profili →
          </Link>
        </div>
      </header>

      <div className={`sdp-panel sdp-panel--${marketTone} sdm-panel sdm-panel--surface`}>
        {verdict ? (
          <SignalDetailHeroBand
            row={row}
            locked={locked}
            entryLabel={entry}
            targetLabel={target}
            stopLabel={stop}
            rrLabel={row.riskRewardLabel}
            verdict={verdict}
            onClose={() => {}}
          />
        ) : null}

        <div className="sdm-body-grid sdp-body-grid">
          <SignalDetailPrimaryColumn row={row} locked={locked} intel={intel} threadPack={threadPack} onClose={() => {}} />
          <SignalDetailContextColumn
            row={row}
            catalog={rows}
            similar={similar}
            intel={intel}
            onClose={() => {}}
            engagement={engagement}
          />
        </div>
      </div>

      {relatedRail.length > 0 ? (
        <SignalDetailRelatedRail rows={relatedRail} onOpen={openRelated} />
      ) : null}
    </article>
  );
}

export function SignalDetailPageClient({ signalId }: Props) {
  return (
    <SignalsEngagementProvider>
      <SignalDetailPageBody signalId={signalId} />
    </SignalsEngagementProvider>
  );
}
