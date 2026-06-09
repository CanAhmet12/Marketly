"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { NotificationsDigestRail } from "@/features/notifications/components/notifications-digest-rail";
import { NotificationsIntelStrip } from "@/features/notifications/components/notifications-intel-strip";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { NotificationsNavRail } from "@/features/notifications/components/notifications-nav-rail";
import { NotificationsPageHeader } from "@/features/notifications/components/notifications-page-header";
import { NotificationsPanelToolbar } from "@/features/notifications/components/notifications-panel-toolbar";
import { NotificationsQuickLinks } from "@/features/notifications/components/notifications-quick-links";
import { NotificationsPageSkeleton } from "@/features/notifications/components/notifications-states";
import { useNotificationCenter } from "@/features/notifications/hooks/use-notification-center";
import type { NotificationInboxStreamId } from "@/features/notifications/domain/types";
import {
  buildNotificationIntel,
  buildStreamUnreadCounts,
} from "@/features/notifications/lib/build-notification-intel";
import {
  NOTIFICATION_STREAM_LABELS,
  notificationStreamToParam,
  resolveNotificationStream,
} from "@/features/notifications/notifications-section-params";
import { trackContentView } from "@/features/personalization/tracking";
import { isMockDataEnabled } from "@/mock/config";

export function NotificationsHubClient() {
  const mockOn = isMockDataEnabled();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = user?.id;

  const stream = useMemo(
    () => resolveNotificationStream(searchParams.get("stream")),
    [searchParams],
  );

  const pushStream = useCallback(
    (id: NotificationInboxStreamId) => {
      const sp = new URLSearchParams(searchParams.toString());
      const param = notificationStreamToParam(id);
      if (param) sp.set("stream", param);
      else sp.delete("stream");
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { hub, visibleItems, dispatch, inbox } = useNotificationCenter(uid, stream);
  const { unreadCount, markRead, markAllRead, overrides, hydrated } = inbox;

  const intel = useMemo(
    () => buildNotificationIntel(hub.items, overrides, hub.confidence_label),
    [hub.items, overrides, hub.confidence_label],
  );

  const streamCounts = useMemo(
    () => buildStreamUnreadCounts(hub.items, overrides),
    [hub.items, overrides],
  );

  useEffect(() => {
    if (!hydrated) return;
    trackContentView({ contentFormat: "post", surface: "notifications_inbox_v2" });
  }, [hydrated]);

  const loginNext = pathname?.startsWith("/hub") ? pathname : "/hub/notifications";
  const empty = visibleItems.length === 0;

  const pageHeader = (
    <NotificationsPageHeader
      title={user ? hub.headline : "Bildirim merkezi"}
      subtitle={
        user ? hub.subline : "Portföy, takip ve premium akışlarından gelen olaylar burada toplanır."
      }
      unreadCount={unreadCount}
      hydrated={hydrated}
      onMarkAllRead={user ? () => markAllRead() : undefined}
    />
  );

  if (!isInitialized) {
    return (
      <HubPageShell zone="inbox" className="hp-canvas--embedded-notifications" header={pageHeader}>
        <NotificationsPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="inbox" className="hp-canvas--embedded-notifications" header={pageHeader}>
        <div className="ntf-studio">
          <div className="ntf-page ntf-surface">
            <div className="ntf-panel">
              <EmptyState
                title="Bildirim merkezi"
                description="Bildirimlerinizi görmek için oturum açın."
                actionLabel="Oturum aç"
                actionHref={`/auth/login?next=${encodeURIComponent(loginNext)}`}
                tone="social"
                compact
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="inbox" className="hp-canvas--embedded-notifications" header={pageHeader}>
      <div className="ntf-studio">
        <div className="ntf-page ntf-surface">
          <NotificationsNavRail active={stream} onSelect={pushStream} streamCounts={streamCounts} />

          <div className="ntf-panel" id="ntf-panel-main" role="tabpanel" aria-labelledby={`ntf-tab-${stream}`}>
            <NotificationsPanelToolbar
              stream={stream}
              visibleCount={visibleItems.length}
              mockOn={mockOn || hub.mock_mode}
            />

            <NotificationsIntelStrip
              hub={hub}
              intel={intel}
              hydrated={hydrated}
              streamLabel={NOTIFICATION_STREAM_LABELS[stream]}
            />

            <NotificationsDigestRail digests={hub.digests} />

            {empty ? (
              <EmptyState
                title={!mockOn ? "Henüz olay yok" : "Bu akışta sonuç yok"}
                description={
                  !mockOn
                    ? "Canlı modda olaylar yüklendiğinde zekâ kutusu güncellenir. Portföy ve liste bağlantılarını tamamlayın."
                    : stream !== "today" && stream !== "all"
                      ? "Başka bir akış seçin veya tüm bildirimlere geçin."
                      : "Başka bir akış seçin veya sessize alınan içerikçileri ayarlardan gözden geçirin."
                }
                actionLabel={stream !== "today" && stream !== "all" ? "Tümünü göster" : undefined}
                onAction={stream !== "today" && stream !== "all" ? () => pushStream("all") : undefined}
                tone="social"
                compact
              />
            ) : (
              <NotificationsList
                items={visibleItems}
                overrides={overrides}
                markRead={markRead}
                dispatch={dispatch}
              />
            )}

            <NotificationsQuickLinks links={hub.nav_links} />
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
