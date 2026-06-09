"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetMediaItem } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { items: AssetMediaItem[] };

export function AssetDetailMediaRail({ items }: Props) {
  const railItems = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [items]);

  return (
    <MarketIntelSection
      title="İlgili medya"
      description="Video, Pulse ve canlı — keşfet / izle akışlarına bağlanır."
      bodyClassName="px-0 pb-0 pt-0"
    >
      {railItems.length === 0 ? (
        <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
          <EmptyState title="Medya yok" description="Bu varlık için ilişkili içerik henüz eklenmedi." tone="market" compact />
        </div>
      ) : (
        <div className="ms-scrollbar-thin ms-rail-scroll flex gap-[var(--sp-2)] overflow-x-auto px-[var(--sp-3)] py-[var(--sp-3)]">
          {railItems.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="flex w-[min(200px,72vw)] shrink-0 flex-col overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] transition hover:border-[color-mix(in_srgb,var(--color-primary)_38%,var(--color-border))]"
            >
              <div className="relative aspect-video w-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                {m.thumbnailUrl ? (
                  <Image src={m.thumbnailUrl} alt={m.title} fill className="object-cover" sizes="(max-width: 640px) 72vw, 200px" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[var(--color-meta)]">{m.kind}</div>
                )}
                <span className={cn("absolute left-1 top-1 rounded px-1 py-0.5 text-[11px] font-bold uppercase", kindPill(m.kind))}>{m.kind}</span>
                {m.durationLabel ? (
                  <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1 py-0.5 text-[11px] font-bold text-white">{m.durationLabel}</span>
                ) : null}
              </div>
              <div className="p-[var(--sp-2)]">
                <p className="line-clamp-2 text-[12px] font-bold leading-snug text-[var(--color-text)]">{m.title}</p>
                <p className="mt-1 text-[11px] font-semibold text-[var(--color-meta)]">{m.creatorDisplay}</p>
                {m.editorialIntent ? <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">{m.editorialIntent}</p> : null}
                <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-tertiary)]">{m.viewsLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MarketIntelSection>
  );
}

function kindPill(kind: AssetMediaItem["kind"]) {
  if (kind === "live") return "bg-[color-mix(in_srgb,var(--color-fall)_16%,transparent)] text-[var(--color-fall)]";
  if (kind === "short") return "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary-dark)]";
  return "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[var(--color-text-secondary)]";
}
