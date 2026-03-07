/**
 * useLeaderboard — En iyi analistleri, sinyalleri ve portföy kazananlarını
 * Supabase'den çeken hook.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { avatarUrl } from '../lib/avatarUrl';

export interface AnalystEntry {
  rank:      number;
  id:        string;
  name:      string;
  handle:    string;
  avatar:    string;
  accuracy:  number;
  signals:   number;
  followers: string;
  gain:      string;
  tier:      string;
  verified:  boolean;
  badge:     string;
  specialty?: string;
}

export interface SignalEntry {
  rank:     number;
  id:       string;
  analystName:  string;
  analystId:    string;
  symbol:   string;
  direction: string;
  gain:     string;
  copies:   number;
  timeAgo:  string;
  color:    string;
  badge:    string;
}

export interface GainerEntry {
  rank:   number;
  id:     string;
  name:   string;
  handle: string;
  avatar: string;
  gain:   string;
  value:  string;
  badge:  string;
}

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
  XRP: '#00AAE4', AAPL: '#555555', NVDA: '#76B900', TSLA: '#CC0000',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'bugün';
  return `${d} gün önce`;
}

function fmtFollowers(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function useLeaderboard() {
  const [analysts,   setAnalysts]   = useState<AnalystEntry[]>([]);
  const [topSignals, setTopSignals] = useState<SignalEntry[]>([]);
  const [gainers,    setGainers]    = useState<GainerEntry[]>([]);
  const [loading,    setLoading]    = useState(true);

  const fetchLeaderboard = useCallback(async (period: 'all' | 'weekly' = 'all') => {
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      // ── Top analistler ──
      const { data: analystData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, tier, verified, follower_count, signal_accuracy')
        .gt('signal_accuracy', 0)
        .order('signal_accuracy', { ascending: false })
        .limit(10);

      if (analystData && analystData.length > 0) {
        const mapped = analystData.map((p: any, i: number) => ({
          rank:      i + 1,
          id:        p.id,
          name:      p.full_name || p.username,
          handle:    `@${p.username}`,
          avatar:    p.avatar_url || avatarUrl(p.id, p.full_name ?? p.username),
          accuracy:  Math.round(p.signal_accuracy * 10) / 10,
          signals:   0,
          followers: fmtFollowers(p.follower_count || 0),
          gain:      '+0%',
          tier:      p.tier,
          verified:  p.verified,
          badge:     i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
        }));

        const ids = analystData.map((p: any) => p.id);
        const { data: sigCounts } = await supabase
          .from('signals')
          .select('creator_id')
          .in('creator_id', ids);

        if (sigCounts) {
          const countMap: Record<string, number> = {};
          for (const s of sigCounts) countMap[s.creator_id] = (countMap[s.creator_id] || 0) + 1;
          mapped.forEach(a => { a.signals = countMap[a.id] || 0; });
        }

        setAnalysts(mapped);
      }

      // ── Top sinyaller ──
      let sigQuery = supabase
        .from('signals')
        .select('id, creator_id, asset_id, direction, copies_count, created_at')
        .order('copies_count', { ascending: false })
        .limit(5);

      if (period === 'weekly') {
        sigQuery = sigQuery.gte('created_at', weekAgo);
      }

      const { data: sigData } = await sigQuery;

      if (sigData && sigData.length > 0) {
        const profIds  = [...new Set(sigData.map((s: any) => s.creator_id))];
        const assetIds = [...new Set(sigData.map((s: any) => s.asset_id))];

        const [{ data: profData }, { data: assetData }] = await Promise.all([
          supabase.from('profiles').select('id, full_name, username').in('id', profIds),
          supabase.from('assets').select('id, symbol').in('id', assetIds),
        ]);

        const profMap:  Record<string, any> = {};
        const assetMap: Record<string, any> = {};
        for (const p of profData  ?? []) profMap[p.id]  = p;
        for (const a of assetData ?? []) assetMap[a.id] = a;

        const mapped = sigData.map((s: any, i: number) => ({
          rank:        i + 1,
          id:          s.id,
          analystName: profMap[s.creator_id]?.full_name || profMap[s.creator_id]?.username || 'Analist',
          analystId:   s.creator_id,
          symbol:      assetMap[s.asset_id]?.symbol || s.asset_id,
          direction:   s.direction === 'BUY' ? 'AL' : s.direction === 'SELL' ? 'SAT' : 'TUT',
          gain:        '+0%',
          copies:      s.copies_count || 0,
          timeAgo:     timeAgo(s.created_at),
          color:       ASSET_COLORS[assetMap[s.asset_id]?.symbol] || '#9AA0AF',
          badge:       i === 0 ? '🔥' : i === 1 ? '⚡' : i === 2 ? '📈' : '',
        }));
        setTopSignals(mapped);
      }

      // ── Portföy kazananları (gerçek PnL) ──
      // NOT: Bu sorgu için ADD_TABLES.sql'deki "Giriş yapanlar tüm holdings'i okuyabilir" policy gerekli
      const { data: holdingsData, error: holdingsErr } = await supabase
        .from('portfolio_holdings')
        .select('user_id, quantity, avg_cost, asset_id')
        .limit(1000);

      if (holdingsErr) {
        // RLS engelliyorsa sessizce geç
        console.warn('[useLeaderboard] holdings sorgu hatası:', holdingsErr.message);
      }

      if (holdingsData && holdingsData.length > 0) {
        // Tüm unique asset_id'lerin güncel fiyatlarını çek
        const assetIds = [...new Set(holdingsData.map((h: any) => h.asset_id))];
        const { data: priceData } = await supabase
          .from('asset_prices')
          .select('asset_id, price')
          .in('asset_id', assetIds);
        const priceMap: Record<string, number> = {};
        for (const p of priceData ?? []) priceMap[p.asset_id] = p.price;

        // Kullanıcı bazında: maliyet ve güncel değer topla
        const userStats: Record<string, { cost: number; current: number }> = {};
        for (const h of holdingsData) {
          const qty  = h.quantity ?? 0;
          const cost = qty * (h.avg_cost ?? 0);
          const curr = qty * (priceMap[h.asset_id] ?? h.avg_cost ?? 0);
          if (!userStats[h.user_id]) userStats[h.user_id] = { cost: 0, current: 0 };
          userStats[h.user_id].cost    += cost;
          userStats[h.user_id].current += curr;
        }

        // En yüksek kazanç oranına göre sırala
        const topUserIds = Object.entries(userStats)
          .filter(([, s]) => s.cost > 0)
          .sort(([, a], [, b]) => {
            const gainA = (a.current - a.cost) / a.cost;
            const gainB = (b.current - b.cost) / b.cost;
            return gainB - gainA;
          })
          .slice(0, 5)
          .map(([id]) => id);

        if (topUserIds.length > 0) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', topUserIds);

          if (profData && profData.length > 0) {
            const profMap: Record<string, any> = {};
            for (const p of profData) profMap[p.id] = p;

            const mapped: GainerEntry[] = topUserIds
              .filter(uid => profMap[uid])
              .slice(0, 5)
              .map((uid, i) => {
                const stats   = userStats[uid];
                const gainPct = stats.cost > 0
                  ? ((stats.current - stats.cost) / stats.cost) * 100
                  : 0;
                return {
                  rank:   i + 1,
                  id:     uid,
                  name:   profMap[uid]?.full_name || profMap[uid]?.username || 'Kullanıcı',
                  handle: `@${profMap[uid]?.username || 'user'}`,
                  avatar: profMap[uid]?.avatar_url || avatarUrl(uid, profMap[uid]?.full_name ?? profMap[uid]?.username),
                  gain:   gainPct >= 0 ? `+${gainPct.toFixed(1)}%` : `${gainPct.toFixed(1)}%`,
                  value:  `$${stats.current.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                  badge:  i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
                };
              });
            if (mapped.length > 0) setGainers(mapped);
          }
        }
      }
    } catch (e) {
      console.warn('[useLeaderboard] Hata:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return { analysts, topSignals, gainers, loading, refetch: fetchLeaderboard };
}
