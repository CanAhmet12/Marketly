/**
 * useMessages — Kullanıcılar arası doğrudan mesajlaşma (DM) sistemi.
 *
 * Gerekli tablolar (Supabase'de bir kez çalıştır):
 * ─────────────────────────────────────────────────
 * CREATE TABLE dm_conversations (
 *   id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user1_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   user2_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   last_message     TEXT,
 *   last_message_at  TIMESTAMPTZ DEFAULT NOW(),
 *   unread_count_1   INT DEFAULT 0,  -- user1 için okunmamış
 *   unread_count_2   INT DEFAULT 0,  -- user2 için okunmamış
 *   created_at  TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE (user1_id, user2_id)
 * );
 *
 * CREATE TABLE dm_messages (
 *   id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE,
 *   sender_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   content         TEXT NOT NULL,
 *   image_url       TEXT,
 *   is_read         BOOLEAN DEFAULT FALSE,
 *   created_at      TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE dm_conversations ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE dm_messages      ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "party_access_conv" ON dm_conversations
 *   FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);
 *
 * CREATE POLICY "party_access_msg" ON dm_messages
 *   FOR ALL USING (
 *     conversation_id IN (
 *       SELECT id FROM dm_conversations
 *       WHERE user1_id = auth.uid() OR user2_id = auth.uid()
 *     )
 *   );
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DMConversation {
  id:               string;
  user1_id:         string;
  user2_id:         string;
  last_message:     string | null;
  last_message_at:  string;
  unread_count_1:   number;
  unread_count_2:   number;
  created_at:       string;
  // joined
  other_user?: {
    id:         string;
    username:   string;
    full_name:  string | null;
    avatar_url: string | null;
    verified:   boolean;
  };
}

export interface DMMessage {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  content:         string;
  image_url:       string | null;
  is_read:         boolean;
  created_at:      string;
}

// ─── Conversation list hook ───────────────────────────────────────────────────
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [tablesExist,   setTablesExist]   = useState<boolean | null>(null);

  const checkTables = useCallback(async (): Promise<boolean> => {
    if (tablesExist !== null) return tablesExist;
    try {
      const { error } = await supabase.from('dm_conversations').select('id').limit(1);
      const ok = !error || error.code !== '42P01';
      setTablesExist(ok);
      return ok;
    } catch {
      setTablesExist(false);
      return false;
    }
  }, [tablesExist]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    const ok = await checkTables();
    if (!ok) { setLoading(false); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dm_conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error || !data) { setLoading(false); return; }

      // Her konuşma için karşı tarafın profilini al
      const otherIds = data.map(c => c.user1_id === user.id ? c.user2_id : c.user1_id);
      const uniqueIds = [...new Set(otherIds)];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, verified')
        .in('id', uniqueIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

      const enriched: DMConversation[] = data.map(c => ({
        ...c,
        other_user: profileMap.get(c.user1_id === user.id ? c.user2_id : c.user1_id),
      }));

      setConversations(enriched);
    } catch {}
    finally { setLoading(false); }
  }, [user?.id, checkTables]);

  // Realtime aboneliği
  useEffect(() => {
    if (!user?.id) return;
    loadConversations();

    const channel = supabase
      .channel('dm_convs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dm_conversations',
        filter: `user1_id=eq.${user.id}`,
      }, () => loadConversations())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dm_conversations',
        filter: `user2_id=eq.${user.id}`,
      }, () => loadConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Yeni konuşma başlat ya da mevcut olanı getir
  const getOrCreateConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user?.id) return null;
    const ok = await checkTables();
    if (!ok) return null;

    const u1 = user.id < otherUserId ? user.id      : otherUserId;
    const u2 = user.id < otherUserId ? otherUserId  : user.id;

    try {
      const { data: existing } = await supabase
        .from('dm_conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .maybeSingle();

      if (existing) return existing.id;

      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({ user1_id: u1, user2_id: u2 })
        .select('id')
        .single();

      if (!error && created) return created.id;
    } catch {}
    return null;
  }, [user?.id, checkTables]);

  // Toplam okunmamış mesaj sayısı
  const totalUnread = conversations.reduce((sum, c) => {
    const isUser1 = c.user1_id === user?.id;
    return sum + (isUser1 ? c.unread_count_1 : c.unread_count_2);
  }, 0);

  return {
    conversations,
    loading,
    tablesExist,
    totalUnread,
    loadConversations,
    getOrCreateConversation,
  };
}

// ─── Single conversation messages hook ───────────────────────────────────────
export function useDirectMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState<DMMessage[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [sending,  setSending]    = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data as DMMessage[]);
    } catch {}
    finally { setLoading(false); }
  }, [conversationId]);

  // Mesajları okundu işaretle
  const markRead = useCallback(async () => {
    if (!conversationId || !user?.id) return;
    try {
      // Mesajları okundu yap
      await supabase
        .from('dm_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      // Konuşmadaki unread sayacını sıfırla
      const { data: conv } = await supabase
        .from('dm_conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (conv) {
        const field = conv.user1_id === user.id ? 'unread_count_1' : 'unread_count_2';
        await supabase
          .from('dm_conversations')
          .update({ [field]: 0 })
          .eq('id', conversationId);
      }
    } catch {}
  }, [conversationId, user?.id]);

  // Mesaj gönder
  const sendMessage = useCallback(async (content: string, imageUrl?: string): Promise<boolean> => {
    if (!conversationId || !user?.id || !content.trim()) return false;

    setSending(true);
    const tempId = `temp_${Date.now()}`;
    const tempMsg: DMMessage = {
      id:              tempId,
      conversation_id: conversationId,
      sender_id:       user.id,
      content:         content.trim(),
      image_url:       imageUrl ?? null,
      is_read:         false,
      created_at:      new Date().toISOString(),
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMsg]);

    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .insert({
          conversation_id: conversationId,
          sender_id:       user.id,
          content:         content.trim(),
          image_url:       imageUrl ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic msg'yi gerçek DB satırıyla değiştir
      setMessages(prev => prev.map(m => m.id === tempId ? (data as DMMessage) : m));

      // Konuşmanın son mesajını güncelle
      await supabase.from('dm_conversations').update({
        last_message:    content.trim().slice(0, 100),
        last_message_at: new Date().toISOString(),
      }).eq('id', conversationId);

      return true;
    } catch {
      // Optimistic msg'yi geri al
      setMessages(prev => prev.filter(m => m.id !== tempId));
      return false;
    } finally {
      setSending(false);
    }
  }, [conversationId, user?.id]);

  // Realtime abonelik
  useEffect(() => {
    if (!conversationId) return;
    loadMessages();
    markRead();

    channelRef.current = supabase
      .channel(`dm_msgs_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as DMMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Karşı taraftan geliyorsa okundu işaretle
        if (newMsg.sender_id !== user?.id) markRead();
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversationId]);

  return { messages, loading, sending, sendMessage, markRead };
}
