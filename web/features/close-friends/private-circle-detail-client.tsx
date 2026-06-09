"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { CircleDetailHeader } from "@/features/close-friends/components/circle-detail-header";
import { CircleDetailIntel } from "@/features/close-friends/components/circle-detail-intel";
import { CloseFriendsCreatorTrustActions } from "@/features/close-friends/components/close-friends-creator-trust-actions";
import { CloseFriendsDataBadge } from "@/features/close-friends/components/close-friends-data-badge";
import { CloseFriendsFeedList } from "@/features/close-friends/components/close-friends-feed-list";
import { CloseFriendsPageHeader } from "@/features/close-friends/components/close-friends-page-header";
import {
  CircleDetailSkeleton,
  CloseFriendsHubError,
} from "@/features/close-friends/components/close-friends-states";
import { CloseFriendsSectionHeader } from "@/features/close-friends/components/close-friends-ui";
import { useCircleDetail } from "@/features/close-friends/hooks/use-close-friends-hub";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";

type Props = { circleId: string };

export function PrivateCircleDetailClient({ circleId }: Props) {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;
  const pSnap = usePersonalizationSnapshot();
  void pSnap.recommendRev;

  const { detail, isLoading, isError, refetch, mockOn } = useCircleDetail(circleId, viewerId);

  const pageHeader = <CloseFriendsPageHeader title="Özel daire" />;

  if (isLoading) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
        <CircleDetailSkeleton />
      </HubPageShell>
    );
  }

  if (isError) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
        <CloseFriendsHubError onRetry={() => void refetch()} />
      </HubPageShell>
    );
  }

  if (!detail) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
        <div className="cf-studio">
          <div className="cf-page cf-surface">
            <div className="cf-panel">
              <EmptyState
                title="Daire bulunamadı"
                description="Bağlantı süresi dolmuş veya davet kapsamı dışında olabilirsin."
                actionLabel="Yakın arkadaşlar"
                actionHref="/hub/close-friends"
                secondaryActionLabel="Keşfet"
                secondaryActionHref="/discover"
                tone="social"
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  const { circle, feed, publishing_hint } = detail;

  return (
    <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
      <div className="cf-studio">
        <div className="cf-page cf-surface">
          <div className="cf-panel">
            <CircleDetailHeader detail={detail} />

            <CloseFriendsDataBadge
              dataMode={mockOn ? "mock" : "live"}
              writeEnabled={detail.write_enabled}
              mockOn={mockOn}
            />

            {user ? (
              <CloseFriendsCreatorTrustActions detail={detail} viewerId={user.id} mockOn={mockOn} />
            ) : null}

            <p className="cf-detail-overview">{circle.subline}</p>

            <CircleDetailIntel intel={circle.intel} />

            {publishing_hint.trim() ? <p className="cf-detail-strategy">{publishing_hint}</p> : null}

            <section>
              <CloseFriendsSectionHeader title="Daire akışı" />
              <CloseFriendsFeedList items={feed} />
            </section>

            <nav className="cf-quick-links" aria-label="Geri dön">
              <Link href="/hub/close-friends" className="cf-quick-link">
                ← Yakın arkadaşlar
              </Link>
              <Link href={circle.subscription_href} className="cf-quick-link">
                Üyelik
              </Link>
              <Link href="/hub/upload" className="cf-quick-link">
                Yayınla
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
