"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

import { SignalDetailContextColumn } from "@/features/signals/components/signal-detail-context-column";
import { SignalDetailHeroBand } from "@/features/signals/components/signal-detail-hero-band";
import { SignalDetailPrimaryColumn } from "@/features/signals/components/signal-detail-primary-column";
import { SignalDetailRelatedRail } from "@/features/signals/components/signal-detail-related-rail";
import { useSignalDetailModalChrome } from "@/features/signals/hooks/use-signal-detail-modal-chrome";
import { signalDetailRowLocked } from "@/features/signals/domain/signal-economy";
import { deriveSignalDetailExtension } from "@/features/signals/lib/signal-detail-extension";
import { buildSignalDetailVerdict } from "@/features/signals/lib/signal-detail-narrative";
import { signalMarketTone } from "@/features/signals/lib/signal-market-tone";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import { SignalsFeedSkeleton } from "@/features/signals/components/signals-feed-skeleton";
import { useSignalsEngagementContext } from "@/features/signals/contexts/signals-engagement-context";
import { useSignalThreadPack } from "@/features/signals/hooks/use-signal-thread-pack";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

type Props = {
  open: boolean;
  row: SignalsFeedRow | null;
  similar: SignalsFeedRow[];
  catalog?: SignalsFeedRow[];
  isLoading?: boolean;
  onClose: () => void;
  onOpenSignal?: (row: SignalsFeedRow) => void;
};

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SignalDetailModal({ open, row, similar, catalog, isLoading = false, onClose, onOpenSignal }: Props) {
  const mounted = useSignalDetailModalChrome(open, onClose);
  const isSubscriber = useMockSignalSubscriber();

  const catalogForIntel = useMemo(() => {
    if (catalog?.length) return catalog;
    if (!row) return [];
    const seen = new Set<string>();
    const out: SignalsFeedRow[] = [];
    for (const r of [row, ...similar]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  }, [catalog, row, similar]);

  const intel = useMemo(() => (row ? deriveSignalDetailExtension(row, catalogForIntel) : null), [row, catalogForIntel]);

  const verdict = useMemo(
    () => (row ? buildSignalDetailVerdict(row, catalogForIntel, intel?.creatorRecord) : null),
    [row, catalogForIntel, intel?.creatorRecord],
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

  const relatedForRail = useMemo(() => {
    if (!row) return [];
    const seen = new Set<string>([row.id]);
    const out: SignalsFeedRow[] = [];
    for (const r of similar) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
      if (out.length >= 6) break;
    }
    return out;
  }, [similar, row]);

  if (!mounted || !open) return null;

  if (isLoading || !row) {
    return createPortal(
      <div className="sdm-root motion-modal-enter" role="dialog" aria-modal="true" aria-busy="true" aria-label="Sinyal yükleniyor">
        <button type="button" className="sdm-backdrop motion-backdrop-enter" aria-label="Kapat" onClick={onClose} />
        <div className="sdm-panel sdm-panel--surface" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="sdm-panel__close" aria-label="Kapat" onClick={onClose}>
            <IconClose />
          </button>
          <div className="sdm-scroll p-6">
            <SignalsFeedSkeleton count={1} />
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  const locked = signalDetailRowLocked(row, isSubscriber);
  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);

  const panelDir =
    row.direction === "BUY" ? "sdm-panel--buy" : row.direction === "SELL" ? "sdm-panel--sell" : "sdm-panel--hold";
  const marketTone = signalMarketTone(row.assetCategory);

  return createPortal(
    <div className="sdm-root motion-modal-enter" role="dialog" aria-modal="true" aria-labelledby="sig-modal-title">
      <button type="button" className="sdm-backdrop motion-backdrop-enter" aria-label="Kapat" onClick={onClose} />
      <div className={`sdm-panel sdm-panel--${marketTone} ${panelDir}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sdm-panel__close" aria-label="Kapat" onClick={onClose}>
          <IconClose />
        </button>

        <div className="sdm-scroll">
          {verdict ? (
            <SignalDetailHeroBand
              row={row}
              locked={locked}
              entryLabel={entry}
              targetLabel={target}
              stopLabel={stop}
              rrLabel={row.riskRewardLabel}
              verdict={verdict}
              onClose={onClose}
            />
          ) : null}

          <div className="sdm-body-grid">
            <SignalDetailPrimaryColumn row={row} locked={locked} intel={intel} threadPack={threadPack} onClose={onClose} />
            <SignalDetailContextColumn
              row={row}
              catalog={catalogForIntel}
              similar={similar}
              intel={intel}
              onClose={onClose}
              engagement={engagement}
            />
          </div>

          {relatedForRail.length > 0 && onOpenSignal ? (
            <div className="sdm-related-band">
              <SignalDetailRelatedRail
                rows={relatedForRail}
                onOpen={onOpenSignal}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
