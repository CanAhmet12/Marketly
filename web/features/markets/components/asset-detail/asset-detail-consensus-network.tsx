"use client";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import { SignalsMarketIntelStrip } from "@/features/signals/components/signals-market-intel-strip";
import type { MarketSignalIntelligence, SymbolConsensusIntel } from "@/features/signals/intelligence/types";

type Props = {
  consensus: SymbolConsensusIntel;
  marketIntel: MarketSignalIntelligence;
};

export function AssetDetailConsensusNetwork({ consensus, marketIntel }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-[var(--sp-3)]">
      <SignalsMarketIntelStrip intel={marketIntel} />
      <MarketIntelSection title="Konsensüs ve ağ" description="Bu sembolda aktif çağrıların hizalanması — repository anlık görüntüsü." bodyClassName="px-0 pb-0 pt-0">
        <ConsensusTable c={consensus} />
      </MarketIntelSection>
    </div>
  );
}

function ConsensusTable({ c }: { c: SymbolConsensusIntel }) {
  return (
    <div className="grid gap-2 px-[var(--sp-3)] py-[var(--sp-3)] min-[480px]:grid-cols-2">
      <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] p-2">
        <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Yön uyumu</p>
        <p className="mt-1 text-[20px] font-bold tabular-nums text-[var(--color-text)]">%{c.agreementPct}</p>
        <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{c.splitSentiment ? "Ayrışan tezler" : "Hizalı akış"}</p>
      </div>
      <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] p-2">
        <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Aktif analist</p>
        <p className="mt-1 text-[20px] font-bold tabular-nums text-[var(--color-text)]">{c.activeAnalysts}</p>
        <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">Çelişen grup {c.conflictingThesisGroups}</p>
      </div>
      <div className="rounded-lg border border-[var(--ms-border-hairline)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] p-2 min-[480px]:col-span-2">
        <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Boğa / ayı konsantrasyonu (aktif)</p>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
          <div className="h-full bg-[color-mix(in_srgb,var(--color-rise)_60%,var(--color-rise))]" style={{ width: `${c.bullishConcentrationPct}%` }} />
          <div className="h-full bg-[color-mix(in_srgb,var(--color-fall)_58%,var(--color-fall))]" style={{ width: `${c.bearishConcentrationPct}%` }} />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
          Ortalama güven %{c.confidenceAvg}
          {c.strongestConviction != null ? ` · zirve %${c.strongestConviction}` : ""}
        </p>
      </div>
    </div>
  );
}
