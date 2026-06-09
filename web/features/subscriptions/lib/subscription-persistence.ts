import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

export type SubscriptionActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Üreticiye abone ol (analyst_subscriptions) */
export async function subscribeToCreator(
  userId: string,
  creatorId: string,
  analystName: string,
  tier = "premium",
): Promise<SubscriptionActionResult> {
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }

  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("analyst_subscriptions").upsert(
      {
        user_id: userId,
        analyst_id: creatorId,
        analyst_name: analystName,
        tier,
      },
      { onConflict: "user_id,analyst_id" },
    );

    if (error) {
      console.warn("[subscriptions] subscribeToCreator", error.message);
      return { ok: false, error: "Abonelik kaydedilemedi. Lütfen tekrar dene." };
    }

    try {
      await client.rpc("increment_subscriber_count", { profile_id: creatorId });
    } catch {
      /* RPC yoksa sessiz geç — abonelik kaydı yeterli */
    }

    return { ok: true };
  } catch (e) {
    console.warn("[subscriptions] subscribeToCreator", e);
    return { ok: false, error: "Bağlantı hatası. Tekrar dene." };
  }
}

/** Aboneliği iptal et */
export async function unsubscribeFromCreator(
  userId: string,
  creatorId: string,
): Promise<SubscriptionActionResult> {
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }

  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client
      .from("analyst_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("analyst_id", creatorId);

    if (error) {
      console.warn("[subscriptions] unsubscribeFromCreator", error.message);
      return { ok: false, error: "Abonelik iptal edilemedi." };
    }

    return { ok: true };
  } catch (e) {
    console.warn("[subscriptions] unsubscribeFromCreator", e);
    return { ok: false, error: "Bağlantı hatası. Tekrar dene." };
  }
}

export function isSubscriptionWriteEnabled(): boolean {
  return isWebWriteEnabled();
}
