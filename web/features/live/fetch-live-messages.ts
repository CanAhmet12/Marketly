import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockDataEnabled } from "@/mock/config";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

export type LiveChatMessage = {
  id: string;
  post_id: string;
  user_id: string | null;
  username: string;
  content: string;
  is_gift: boolean;
  gift_icon: string | null;
  gift_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

const MOCK_CHAT: LiveChatMessage[] = [
  {
    id: "lc-1",
    post_id: "",
    user_id: null,
    username: "Ayşe Kaya",
    content: "XU100 direnç testinde, hacim takipteyim.",
    is_gift: false,
    gift_icon: null,
    gift_name: null,
    avatar_url: null,
    created_at: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    id: "lc-2",
    post_id: "",
    user_id: null,
    username: "Kerem",
    content: "Stop seviyesi net mi?",
    is_gift: false,
    gift_icon: null,
    gift_name: null,
    avatar_url: null,
    created_at: new Date(Date.now() - 90_000).toISOString(),
  },
  {
    id: "lc-3",
    post_id: "",
    user_id: null,
    username: "Moderatör",
    content: "Kurallar: spam yok, sinyal dışı reklam yok.",
    is_gift: false,
    gift_icon: null,
    gift_name: null,
    avatar_url: null,
    created_at: new Date(Date.now() - 60_000).toISOString(),
  },
];

export async function fetchLiveMessages(
  client: SupabaseClient | null,
  postId: string,
): Promise<LiveChatMessage[]> {
  if (isMockDataEnabled()) {
    return MOCK_CHAT.map((m) => ({ ...m, post_id: postId }));
  }
  if (!client) return [];
  const { data, error } = await client
    .from("live_messages")
    .select("id, post_id, user_id, username, content, is_gift, gift_icon, gift_name, avatar_url, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(120);
  if (error) {
    console.warn("[live] fetchLiveMessages", error.message);
    return [];
  }
  return (data ?? []) as LiveChatMessage[];
}

export async function sendLiveMessage(
  client: SupabaseClient | null,
  args: {
    postId: string;
    userId: string;
    username: string;
    avatarUrl: string | null;
    content: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  if (isMockDataEnabled()) {
    return { ok: true };
  }
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  if (!client) return { ok: false, error: "Supabase yapılandırılmadı" };
  const { error } = await client.from("live_messages").insert({
    post_id: args.postId,
    user_id: args.userId,
    username: args.username,
    avatar_url: args.avatarUrl,
    content: args.content.trim(),
    is_gift: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function incrementLiveViewers(client: SupabaseClient | null, postId: string): Promise<void> {
  if (isMockDataEnabled() || !client) return;
  if (!isWebWriteEnabled()) return;
  try {
    await client.rpc("increment_viewers", { session_post_id: postId });
  } catch {
    /* yok */
  }
}
