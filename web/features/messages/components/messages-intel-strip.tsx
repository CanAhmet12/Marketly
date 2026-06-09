"use client";

import type { MessageCenterPayload } from "@/features/messages/domain/types";
import type { MessageIntelSnapshot } from "@/features/messages/lib/build-message-intel";
import { cn } from "@/lib/cn";

type Props = {
  hub: Pick<MessageCenterPayload, "adaptive_line" | "fatigue_note">;
  intel: MessageIntelSnapshot;
  hydrated: boolean;
  streamLabel: string;
  unreadOnly?: boolean;
  onStatAction?: (action: "unread" | "important" | "close" | "all") => void;
};

export function MessagesIntelStrip({
  hub,
  intel,
  hydrated,
  streamLabel,
  unreadOnly = false,
  onStatAction,
}: Props) {
  const stats: {
    key: string;
    label: string;
    value: string;
    accent?: boolean;
    action?: "unread" | "important" | "close" | "all";
    active?: boolean;
  }[] = [
    {
      key: "unread",
      label: "Okunmamış",
      value: hydrated ? String(intel.unread) : "—",
      accent: intel.unread > 0,
      action: "unread",
      active: unreadOnly,
    },
    {
      key: "important",
      label: "Önemli",
      value: hydrated ? String(intel.important) : "—",
      accent: intel.important > 0,
      action: "important",
    },
    {
      key: "close",
      label: "Yakın çevre",
      value: hydrated ? String(intel.close) : "—",
      action: "close",
    },
    {
      key: "total",
      label: "Sohbet",
      value: hydrated ? String(intel.total) : "—",
      action: "all",
    },
  ];

  return (
    <section className="msg-intel-block" aria-label="Mesaj özeti">
      <div className="msg-status-row">
        <span>
          Akış · <strong>{streamLabel}</strong>
        </span>
        {hub.adaptive_line.trim() ? <span>{hub.adaptive_line}</span> : null}
        {hub.fatigue_note ? <span className="msg-status-badge">{hub.fatigue_note}</span> : null}
      </div>

      <div className="msg-intel-grid" role="list">
        {stats.map((s) => {
          const interactive = Boolean(onStatAction && s.action);
          const Tag = interactive ? "button" : "div";
          return (
            <Tag
              key={s.key}
              type={interactive ? "button" : undefined}
              role="listitem"
              className={cn("msg-intel-stat", interactive && "msg-intel-stat--action")}
              data-accent={s.accent ? "true" : undefined}
              data-active={s.active ? "true" : undefined}
              onClick={interactive ? () => onStatAction?.(s.action!) : undefined}
              aria-pressed={s.active ? true : undefined}
            >
              <span className="msg-intel-label">{s.label}</span>
              <span className="msg-intel-value">{s.value}</span>
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
