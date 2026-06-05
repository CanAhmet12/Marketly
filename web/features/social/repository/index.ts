import { isMockDataEnabled } from "@/mock/config";

import { MockSocialRepository } from "./mock-social-repository";
import type { SocialRepository } from "./social-repository";
import { SupabaseSocialRepository } from "./supabase-social-repository";

export type { SocialRepository } from "./social-repository";
export type {
  CloseFriend,
  Conversation,
  Message,
  NotificationItem,
  ParticipantProfile,
  SettingsBundle,
  SettingsProfileSeed,
} from "./types";

let mockSingleton: MockSocialRepository | null = null;
let supabaseSingleton: SupabaseSocialRepository | null = null;

export function getSocialRepository(): SocialRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockSocialRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseSocialRepository();
  return supabaseSingleton;
}
