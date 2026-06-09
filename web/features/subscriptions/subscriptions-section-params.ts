export type SubscriptionsSectionId = "overview" | "discover" | "active" | "catalog";

const VALID: SubscriptionsSectionId[] = ["overview", "discover", "active", "catalog"];

export function resolveSubscriptionsSection(raw: string | null | undefined): SubscriptionsSectionId {
  if (raw && VALID.includes(raw as SubscriptionsSectionId)) {
    return raw as SubscriptionsSectionId;
  }
  return "overview";
}

export function subscriptionsSectionToParam(id: SubscriptionsSectionId): string {
  return id === "overview" ? "" : id;
}

export const SUBSCRIPTIONS_SECTION_LABELS: Record<SubscriptionsSectionId, string> = {
  overview: "Genel Bakış",
  discover: "Keşfet",
  active: "Aktif Üyelikler",
  catalog: "Tüm Katalog",
};
