import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSocialRepository } from "@/features/social/repository";

import {
  recordNotificationDismissed,
  recordNotificationRead,
} from "@/features/notifications/domain/notification-action-store";

import type { NotificationCenterAction, NotificationCenterPayload } from "../domain/types";
import type { NotificationsRepository } from "./notifications-repository";
import { assembleNotificationCenter } from "./assemble-notification-center";

const LS_STAR = "marketly-inbox-star-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* */
  }
}

function readStarMap(): Record<string, boolean> {
  const o = readJson<unknown>(LS_STAR, {});
  return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, boolean>) : {};
}

/** Canlı: sosyal bildirim RPC bağlanana kadar seyrek yük; zekâ katmanı repo üzerinden gelir */
export class SupabaseNotificationsRepository implements NotificationsRepository {
  isStarred(notificationId: string): boolean {
    return Boolean(readStarMap()[notificationId]);
  }

  getNotificationCenter(viewerId: string | null): NotificationCenterPayload {
    const rows = viewerId ? getSocialRepository().getNotifications(viewerId) : [];
    return assembleNotificationCenter({
      viewerId,
      rows,
      isStarred: (id) => this.isStarred(id),
    });
  }

  getInboxPreview(viewerId: string | null, limit: number): NotificationCenterPayload["items"] {
    return this.getNotificationCenter(viewerId).items.slice(0, Math.max(1, limit));
  }

  dispatchCenterAction(viewerId: string | null, action: NotificationCenterAction): void {
    const social = getSocialRepository();
    const p = getPersonalizationRepository();
    switch (action.type) {
      case "mark_read": {
        if (viewerId) {
          const row = social.getNotifications(viewerId).find((n) => n.id === action.notificationId);
          if (row) recordNotificationRead(row.type);
          social.markNotificationRead(viewerId, action.notificationId);
        }
        break;
      }
      case "toggle_star": {
        const m = { ...readStarMap() };
        m[action.notificationId] = !m[action.notificationId];
        if (!m[action.notificationId]) delete m[action.notificationId];
        writeJson(LS_STAR, m);
        break;
      }
      case "mute_creator":
        recordNotificationDismissed("follow");
        p.applyFeedFeedback({ type: "mute_creator", creatorId: action.creatorId });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("marketly-personalization-updated"));
        break;
      case "mute_asset":
        p.applyFeedFeedback({ type: "mute_asset", symbol: action.symbol });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("marketly-personalization-updated"));
        break;
      case "mute_topic":
        p.applyFeedFeedback({ type: "not_interested_topic", token: action.token });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("marketly-personalization-updated"));
        break;
      case "follow_creator":
        p.applyExplorationFeedback({ type: "interested_exploration_creator", creatorId: action.creatorId });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("marketly-personalization-updated"));
        break;
      default:
        break;
    }
  }
}
