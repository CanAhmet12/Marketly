/**
 * useLeaderboard — En iyi analistleri, sinyalleri ve portföy kazananlarını
 * Supabase'den çeken hook.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

// ─── Mock fallback verisi ─────────────────────────────────────────────────────
const MOCK_ANALYSTS: AnalystEntry[] = [
  { rank:1,  id:'a1', name:'CryptoGuru',  handle:'@cryptoguru',  avatar:'https://i.pravatar.cc/80?u=cg1', accuracy:91.2, signals:247, followers:'48.2K', gain:'+284%', tier:'elite', verified:true,  badge:'🏆' },
  { rank:2,  id:'a2', name:'BorsaMaster', handle:'@borsam',      avatar:'https://i.pravatar.cc/80?u=bm2', accuracy:87.4, signals:183, followers:'31.7K', gain:'+196%', tier:'pro',   verified:true,  badge:'🥈' },
  { rank:3,  id:'a3', name:'FXWizard',    handle:'@fxwizard',    avatar:'https://i.pravatar.cc/80?u=fw3', accuracy:84.9, signals:156, followers:'22.4K', gain:'+162%', tier:'pro',   verified:true,  badge:'🥉' },
  { rank:4,  id:'a4', name:'TechTrader',  handle:'@techtrader',  avatar:'https://i.pravatar.cc/80?u=tt4', accuracy:82.3, signals:201, followers:'18.9K', gain:'+138%', tier:'pro',   verified:false, badge:'' },
  { rank:5,  id:'a5', name:'DeFiHunter',  handle:'@defihunter',  avatar:'https://i.pravatar.cc/80?u=dh5', accuracy:79.8, signals:134, followers:'15.3K', gain:'+121%', tier:'pro',   verified:false, badge:'' },
];

const MOCK_SIGNALS: SignalEntry[] = [
  { rank:1, id:'s1', analystName:'CryptoGuru',  analystId:'a1', symbol:'SOL',  direction:'AL',  gain:'+68.4%', copies:1284, timeAgo:'12 gün önce', color:'#9945FF', badge:'🔥' },
  { rank:2, id:'s2', analystName:'FXWizard',    analystId:'a3', symbol:'ETH',  direction:'AL',  gain:'+44.7%', copies:892,  timeAgo:'5 gün önce',  color:'#627EEA', badge:'⚡' },
  { rank:3, id:'s3', analystName:'BorsaMaster', analystId:'a2', symbol:'BTC',  direction:'AL',  gain:'+28.9%', copies:741,  timeAgo:'8 gün önce',  color:'#F7931A', badge:'📈' },
];

const MOCK_GAINERS: GainerEntry[] = [
  { rank:1, id:'g1', name:'MehmetK',    handle:'@mehmetk',   avatar:'https://i.pravatar.cc/80?u=mk1', gain:'+342%', value:'$48.2K', badge:'🏆' },
  { rank:2, id:'g2', name:'AliTrader',  handle:'@alitrd',    avatar:'https://i.pravatar.cc/80?u=at2', gain:'+287%', value:'$31.7K', badge:'🥈' },
  { rank:3, id:'g3', name:'YildizFX',   handle:'@yildizfx',  avatar:'https://i.pravatar.cc/80?u=yx3', gain:'+213%', value:'$22.1K', badge:'🥉' },
];

export function useLeaderboard() {
  const [analysts, setAnalysts] = useState<AnalystEntry[]>(MOCK_ANALYSTS);
  const [topSignals, setTopSignals] = useState<SignalEntry[]>(MOCK_SIGNALS);
  const [gainers,    setGainers]    = useState<GainerEntry[]>(MOCK_GAINERS);
  const [loading,    setLoading]    = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // ── Top analistler: signal_accuracy + follower_count'a göre sırala ──
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
          avatar:    p.avatar_url || `https://i.pravatar.cc/80?u=${p.id}`,
          accuracy:  Math.round(p.signal_accuracy * 10) / 10,
          signals:   0,
          followers: fmtFollowers(p.follower_count || 0),
          gain:      '+0%',
          tier:      p.tier,
          verified:  p.verified,
          badge:     i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '',
        }));

        // Sinyal sayısını ayrı sorgula
        const ids = analystData.map((p: any) => p.id);
        const { data: sigCounts } = await supabase
          .from('signals')
          .select('creator_id')
          .in('creator_id', ids);

        if (sigCounts) {
          const countMap: Record<string, number> = {};
          for (const s of sigCounts) {
            countMap[s.creator_id] = (countMap[s.creator_id] || 0) + 1;
          }
          mapped.forEach(a => { a.signals = countMap[a.id] || 0; });
        }

        setAnalysts(mapped);
      }

      // ── Top sinyaller: copies_count'a göre sırala ──
      const { data: sigData } = await supabase
        .from('signals')
        .select('id, creator_id, asset_id, direction, copies_count, created_at')
        .order('copies_count', { ascending: false })
        .limit(5);

      if (sigData && sigData.length > 0) {
        // Profiles + assets ayrı çek
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

      // ── Portföy kazananları: en yüksek toplam değerli kullanıcılar ────────
      try {
        const { data: holdingsData } = await supabase
          .from('portfolio_holdings')
          .select('user_id, quantity, buy_price, asset_id');

        if (holdingsData && holdingsData.length > 0) {
          // Kullanıcı başına toplam yatırım ve değer hesapla
          const userStats: Record<string, { invested: number; quantity: number }> = {};
          for (const h of holdingsData) {
            if (!userStats[h.user_id]) userStats[h.user_id] = { invested: 0, quantity: 0 };
            const buyP = h.buy_price ?? 0;
            userStats[h.user_id].invested  += (h.quantity ?? 0) * buyP;
            userStats[h.user_id].quantity  += (h.quantity ?? 0);
          }

          const topUserIds = Object.entries(userStats)
            .sort(([, a], [, b]) => b.quantity - a.quantity)
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
                .slice(0, 3)
                .map((uid, i) => {
                  const stats   = userStats[uid];
                  const gainPct = stats.invested > 0
                    ? Math.round(((stats.quantity * 100) / stats.invested - 1) * 100) / 100
                    : 0;
                  return {
                    rank:   i + 1,
                    id:     uid,
                    name:   profMap[uid]?.full_name || profMap[uid]?.username || 'Kullanıcı',
                    handle: `@${profMap[uid]?.username || 'user'}`,
                    avatar: profMap[uid]?.avatar_url || `https://i.pravatar.cc/80?u=${uid}`,
                    gain:   gainPct >= 0 ? `+${gainPct.toFixed(1)}%` : `${gainPct.toFixed(1)}%`,
                    value:  `${stats.quantity.toFixed(2)} birim`,
                    badge:  i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉',
                  };
                });
              if (mapped.length > 0) setGainers(mapped);
            }
          }
        }
      } catch {
        // gainers mock'ta kalsın
      }

    } catch (e) {
      console.warn('[useLeaderboard] Mock veriye düşülüyor:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return { analysts, topSignals, gainers, loading, refetch: fetchLeaderboard };
}
