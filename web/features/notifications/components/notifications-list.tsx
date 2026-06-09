import { useMemo } from "react";

import { formatNotificationGroupLabel } from "@/features/notifications/domain/notification-priority";
import type { NotificationCenterAction, NotificationCenterItem } from "@/features/notifications/domain/types";
import { NotificationRow } from "@/features/notifications/components/notification-row";

function partitionBatches(items: NotificationCenterItem[]) {
  type Block =
    | { kind: "batch"; key: string; items: NotificationCenterItem[] }
    | { kind: "single"; item: NotificationCenterItem };
  const out: Block[] = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i]!;
    const bk = it.batch_key;
    if (bk) {
      const group = [it];
      let j = i + 1;
      while (j < items.length && items[j]!.batch_key === bk) {
        group.push(items[j]!);
        j++;
      }
      if (group.length > 1) out.push({ kind: "batch", key: bk, items: group });
      else out.push({ kind: "single", item: it });
      i = j;
    } else {
      out.push({ kind: "single", item: it });
      i++;
    }
  }
  return out;
}

type Props = {
  items: NotificationCenterItem[];
  overrides: Record<string, string>;
  markRead: (id: string) => void;
  dispatch: (a: NotificationCenterAction) => void;
};

export function NotificationsList({ items, overrides, markRead, dispatch }: Props) {
  const blocks = useMemo(() => partitionBatches(items), [items]);

  return (
    <div className="ntf-feed">
      {blocks.map((b, bi) =>
        b.kind === "batch" ? (
          <section key={`batch-${b.key}-${bi}`} className="ntf-batch-block">
            <h2 className="ntf-batch-head">{formatNotificationGroupLabel(b.items)}</h2>
            <ul className="ntf-feed-list">
              {b.items.map((it) => (
                <NotificationRow key={it.id} item={it} overrides={overrides} markRead={markRead} dispatch={dispatch} />
              ))}
            </ul>
          </section>
        ) : (
          <ul key={b.item.id} className="ntf-feed-list">
            <NotificationRow item={b.item} overrides={overrides} markRead={markRead} dispatch={dispatch} />
          </ul>
        ),
      )}
    </div>
  );
}
