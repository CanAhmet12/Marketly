"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = { assetTag: string | null | undefined };

/** İzleme sayfası — içerik varlığına göre tartışma köprüsü (repository). */
export function WatchMarketsDiscussionContext({ assetTag }: Props) {
  const bundle = useMemo(() => getMarketsRepository().getMarketCommunityNetwork(), []);
  const tag = (assetTag ?? "").trim().toUpperCase();
  const teasers = useMemo(() => {
    if (!isMockDataEnabled() || !tag) return [];
    return getSocialRepository().getAssetDiscussionTeasers(tag);
  }, [tag]);
  const watchRooms = useMemo(() => {
    if (!isMockDataEnabled() || !tag) return { lines: [] as { id: string; text: string; href: string }[] };
    return getSocialRepository().getWatchCreatorRoomsContext(tag);
  }, [tag]);
  const topicBridge = useMemo(() => {
    if (!isMockDataEnabled() || !tag) return [];
    const hub = getSocialRepository().getAssetCommunityHub(tag);
    return hub?.related_themes.slice(0, 5) ?? [];
  }, [tag]);
  const matchChain = tag ? bundle.crossAssetChains.find((c) => c.leftSymbol === tag || c.rightSymbol === tag) : undefined;
  const hot = bundle.community.hottestDebates.find((d) => d.symbol === tag);

  if (!tag) {
    return (
      <div className="mb-3 rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[var(--color-surface)] px-[var(--sp-2)] py-2">
        <p className="text-[11px] font-medium text-[var(--color-meta)]">Varlık etiketi yok — piyasa tartışma köprüsü kapalı.</p>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,var(--color-surface))] px-[var(--sp-2)] py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Piyasa tartışması</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Link href={`/markets/${encodeURIComponent(tag)}`} className="text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
          {tag} istihbarat
        </Link>
        <Link href={`/signals?asset=${encodeURIComponent(tag)}`} className="text-[11px] font-semibold text-[var(--color-text-secondary)] hover:underline">
          Sinyaller
        </Link>
      </div>
      {hot ? (
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Tartışma skoru <span className="font-mono font-bold text-[var(--color-text)]">{hot.score}</span> · {hot.stanceSplitLabel}
        </p>
      ) : null}
      {matchChain ? (
        <p className="mt-1 text-[11px] text-[var(--color-meta)]">
          Çapraz akış:{" "}
          <Link href={matchChain.href} className="font-semibold text-[var(--color-primary-dark)] hover:underline">
            {matchChain.leftSymbol} ↔ {matchChain.rightSymbol}
          </Link>{" "}
          · {matchChain.theme}
        </p>
      ) : null}
      {watchRooms.lines.length ? (
        <div className="mt-2 border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-2">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Üretici odaları</p>
          <ul className="m-0 mt-1 list-none space-y-1 p-0">
            {watchRooms.lines.map((ln) => (
              <li key={ln.id}>
                <Link href={ln.href} className="text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                  {ln.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {topicBridge.length ? (
        <div className="mt-2 border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-2">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Bağlı temalar</p>
          <ul className="m-0 mt-1 flex flex-wrap gap-1.5 p-0">
            {topicBridge.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]/40">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {teasers.length ? (
        <div className="mt-2 border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-2">
          <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">Gönderi tartışmaları</p>
          <ul className="m-0 mt-1 list-none space-y-1 p-0">
            {teasers.map((t) => (
              <li key={t.post_id}>
                <Link href={t.href} className="text-[11px] font-semibold text-[var(--color-primary-dark)] hover:underline">
                  {t.label}
                </Link>
                <span className="text-[10px] text-[var(--color-meta)]"> · {t.momentum}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
