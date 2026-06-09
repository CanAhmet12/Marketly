"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { fetchRecommendedCreators } from "@/features/home/fetch-home-extras";
import { RecommendationNetworkRails } from "@/features/personalization/components/recommendation-network-rails";
import { avatarUrl } from "@/lib/avatar-url";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  viewerId: string | null;
  channelUserId: string;
  specialties?: string[] | null;
};

/** Mock: personalization rails · Live: leaderboard tabanlı benzer üreticiler */
export function ChannelRecommendationRail({ viewerId, channelUserId, specialties }: Props) {
  const mockOn = isMockDataEnabled();
  const liveQuery = useQuery({
    queryKey: [...queryKeys.recommendedCreators(), "channel-rail", channelUserId] as const,
    enabled: !mockOn && isSupabaseConfigured(),
    staleTime: 120_000,
    queryFn: () => fetchRecommendedCreators(getSupabaseBrowserClient(), 8),
  });

  if (mockOn) {
    return (
      <div className="ch-recommend-rail-wrap">
        <RecommendationNetworkRails viewerId={viewerId} excludeCreatorId={channelUserId} />
      </div>
    );
  }

  const creators = (liveQuery.data ?? []).filter((c) => c.id !== channelUserId).slice(0, 5);
  const topicChips = (specialties ?? []).slice(0, 4).map((s) => ({
    label: s,
    href: `/search?q=${encodeURIComponent(s)}`,
  }));

  if (!creators.length && !topicChips.length) return null;

  return (
    <div className="ch-recommend-rail-wrap">
      <div className="ch-related-rail">
        <div className="ch-related-rail-head">
          <span className="ch-related-rail-title">Keşfet</span>
          <Link href="/creators" className="ch-related-rail-more">
            Tüm üreticiler →
          </Link>
        </div>

        {creators.length > 0 ? (
          <ul className="ch-related-rail-list">
            {creators.map((c) => (
              <li key={c.id}>
                <Link href={`/channel/${encodeURIComponent(c.id)}`} className="ch-related-rail-row">
                  <img
                    src={c.avatar_url?.trim() ? c.avatar_url : avatarUrl(c.id, c.name)}
                    alt=""
                    className="ch-related-rail-avatar"
                  />
                  <span className="ch-related-rail-row-main">
                    <span className="ch-related-rail-name">{c.name}</span>
                    <span className="ch-related-rail-meta">{c.expertise}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {topicChips.length > 0 ? (
          <div className="ch-related-rail-chips">
            {topicChips.map((chip) => (
              <Link key={chip.label} href={chip.href} className="ch-related-rail-chip">
                {chip.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
