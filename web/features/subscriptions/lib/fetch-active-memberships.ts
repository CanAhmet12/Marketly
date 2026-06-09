import type { SupabaseClient } from "@supabase/supabase-js";

import type { ActiveMembershipRow } from "@/features/subscriptions/domain/types";
import { mapActiveMembershipRow } from "@/features/subscriptions/lib/build-subscription-rails";

type SubRow = {
  analyst_id: string;
  tier: string | null;
  subscribed_at: string | null;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
};

/** Giriş yapmış kullanıcının analyst_subscriptions kayıtları */
export async function fetchActiveMemberships(
  client: SupabaseClient,
  viewerId: string,
): Promise<ActiveMembershipRow[]> {
  try {
    const { data: subs, error } = await client
      .from("analyst_subscriptions")
      .select("analyst_id, tier, subscribed_at")
      .eq("user_id", viewerId)
      .order("subscribed_at", { ascending: false });

    if (error || !subs?.length) {
      if (error) console.warn("[subscriptions] fetchActiveMemberships", error.message);
      return [];
    }

    const rows = subs as SubRow[];
    const ids = rows.map((s) => s.analyst_id);
    const { data: profiles } = await client
      .from("profiles")
      .select("id, username, full_name")
      .in("id", ids);

    const profileMap = new Map<string, ProfileRow>();
    for (const p of (profiles ?? []) as ProfileRow[]) {
      profileMap.set(p.id, p);
    }

    return rows.map((s) => mapActiveMembershipRow(s, profileMap.get(s.analyst_id) ?? null));
  } catch (e) {
    console.warn("[subscriptions] fetchActiveMemberships", e);
    return [];
  }
}

export type ViewerSubscriptionRow = {
  subscribed: boolean;
  tier: string | null;
  subscribed_at: string | null;
};

export async function fetchViewerSubscription(
  client: SupabaseClient,
  viewerId: string,
  creatorId: string,
): Promise<ViewerSubscriptionRow> {
  try {
    const { data, error } = await client
      .from("analyst_subscriptions")
      .select("tier, subscribed_at")
      .eq("user_id", viewerId)
      .eq("analyst_id", creatorId)
      .maybeSingle();

    if (error || !data) {
      return { subscribed: false, tier: null, subscribed_at: null };
    }

    return {
      subscribed: true,
      tier: (data as { tier: string | null }).tier,
      subscribed_at: (data as { subscribed_at: string | null }).subscribed_at,
    };
  } catch {
    return { subscribed: false, tier: null, subscribed_at: null };
  }
}
