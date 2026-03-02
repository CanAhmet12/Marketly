/**
 * useAIChat — AI sohbet geçmişi Supabase'e kayıt ve yükleme.
 *
 * Gerekli tablolar (Supabase'de bir kez çalıştır):
 * ─────────────────────────────────────────────────
 * CREATE TABLE ai_sessions (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   title      TEXT NOT NULL DEFAULT 'Yeni Sohbet',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE ai_messages (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   session_id UUID REFERENCES ai_sessions(id) ON DELETE CASCADE,
 *   user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   role       TEXT CHECK (role IN ('user', 'assistant')),
 *   content    TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "own_sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "own_messages" ON ai_messages FOR ALL USING (auth.uid() = user_id);
 */

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AISession {
  id:         string;
  title:      string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id:         string;
  session_id: string;
  role:       'user' | 'assistant';
  content:    string;
  created_at: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAIChat() {
  const { user } = useAuth();

  const [sessions,        setSessions]        = useState<AISession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [tablesExist,     setTablesExist]     = useState<boolean | null>(null);

  // ── Tablo varlığını test et ───────────────────────────────────────────────
  const checkTables = useCallback(async (): Promise<boolean> => {
    if (tablesExist !== null) return tablesExist;
    try {
      const { error } = await supabase
        .from('ai_sessions')
        .select('id')
        .limit(1);
      const exists = !error || error.code !== '42P01'; // 42P01 = table not found
      setTablesExist(exists);
      return exists;
    } catch {
      setTablesExist(false);
      return false;
    }
  }, [tablesExist]);

  // ── Oturumları listele ────────────────────────────────────────────────────
  const loadSessions = useCallback(async (): Promise<AISession[]> => {
    if (!user?.id) return [];
    const ok = await checkTables();
    if (!ok) return [];

    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('ai_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setSessions(data);
        return data;
      }
    } catch {}
    finally { setLoadingSessions(false); }
    return [];
  }, [user?.id, checkTables]);

  // ── Bir oturumun mesajlarını yükle ────────────────────────────────────────
  const loadMessages = useCallback(async (sessionId: string): Promise<AIMessage[]> => {
    const ok = await checkTables();
    if (!ok) return [];

    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data) return data as AIMessage[];
    } catch {}
    return [];
  }, [checkTables]);

  // ── Mevcut en son oturumu al ya da yeni oturum oluştur ───────────────────
  const getOrCreateSession = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;
    const ok = await checkTables();
    if (!ok) return null;

    try {
      const { data: existing } = await supabase
        .from('ai_sessions')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) return existing.id;

      // Henüz oturum yok → oluştur
      const { data: created, error } = await supabase
        .from('ai_sessions')
        .insert({ user_id: user.id, title: 'Yeni Sohbet' })
        .select('id')
        .single();

      if (!error && created) return created.id;
    } catch {}
    return null;
  }, [user?.id, checkTables]);

  // ── Yeni oturum oluştur ───────────────────────────────────────────────────
  const createNewSession = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;
    const ok = await checkTables();
    if (!ok) return null;

    try {
      const { data, error } = await supabase
        .from('ai_sessions')
        .insert({ user_id: user.id, title: 'Yeni Sohbet' })
        .select('id')
        .single();

      if (!error && data) return data.id;
    } catch {}
    return null;
  }, [user?.id, checkTables]);

  // ── Mesaj kaydet ──────────────────────────────────────────────────────────
  const saveMessage = useCallback(async (
    sessionId:       string,
    role:            'user' | 'assistant',
    content:         string,
    isFirstUserMsg?: boolean,
  ) => {
    if (!user?.id) return;
    const ok = await checkTables();
    if (!ok) return;

    try {
      await supabase.from('ai_messages').insert({
        session_id: sessionId,
        user_id:    user.id,
        role,
        content,
      });

      const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
      if (isFirstUserMsg) updateData.title = content.slice(0, 60);

      await supabase
        .from('ai_sessions')
        .update(updateData)
        .eq('id', sessionId);
    } catch {}
  }, [user?.id, checkTables]);

  // ── Oturumu sil ───────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await supabase.from('ai_sessions').delete().eq('id', sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch {}
  }, []);

  return {
    sessions,
    loadingSessions,
    tablesExist,
    loadSessions,
    loadMessages,
    getOrCreateSession,
    createNewSession,
    saveMessage,
    deleteSession,
  };
}
