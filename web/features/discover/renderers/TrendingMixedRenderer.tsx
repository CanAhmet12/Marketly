"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { PulseCard } from "@/features/discover/cards/PulseCard";
import { LiveCard } from "@/features/discover/cards/LiveCard";
import { SignalCard } from "@/features/discover/cards/SignalCard";
import { VideoCardFullWidth } from "@/features/discover/cards/VideoCardFullWidth";
import { EmptyState } from "@/components/states";
import { DiscoverCreatorSpotlightCard } from "@/features/discover/components/DiscoverCreatorSpotlightCard";
import { DiscoverTopicEcosystemList } from "@/features/discover/components/DiscoverTopicEcosystemList";
import { isLivePost, isLongVideoPost, isPulsePost, isSignalPost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { cn } from "@/lib/cn";
import { getDiscoverCreatorSpotlightRows, getDiscoverTopicEcosystems } from "@/mock/adapters/discover-lower";

type Props = {
  posts: FeedPost[];
  engagement: HomeEngagementHandlers;
};

function ContinueLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="hv-discover-continue">
      <Link href={href} className="hv-discover-continue__link">
        {label}
      </Link>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  subtitle,
  className,
  action,
}: {
  id: string;
  title: string;
  subtitle?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "mb-[var(--hv-s-3)] flex min-w-0 flex-col gap-2 sm:mb-[var(--hv-s-4)] sm:flex-row sm:items-end sm:justify-between sm:gap-x-4 sm:gap-y-1",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 id={id} className="hv-discover-section-heading">
          {title}
        </h2>
        {subtitle ? <p className="hv-discover-section-kicker">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-px">{action}</div> : null}
    </header>
  );
}

/**
 * Keşfet / Tümü — web-first sıra: canlı → pulse → uzun video → sinyal → konu → üretici CTA
 */
export function TrendingMixedRenderer({ posts, engagement }: Props) {
  const pulseContent = posts.filter(isPulsePost);
  const liveContent = posts.filter(isLivePost);
  const signalContent = posts.filter(isSignalPost);
  const longVideoContent = posts.filter((p) => isLongVideoPost(p) && !isLivePost(p) && !isSignalPost(p));

  const excludeSpotlightUserIds = useMemo(() => {
    const s = new Set<string>();
    posts
      .filter(isLivePost)
      .slice(0, 4)
      .forEach((p) => s.add(p.user_id));
    posts
      .filter(isPulsePost)
      .slice(0, 6)
      .forEach((p) => s.add(p.user_id));
    posts
      .filter((p) => isLongVideoPost(p) && !isLivePost(p) && !isSignalPost(p))
      .slice(0, 4)
      .forEach((p) => s.add(p.user_id));
    posts
      .filter(isSignalPost)
      .slice(0, 6)
      .forEach((p) => s.add(p.user_id));
    return s;
  }, [posts]);

  const topicRows = useMemo(() => getDiscoverTopicEcosystems().slice(0, 5), []);
  const creatorSpotlights = useMemo(() => getDiscoverCreatorSpotlightRows(excludeSpotlightUserIds), [excludeSpotlightUserIds]);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Henüz keşif sinyali yok"
        description="İçerik yüklendiğinde akış burada başlayacak."
        actionLabel="Ana akış"
        actionHref="/"
        compact
      />
    );
  }

  return (
    <div className="hv-discover-flow">
      {liveContent.length > 0 ? (
        <section className="hv-discover-band hv-discover-band--live" aria-labelledby="disc-flow-live">
          <SectionHeading
            id="disc-flow-live"
            title="Canlı Yayınlar"
            action={
              <Link href={DISCOVER_VERTICAL_ROUTES.live} className="hv-ref-discover-sec__cta">
                Tüm canlılar →
              </Link>
            }
          />
          <div className="discover-live-hub">
            <div className="discover-live-hub__grid">
              <div className="min-w-0">
                <LiveCard
                  post={liveContent[0]}
                  engagement={engagement}
                  index={0}
                  feedSurface="default"
                  discoverLiveVariant="featured"
                />
              </div>
              {liveContent.length > 1 ? (
                <ul className="discover-live-hub__stack m-0 list-none p-0">
                  {liveContent.slice(1, 5).map((post, index) => (
                    <li key={post.id} className="min-w-0">
                      <LiveCard
                        post={post}
                        engagement={engagement}
                        index={index + 1}
                        feedSurface="default"
                        discoverLiveVariant="secondary"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {pulseContent.length > 0 ? (
        <section className="hv-discover-band hv-discover-band--pulse min-w-0" aria-labelledby="disc-flow-pulse">
          <SectionHeading id="disc-flow-pulse" title="Pulse — Piyasanın Nabzı" subtitle="Kısa form keşfi; hızlı tarama." />
          <div className="flex min-w-0 flex-col gap-[var(--hv-s-4)]">
            <div className="grid min-w-0 grid-cols-2 gap-[var(--hv-s-3)] sm:gap-[var(--hv-s-4)]">
              {pulseContent.slice(0, 2).map((post, index) => (
                <div key={post.id} className="flex min-w-0 justify-center">
                  <PulseCard post={post} engagement={engagement} index={index} discoverTier="featured" />
                </div>
              ))}
            </div>
            {pulseContent.length > 2 ? (
              <div className="grid min-w-0 grid-cols-2 gap-[var(--hv-s-3)] min-[560px]:grid-cols-3 lg:grid-cols-3">
                {pulseContent.slice(2, 8).map((post, index) => (
                  <div key={post.id} className="flex min-w-0 justify-center">
                    <PulseCard post={post} engagement={engagement} index={index + 2} discoverTier="medium" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <ContinueLink href={DISCOVER_VERTICAL_ROUTES.pulse} label="Pulse akışı →" />
        </section>
      ) : null}

      {longVideoContent.length > 0 ? (
        <section className="hv-discover-band hv-discover-band--video" aria-labelledby="disc-flow-video">
          <SectionHeading id="disc-flow-video" title="Öne Çıkan Videolar" subtitle="Uzun form analiz ve tartışma." />
          <ul className="m-0 flex list-none flex-col gap-[var(--hv-s-6)] p-0">
            {longVideoContent.slice(0, 3).map((post, index) => (
              <li key={post.id}>
                <VideoCardFullWidth post={post} engagement={engagement} index={index} discoverCinematic />
              </li>
            ))}
          </ul>
          <ContinueLink href={DISCOVER_VERTICAL_ROUTES.videos} label="Video kütüphanesi →" />
        </section>
      ) : null}

      {signalContent.length > 0 ? (
        <section className="hv-discover-band hv-discover-band--signals" aria-labelledby="disc-flow-sig">
          <SectionHeading
            id="disc-flow-sig"
            title="Aktif Sinyaller"
            subtitle="Kısa vadeli fikirler ve seviye özeti."
            action={
              <Link href="/signals" className="hv-ref-discover-sec__cta">
                Sinyal pazarı →
              </Link>
            }
          />
          <ul className="discover-signal-intel-grid m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-3">
            {signalContent.slice(0, 8).map((post, index) => (
              <li key={post.id} className="min-w-0">
                <SignalCard post={post} engagement={engagement} index={index} feedSurface="default" discoverIntel />
              </li>
            ))}
          </ul>
          <ContinueLink href={DISCOVER_VERTICAL_ROUTES.signals} label="Tüm sinyaller →" />
        </section>
      ) : null}

      <section className="hv-discover-band hv-discover-band--topics" aria-labelledby="disc-flow-topics">
        <SectionHeading id="disc-flow-topics" title="Konu Ekosistemleri" subtitle="Gündem hatları ve topluluk yoğunluğu." />
        <DiscoverTopicEcosystemList topics={topicRows} />
        <ContinueLink href="/results?q=&tab=communities" label="Topluluk aramasına git →" />
      </section>

      <section className="hv-discover-band hv-discover-band--creators" aria-labelledby="disc-flow-creators">
        <SectionHeading
          id="disc-flow-creators"
          title="Üretici Keşfi"
          subtitle="Yükselen ve uzman üretici hatları."
          action={
            <Link href={DISCOVER_VERTICAL_ROUTES.creators} className="hv-ref-discover-sec__cta">
              Tüm üreticiler →
            </Link>
          }
        />
        <ul className="m-0 grid list-none grid-cols-1 gap-[var(--hv-s-3)] p-0 lg:grid-cols-2">
          {creatorSpotlights.map((row) => (
            <li key={row.userId} className="min-w-0">
              <DiscoverCreatorSpotlightCard row={row} />
            </li>
          ))}
        </ul>
        <ContinueLink href={DISCOVER_VERTICAL_ROUTES.creators} label="Üretici şeridine geç →" />
      </section>
    </div>
  );
}
