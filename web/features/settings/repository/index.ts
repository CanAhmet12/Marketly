import { isMockDataEnabled } from "@/mock/config";

import type { SettingsRepository } from "./settings-repository";
import { MockSettingsRepository } from "./mock-settings-repository";
import { SupabaseSettingsRepository } from "./supabase-settings-repository";

export type { SettingsRepository } from "./settings-repository";
export type { AccountControlHubPayload } from "../domain/types";

let mockSingleton: MockSettingsRepository | null = null;
let supabaseSingleton: SupabaseSettingsRepository | null = null;

export function getSettingsRepository(): SettingsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockSettingsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseSettingsRepository();
  return supabaseSingleton;
}
