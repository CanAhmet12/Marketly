import Link from "next/link";

import { recordNotificationOpened } from "@/features/notifications/domain/notification-action-store";
import type { NotificationCenterAction, NotificationCenterItem } from "@/features/notifications/domain/types";

type Props = {
  item: NotificationCenterItem;
  markRead: (id: string) => void;
  dispatch: (a: NotificationCenterAction) => void;
};

export function NotificationRowActions({ item, markRead, dispatch }: Props) {
  const n = item.row;

  return (
    <div className="ntf-row-actions">
      {item.actions.map((a) => {
        if (a.kind === "open_primary" && a.href) {
          return (
            <Link
              key={a.id}
              href={a.href}
              onClick={() => {
                recordNotificationOpened(n.type);
                markRead(n.id);
              }}
              className="ntf-action-link ntf-action-link--primary"
            >
              {a.label}
            </Link>
          );
        }
        if (a.kind === "open_secondary" && a.href) {
          return (
            <Link key={a.id} href={a.href} onClick={() => markRead(n.id)} className="ntf-action-link">
              {a.label}
            </Link>
          );
        }
        if (a.kind === "join_room" && a.href) {
          return (
            <Link key={a.id} href={a.href} onClick={() => markRead(n.id)} className="ntf-action-link ntf-action-link--accent">
              {a.label}
            </Link>
          );
        }
        if (a.kind === "mark_read") {
          return (
            <button key={a.id} type="button" className="ntf-action-link" onClick={() => markRead(n.id)}>
              {a.label}
            </button>
          );
        }
        if (a.kind === "toggle_star") {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => dispatch({ type: "toggle_star", notificationId: n.id })}
            >
              {a.label}
            </button>
          );
        }
        if (a.kind === "mute_creator" && a.payload?.creatorId) {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => dispatch({ type: "mute_creator", creatorId: a.payload!.creatorId! })}
            >
              {a.label}
            </button>
          );
        }
        if (a.kind === "mute_asset" && a.payload?.symbol) {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => dispatch({ type: "mute_asset", symbol: a.payload!.symbol! })}
            >
              {a.label}
            </button>
          );
        }
        if (a.kind === "mute_topic" && a.payload?.token) {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => dispatch({ type: "mute_topic", token: a.payload!.token! })}
            >
              {a.label}
            </button>
          );
        }
        if (a.kind === "follow_creator" && a.payload?.creatorId) {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => dispatch({ type: "follow_creator", creatorId: a.payload!.creatorId! })}
            >
              {a.label}
            </button>
          );
        }
        if (a.kind === "copy_signal" && a.payload?.text) {
          return (
            <button
              key={a.id}
              type="button"
              className="ntf-action-link"
              onClick={() => void navigator.clipboard?.writeText(a.payload!.text!)}
            >
              {a.label}
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}
