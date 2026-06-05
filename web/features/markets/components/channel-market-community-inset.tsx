"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

type Props = { channelUserId: string };

/** Kanal profili — piyasa tartışma ağından ince bağlam (repository). */
export function ChannelMarketCommunityInset({ channelUserId }: Props) {
  const bundle = useMemo(() => getMarketsRepository().getMarketCommunityNetwork(), []);
  const topics = useMemo(() => {
    if (!isMockDataEnabled()) return [];
    return getSocialRepository().getCreatorTopicCommunities(channelUserId);
  }, [channelUserId]);
  const overlap = bundle.community.creatorOverlapLeaders.find((c) => c.href === `/channel/${channelUserId}`);
  const chains = bundle.crossAssetChains.slice(0, 2);

  if (!overlap && !chains.length && !topics.length) {
    return (
      <div className="mb-4 rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-2">
        <p className="text-[11px] font-medium text-[var(--color-meta)]">Piyasa tartışma köprüsü: veri bekleniyor.</p>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-[var(--sp-2)]">
      {topics.length ? (
        <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Konu ağı</p>
            <Link href="/discover" className="text-[10px] font-bold text-[var(--color-primary-dark)] hover:underline">
              Keşfet →
            </Link>
          </div>
          <ul className="m-0 mt-1 flex flex-wrap gap-1.5 p-0">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/40">
                  {t.label}
                  <span className="ml-1 text-[10px] text-[var(--color-meta)]">{t.heatLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {overlap || chains.length ? (
        <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-3)] py-[var(--sp-2)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Piyasa ağı</p>
            <Link href="/markets" className="text-[10px] font-bold text-[var(--color-primary-dark)] hover:underline">
              Piyasalar →
            </Link>
          </div>
          {overlap ? (
            <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">
              Bu kanal <span className="text-[var(--color-primary-dark)]">{overlap.topSymbol}</span> tartışma kümesinde — {overlap.sharedAssetCount} varlık kesişimi (mock)
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Çapraz tartışma zincirleri:</p>
          )}
          <ul className={cn("mt-1 flex flex-wrap gap-2", !chains.length && "hidden")}>
            {chains.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
                  {c.leftSymbol} ↔ {c.rightSymbol}
                </Link>
                <span className="text-[11px] text-[var(--color-meta)]"> · {c.theme}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
