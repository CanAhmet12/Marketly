import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type NotifType = 'price_alert' | 'like' | 'comment' | 'follow' | 'market' | 'system';

export interface AppNotification {
  id:         string;
  type:       NotifType;
  title:      string;
  body:       string;
  read:       boolean;
  created_at: string;
  meta:       Record<string, any> | null;
}

// schema.sql is_read alanını normalize eder
function normalize(row: any): AppNotification {
  return {
    id:         row.id,
    type:       row.type as NotifType,
    title:      row.title,
    body:       row.body ?? row.message ?? '',
    read:       row.read ?? row.is_read ?? false,
    created_at: row.created_at,
    meta:       row.meta ?? row.data ?? null,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading,       setLoading]       = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifs = useCallback(async () => {
    if (!user?.id) { setNotifications([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data.map(normalize));
      } else if (error) {
        console.warn('[useNotifications] fetch error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // Realtime: yeni/güncellenen/silinen bildirimler
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [normalize(payload.new), ...prev]);
      })
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev =>
          prev.map(n => n.id === payload.new.id ? normalize(payload.new) : n)
        );
      })
      .on('postgres_changes', {
        event:  'DELETE',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // schema.sql'de is_read, ADD_TABLES.sql'de read — her ikisini de güncelle
    await supabase.from('notifications')
      .update({ read: true, is_read: true })
      .eq('id', id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications')
      .update({ read: true, is_read: true })
      .eq('user_id', user.id);
  }, [user?.id]);

  const deleteNotif = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  }, []);

  return { notifications, loading, unreadCount, markRead, markAllRead, deleteNotif, refetch: fetchNotifs };
}
