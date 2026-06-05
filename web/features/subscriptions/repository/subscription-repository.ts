import type { MembershipDetailPayload, SubscriptionsHubPayload } from "../domain/types";

export type SubscriptionRepository = {
  getSubscriptionsHub(viewerId: string | null): SubscriptionsHubPayload;
  getMembershipDetail(creatorId: string, viewerId: string | null): MembershipDetailPayload | null;
};
