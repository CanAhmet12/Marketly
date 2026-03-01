import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useFollow(targetUserId?: string) {
  const { user } = useAuth();
  const [isFollowing,      setIsFollowing]      = useState(false);
  const [followersCount,   setFollowersCount]   = useState(0);
  const [followingCount,   setFollowingCount]   = useState(0);
  const [loading,          setLoading]          = useState(false);

  // Fetch follow state + counts
  const refresh = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const [followCheck, follCount, follwCount] = await Promise.all([
        user?.id
          ? supabase
              .from('follows')
              .select('follower_id')
              .eq('follower_id', user.id)
              .eq('following_id', targetUserId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from('follows')
          .select('follower_id', { count: 'exact', head: true })
          .eq('following_id', targetUserId),
        supabase
          .from('follows')
          .select('following_id', { count: 'exact', head: true })
          .eq('follower_id', targetUserId),
      ]);
      setIsFollowing(!!followCheck.data);
      setFollowersCount(follCount.count ?? 0);
      setFollowingCount(follwCount.count ?? 0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, targetUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !targetUserId || user.id === targetUserId) return false;
    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);
    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
        if (error) throw error;
      }
      return !wasFollowing;
    } catch {
      // Rollback
      setIsFollowing(wasFollowing);
      setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
      return wasFollowing;
    }
  }, [user?.id, targetUserId, isFollowing]);

  return { isFollowing, followersCount, followingCount, toggle, loading, refresh };
}
