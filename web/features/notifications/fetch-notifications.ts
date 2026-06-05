import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationItem } from "@/features/social/repository";

/** `notifications` tablosundan kullanıcının bildirimlerini çeker.
 *  BE-REP-001: sender_id → profiles ikinci sorgu ile actor_avatar_url doldurulur.
 */
export async function fetchNotifications(
  client: SupabaseClient,
  userId: string,
): Promise<NotificationItem[]> {
  const { data, error } = await client
    .from("notifications")
    .select("id, user_id, type, title, body, read, read_at, created_at, sender_id, data, meta")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  // BE-REP-001: sender_id'leri topla → profiles ikinci sorgu
  const senderIds = [
    ...new Set(
      data
        .map((row: any) => row.sender_id)
        .filter((id: unknown): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  type ProfileRow = { id: string; username: string | null; full_name: string | null; avatar_url: string | null; verified: boolean };
  const profileMap = new Map<string, ProfileRow>();

  if (senderIds.length > 0) {
    const { data: profiles } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified")
      .in("id", senderIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p as ProfileRow);
    }
  }

  return data.map((row: any): NotificationItem => {
    const profile = profileMap.get(row.sender_id ?? "") ?? null;
    return {
      id:              String(row.id),
      user_id:         String(row.user_id),
      actor_id:        row.sender_id ?? row.user_id,
      type:            row.type ?? "system",
      entity_type:     (row.data as any)?.entity_type ?? null,
      entity_id:       (row.data as any)?.entity_id ?? null,
      title:           row.title ?? "",
      body:            row.body ?? "",
      read_at:         row.read_at ?? (row.read ? new Date().toISOString() : null),
      created_at:      row.created_at ?? new Date().toISOString(),
      actor_display:   profile?.full_name ?? profile?.username ?? row.title ?? "Bildirim",
      actor_avatar_url: profile?.avatar_url ?? null,
      actor_verified:  profile?.verified ?? false,
      action_href:     null,
    } as unknown as NotificationItem;
  });
}

export async function markNotificationReadRemote(
  client: SupabaseClient,
  notificationId: string,
): Promise<void> {
  await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
}

export async function markAllNotificationsReadRemote(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}
