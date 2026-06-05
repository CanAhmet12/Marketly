import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Message } from "@/features/social/repository";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

/** dm_conversations + profiles JOIN → Conversation[] */
export async function fetchConversations(
  client: SupabaseClient,
  userId: string,
): Promise<Conversation[]> {
  const { data, error } = await client
    .from("dm_conversations")
    .select(`
      id,
      user1_id,
      user2_id,
      last_message,
      last_message_at,
      unread_count_1,
      unread_count_2,
      created_at
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) return [];

  // Karşı taraf profilleri çek
  const peerIds = data.map((c: any) => c.user1_id === userId ? c.user2_id : c.user1_id);
  const uniquePeerIds = [...new Set(peerIds)];
  const { data: profiles } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url, verified")
    .in("id", uniquePeerIds);

  const profileMap: Record<string, any> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p;

  return data.map((c: any): Conversation => {
    const peerId = c.user1_id === userId ? c.user2_id : c.user1_id;
    const peer = profileMap[peerId];
    const unread = c.user1_id === userId ? (c.unread_count_1 ?? 0) : (c.unread_count_2 ?? 0);
    return {
      id:                    String(c.id),
      is_group:              false,
      title:                 peer?.full_name ?? peer?.username ?? "Kullanıcı",
      subtitle:              c.last_message ?? null,
      avatar_url:            peer?.avatar_url ?? null,
      participant_ids:       [userId, peerId],
      online_participant_ids:[],
      unread_count:          unread,
      updated_at:            c.last_message_at ?? c.created_at,
      last_message: c.last_message
        ? { id: "", sender_id: "", content: c.last_message, created_at: c.last_message_at ?? c.created_at, read_at: null }
        : undefined,
    } as unknown as Conversation;
  });
}

/** dm_messages → Message[] */
export async function fetchMessages(
  client: SupabaseClient,
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await client
    .from("dm_messages")
    .select("id, conversation_id, sender_id, content, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  return data.map((m: any): Message => ({
    id:              String(m.id),
    conversation_id: String(m.conversation_id),
    sender_id:       String(m.sender_id),
    content:         m.content ?? "",
    created_at:      m.created_at ?? new Date().toISOString(),
    read_at:         m.read_at ?? null,
  }));
}

/** dm_messages INSERT */
export async function sendMessageRemote(
  client: SupabaseClient,
  userId: string,
  conversationId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  // WG-003: write-gate — salt-okuma fazında dm_messages INSERT bloke
  if (!isWebWriteEnabled()) {
    return { ok: false, error: WEB_WRITE_BLOCKED_MESSAGE };
  }
  const { error } = await client.from("dm_messages").insert({
    conversation_id: conversationId,
    sender_id:       userId,
    content:         content.trim(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
