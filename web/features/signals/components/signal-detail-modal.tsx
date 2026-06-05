"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

import { SignalDetailContextColumn } from "@/features/signals/components/signal-detail-context-column";
import { SignalDetailHeroBand } from "@/features/signals/components/signal-detail-hero-band";
import { SignalDetailPrimaryColumn } from "@/features/signals/components/signal-detail-primary-column";
import { useSignalDetailModalChrome } from "@/features/signals/hooks/use-signal-detail-modal-chrome";
import { signalRowLocked } from "@/features/signals/components/signal-economy-ui";
import { deriveSignalDetailExtension } from "@/features/signals/lib/signal-detail-extension";
import { formatSignalPrice } from "@/features/signals/components/unified-signal-primitives";
import { useMockSignalSubscriber } from "@/features/signals/hooks/use-mock-signal-subscriber";
import { getSignalsRepository } from "@/features/signals/repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

type Props = {
  open: boolean;
  row: SignalsFeedRow | null;
  similar: SignalsFeedRow[];
  catalog?: SignalsFeedRow[];
  onClose: () => void;
};

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SignalDetailModal({ open, row, similar, catalog, onClose }: Props) {
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

  const threadPack = useMemo(() => {
    if (!row) return null;
    return getSignalsRepository().getSignalThreadPack(row.id);
  }, [row]);

  if (!mounted || !open || !row) return null;

  const locked = signalRowLocked(row, isSubscriber);
  const entry = row.entryZoneLabel ?? formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);

  const panelDir =
    row.direction === "BUY" ? "sdm-panel--buy" : row.direction === "SELL" ? "sdm-panel--sell" : "sdm-panel--hold";

  return createPortal(
    <div className="sdm-root motion-modal-enter" role="dialog" aria-modal="true" aria-labelledby="sig-modal-title">
      <button type="button" className="sdm-backdrop motion-backdrop-enter" aria-label="Kapat" onClick={onClose} />
      <div className={`sdm-panel ${panelDir}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sdm-panel__close" aria-label="Kapat" onClick={onClose}>
          <IconClose />
        </button>

        <div className="sdm-scroll">
          <SignalDetailHeroBand
            row={row}
            locked={locked}
            entryLabel={entry}
            targetLabel={target}
            stopLabel={stop}
            rrLabel={row.riskRewardLabel}
            onClose={onClose}
          />

          <div className="sdm-body-grid">
            <SignalDetailPrimaryColumn row={row} locked={locked} intel={intel} threadPack={threadPack} onClose={onClose} />
            <SignalDetailContextColumn row={row} similar={similar} intel={intel} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
