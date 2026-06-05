"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetCreatorNetwork, AssetCreatorRanked } from "@/features/markets/types/asset-intelligence";

type Props = { network: AssetCreatorNetwork };

function RowList({ title, rows }: { title: string; rows: AssetCreatorRanked[] }) {
  if (!rows.length) return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">{title}</p>
      <ul className="mt-[var(--sp-2)] space-y-[var(--sp-2)]">
        {rows.map((r) => (
          <li key={`${title}-${r.analystId}`}>
            <Link href={r.href} className="flex items-center gap-[var(--sp-2)] rounded-lg py-1 transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
              {r.avatarUrl ? <SafeAvatar src={r.avatarUrl} alt={r.display} size={32} /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[12px] font-bold">{r.display.slice(0, 1)}</div>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[var(--color-text)]">
                  {r.display}
                  {r.verified ? <span className="text-[var(--color-primary-dark)]"> ✓</span> : null}
                </p>
                <p className="truncate text-[10px] font-semibold text-[var(--color-meta)]">
                  {r.badge} · {r.metric}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssetDetailCreatorNetwork({ network }: Props) {
  const hasAny =
    network.topOnAsset.length +
      network.rising.length +
      network.institutionalStyle.length +
      network.macroSpecialists.length +
      network.mostCopied.length >
    0;

  return (
    <MarketIntelSection
      title="Creator & analist ağı"
      description="Bu varlıkta üretim yapan analistler — sinyal pazarı sıralamaları ile hizalı."
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--sp-2)] border-b border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pb-[var(--sp-2)]">
          <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
            Üst 3 yoğunluk <span className="markets-mono text-[var(--color-text)]">%{network.concentrationTop3Pct}</span>
          </p>
        </div>
        {!hasAny ? (
          <div className="pt-[var(--sp-3)]">
            <EmptyState title="Analist ağı boş" description="Bu sembolde aktif üretici örneklemesi yok." tone="market" compact />
          </div>
        ) : (
          <div className="mt-[var(--sp-3)] grid gap-[var(--sp-4)] min-[720px]:grid-cols-2 min-[1100px]:grid-cols-3">
            <RowList title="Bu varlıkta öne çıkan" rows={network.topOnAsset} />
            <RowList title="Yükselen üreticiler" rows={network.rising} />
            <RowList title="Kurumsal üslup" rows={network.institutionalStyle} />
            <RowList title="Makro & FX" rows={network.macroSpecialists} />
            <RowList title="En çok kopyalanan" rows={network.mostCopied} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">Zaman çizelgesi</p>
              <ul className="mt-[var(--sp-2)] space-y-1.5">
                {network.timeline.length === 0 ? (
                  <li className="text-[12px] text-[var(--color-meta)]">Henüz kapanış olayı yok.</li>
                ) : (
                  network.timeline.map((t, i) => (
                    <li key={`${t.at}-${i}`} className="text-[11px] font-semibold leading-snug text-[var(--color-text)]">
                      <span className="text-[var(--color-meta)]">{new Date(t.at).toLocaleDateString("tr-TR")}</span> · {t.label}
                      <span className="font-medium text-[var(--color-text-secondary)]"> — {t.analystDisplay}</span>
                      {t.href ? (
                        <Link href={t.href} className="ml-1 text-[var(--color-primary-dark)] hover:underline">
                          →
                        </Link>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </MarketIntelSection>
  );
}
