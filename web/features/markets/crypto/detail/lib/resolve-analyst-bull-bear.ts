import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

/** Analist konsensüsü bull/bear — B4 tek kaynak; B5 yalnızca uyum gösterir. */
export function resolveAnalystBullBear(bundle: AssetIntelligenceBundle): {
  bullPct: number;
  bearPct: number;
} {
  const { symbolConsensus, signalSummary } = bundle;
  const bullRaw = symbolConsensus.bullishConcentrationPct;
  const bearRaw = symbolConsensus.bearishConcentrationPct;
  if (bullRaw + bearRaw > 0) {
    const denom = bullRaw + bearRaw;
    const bullPct = Math.round((bullRaw / denom) * 100);
    return { bullPct, bearPct: 100 - bullPct };
  }
  const bullPct = signalSummary.bullSharePct;
  return { bullPct, bearPct: 100 - bullPct };
}
