"use client";

import { useCallback, useMemo, useState } from "react";

import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useNotificationInbox } from "@/features/social/hooks/use-notification-inbox";
import type { NotificationCenterAction, NotificationInboxStreamId } from "@/features/notifications/domain/types";
import { getNotificationsRepository } from "@/features/notifications/repository";

export function useNotificationCenter(userId: string | undefined, stream: NotificationInboxStreamId) {
  const snap = usePersonalizationSnapshot();
  const inbox = useNotificationInbox(userId);
  const [starTick, setStarTick] = useState(0);

  const hub = useMemo(() => {
    void snap.feedbackRev;
    void snap.adaptiveRev;
    void snap.explorationRev;
    void snap.recommendRev;
    void snap.watchRev;
    void snap.intel.headline;
    void snap.intel.subline;
    void starTick;
    return getNotificationsRepository().getNotificationCenter(userId ?? null);
  }, [
    userId,
    snap.feedbackRev,
    snap.adaptiveRev,
    snap.explorationRev,
    snap.recommendRev,
    snap.watchRev,
    snap.intel,
    starTick,
  ]);

  const visibleItems = useMemo(() => {
    if (stream === "all") return hub.items;
    if (stream === "important") {
      return hub.items.filter((i) => i.streams.includes("important") || i.starred);
    }
    return hub.items.filter((i) => i.streams.includes(stream));
  }, [hub.items, stream]);

  const dispatch = useCallback(
    (action: NotificationCenterAction) => {
      getNotificationsRepository().dispatchCenterAction(userId ?? null, action);
      if (action.type === "toggle_star") setStarTick((t) => t + 1);
      if (action.type === "mute_creator" || action.type === "mute_asset" || action.type === "mute_topic" || action.type === "follow_creator") {
        setStarTick((t) => t + 1);
      }
    },
    [userId],
  );

  return {
    hub,
    visibleItems,
    dispatch,
    inbox,
  };
}
