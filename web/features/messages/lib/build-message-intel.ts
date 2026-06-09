import type { MessageInboxStreamId, SmartConversationItem } from "@/features/messages/domain/types";

export type MessageIntelSnapshot = {
  total: number;
  unread: number;
  important: number;
  close: number;
  premium: number;
};

export function buildMessageIntel(items: SmartConversationItem[]): MessageIntelSnapshot {
  let unread = 0;
  let important = 0;
  let close = 0;
  let premium = 0;

  for (const item of items) {
    const count = item.row.unread_count;
    if (count > 0) {
      unread += count;
      if (item.streams.includes("important")) important += count;
      if (item.streams.includes("close")) close += count;
      if (item.streams.includes("premium")) premium += count;
    }
  }

  return { total: items.length, unread, important, close, premium };
}

export function buildStreamUnreadCounts(
  items: SmartConversationItem[],
): Partial<Record<MessageInboxStreamId, number>> {
  const counts: Partial<Record<MessageInboxStreamId, number>> = {};
  for (const item of items) {
    if (item.row.unread_count <= 0) continue;
    for (const s of item.streams) {
      counts[s] = (counts[s] ?? 0) + item.row.unread_count;
    }
  }
  return counts;
}
