"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";

import { getSignalsRepository } from "@/features/signals/repository";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";

interface Props {
  assetTag: string;
}

export function PostDetailMarketContext({ assetTag }: Props) {
  const clean = useMemo(() => assetTag.replace(/^#/, "").trim(), [assetTag]);

  const snapshot = useMemo(() => {
    const rows = getSignalsRepository()
      .getFeedRows()
      .filter((r) => r.symbol.toUpperCase() === clean.toUpperCase());
    if (!rows.length) return null;
    const activeN = rows.filter((r) => r.is_active).length;
    const best = [...rows].sort((a, b) => b.confidence - a.confidence)[0]!;
    const pulse = getSignalsRepository().getAssetSignalCommunityPulse(clean);
    return { activeN, best, pulse };
  }, [clean]);

  return (
    <div className="pd-side-module pd-side-module--market" style={{ "--pd-side-accent": "var(--pd-accent)" } as CSSProperties}>
      <span className="pd-side-module-accent" aria-hidden />
      <div className="pd-side-module-inner">
      <h3 className="pd-side-title">Piyasa bağlamı</h3>
      <div className="pd-market-row">
        <div className="pd-market-icon">{clean.slice(0, 2)}</div>
        <div>
          <div className="pd-market-label">#{clean}</div>
          <div className="pd-market-sub">İlgili varlık</div>
        </div>
      </div>

      {snapshot?.best ? (
        <div className="pd-signal-snippet">
          <span className="pd-signal-snippet-label">Sinyal özeti</span>
          <span className={`pd-signal-dir pd-signal-dir--${snapshot.best.direction.toLowerCase()}`}>
            {snapshot.best.direction}
          </span>
          <span className="pd-signal-conf">%{snapshot.best.confidence}</span>
          <span className="pd-signal-phase">{signalLifecycleLabel(snapshot.best.lifecycle_phase)}</span>
          <span className="pd-signal-meta">{snapshot.activeN} aktif</span>
        </div>
      ) : null}

      {snapshot?.pulse ? (
        <p className="pd-signal-pulse">{snapshot.pulse.trendingSnippet}</p>
      ) : null}

      <div className="pd-market-actions">
        <Link href={`/markets/${encodeURIComponent(clean)}`} className="pd-market-pill">
          Piyasa →
        </Link>
        <Link href={`/signals?asset=${encodeURIComponent(clean)}`} className="pd-market-pill">
          Sinyaller →
        </Link>
      </div>
      </div>
    </div>
  );
}
