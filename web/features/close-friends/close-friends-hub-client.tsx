"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { CloseFriendsAddPanel } from "@/features/close-friends/components/close-friends-add-panel";
import { CloseFriendsDataBadge } from "@/features/close-friends/components/close-friends-data-badge";
import { CloseFriendsDiscoverySection } from "@/features/close-friends/components/close-friends-discovery-section";
import { CloseFriendsFeedList } from "@/features/close-friends/components/close-friends-feed-list";
import { CloseFriendsNavRail } from "@/features/close-friends/components/close-friends-nav-rail";
import { CloseFriendsPageHeader } from "@/features/close-friends/components/close-friends-page-header";
import { CloseFriendsQuickLinks } from "@/features/close-friends/components/close-friends-quick-links";
import {
  CloseFriendsHubError,
  CloseFriendsPageSkeleton,
} from "@/features/close-friends/components/close-friends-states";
import { CloseFriendsStatusStrip } from "@/features/close-friends/components/close-friends-status-strip";
import { CloseFriendsTrustedList } from "@/features/close-friends/components/close-friends-trusted-list";
import { CloseFriendsSectionHeader } from "@/features/close-friends/components/close-friends-ui";
import { useCloseFriendsHub } from "@/features/close-friends/hooks/use-close-friends-hub";
import {
  closeFriendsSectionToParam,
  resolveCloseFriendsSection,
  type CloseFriendsSectionId,
} from "@/features/close-friends/close-friends-section-params";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";

export function CloseFriendsHubClient() {
  const { user, isInitialized } = useAuth();
  const viewerId = user?.id ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pSnap = usePersonalizationSnapshot();
  void pSnap.recommendRev;
  void pSnap.affinity.meta.eventCount;

  const { payload, isLoading: hubLoading, isError, refetch, mockOn } = useCloseFriendsHub(viewerId);

  const activeSection = useMemo(
    () => resolveCloseFriendsSection(searchParams.get("section")),
    [searchParams],
  );

  const pushSection = useCallback(
    (id: CloseFriendsSectionId) => {
      const param = closeFriendsSectionToParam(id);
      const next = param ? `${pathname}?section=${param}` : pathname;
      router.replace(next, { scroll: false });
    },
    [pathname, router],
  );

  const sparseLive =
    payload.data_mode === "live_sparse" &&
    payload.your_circles.length === 0 &&
    payload.trusted_members.length === 0;

  const pageHeader = (
    <CloseFriendsPageHeader title={payload.headline} subtitle={payload.subline} />
  );

  if (!isInitialized || hubLoading) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
        <CloseFriendsPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
        <div className="cf-studio">
          <div className="cf-page cf-surface">
            <div className="cf-panel">
              <EmptyState
                title="Oturum gerekli"
                description="Özel daireler ve güven katmanı yalnızca oturum açmış üyeler için görünür."
                actionLabel="Oturum aç"
                actionHref={`/auth/login?next=${encodeURIComponent("/hub/close-friends")}`}
                tone="social"
                compact
              />
            </div>
          </div>
        </div>
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

  return (
    <HubPageShell zone="connect" className="hp-canvas--embedded-close-friends" header={pageHeader}>
      <div className="cf-studio">
        <div className="cf-page cf-surface">
          <CloseFriendsNavRail
            active={activeSection}
            onSelect={pushSection}
            circleCount={payload.your_circles.length}
          />

          <div className="cf-panel" id="cf-panel-main" role="tabpanel" aria-labelledby={`cf-tab-${activeSection}`}>
            <CloseFriendsDataBadge
              dataMode={payload.data_mode}
              writeEnabled={payload.write_enabled}
              mockOn={mockOn}
            />

            {activeSection === "overview" ? (
              <>
                <CloseFriendsStatusStrip payload={payload} />
                <section>
                  <CloseFriendsSectionHeader
                    title="Güvenilen katman"
                    desc="Yakın takip — özel yayın ve dar daire için çekirdek liste"
                  />
                  <CloseFriendsTrustedList
                    members={payload.trusted_members}
                    viewerId={user.id}
                    writeEnabled={payload.write_enabled}
                    mockOn={mockOn}
                  />
                  <CloseFriendsAddPanel
                    viewerId={user.id}
                    trustedIds={payload.trusted_members.map((m) => m.id)}
                    writeEnabled={payload.write_enabled}
                    mockOn={mockOn}
                  />
                </section>
                {!sparseLive ? (
                  <CloseFriendsDiscoverySection payload={payload} mode="overview" />
                ) : null}
                <CloseFriendsQuickLinks nav={payload.nav} publishing={payload.publishing} />
              </>
            ) : null}

            {activeSection === "circles" ? (
              <>
                <section>
                  <CloseFriendsSectionHeader title="Güven katmanı" desc="Dairelerin yakın arkadaş listene bağlıdır" />
                  <CloseFriendsTrustedList
                    members={payload.trusted_members}
                    viewerId={user.id}
                    writeEnabled={payload.write_enabled}
                    mockOn={mockOn}
                  />
                  <CloseFriendsAddPanel
                    viewerId={user.id}
                    trustedIds={payload.trusted_members.map((m) => m.id)}
                    writeEnabled={payload.write_enabled}
                    mockOn={mockOn}
                  />
                </section>
                {payload.your_circles.length === 0 ? (
                  <EmptyState
                    title="Henüz daire yok"
                    description="Yakın arkadaş ekledikçe üreticilerinin özel segmentleri burada listelenir."
                    actionLabel="Ayarlar"
                    actionHref="/hub/settings"
                    secondaryActionLabel="Keşfet"
                    secondaryActionHref="/discover"
                    tone="social"
                  />
                ) : (
                  <CloseFriendsDiscoverySection payload={payload} mode="circles" />
                )}
                <CloseFriendsQuickLinks nav={payload.nav} publishing={payload.publishing} />
              </>
            ) : null}

            {activeSection === "discover" ? (
              <>
                {sparseLive ? (
                  <EmptyState
                    title="Özel daireler hazırlanıyor"
                    description="Canlı modda davetli masalar ve kitle segmentasyonu bağlandığında burada görünecek."
                    actionLabel="Keşfet"
                    actionHref="/discover"
                    secondaryActionLabel="Üyelikler"
                    secondaryActionHref="/hub/subscriptions"
                  />
                ) : (
                  <CloseFriendsDiscoverySection payload={payload} mode="discover" />
                )}
                <CloseFriendsQuickLinks nav={payload.nav} publishing={payload.publishing} />
              </>
            ) : null}

            {activeSection === "feed" ? (
              <>
                <CloseFriendsSectionHeader title="Özel akış" desc="Daire içi güncellemeler — kompakt özet" />
                <CloseFriendsFeedList items={payload.private_feed} />
                <CloseFriendsQuickLinks nav={payload.nav} publishing={payload.publishing} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
