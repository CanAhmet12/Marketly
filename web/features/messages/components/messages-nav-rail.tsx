"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

import type { MessageInboxStreamId } from "@/features/messages/domain/types";
import {
  MESSAGE_STREAM_LABELS,
  MESSAGE_STREAM_ORDER,
} from "@/features/messages/messages-section-params";
import { cn } from "@/lib/cn";

type Props = {
  active: MessageInboxStreamId;
  onSelect: (id: MessageInboxStreamId) => void;
  counts?: Partial<Record<MessageInboxStreamId, number>>;
};

export function MessagesNavRail({ active, onSelect, counts = {} }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const len = MESSAGE_STREAM_ORDER.length;
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
    <nav className="msg-nav-top" aria-label="Gelen kutusu akışları">
      <div className="msg-nav-segment" role="tablist">
        {MESSAGE_STREAM_ORDER.map((id, index) => {
          const on = active === id;
          const unread = counts[id] ?? 0;
          const base = MESSAGE_STREAM_LABELS[id];
          const label = unread > 0 ? `${base} (${unread})` : base;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`msg-tab-${id}`}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn("msg-nav-tab", on && "msg-nav-tab--active")}
              data-tone={id}
            >
              <span className="msg-nav-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
