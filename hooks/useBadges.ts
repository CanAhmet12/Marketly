/**
 * useBadges — Kullanıcının rozetlerini Supabase'den çeker ve
 * otomatik olarak yeni rozet kazanımlarını kontrol eder.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ALL_BADGES } from '../components/BadgesRow';

// ─── İstatistik tipi ──────────────────────────────────────────────────────────
export interface BadgeStats {
  signalCount?:    number;
  followerCount?:  number;
  streakDays?:     number;
  signalAccuracy?: number;
  portfolioCount?: number;
  postCount?:      number;
  watchlistCount?: number;
  tier?:           string;
}

// ─── Rozet koşulları ──────────────────────────────────────────────────────────
const CONDITIONS: { id: string; check: (s: BadgeStats) => boolean }[] = [
  { id: 'first_step',    check: (s) => (s.signalCount    ?? 0) >= 1 },
  { id: 'rising_star',   check: (s) => (s.followerCount  ?? 0) >= 100 },
  { id: 'streak_7',      check: (s) => (s.streakDays     ?? 0) >= 7 },
  { id: 'expert',        check: (s) => (s.signalAccuracy ?? 0) >= 70 && (s.signalCount ?? 0) >= 50 },
  { id: 'trend_analyst', check: (s) => (s.followerCount  ?? 0) >= 1000 },
  { id: 'portfolio_pro', check: (s) => (s.portfolioCount ?? 0) >= 5 },
  { id: 'signal_100',    check: (s) => (s.signalCount    ?? 0) >= 100 },
  { id: 'ai_explorer',   check: (s) => (s.postCount      ?? 0) >= 10 },
  { id: 'early_bird',    check: (s) => true },  // İlk 1000 kullanıcı
];

export function useBadges() {
  const { user } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newBadges,    setNewBadges]    = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);

  // ── Kazanılan rozetleri yükle ─────────────────────────────────────────────
  const fetchBadges = useCallback(async () => {
    if (!user?.id) { setEarnedBadges([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setEarnedBadges(data.map((b: any) => b.badge_id));
      }
    } catch { /* tablo yoksa sessizce geç */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  // ── Rozet kazanım kontrolü (dışarıdan stats alır) ────────────────────────
  const checkAndAward = useCallback(async (stats: BadgeStats) => {
    if (!user?.id) return;

    const toAward = CONDITIONS.filter(
      (cond) => !earnedBadges.includes(cond.id) && cond.check(stats)
    );
    if (toAward.length === 0) return;

    const inserts = toAward.map((cond) => ({
      user_id:   user.id,
      badge_id:  cond.id,
      earned_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('user_badges')
        .upsert(inserts, { onConflict: 'user_id,badge_id' });

      if (!error) {
        const newIds = toAward.map((c) => c.id);
        setEarnedBadges((prev) => [...new Set([...prev, ...newIds])]);
        setNewBadges(newIds);
        setTimeout(() => setNewBadges([]), 6000);
      }
    } catch { /* tablo yoksa sessizce geç */ }
  }, [user?.id, earnedBadges]);

  // Tüm rozetleri earned durumu ile döndür
  const allBadges = ALL_BADGES.map((b) => ({
    ...b,
    earned: earnedBadges.includes(b.id),
  }));

  return {
    earnedBadges,   // string[] — kazanılan rozet ID'leri
    earnedIds: earnedBadges,
    allBadges,      // ALL_BADGES + earned durumu
    newBadges,      // son 5sn içinde kazanılanlar (bildirim için)
    loading,
    checkAndAward,
    refetch: fetchBadges,
  };
}
