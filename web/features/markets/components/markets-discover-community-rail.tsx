"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

/**
 * Keşfet üstü — çapraz varlık zinciri (Markets ağı) + tema toplulukları (Social).
 * Veri SocialRepository.getDiscoverMarketTopicBridge üzerinden; UI fixture içermez.
 */
export function MarketsDiscoverCommunityRail() {
  const bridge = useMemo(() => {
    if (!isMockDataEnabled()) return null;
    return getSocialRepository().getDiscoverMarketTopicBridge();
  }, []);

  if (!bridge) {
    return (
      <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-2)]">
        <p className="text-[11px] font-medium text-[var(--color-meta)]">Tema ve piyasa köprüsü: mock kapalı veya veri yok.</p>
      </div>
    );
  }

  const { crossAssetChains, topicChips } = bridge;
  if (!crossAssetChains.length && !topicChips.length) {
    return (
      <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-2)]">
        <p className="text-[11px] font-medium text-[var(--color-meta)]">Köprü verisi bekleniyor.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-2)] py-[var(--sp-2)]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Piyasa · tema köprüsü</p>
        <Link href="/markets" className="text-[10px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Piyasalar →
        </Link>
      </div>
      <div className="mt-1 flex gap-[var(--sp-2)] overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {crossAssetChains.map((c) => (
          <Link
            key={`chain-${c.id}`}
            href={c.href}
            className={cn(
              "shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)]",
              "px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]",
            )}
          >
            {c.leftSymbol}↔{c.rightSymbol}
            <span className="ml-1 text-[var(--color-meta)]">{c.intensityLabel}</span>
          </Link>
        ))}
        {topicChips.map((x, i) => (
          <Link
            key={`topic-${x.slug}-${i}`}
            href={x.href}
            className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] px-[var(--sp-3)] py-1 text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]"
          >
            {x.label}
            <span className="ml-1 text-[var(--color-meta)]">{x.heatLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
