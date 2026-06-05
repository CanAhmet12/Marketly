import { isMockDataEnabled } from "@/mock/config";

import type { SubscriptionRepository } from "./subscription-repository";
import { MockSubscriptionRepository } from "./mock-subscription-repository";
import { SupabaseSubscriptionRepository } from "./supabase-subscription-repository";

export type { SubscriptionRepository } from "./subscription-repository";
export type {
  ActiveMembershipRow,
  CreatorEconomyIntel,
  MembershipDetailPayload,
  MembershipDiscoveryCard,
  MembershipDiscoveryRails,
  MembershipTierDefinition,
  MembershipTierKey,
  SubscriptionsHubPayload,
} from "../domain/types";

let mockSingleton: MockSubscriptionRepository | null = null;
let supabaseSingleton: SupabaseSubscriptionRepository | null = null;

export function getSubscriptionRepository(): SubscriptionRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockSubscriptionRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseSubscriptionRepository();
  return supabaseSingleton;
}
