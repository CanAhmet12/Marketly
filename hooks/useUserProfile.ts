/**
 * useUserProfile — Belirli bir kullanıcının profilini Supabase'den çeker.
 * Kendi profilin için useAuth().profile kullan.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { avatarUrl } from '../lib/avatarUrl';

export interface UserProfile {
  id:              string;
  username:        string;
  full_name:       string | null;
  avatar_url:      string | null;
  bio:             string | null;
  tier:            string;
  verified:        boolean;
  follower_count:  number;
  following_count: number;
  signal_accuracy: number;
  streak_days:     number;
  created_at:      string;
  // Computed
  displayName: string;
  handle:      string;
  avatarUri:   string;
}

export function useUserProfile(userId: string | null | undefined) {
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setProfile({
        ...data,
        displayName: data.full_name || data.username,
        handle:      `@${data.username}`,
        avatarUri:   data.avatar_url || avatarUrl(userId, data.full_name ?? data.username),
      });
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, notFound, refetch: fetchProfile };
}
