import type { NotificationCenterItem, NotificationInboxStreamId } from "@/features/notifications/domain/types";
import { effectiveReadAt } from "@/features/social/hooks/use-notification-inbox";

export type NotificationIntelSnapshot = {
  total: number;
  unread: number;
  critical: number;
  starred: number;
  premium: number;
  today: number;
  confidence: string;
};

export function buildNotificationIntel(
  items: NotificationCenterItem[],
  overrides: Record<string, string>,
  confidence: string,
): NotificationIntelSnapshot {
  let unread = 0;
  let critical = 0;
  let starred = 0;
  let premium = 0;
  let today = 0;

  for (const item of items) {
    const read = Boolean(effectiveReadAt(item.row, overrides));
    if (!read) unread++;
    if (item.importance === "critical" && !read) critical++;
    if (item.starred) starred++;
    if (item.streams.includes("premium")) premium++;
    if (item.streams.includes("today")) today++;
  }

  return {
    total: items.length,
    unread,
    critical,
    starred,
    premium,
    today,
    confidence,
  };
}

export function buildStreamUnreadCounts(
  items: NotificationCenterItem[],
  overrides: Record<string, string>,
): Partial<Record<NotificationInboxStreamId, number>> {
  const counts: Partial<Record<NotificationInboxStreamId, number>> = {};
  for (const item of items) {
    if (effectiveReadAt(item.row, overrides)) continue;
    for (const s of item.streams) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return counts;
}
