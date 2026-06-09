"use client";

import { EmptyState, SkeletonList } from "@/components/states";
import { MessagesInboxRow } from "@/features/messages/components/messages-inbox-row";
import type { SmartConversationItem } from "@/features/messages/domain/types";
import type { useContainerVirtualList } from "@/hooks/use-virtual-list";

type VirtualInbox = ReturnType<typeof useContainerVirtualList>;

type Props = {
  items: SmartConversationItem[];
  activeId: string | null;
  hydrated: boolean;
  onSelect: (id: string) => void;
  inboxVirtual: VirtualInbox;
};

export function MessagesInboxList({
  items,
  activeId,
  hydrated,
  onSelect,
  inboxVirtual,
}: Props) {
  return (
    <ul ref={inboxVirtual.scrollRef as React.RefObject<HTMLUListElement>} className="msg-conv-list">
      {!hydrated && (
        <li style={{ padding: "10px 14px" }}>
          <SkeletonList count={4} />
        </li>
      )}
      {items.length === 0 && hydrated && (
        <li style={{ padding: "16px 14px" }}>
          <EmptyState title="Sonuç yok" description="Aramayı veya filtreyi değiştirin." tone="social" compact />
        </li>
      )}
      {inboxVirtual.enabled && inboxVirtual.virtualItems ? (
        <li
          className="virtual-list-spacer"
          style={{ height: inboxVirtual.totalSize, position: "relative", padding: 0, border: "none", listStyle: "none" }}
        >
          {inboxVirtual.virtualItems.map((vRow) => {
            const it = items[vRow.index]!;
            return (
              <div
                key={vRow.key}
                className="msg-conv-item"
                style={{ position: "absolute", top: vRow.start, left: 0, width: "100%" }}
              >
                <MessagesInboxRow item={it} active={activeId === it.row.id} onSelect={onSelect} />
              </div>
            );
          })}
        </li>
      ) : (
        items.map((it) => (
          <li key={it.row.id} className="msg-conv-item">
            <MessagesInboxRow item={it} active={activeId === it.row.id} onSelect={onSelect} />
          </li>
        ))
      )}
    </ul>
  );
}
