"use client";

import { SignalLevelsGrid } from "@/features/signals/components/signal-levels-grid";

type Props = {
  entryLabel: string;
  targetLabel: string;
  stopLabel: string;
  rrLabel: string | null;
  dense?: boolean;
  locked: boolean;
};

export function SignalLevelsWithEconomyLock({ entryLabel, targetLabel, stopLabel, rrLabel, dense, locked }: Props) {
  if (!locked) {
    return <SignalLevelsGrid entryLabel={entryLabel} targetLabel={targetLabel} stopLabel={stopLabel} rrLabel={rrLabel} dense={dense} />;
  }
  return (
    <div className="relative overflow-hidden rounded-[12px] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_18%,var(--ms-border-hairline))]">
      <div className="pointer-events-none select-none blur-[6px] opacity-[0.72]">
        <SignalLevelsGrid entryLabel={entryLabel} targetLabel={targetLabel} stopLabel={stopLabel} rrLabel={rrLabel} dense={dense} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[color-mix(in_srgb,var(--ms-card-surface)_88%,transparent)] px-[var(--sp-3)] py-[var(--sp-2)] text-center">
        <p className="text-[11px] font-semibold text-[var(--color-text)]">Seviyeler abonelikle açılır</p>
        <p className="text-[11px] font-medium text-[var(--color-meta)]">Hedef, stop ve R/R üyelik akışında görünür.</p>
      </div>
    </div>
  );
}
