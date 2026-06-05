"use client";

import Link from "next/link";

import { HomeForYouIntelligenceRails } from "@/features/personalization/components/home-for-you-intelligence-rails";
import { InterestProfileStrip } from "@/features/personalization/components/interest-profile-strip";
import { RecommendationNetworkRails } from "@/features/personalization/components/recommendation-network-rails";
import { DiscussionPersonalizedRail } from "@/features/social/components/discussion-personalized-rail";
import { HomeTopicCommunityRails } from "@/features/social/components/home-topic-community-rails";
import { homeAmbientContextSummary } from "@/features/feed/home-intel-copy";
import { useHomeLiveContext } from "@/features/home/hooks/use-home-live-context";
import { getHomeRepository } from "@/features/home/repository";
import { HomeLivePersonalizationRail } from "@/features/personalization/components/home-live-personalization-rail";
import { isMockDataEnabled } from "@/mock/config";
import type { InterestIntelligenceSnapshot } from "@/features/personalization/domain/personalization-types";

function RailSpark() {
  return (
    <span
      className="ms-home-rail-spark mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_75%,transparent)] shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
      aria-hidden
    />
  );
}

type Props = {
  viewerId: string | null;
  intel: InterestIntelligenceSnapshot;
  className?: string;
};

/**
 * Home sağ şerit — ambient, taranabilir, kısa bloklar.
 */
export function HomeAmbientRail({ viewerId, intel, className = "" }: Props) {
  const mockOn = isMockDataEnabled();
  const liveCtx = useHomeLiveContext(viewerId);
  const pulse = mockOn ? getHomeRepository().getMarketPulse() : (liveCtx.pulse ?? getHomeRepository().getMarketPulse());
  const summary = mockOn ? homeAmbientContextSummary(intel) : (liveCtx.summary ?? homeAmbientContextSummary(intel));
  const markets = pulse.slice(0, 6);

  return (
    <div className={`ms-home-ambient-rail ms-home-rail-root text-[var(--color-text)] ${className}`}>
      {summary ? (
        <section className="ms-home-ambient-rail__block">
          <h3 className="ms-home-ambient-rail__title">Bugün</h3>
          <div className="ms-home-ambient-summary mt-2.5">
            <p className="line-clamp-3 text-[15px] font-normal leading-relaxed text-[var(--color-text-secondary)]">{summary}</p>
          </div>
        </section>
      ) : null}

      <section className="ms-home-ambient-rail__block">
        <h3 className="ms-home-ambient-rail__title">Kısayol</h3>
        <nav className="mt-2.5 flex flex-col gap-1.5" aria-label="Hızlı semboller">
          {markets.map((x) => (
            <Link
              key={x.label}
              href={x.href}
              className="ms-home-ambient-rail__pill group/rp flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold leading-snug text-[var(--color-text-secondary)] outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] sm:text-[15px]"
            >
              <RailSpark />
              <span className="min-w-0 truncate">{x.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      {mockOn ? (
        <section className="ms-home-ambient-rail__block">
          <h3 className="ms-home-ambient-rail__title">Sana özel</h3>
          <div className="mt-2.5 space-y-3">
            <InterestProfileStrip variant="compact" intel={intel} embedded railAmbient />
            <HomeForYouIntelligenceRails viewerId={viewerId} embedded minimal omitDiscussions />
            <HomeTopicCommunityRails embedded maxItems={1} />
            <Link
              href="/discover"
              className="inline-flex min-h-10 items-center text-[14px] font-semibold text-[var(--color-primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]"
            >
              Keşfet
            </Link>
          </div>
        </section>
      ) : liveCtx.recommendations ? (
        <section className="ms-home-ambient-rail__block">
          <h3 className="ms-home-ambient-rail__title">Sana özel</h3>
          <div className="mt-2.5">
            <HomeLivePersonalizationRail bundle={liveCtx.recommendations} variant="forYou" />
            <Link
              href="/discover"
              className="mt-2 inline-flex min-h-10 items-center text-[14px] font-semibold text-[var(--color-primary)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]"
            >
              Keşfet
            </Link>
          </div>
        </section>
      ) : null}

      {mockOn ? (
        <section className="ms-home-ambient-rail__block">
          <h3 className="ms-home-ambient-rail__title">Topluluk</h3>
          <div className="mt-2.5 space-y-3">
            <DiscussionPersonalizedRail ambient />
            <RecommendationNetworkRails viewerId={viewerId} ambient railHome maxAmbientItems={1} />
          </div>
        </section>
      ) : liveCtx.recommendations ? (
        <section className="ms-home-ambient-rail__block">
          <h3 className="ms-home-ambient-rail__title">Topluluk</h3>
          <div className="mt-2.5">
            <HomeLivePersonalizationRail bundle={liveCtx.recommendations} variant="community" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
