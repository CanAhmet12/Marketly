"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSocialRepository } from "@/features/social/repository";
import type { MockNotificationType } from "@/features/social/types";
import type { NotificationItem } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  markNotificationReadRemote,
  markAllNotificationsReadRemote,
} from "@/features/notifications/fetch-notifications";

const repo = () => getSocialRepository();

export function effectiveReadAt(row: NotificationItem, overrides: Record<string, string>): string | null {
  return row.read_at ?? overrides[row.id] ?? null;
}

export function useNotificationInbox(userId: string | undefined) {
  const [filter, setFilter] = useState<MockNotificationType | "all">("all");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [liveNotifs, setLiveNotifs] = useState<NotificationItem[]>([]);
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();

  useEffect(() => {
    queueMicrotask(() => {
      setOverrides(repo().getNotificationReadOverrides());
      setHydrated(true);
    });
  }, []);

  // Canlı modda Supabase'den bildirim çek
  useEffect(() => {
    if (!userId || !liveMode) return;
    fetchNotifications(getSupabaseBrowserClient(), userId).then(setLiveNotifs);
  }, [userId, liveMode]);

  const base = useMemo(
    () => (liveMode && liveNotifs.length > 0 ? liveNotifs : (userId ? repo().getNotifications(userId) : [])),
    [userId, liveMode, liveNotifs],
  );

  const rows = useMemo(() => {
    if (filter === "all") return base;
    return base.filter((r) => r.type === filter);
  }, [base, filter]);

  const unreadCount = useMemo(
    () => base.filter((r) => !effectiveReadAt(r, overrides)).length,
    [base, overrides],
  );

  const markRead = useCallback(
    (id: string) => {
      if (!userId) return;
      if (liveMode) {
        markNotificationReadRemote(getSupabaseBrowserClient(), id)
          .then(() => fetchNotifications(getSupabaseBrowserClient(), userId).then(setLiveNotifs));
      } else {
        repo().markNotificationRead(userId, id);
        setOverrides(repo().getNotificationReadOverrides());
      }
    },
    [userId, liveMode],
  );

  const markAllRead = useCallback(() => {
    if (!userId) return;
    if (liveMode) {
      markAllNotificationsReadRemote(getSupabaseBrowserClient(), userId)
        .then(() => fetchNotifications(getSupabaseBrowserClient(), userId).then(setLiveNotifs));
    } else {
      repo().markAllNotificationsRead(userId);
      setOverrides(repo().getNotificationReadOverrides());
    }
  }, [userId, liveMode]);

  return { rows, filter, setFilter, unreadCount, markRead, markAllRead, overrides, hydrated };
}
