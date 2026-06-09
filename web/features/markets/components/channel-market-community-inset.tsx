"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  channelUserId: string;
  assetTags?: string[];
};

/** Kanal profili — piyasa tartışma ağından ince bağlam (repository + canlı varlık etiketleri). */
export function ChannelMarketCommunityInset({ channelUserId, assetTags = [] }: Props) {
  const bundle = useMemo(() => getMarketsRepository().getMarketCommunityNetwork(), []);
  const topics = useMemo(() => {
    if (isMockDataEnabled()) {
      return getSocialRepository().getCreatorTopicCommunities(channelUserId);
    }
    return assetTags.slice(0, 6).map((tag) => ({
      slug: tag.toLowerCase(),
      label: tag.startsWith("#") ? tag : `#${tag}`,
      href: `/search?q=${encodeURIComponent(tag)}`,
      heatLabel: "tartışma",
    }));
  }, [channelUserId, assetTags]);
  const overlap = bundle.community.creatorOverlapLeaders.find((c) => c.href === `/channel/${channelUserId}`);
  const chains = bundle.crossAssetChains.slice(0, 2);

  if (!overlap && !chains.length && !topics.length) {
    return (
      <div className="ch-inset ch-inset--empty">
        <p className="ch-inset-empty-text">Piyasa tartışma köprüsü: kanal içeriğinden varlık etiketleri görününce burada dolacak.</p>
      </div>
    );
  }

  return (
    <div className="ch-inset-stack">
      {topics.length > 0 ? (
        <div className="ch-inset">
          <div className="ch-inset-head">
            <p className="ch-inset-label">Konu ağı</p>
            <Link href="/discover" className="ch-inset-link">
              Keşfet →
            </Link>
          </div>
          <ul className="ch-inset-chip-list">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="ch-inset-chip">
                  {t.label}
                  <span className="ch-inset-chip-meta">{t.heatLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {overlap || chains.length > 0 ? (
        <div className="ch-inset">
          <div className="ch-inset-head">
            <p className="ch-inset-label">Piyasa ağı</p>
            <Link href="/markets" className="ch-inset-link">
              Piyasalar →
            </Link>
          </div>
          {overlap ? (
            <p className="ch-inset-body">
              Bu kanal <span className="ch-inset-highlight">{overlap.topSymbol}</span> tartışma kümesinde —{" "}
              {overlap.sharedAssetCount} varlık kesişimi
              {isMockDataEnabled() ? " (mock)" : ""}
            </p>
          ) : (
            <p className="ch-inset-body ch-inset-body--muted">Çapraz tartışma zincirleri:</p>
          )}
          <ul className={chains.length > 0 ? "ch-inset-chain-list" : "ch-inset-chain-list ch-inset-chain-list--hidden"}>
            {chains.map((c) => (
              <li key={c.id}>
                <Link href={c.href} className="ch-inset-chain-link">
                  {c.leftSymbol} ↔ {c.rightSymbol}
                </Link>
                <span className="ch-inset-chain-theme"> · {c.theme}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
