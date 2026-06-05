import type { MessageInboxStreamId } from "@/features/messages/domain/types";
import type { NotificationInboxStreamId } from "@/features/notifications/domain/types";

const MESSAGE_STREAMS: readonly MessageInboxStreamId[] = [
  "important",
  "creators",
  "premium",
  "rooms",
  "markets",
  "discussions",
  "close",
  "all",
];

const NOTIFICATION_STREAMS: readonly NotificationInboxStreamId[] = [
  "today",
  "important",
  "portfolio",
  "following",
  "premium",
  "discussions",
  "all",
];

export function resolveMessageStream(raw: string | null): MessageInboxStreamId {
  if (!raw || raw === "all") return "all";
  if ((MESSAGE_STREAMS as readonly string[]).includes(raw)) return raw as MessageInboxStreamId;
  return "all";
}

export function resolveNotificationStream(raw: string | null): NotificationInboxStreamId {
  if (!raw) return "today";
  if ((NOTIFICATION_STREAMS as readonly string[]).includes(raw)) return raw as NotificationInboxStreamId;
  return "today";
}

export function messageStreamToParam(stream: MessageInboxStreamId): string | null {
  return stream === "all" ? null : stream;
}

export function notificationStreamToParam(stream: NotificationInboxStreamId): string | null {
  return stream === "today" ? null : stream;
}
