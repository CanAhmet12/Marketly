import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // İlk yükleme — Supabase'den çek
  useEffect(() => {
    if (!user?.id) { setWatchlist(new Set()); return; }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('watchlists')
          .select('asset_id')
          .eq('user_id', user.id);
        if (err) { setError(err.message); return; }
        if (data) setWatchlist(new Set(data.map((r: any) => r.asset_id)));
      } catch (e: any) {
        setError(e?.message ?? 'Watchlist yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const isWatched = useCallback((assetId: string) =>
    watchlist.has(assetId.toUpperCase()), [watchlist]);

  const toggle = useCallback(async (assetId: string): Promise<boolean> => {
    if (!user?.id) return false;
    const id = assetId.toUpperCase();
    const already = watchlist.has(id);

    // Optimistic update
    setWatchlist(prev => {
      const next = new Set(prev);
      already ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (already) {
        await supabase
          .from('watchlists')
          .delete()
          .eq('user_id', user.id)
          .eq('asset_id', id);
      } else {
        await supabase
          .from('watchlists')
          .upsert({ user_id: user.id, asset_id: id });
      }
      return !already;
    } catch {
      // Rollback on error
      setWatchlist(prev => {
        const next = new Set(prev);
        already ? next.add(id) : next.delete(id);
        return next;
      });
      return already;
    }
  }, [user?.id, watchlist]);

  // Memoized array to avoid unnecessary re-renders in consumers
  const watchlistIds = useMemo(() => Array.from(watchlist), [watchlist]);

  return { watchlist, watchlistIds, isWatched, toggle, loading, error };
}
