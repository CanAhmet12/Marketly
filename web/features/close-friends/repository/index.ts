import { isMockDataEnabled } from "@/mock/config";

import type { CloseFriendsRepository } from "./close-friends-repository";
import { MockCloseFriendsRepository } from "./mock-close-friends-repository";
import { SupabaseCloseFriendsRepository } from "./supabase-close-friends-repository";

export type { CloseFriendsRepository } from "./close-friends-repository";
export type {
  CloseFriendsHubPayload,
  ComposerCircleAudienceOption,
  PrivateCircleDetailPayload,
  PrivateCircleSummary,
  PrivateFeedItem,
  TrustedMemberCard,
} from "../domain/types";

let mockSingleton: MockCloseFriendsRepository | null = null;
let supabaseSingleton: SupabaseCloseFriendsRepository | null = null;

export function getCloseFriendsRepository(): CloseFriendsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockCloseFriendsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseCloseFriendsRepository();
  return supabaseSingleton;
}
