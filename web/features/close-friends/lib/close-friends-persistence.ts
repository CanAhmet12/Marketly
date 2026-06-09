import { getSocialRepository } from "@/features/social/repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

export type CloseFriendActionResult = { ok: true } | { ok: false; error: string };

export function isCloseFriendsWriteEnabled(): boolean {
  return isWebWriteEnabled();
}

function mockMutateCloseFriends(userId: string, mutate: (ids: string[]) => string[]): CloseFriendActionResult {
  try {
    const social = getSocialRepository();
    const current = social.getCloseFriends(userId).map((f) => f.id);
    social.updateCloseFriends(userId, mutate(current));
    return { ok: true };
  } catch {
    return { ok: false, error: "Demo kaydı güncellenemedi." };
  }
}

export async function addCloseFriendMock(userId: string, friendId: string): Promise<CloseFriendActionResult> {
  if (userId === friendId) return { ok: false, error: "Kendini ekleyemezsin." };
  return mockMutateCloseFriends(userId, (ids) => (ids.includes(friendId) ? ids : [...ids, friendId]));
}

export async function removeCloseFriendMock(userId: string, friendId: string): Promise<CloseFriendActionResult> {
  return mockMutateCloseFriends(userId, (ids) => ids.filter((id) => id !== friendId));
}

export async function addCloseFriend(userId: string, friendId: string): Promise<CloseFriendActionResult> {
  if (!isWebWriteEnabled()) return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  if (userId === friendId) return { ok: false, error: "Kendini ekleyemezsin." };

  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("close_friends").upsert(
      { user_id: userId, friend_id: friendId },
      { onConflict: "user_id,friend_id" },
    );
    if (error) {
      console.warn("[close-friends] addCloseFriend", error.message);
      return { ok: false, error: "Yakın arkadaş eklenemedi." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[close-friends] addCloseFriend", e);
    return { ok: false, error: "Bağlantı hatası." };
  }
}

export async function removeCloseFriend(userId: string, friendId: string): Promise<CloseFriendActionResult> {
  if (!isWebWriteEnabled()) return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };

  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("close_friends").delete().eq("user_id", userId).eq("friend_id", friendId);
    if (error) {
      console.warn("[close-friends] removeCloseFriend", error.message);
      return { ok: false, error: "Yakın arkadaş kaldırılamadı." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[close-friends] removeCloseFriend", e);
    return { ok: false, error: "Bağlantı hatası." };
  }
}
