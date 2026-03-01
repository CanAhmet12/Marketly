/**
 * useSignals — Supabase `signals` tablosundan gerçek sinyal verilerini çeken hook.
 * Profil JOIN yerine ayrı sorgu kullanır. Supabase boşsa [] döner.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface RealSignal {
  id:           string;
  creator_id:   string;
  asset_id:     string;
  symbol:       string;
  direction:    'BUY' | 'SELL' | 'HOLD';
  confidence:   number;
  entry_price:  number | null;
  target_price: number | null;
  stop_loss:    number | null;
  timeframe:    string;
  rationale:    string | null;
  is_active:    boolean;
  copies_count: number;
  likes_count:  number;
  created_at:   string;
  result:       string | null;
  creator: {
    id:       string;
    name:     string;
    handle:   string;
    avatar:   string;
    verified: boolean;
    tier:     string;
    accuracy: number;
  };
}

// ─── Yardımcı: profiles + assets tek sorguda ─────────────────────────────────
async function fetchProfilesMap(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {};
  const unique = [...new Set(userIds)];
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, verified, tier, signal_accuracy')
    .in('id', unique);
  const map: Record<string, any> = {};
  for (const p of data ?? []) map[p.id] = p;
  return map;
}

async function fetchAssetsMap(assetIds: string[]): Promise<Record<string, any>> {
  if (assetIds.length === 0) return {};
  const unique = [...new Set(assetIds)];
  const { data } = await supabase
    .from('assets')
    .select('id, symbol, name')
    .in('id', unique);
  const map: Record<string, any> = {};
  for (const a of data ?? []) map[a.id] = a;
  return map;
}

const PAGE_SIZE = 15;

export function useSignals(opts: {
  assetId?:    string;
  creatorId?:  string;
  activeOnly?: boolean;
} = {}) {
  const { user } = useAuth();
  const [signals,  setSignals]  = useState<RealSignal[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [hasMore,  setHasMore]  = useState(true);
  const [page,     setPage]     = useState(0);

  const fetchSignals = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    try {
      // ── 1. Sinyalleri çek ──────────────────────────────────────────────
      let q = supabase
        .from('signals')
        .select('id, creator_id, asset_id, direction, confidence, entry_price, target_price, stop_loss, timeframe, rationale, is_active, copies_count, likes_count, created_at, result')
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

      if (opts.activeOnly !== false) q = q.eq('is_active', true);
      if (opts.assetId)   q = q.eq('asset_id', opts.assetId.toUpperCase());
      if (opts.creatorId) q = q.eq('creator_id', opts.creatorId);

      const { data, error } = await q;
      if (error) throw error;

      if (data && data.length > 0) {
        // ── 2. Profiles + Assets ayrı çek ─────────────────────────────────
        const [profMap, assetMap] = await Promise.all([
          fetchProfilesMap(data.map((r: any) => r.creator_id).filter(Boolean)),
          fetchAssetsMap(data.map((r: any) => r.asset_id).filter(Boolean)),
        ]);

        const mapped: RealSignal[] = data.map((row: any) => {
          const prof  = profMap[row.creator_id];
          const asset = assetMap[row.asset_id];
          return {
            id:           row.id,
            creator_id:   row.creator_id,
            asset_id:     row.asset_id,
            symbol:       asset?.symbol ?? row.asset_id,
            direction:    row.direction as 'BUY' | 'SELL' | 'HOLD',
            confidence:   row.confidence  ?? 3,
            entry_price:  row.entry_price  ?? null,
            target_price: row.target_price ?? null,
            stop_loss:    row.stop_loss    ?? null,
            timeframe:    row.timeframe    ?? '1G',
            rationale:    row.rationale    ?? null,
            is_active:    row.is_active    ?? true,
            copies_count: row.copies_count ?? 0,
            likes_count:  row.likes_count  ?? 0,
            created_at:   row.created_at,
            result:       row.result       ?? null,
            creator: {
              id:       prof?.id       ?? row.creator_id,
              name:     prof?.full_name ?? prof?.username ?? 'Analist',
              handle:   `@${prof?.username ?? 'analist'}`,
              avatar:   prof?.avatar_url ?? `https://i.pravatar.cc/80?u=${row.creator_id}`,
              verified: prof?.verified  ?? false,
              tier:     prof?.tier      ?? 'free',
              accuracy: prof?.signal_accuracy ?? 0,
            },
          };
        });

        if (reset) { setSignals(mapped); setPage(1); }
        else        { setSignals(prev => [...prev, ...mapped]); setPage(p => p + 1); }
        setHasMore(mapped.length === PAGE_SIZE);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('[useSignals]', e);
    }

    if (reset) setSignals([]);
    setHasMore(false);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, opts.assetId, opts.creatorId, opts.activeOnly]);

  useEffect(() => {
    fetchSignals(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.assetId, opts.creatorId, opts.activeOnly]);

  const createSignal = useCallback(async (data: {
    asset_id:     string;
    direction:    'BUY' | 'SELL' | 'HOLD';
    confidence:   number;
    entry_price?: number;
    target_price?: number;
    stop_loss?:   number;
    timeframe?:   string;
    rationale?:   string;
  }): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const { error } = await supabase
        .from('signals')
        .insert({
          creator_id:   user.id,
          asset_id:     data.asset_id.toUpperCase(),
          direction:    data.direction,
          confidence:   data.confidence,
          entry_price:  data.entry_price  ?? null,
          target_price: data.target_price ?? null,
          stop_loss:    data.stop_loss    ?? null,
          timeframe:    data.timeframe    ?? '1G',
          rationale:    data.rationale    ?? null,
        });
      if (error) throw error;
      await fetchSignals(true);
      return true;
    } catch { return false; }
  }, [user?.id, fetchSignals]);

  const likeSignal = useCallback(async (signalId: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const sig = signals.find(s => s.id === signalId);
      if (!sig) return false;

      // Daha önce beğenip beğenmediğini kontrol et
      const { data: existing } = await supabase
        .from('signal_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('signal_id', signalId)
        .maybeSingle();

      if (existing) {
        // Beğeniyi geri al
        await supabase.from('signal_likes').delete()
          .eq('user_id', user.id).eq('signal_id', signalId);
        await supabase.from('signals')
          .update({ likes_count: Math.max(0, sig.likes_count - 1) })
          .eq('id', signalId);
        setSignals(prev =>
          prev.map(s => s.id === signalId ? { ...s, likes_count: Math.max(0, s.likes_count - 1) } : s)
        );
      } else {
        // Yeni beğeni
        await supabase.from('signal_likes').upsert(
          { user_id: user.id, signal_id: signalId },
          { onConflict: 'user_id,signal_id' }
        );
        await supabase.from('signals')
          .update({ likes_count: sig.likes_count + 1 })
          .eq('id', signalId);
        setSignals(prev =>
          prev.map(s => s.id === signalId ? { ...s, likes_count: s.likes_count + 1 } : s)
        );
      }
      return true;
    } catch { return false; }
  }, [user?.id, signals]);

  const copySignal = useCallback(async (signalId: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const sig = signals.find(s => s.id === signalId);
      if (!sig) return false;

      // Aynı kullanıcı aynı sinyali iki kez kopyalayamasın
      const { data: existing } = await supabase
        .from('signal_copies')
        .select('id')
        .eq('user_id', user.id)
        .eq('signal_id', signalId)
        .maybeSingle();

      if (!existing) {
        await supabase.from('signal_copies').upsert(
          { user_id: user.id, signal_id: signalId },
          { onConflict: 'user_id,signal_id' }
        );
        await supabase.from('signals')
          .update({ copies_count: sig.copies_count + 1 })
          .eq('id', signalId);
        setSignals(prev =>
          prev.map(s => s.id === signalId ? { ...s, copies_count: s.copies_count + 1 } : s)
        );
      }
      return true;
    } catch { return false; }
  }, [user?.id, signals]);

  return {
    signals, loading, hasMore,
    loadMore: () => { if (!loading && hasMore) fetchSignals(false); },
    refetch:  () => fetchSignals(true),
    createSignal, likeSignal, copySignal,
  };
}
