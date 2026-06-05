import type { Message } from "@/features/social/repository/types";

import { formatMessageDayLabel, isSameCalendarDay } from "@/features/social/lib/social-format";

export type ThreadVirtualDayItem = {
  kind: "day";
  id: string;
  label: string;
};

export type ThreadVirtualBubbleItem = {
  kind: "bubble";
  id: string;
  message: Message;
  mine: boolean;
  clusterStart: boolean;
};

export type ThreadVirtualItem = ThreadVirtualDayItem | ThreadVirtualBubbleItem;

export function buildThreadVirtualItems(messages: Message[], selfId: string): ThreadVirtualItem[] {
  const items: ThreadVirtualItem[] = [];

  messages.forEach((m, idx) => {
    const prev = messages[idx - 1];
    const showDay = !prev || !isSameCalendarDay(prev.created_at, m.created_at);
    if (showDay) {
      items.push({
        kind: "day",
        id: `day-${m.created_at.slice(0, 10)}-${idx}`,
        label: formatMessageDayLabel(m.created_at),
      });
    }
    items.push({
      kind: "bubble",
      id: m.id,
      message: m,
      mine: m.sender_id === selfId,
      clusterStart: !prev || prev.sender_id !== m.sender_id || showDay,
    });
  });

  return items;
}
