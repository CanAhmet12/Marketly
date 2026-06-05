import { isMockDataEnabled } from "@/mock/config";

import type { NotificationsRepository } from "./notifications-repository";
import { MockNotificationsRepository } from "./mock-notifications-repository";
import { SupabaseNotificationsRepository } from "./supabase-notifications-repository";

export type { NotificationsRepository } from "./notifications-repository";

let mockSingleton: MockNotificationsRepository | null = null;
let supaSingleton: SupabaseNotificationsRepository | null = null;

export function getNotificationsRepository(): NotificationsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockNotificationsRepository();
    return mockSingleton;
  }
  supaSingleton ??= new SupabaseNotificationsRepository();
  return supaSingleton;
}
