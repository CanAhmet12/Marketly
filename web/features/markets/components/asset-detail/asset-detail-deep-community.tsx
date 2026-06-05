"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetCommunitySurface } from "@/features/markets/types/asset-intelligence";

type Props = { surface: AssetCommunitySurface; symbol: string };

export function AssetDetailDeepCommunity({ surface, symbol }: Props) {
  const quiet = surface.activeDiscussions === 0 && surface.notableQuotes.length === 0;

  return (
    <MarketIntelSection
      title="Topluluk & tartışma"
      description="Tartışma yoğunluğu, tez ayrışması ve öne çıkan alıntılar — kompakt istihbarat."
      headerAside={
        <Link href={`/discover`} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Keşfet
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="flex flex-col gap-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-3)]">
        {quiet ? (
          <EmptyState title="Tartışma özeti boş" description="Bağlı içerik ve thread verisi geldiğinde dolar." tone="market" compact />
        ) : (
          <>
            <div className="grid gap-[var(--sp-2)] min-[520px]:grid-cols-4">
              <Metric label="Aktif başlık" value={String(surface.activeDiscussions)} />
              <Metric label="Üretici güncellemesi" value={String(surface.recentCreatorUpdates)} />
              <Metric label="Tartışma şiddeti" value={`${surface.debateIntensity}/100`} />
              <Metric label="Tez çatışması" value={String(surface.thesisDisagreements)} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Topluluk hissi</p>
              <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                <div className="h-full bg-[color-mix(in_srgb,var(--color-rise)_58%,var(--color-rise))]" style={{ width: `${surface.bullCommunityPct}%` }} />
                <div className="h-full bg-[color-mix(in_srgb,var(--color-fall)_55%,var(--color-fall))]" style={{ width: `${surface.bearCommunityPct}%` }} />
              </div>
              <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                Boğa %{surface.bullCommunityPct} · Ayı %{surface.bearCommunityPct}
              </p>
            </div>
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{surface.relatedThreadHint}</p>
            {surface.notableQuotes.length ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Öne çıkan alıntılar</p>
                <ul className="mt-[var(--sp-2)] space-y-2">
                  {surface.notableQuotes.map((q, i) => (
                    <li key={i} className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] p-[var(--sp-2)]">
                      <p className="text-[12px] font-medium leading-snug text-[var(--color-text)]">“{q.quote}”</p>
                      <p className="mt-1 text-[11px] font-semibold text-[var(--color-meta)]">
                        <Link href={q.href} className="text-[var(--color-primary-dark)] hover:underline">
                          {q.source}
                        </Link>{" "}
                        ·{" "}
                        <Link href={`/results?q=${encodeURIComponent(symbol)}`} className="hover:underline">
                          ilgili arama
                        </Link>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </MarketIntelSection>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] px-[var(--sp-2)] py-[var(--sp-2)]">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{label}</p>
      <p className="markets-mono mt-0.5 text-[15px] font-bold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
