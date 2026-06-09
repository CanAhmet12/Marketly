import type { NotificationInboxStreamId } from "@/features/notifications/domain/types";
export {
  notificationStreamToParam,
  resolveNotificationStream,
} from "@/features/social/lib/inbox-stream-params";

export const NOTIFICATION_STREAM_ORDER: NotificationInboxStreamId[] = [
  "today",
  "important",
  "portfolio",
  "following",
  "premium",
  "discussions",
  "all",
];

export const NOTIFICATION_STREAM_LABELS: Record<NotificationInboxStreamId, string> = {
  today: "Bugün",
  important: "Önemli",
  portfolio: "Portföyün",
  following: "Takip",
  premium: "Premium",
  discussions: "Tartışmalar",
  all: "Tümü",
};
