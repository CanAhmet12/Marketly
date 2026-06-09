"use client";

import { HubButton } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = {
  title?: string;
  subtitle?: string;
  unreadCount?: number;
  unreadOnly?: boolean;
  onToggleUnread?: () => void;
};

export function MessagesPageHeader({
  title = "Mesajlar",
  subtitle,
  unreadCount = 0,
  unreadOnly = false,
  onToggleUnread,
}: Props) {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("inbox", "Gelen kutusu")}
      title={title}
      subtitle={subtitle}
      actions={
        onToggleUnread && unreadCount > 0 ? (
          <HubButton
            type="button"
            variant={unreadOnly ? "primary" : "default"}
            aria-pressed={unreadOnly}
            onClick={onToggleUnread}
          >
            {unreadOnly ? "Tüm sohbetler" : `Okunmamış (${unreadCount > 99 ? "99+" : unreadCount})`}
          </HubButton>
        ) : undefined
      }
    />
  );
}
