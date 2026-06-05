import type { NotificationCenterAction, NotificationCenterPayload } from "../domain/types";

export type NotificationsRepository = {
  getNotificationCenter(viewerId: string | null): NotificationCenterPayload;
  getInboxPreview(viewerId: string | null, limit: number): NotificationCenterPayload["items"];
  dispatchCenterAction(viewerId: string | null, action: NotificationCenterAction): void;
  isStarred(notificationId: string): boolean;
};
