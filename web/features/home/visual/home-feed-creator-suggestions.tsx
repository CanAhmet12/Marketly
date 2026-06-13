"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { avatarUrl } from "@/lib/avatar-url";
import { formatCompactCount } from "@/lib/format-compact-count";

import { RailCreatorFollow } from "./rail-creator-follow";

type Props = {
  creators: RecommendedCreatorCard[];
  viewerId: string | null;
};

export function HomeFeedCreatorSuggestions({ creators, viewerId }: Props) {
  if (creators.length === 0) return null;

  return (
    <section className="hv-ref-creator-suggest" aria-label="Önerilen üreticiler">
      <h3 className="hv-ref-creator-suggest__title">Takip etmeye başla</h3>
      <p className="hv-ref-creator-suggest__desc">
        Bu üreticileri keşfet — takip akışın burada dolacak.
      </p>
      <ul className="hv-ref-creator-suggest__list">
        {creators.slice(0, 5).map((c) => (
          <li key={c.id} className="hv-ref-creator-suggest__row">
            <Link href={`/channel/${c.id}`} className="hv-ref-creator-suggest__profile">
              <SafeAvatar
                src={c.avatar_url?.trim() || avatarUrl(c.id, c.name)}
                alt={c.name}
                size={40}
              />
              <span className="hv-ref-creator-suggest__meta">
                <span className="hv-ref-creator-suggest__name">{c.name}</span>
                <span className="hv-ref-creator-suggest__handle">{c.handle}</span>
                <span className="hv-ref-creator-suggest__followers">
                  {formatCompactCount(c.follower_count)} takipçi
                </span>
              </span>
            </Link>
            <RailCreatorFollow creatorUserId={c.id} viewerId={viewerId} />
          </li>
        ))}
      </ul>
      <Link href="/creators" className="hv-ref-creator-suggest__more">
        Tüm creator&apos;ları gör →
      </Link>
    </section>
  );
}
