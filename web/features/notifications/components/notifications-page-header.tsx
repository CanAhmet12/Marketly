"use client";

import { HubButton } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = {
  title?: string;
  subtitle?: string;
  unreadCount?: number;
  hydrated?: boolean;
  onMarkAllRead?: () => void;
};

export function NotificationsPageHeader({
  title = "Bildirimler",
  subtitle,
  unreadCount = 0,
  hydrated = false,
  onMarkAllRead,
}: Props) {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("inbox", "Bildirim merkezi")}
      title={title}
      subtitle={subtitle}
      actions={
        onMarkAllRead ? (
          <HubButton type="button" disabled={!hydrated || unreadCount === 0} onClick={onMarkAllRead}>
            Tümünü oku
          </HubButton>
        ) : undefined
      }
    />
  );
}
