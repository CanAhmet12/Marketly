"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetMarketMemory } from "@/features/markets/types/asset-intelligence";

type Props = { memory: AssetMarketMemory; symbol: string };

export function AssetDetailMarketMemory({ memory, symbol }: Props) {
  const empty =
    memory.timeline.length === 0 &&
    memory.notableDiscussions.length === 0 &&
    memory.signalOutcomes.wins + memory.signalOutcomes.losses + memory.signalOutcomes.neutral === 0;

  return (
    <MarketIntelSection
      title="Piyasa hafızası"
      description="Kapanan çağrılar, rejim kayıtları ve önemli tartışmalar — kalıcı bağlam."
      headerAside={
        <Link href={`/signals?asset=${encodeURIComponent(symbol)}`} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Arşiv akışı
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
        {empty ? (
          <EmptyState title="Geçmiş kayıt yok" description="Sonuçlanan çağrılar ve tartışmalar bağlandığında görünür." tone="market" compact />
        ) : (
          <div className="grid gap-[var(--sp-4)] min-[720px]:grid-cols-2">
            <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] p-[var(--sp-3)]">
              <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Sinyal sonuçları (mock)</p>
              <p className="mt-2 text-[13px] font-semibold text-[var(--color-text)]">
                TP <span className="markets-mono text-[var(--color-rise)]">{memory.signalOutcomes.wins}</span> · SL{" "}
                <span className="markets-mono text-[var(--color-fall)]">{memory.signalOutcomes.losses}</span> · Diğer{" "}
                <span className="markets-mono">{memory.signalOutcomes.neutral}</span>
              </p>
              <p className="mt-2 text-[11px] font-medium text-[var(--color-text-secondary)]">Arşivlenen çağrı: {memory.archivedCallsCount}</p>
            </div>
            <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] p-[var(--sp-3)]">
              <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Volatilite dönemleri</p>
              <ul className="mt-2 space-y-1">
                {memory.volatilityEpisodes.map((v) => (
                  <li key={v.periodLabel} className="flex justify-between text-[12px] font-semibold text-[var(--color-text)]">
                    <span className="text-[var(--color-text-secondary)]">{v.periodLabel}</span>
                    <span className="markets-mono">{v.maxSwingPct}</span>
                  </li>
                ))}
              </ul>
            </div>
            {memory.pastConsensusShifts.length ? (
              <div className="min-[720px]:col-span-2">
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Konsensüs kayması</p>
                <ul className="mt-2 flex flex-wrap gap-[var(--sp-2)]">
                  {memory.pastConsensusShifts.map((s, i) => (
                    <li key={i} className="rounded-full border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text)]">
                      {new Date(s.at).toLocaleDateString("tr-TR")}: {s.from} → {s.to}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {memory.notableDiscussions.length ? (
              <div className="min-[720px]:col-span-2">
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Önemli tartışmalar</p>
                <ul className="mt-2 space-y-1">
                  {memory.notableDiscussions.map((d) => (
                    <li key={d.id}>
                      <Link href={d.href} className="text-[12px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {memory.timeline.length ? (
              <div className="min-[720px]:col-span-2">
                <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Olay zaman çizgisi</p>
                <ul className="mt-2 space-y-1.5">
                  {memory.timeline.map((e) => (
                    <li key={e.id} className="text-[12px] font-medium text-[var(--color-text)]">
                      <span className="text-[var(--color-meta)]">{new Date(e.at).toLocaleString("tr-TR", { month: "short", day: "numeric" })}</span> · {e.label}{" "}
                      <span className="text-[var(--color-text-secondary)]">— {e.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </MarketIntelSection>
  );
}
