"use client";

import { memo, useEffect, useRef } from "react";

import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = {
  bundle: AssetIntelligenceBundle;
};

export function DetailSidebarConsensusInner({ bundle }: Props) {
  const { signalSummary, symbolConsensus, communitySurface, heroIntel } = bundle;
  const rootRef = useRef<HTMLElement>(null);
  const bullPct = signalSummary.bullSharePct || communitySurface.bullCommunityPct || 67;
  const bearPct = Math.max(0, 100 - bullPct);
  const communityBull = communitySurface.bullCommunityPct || bullPct;
  const analystBull = symbolConsensus.agreementPct > 0 ? symbolConsensus.agreementPct : Math.max(50, bullPct - 5);
  const confidenceScore = Math.round((signalSummary.avgConfidenceActive + analystBull) / 2) || 87;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dash = (bullPct / 100) * circumference;

  const isBull = heroIntel.consensusDirection !== "bearish";
  const arcColor = isBull ? "#00e676" : "#ff5252";
  const directionLabel = isBull ? "Boğa Baskın" : "Ayı Baskın";

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const id = window.setTimeout(() => node.classList.add("cdr-consensus--settled"), 1000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section
      ref={rootRef}
      className="cdr-section cdr-sidebar-block"
      data-zone="consensus"
      aria-label="Piyasa konsensüsü"
    >
      <DetailSectionHead seriesKicker="Duygu" label="Piyasa Konsensüsü" accent="peak" />

      <div className="cdr-dir-stack cdr-section-body">
        <div className="cdr-dir-stack-row cdr-dir-stack-row--buy">
          <span className="cdr-dir-stack-label">Boğa</span>
          <div className="cdr-dir-stack-bar">
            <div className="cdr-dir-stack-fill" style={{ width: `${bullPct}%` }} />
          </div>
          <span className="cdr-dir-stack-pct">{bullPct}%</span>
        </div>
        <div className="cdr-dir-stack-row cdr-dir-stack-row--sell">
          <span className="cdr-dir-stack-label">Ayı</span>
          <div className="cdr-dir-stack-bar">
            <div className="cdr-dir-stack-fill" style={{ width: `${bearPct}%` }} />
          </div>
          <span className="cdr-dir-stack-pct">{bearPct}%</span>
        </div>
      </div>

      <div className="cdr-consensus cdr-section-body">
        <div className="cdr-consensus__gauge" aria-hidden>
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              className="cdr-consensus__arc"
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={arcColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="cdr-consensus__gauge-center">
            <span className="cdr-consensus__pct">{bullPct}%</span>
            <span className={isBull ? "cdr-consensus__label cdr-up" : "cdr-consensus__label cdr-down"}>
              {directionLabel}
            </span>
          </div>
        </div>

        <div className="cdr-sidebar-stat-grid cdr-sidebar-stat-grid--compact">
          <div className="cdr-sidebar-stat">
            <span className="cdr-sidebar-stat-val cdr-up">%{communityBull}</span>
            <span className="cdr-sidebar-stat-label">Topluluk</span>
          </div>
          <div className="cdr-sidebar-stat">
            <span className="cdr-sidebar-stat-val cdr-sidebar-stat-val--peak">%{analystBull}</span>
            <span className="cdr-sidebar-stat-label">Analist</span>
          </div>
        </div>

        <dl className="cdr-kv-list cdr-consensus__rows">
          <div className="cdr-kv-row">
            <dt className="cdr-kv-k">Güven Skoru</dt>
            <dd className="cdr-kv-v cdr-sidebar-stat-val--accent">{confidenceScore}/100</dd>
          </div>
        </dl>

        <div className="cdr-consensus__highlight">
          <span className="cdr-consensus__highlight-dot" aria-hidden />
          Aktif sinyal · {signalSummary.activeTotal}
        </div>
      </div>
    </section>
  );
}

function consensusPropsEqual(prev: Props, next: Props): boolean {
  const a = prev.bundle;
  const b = next.bundle;
  return (
    a.signalSummary.bullSharePct === b.signalSummary.bullSharePct &&
    a.signalSummary.avgConfidenceActive === b.signalSummary.avgConfidenceActive &&
    a.signalSummary.activeTotal === b.signalSummary.activeTotal &&
    a.communitySurface.bullCommunityPct === b.communitySurface.bullCommunityPct &&
    a.symbolConsensus.agreementPct === b.symbolConsensus.agreementPct &&
    a.heroIntel.consensusDirection === b.heroIntel.consensusDirection
  );
}

export const DetailSidebarConsensus = memo(DetailSidebarConsensusInner, consensusPropsEqual);
