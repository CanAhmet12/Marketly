"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { SubscriptionsActiveList } from "@/features/subscriptions/components/subscriptions-active-list";
import { SubscriptionsDataBadge } from "@/features/subscriptions/components/subscriptions-data-badge";
import { SubscriptionsDiscoverySection } from "@/features/subscriptions/components/subscriptions-discovery-section";
import { SubscriptionsIntelStrip } from "@/features/subscriptions/components/subscriptions-intel-strip";
import { SubscriptionsNavRail } from "@/features/subscriptions/components/subscriptions-nav-rail";
import { SubscriptionsPageHeader } from "@/features/subscriptions/components/subscriptions-page-header";
import { SubscriptionsQuickLinks } from "@/features/subscriptions/components/subscriptions-quick-links";
import {
  SubscriptionsHubError,
  SubscriptionsPageSkeleton,
} from "@/features/subscriptions/components/subscriptions-states";
import { SubscriptionsSectionHeader } from "@/features/subscriptions/components/subscriptions-ui";
import { useSubscriptionsHub } from "@/features/subscriptions/hooks/use-subscriptions-hub";
import {
  resolveSubscriptionsSection,
  subscriptionsSectionToParam,
  type SubscriptionsSectionId,
} from "@/features/subscriptions/subscriptions-section-params";

export function SubscriptionsHubClient() {
  const { user, isInitialized } = useAuth();
  const viewerId = user?.id ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pSnap = usePersonalizationSnapshot();
  void pSnap.recommendRev;
  void pSnap.feedbackRev;
  void pSnap.adaptiveRev;
  void pSnap.explorationRev;
  void pSnap.affinity.meta.eventCount;

  const { payload, isLoading: hubLoading, isError, refetch, mockOn } = useSubscriptionsHub(viewerId);

  const activeSection = useMemo(
    () => resolveSubscriptionsSection(searchParams.get("section")),
    [searchParams],
  );

  const pushSection = useCallback(
    (id: SubscriptionsSectionId) => {
      const param = subscriptionsSectionToParam(id);
      const next = param ? `${pathname}?section=${param}` : pathname;
      router.replace(next, { scroll: false });
    },
    [pathname, router],
  );

  const emptyCatalog = payload.catalog.length === 0;
  const sparseLive = payload.data_mode === "live_sparse" && emptyCatalog && payload.active_memberships.length === 0;

  const pageHeader = (
    <SubscriptionsPageHeader title={payload.headline} subtitle={payload.subline} />
  );

  if (!isInitialized || hubLoading) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
        <SubscriptionsPageSkeleton />
      </HubPageShell>
    );
  }

  if (isError) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
        <SubscriptionsHubError onRetry={() => void refetch()} />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="connect" className="hp-canvas--embedded-subscriptions" header={pageHeader}>
      <div className="sub-studio">
        <div className="sub-page sub-surface">
          <SubscriptionsNavRail
            active={activeSection}
            onSelect={pushSection}
            activeCount={payload.active_memberships.length}
          />

          <div className="sub-panel" id="sub-panel-main" role="tabpanel" aria-labelledby={`sub-tab-${activeSection}`}>
            <SubscriptionsDataBadge
              dataMode={payload.data_mode}
              writeEnabled={payload.write_enabled}
              mockOn={mockOn}
            />

            {activeSection === "overview" ? (
              <>
                <SubscriptionsIntelStrip payload={payload} />
                <div>
                  <SubscriptionsSectionHeader title="Aktif üyeliklerin" />
                  <SubscriptionsActiveList rows={payload.active_memberships} />
                </div>
                {!sparseLive ? (
                  <SubscriptionsDiscoverySection rails={payload.rails} catalog={payload.catalog} mode="overview" />
                ) : null}
                <SubscriptionsQuickLinks nav={payload.nav} />
              </>
            ) : null}

            {activeSection === "discover" ? (
              <>
                {sparseLive ? (
                  <EmptyState
                    title="Üyelik kataloğu hazırlanıyor"
                    description="Henüz ücretli katman tanımlayan üretici yok veya veri yüklenemedi. Keşfet ve sinyaller üzerinden ilerleyebilirsin."
                    actionLabel="Keşfet"
                    actionHref="/discover"
                    secondaryActionLabel="Sinyaller"
                    secondaryActionHref="/signals"
                  />
                ) : (
                  <SubscriptionsDiscoverySection rails={payload.rails} catalog={payload.catalog} mode="discover" />
                )}
                <SubscriptionsQuickLinks nav={payload.nav} />
              </>
            ) : null}

            {activeSection === "active" ? (
              <>
                <SubscriptionsSectionHeader
                  title="Aktif üyeliklerin"
                  desc="Yönettiğin planlar — detay sayfasından iptal edebilirsin"
                />
                <SubscriptionsActiveList rows={payload.active_memberships} />
                {payload.active_memberships.length === 0 && !sparseLive ? (
                  <SubscriptionsDiscoverySection rails={payload.rails} catalog={payload.catalog} mode="overview" />
                ) : null}
                <SubscriptionsQuickLinks nav={payload.nav} />
              </>
            ) : null}

            {activeSection === "catalog" ? (
              <>
                {emptyCatalog ? (
                  <EmptyState
                    title="Katalog boş"
                    description="Henüz ücretli katman tanımlayan üretici yok."
                    actionLabel="Keşfet"
                    actionHref="/discover"
                  />
                ) : (
                  <SubscriptionsDiscoverySection rails={payload.rails} catalog={payload.catalog} mode="catalog" />
                )}
                <SubscriptionsQuickLinks nav={payload.nav} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
