"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import {
  NOTIFICATION_STREAM_LABELS,
  NOTIFICATION_STREAM_ORDER,
} from "@/features/notifications/notifications-section-params";
import type { NotificationInboxStreamId } from "@/features/notifications/domain/types";
import { cn } from "@/lib/cn";

type Props = {
  active: NotificationInboxStreamId;
  onSelect: (id: NotificationInboxStreamId) => void;
  streamCounts?: Partial<Record<NotificationInboxStreamId, number>>;
};

export function NotificationsNavRail({ active, onSelect, streamCounts = {} }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const len = NOTIFICATION_STREAM_ORDER.length;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusTab((index + 1) % len);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusTab((index - 1 + len) % len);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusTab(len - 1);
      }
    },
    [focusTab],
  );

  return (
    <nav className="ntf-nav-top" aria-label="Bildirim akışları">
      <div className="ntf-nav-segment" role="tablist">
        {NOTIFICATION_STREAM_ORDER.map((id, index) => {
          const on = active === id;
          const count = streamCounts[id] ?? 0;
          const label =
            count > 0 ? `${NOTIFICATION_STREAM_LABELS[id]} (${count})` : NOTIFICATION_STREAM_LABELS[id];
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`ntf-tab-${id}`}
              aria-selected={on}
              aria-controls="ntf-panel-main"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn("ntf-nav-tab", on && "ntf-nav-tab--active")}
              data-tone={id}
            >
              <span className="ntf-nav-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
