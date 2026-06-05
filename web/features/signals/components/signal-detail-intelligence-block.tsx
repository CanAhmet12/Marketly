"use client";

import Link from "next/link";
import { useMemo } from "react";

import { analystBadgeLabelTr } from "@/features/signals/intelligence/badge-labels";
import type { AnalystReputationProfile, SymbolConsensusIntel } from "@/features/signals/intelligence/types";
import { getSignalsRepository } from "@/features/signals/repository";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  analystId: string;
  onNavigate?: () => void;
  className?: string;
};

function ScoreCell({ label, v }: { label: string; v: number }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-1.5 py-1">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{label}</p>
      <p className="mt-0.5 text-[12px] font-bold tabular-nums text-[var(--color-text)]">{v}</p>
    </div>
  );
}

export function SignalDetailIntelligenceBlock({ symbol, analystId, onNavigate, className }: Props) {
  const consensus = useMemo(() => getSignalsRepository().getSymbolConsensusIntel(symbol), [symbol]);
  const rep = useMemo(() => getSignalsRepository().getAnalystReputationProfile(analystId), [analystId]);

  return (
    <div className={cn("ms-metric-block space-y-[var(--sp-3)] p-[var(--sp-3)]", className)}>
      <ConsensusMini c={consensus} />
      {rep ? <ReputationMini profile={rep} onNavigate={onNavigate} /> : null}
    </div>
  );
}

function ConsensusMini({ c }: { c: SymbolConsensusIntel }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Konsensüs · {c.symbol}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[400px]:grid-cols-4">
        <ScoreCell label="Uyum" v={c.agreementPct} />
        <ScoreCell label="Ort. güven" v={c.confidenceAvg} />
        <ScoreCell label="Boğa %" v={c.bullishConcentrationPct} />
        <ScoreCell label="Ayı %" v={c.bearishConcentrationPct} />
      </div>
      <p className="mt-2 text-[10px] font-medium text-[var(--color-text-secondary)]">
        {c.activeAnalysts} aktif analist · {c.splitSentiment ? "Duygu ayrışması var" : "Duygu hizalı"} · çelişen tez grubu {c.conflictingThesisGroups}
        {c.strongestConviction != null ? (
          <>
            {" "}
            · en güçlü güven %{c.strongestConviction}
          </>
        ) : null}
      </p>
    </div>
  );
}

function ReputationMini({ profile, onNavigate }: { profile: AnalystReputationProfile; onNavigate?: () => void }) {
  const s = profile.scores;
  return (
    <div className="border-t border-[var(--ms-border-hairline)] pt-[var(--sp-3)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Üretici itibarı</p>
        <Link href={`/channel/${profile.analystId}`} onClick={onNavigate} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Profil →
        </Link>
      </div>
      <p className="mt-1 text-[12px] font-semibold leading-snug text-[var(--color-text-secondary)]">{profile.headline}</p>
      {profile.badges.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.badges.map((b) => (
            <span key={b} className="rounded-full border border-[var(--ms-border-hairline)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              {analystBadgeLabelTr(b)}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-2 grid grid-cols-2 gap-2 min-[420px]:grid-cols-5">
        <ScoreCell label="Güven" v={s.trustScore} />
        <ScoreCell label="Tutarlılık" v={s.consistencyScore} />
        <ScoreCell label="Tez" v={s.strategyQuality} />
        <ScoreCell label="Risk-adj" v={s.riskAdjustedPerformance} />
        <ScoreCell label="Topluluk" v={s.communityTrust} />
      </div>
    </div>
  );
}
