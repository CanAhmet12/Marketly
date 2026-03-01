import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, Image,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTabBar } from '../contexts/TabBarContext';
import { useSubscription } from '../hooks/useSubscription';
import { useFollow } from '../hooks/useFollow';
import { usePosts } from '../hooks/usePosts';
import { useBadges } from '../hooks/useBadges';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePortfolio } from '../hooks/usePortfolio';
import { PostCard } from '../components/PostCard';
import { BadgesRow } from '../components/BadgesRow';
import { CreatePostModal } from '../components/CreatePostModal';
import { SignalCard } from '../components/SignalCard';
import { useSignals } from '../hooks/useSignals';
import { radius, shadow, colors } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const COVER_H    = 170;
const AVATAR_SIZE = 86;

const CONTENT_GRID = [
  { id: '1', thumb: 'https://picsum.photos/seed/pv1/300/180', views: '124K', isLive: false },
  { id: '2', thumb: 'https://picsum.photos/seed/pv2/300/180', views: '89K',  isLive: false },
  { id: '3', thumb: 'https://picsum.photos/seed/pv3/300/180', views: '56K',  isLive: true  },
  { id: '4', thumb: 'https://picsum.photos/seed/pv4/300/180', views: '200K', isLive: false },
  { id: '5', thumb: 'https://picsum.photos/seed/pv5/300/180', views: '41K',  isLive: false },
  { id: '6', thumb: 'https://picsum.photos/seed/pv6/300/180', views: '73K',  isLive: false },
  { id: '7', thumb: 'https://picsum.photos/seed/pv7/300/180', views: '93K',  isLive: false },
  { id: '8', thumb: 'https://picsum.photos/seed/pv8/300/180', views: '35K',  isLive: false },
  { id: '9', thumb: 'https://picsum.photos/seed/pv9/300/180', views: '61K',  isLive: false },
];

const PROFILE_TABS = ['Videolar', 'Sinyaller', 'Portföy', 'İstatistikler'] as const;
type ProfileTab = typeof PROFILE_TABS[number];

// ─── GuestProfile ─────────────────────────────────────────────────────────────
function GuestProfile({ onLogin, onRegister, topInset }: { onLogin: () => void; onRegister: () => void; topInset: number }) {
  return (
    <View style={gst.root}>
      <StatusBar barStyle="light-content" />
      <View style={[gst.cover, { paddingTop: topInset }]}>
        <View style={gst.coverBg} />
        <View style={[gst.bubble, { top: -30, left: -30, width: 160, opacity: 0.12 }]} />
        <View style={[gst.bubble, { bottom: -20, right: 20, width: 110, opacity: 0.08 }]} />
        <View style={[gst.bubble, { top: 20, right: 60, width: 70, opacity: 0.06 }]} />
      </View>
      <View style={gst.body}>
        <View style={gst.avatarRing}>
          <View style={gst.guestIcon}>
            <Ionicons name="person-outline" size={38} color={colors.textMuted} />
          </View>
        </View>
        <Text style={gst.title}>Marketly'e Katıl</Text>
        <Text style={gst.sub}>Portföyünü takip et, sinyal paylaş{'\n'}ve finans topluluğuna katıl</Text>
        <View style={gst.perks}>
          {[
            { icon: 'trending-up', text: 'Kişisel portföy takibi' },
            { icon: 'flash',       text: 'Al/Sat sinyal akışı' },
            { icon: 'people',      text: 'Uzman analistleri takip et' },
            { icon: 'bar-chart',   text: 'Gerçek zamanlı piyasa verileri' },
          ].map((p) => (
            <View key={p.text} style={gst.perk}>
              <View style={gst.perkIcon}>
                <Ionicons name={p.icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={gst.perkTxt}>{p.text}</Text>
            </View>
          ))}
        </View>
        <Pressable style={gst.loginBtn} onPress={onLogin}>
          <Text style={gst.loginTxt}>Giriş Yap</Text>
        </Pressable>
        <Pressable style={gst.registerBtn} onPress={onRegister}>
          <Text style={gst.registerTxt}>Ücretsiz Kayıt Ol</Text>
        </Pressable>
      </View>
    </View>
  );
}

const gst = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  cover: { minHeight: 200, overflow: 'hidden', position: 'relative' },
  coverBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.primaryDark },
  bubble: {
    position: 'absolute', aspectRatio: 1, borderRadius: 9999,
    backgroundColor: '#FFF',
  },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 24 },
  avatarRing: {
    marginTop: -44, marginBottom: 16, width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.bgPure, borderWidth: 3, borderColor: colors.bgPure,
    alignItems: 'center', justifyContent: 'center', ...shadow.md,
  },
  guestIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  perks: { width: '100%', gap: 12, marginBottom: 28 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  perkTxt: { fontSize: 14, color: colors.text, fontWeight: '500' },
  loginBtn: {
    width: '100%', backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginBottom: 10,
    ...shadow.md, shadowColor: colors.primary,
  },
  loginTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  registerBtn: {
    width: '100%', backgroundColor: colors.bgPure,
    paddingVertical: 14, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.primary,
  },
  registerTxt: { color: colors.primary, fontSize: 16, fontWeight: '800' },
});

// ─── AnalystStatRow ───────────────────────────────────────────────────────────
function AnalystStatCard({ winRate, total, followers, following }: {
  winRate: number; total: number; followers: string; following: string;
}) {
  const win   = Math.round((winRate / 100) * total);
  const lose  = total - win;
  return (
    <View style={asc.card}>
      {/* Win rate circle */}
      <View style={asc.center}>
        <View style={asc.rateCircle}>
          <Text style={asc.rateNum}>{winRate}%</Text>
          <Text style={asc.rateLbl}>başarı</Text>
        </View>
        <Text style={asc.centerlbl}>Sinyal Oranı</Text>
      </View>
      <View style={asc.divider} />
      {/* Stats grid */}
      <View style={asc.grid}>
        {[
          { val: String(total), lbl: 'Sinyal' },
          { val: String(win),   lbl: 'Kazanç', color: colors.rise },
          { val: String(lose),  lbl: 'Kayıp',  color: colors.fall },
          { val: followers,     lbl: 'Takipçi' },
        ].map((s) => (
          <View key={s.lbl} style={asc.statItem}>
            <Text style={[asc.statVal, s.color ? { color: s.color } : {}]}>{s.val}</Text>
            <Text style={asc.statLbl}>{s.lbl}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const asc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgPure,
    marginHorizontal: 14, borderRadius: radius.lg,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  center: { alignItems: 'center', paddingRight: 16 },
  rateCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: colors.primaryLight,
    borderWidth: 3, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 5,
  },
  rateNum: { fontSize: 18, fontWeight: '900', color: colors.primary },
  rateLbl: { fontSize: 9, fontWeight: '700', color: colors.primaryDark, marginTop: -2 },
  centerlbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  divider: { width: 1, height: 60, backgroundColor: colors.border, marginRight: 16 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  statItem: { width: '50%', alignItems: 'center', paddingVertical: 7 },
  statVal: { fontSize: 16, fontWeight: '900', color: colors.text },
  statLbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
});

// ─── PortfolioTab ─────────────────────────────────────────────────────────────
function PortfolioTab() {
  const navigation = useNavigation<any>();
  return (
    <View style={pt.wrap}>
      <View style={pt.openPortfolio}>
        <Ionicons name="wallet" size={36} color={colors.primary} />
        <Text style={pt.openTitle}>Portföy Takibi</Text>
        <Text style={pt.openSub}>Yatırımlarını ekle, gerçek P&L değerlerini takip et</Text>
        <Pressable style={pt.openBtn} onPress={() => navigation.navigate('Portfolio')}>
          <Text style={pt.openBtnTxt}>Portföyüme Git</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const pt = StyleSheet.create({
  wrap:          { paddingBottom: 20, paddingTop: 16 },
  openPortfolio: {
    marginHorizontal: 14, backgroundColor: colors.bgPure,
    borderRadius: radius.lg, padding: 24,
    alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  openTitle:  { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  openSub:    { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  openBtn:    {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
  },
  openBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

// ─── StatsTab ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const MONTHLY = [
    { month: 'Eyl', winPct: 65, sigs: 12 },
    { month: 'Eki', winPct: 72, sigs: 18 },
    { month: 'Kas', winPct: 58, sigs: 14 },
    { month: 'Ara', winPct: 80, sigs: 22 },
    { month: 'Oca', winPct: 75, sigs: 16 },
    { month: 'Şub', winPct: 82, sigs: 20 },
  ];
  const maxSigs = Math.max(...MONTHLY.map((m) => m.sigs));

  return (
    <View style={st.wrap}>
      {/* Summary cards */}
      <View style={st.statCards}>
        {[
          { icon: 'trending-up', val: '+$18.4K', lbl: 'Toplam Kazanç', color: colors.rise },
          { icon: 'star',        val: '4.8/5',   lbl: 'Ortalama Puan', color: '#FFB800' },
          { icon: 'eye',         val: '1.2M',    lbl: 'Toplam İzlenme', color: colors.info },
          { icon: 'people',      val: '2.4K',    lbl: 'Takipçi',        color: colors.primary },
        ].map((c) => (
          <View key={c.lbl} style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: c.color + '18' }]}>
              <Ionicons name={c.icon as any} size={18} color={c.color} />
            </View>
            <Text style={st.statCardVal}>{c.val}</Text>
            <Text style={st.statCardLbl}>{c.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Signal history chart */}
      <View style={st.chartCard}>
        <Text style={st.chartTitle}>Aylık Sinyal Performansı</Text>
        <View style={st.bars}>
          {MONTHLY.map((m) => {
            const barH = (m.sigs / maxSigs) * 70;
            const isGood = m.winPct >= 70;
            return (
              <View key={m.month} style={st.barGroup}>
                <Text style={[st.barPct, { color: isGood ? colors.rise : colors.fall }]}>{m.winPct}%</Text>
                <View style={st.barTrack}>
                  <View style={[st.bar, { height: barH, backgroundColor: isGood ? colors.rise : colors.fall }]} />
                </View>
                <Text style={st.barMonth}>{m.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Signal history list */}
      <Text style={st.listTitle}>Son Sinyaller</Text>
      {SIGNAL_HISTORY.map((sig, i) => {
        const isWin = sig.result === 'WIN';
        const isBuy = sig.dir === 'BUY';
        return (
          <View key={i} style={st.histRow}>
            <View style={[st.dirBadge, { backgroundColor: isBuy ? colors.riseLight : colors.fallLight }]}>
              <Text style={[st.dirTxt, { color: isBuy ? colors.rise : colors.fall }]}>{sig.dir}</Text>
            </View>
            <Text style={st.histAsset}>{sig.asset}</Text>
            <View style={[st.resultPill, { backgroundColor: isWin ? colors.riseLight : colors.fallLight }]}>
              <Ionicons name={isWin ? 'checkmark-circle' : 'close-circle'} size={12} color={isWin ? colors.rise : colors.fall} />
              <Text style={[st.resultTxt, { color: isWin ? colors.rise : colors.fall }]}>
                {sig.gain}
              </Text>
            </View>
            <Text style={st.histDate}>{sig.date}</Text>
          </View>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { paddingBottom: 20 },
  statCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, marginBottom: 14 },
  statCard: {
    width: (W - 28 - 8) / 2, backgroundColor: colors.bgPure,
    borderRadius: radius.md, padding: 14, gap: 6,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  statIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statCardVal: { fontSize: 20, fontWeight: '900', color: colors.text },
  statCardLbl: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  chartCard: {
    backgroundColor: colors.bgPure, marginHorizontal: 14, borderRadius: radius.lg,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  chartTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 16 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  barGroup: { alignItems: 'center', gap: 4, flex: 1 },
  barPct: { fontSize: 9, fontWeight: '800' },
  barTrack: { width: 20, height: 70, justifyContent: 'flex-end' },
  bar: { width: 20, borderRadius: 4, minHeight: 6 },
  barMonth: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  listTitle: { fontSize: 14, fontWeight: '800', color: colors.text, paddingHorizontal: 14, marginBottom: 8 },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    backgroundColor: colors.bgPure, marginHorizontal: 14, marginBottom: 6,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.xs },
  dirTxt: { fontSize: 10, fontWeight: '900' },
  histAsset: { flex: 1, fontSize: 13, fontWeight: '800', color: colors.text },
  resultPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
  },
  resultTxt: { fontSize: 12, fontWeight: '800' },
  histDate: { fontSize: 10, color: colors.textMuted },
});

// ─── Content Grid ─────────────────────────────────────────────────────────────
function ContentGrid() {
  const CELL_W = (W - 4) / 3;
  return (
    <View style={cg.grid}>
      {CONTENT_GRID.map((v) => (
        <Pressable key={v.id} style={[cg.cell, { width: CELL_W, height: CELL_W * 0.65 }]}>
          <Image source={{ uri: v.thumb }} style={cg.thumb} />
          <View style={cg.overlay} />
          {v.isLive && (
            <View style={cg.liveBadge}>
              <View style={cg.liveDot} />
              <Text style={cg.liveTxt}>CANLI</Text>
            </View>
          )}
          <View style={cg.meta}>
            <Ionicons name="play" size={9} color="#FFF" />
            <Text style={cg.views}>{v.views}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const cg = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingHorizontal: 2 },
  cell: { position: 'relative', overflow: 'hidden', borderRadius: 4 },
  thumb: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },
  liveBadge: {
    position: 'absolute', top: 5, left: 5,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#E53935', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2,
  },
  liveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  meta: {
    position: 'absolute', bottom: 4, left: 4,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  views: { color: '#FFF', fontSize: 9, fontWeight: '700' },
});

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const navigation        = useNavigation<any>();
  const insets            = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Videolar');
  const [showPostModal,  setShowPostModal]  = useState(false);
  const { showTabBar, resetTabBar } = useTabBar();
  const { tierLabel, tierColor }    = useSubscription();
  const { followersCount, followingCount }  = useFollow(user?.id);
  const { posts, toggleLike, deletePost, createPost } = usePosts();
  const { earnedBadges, newBadges, checkAndAward } = useBadges();
  const { watchlist } = useWatchlist();
  const { holdings } = usePortfolio();
  const { signals: mySignals } = useSignals({ creatorId: user?.id });
  const toast = useToast();

  // Yeni rozet kazanılınca bildirim göster
  useEffect(() => {
    if (newBadges.length === 0) return;
    const ALL_BADGES_MAP: Record<string, string> = {
      first_step: '🥇 İlk Adım', rising_star: '📈 Yükselen Yıldız',
      streak_7: '🔥 7 Gün Streak', expert: '💎 Uzman Analist',
      trend_analyst: '👥 Trend Analist', portfolio_pro: '💼 Portföy Pro',
      signal_100: '⚡ 100+ Sinyal', ai_explorer: '🤖 AI Kaşifi',
      early_bird: '🦅 Early Bird',
    };
    newBadges.forEach((id) => {
      const label = ALL_BADGES_MAP[id] ?? id;
      toast.success(`Rozet kazandın: ${label} 🎉`);
    });
  }, [newBadges]);

  // Profil yüklendiğinde rozet kontrolü yap
  useEffect(() => {
    if (!user || !profile) return;
    const p = profile as any;
    checkAndAward({
      signalCount:    p.signal_count     ?? 0,
      followerCount:  followersCount,
      streakDays:     p.streak_days      ?? 0,
      signalAccuracy: p.signal_accuracy  ?? 0,
      postCount:      posts.filter(pt => pt.user_id === user.id).length,
      tier:           p.tier             ?? 'free',
      watchlistCount: watchlist.size,
      portfolioCount: holdings.length,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, followersCount, holdings.length, watchlist.size]);

  useFocusEffect(useCallback(() => {
    showTabBar();
    resetTabBar();
  }, [showTabBar, resetTabBar]));

  if (!user) {
    return (
      <GuestProfile
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
        topInset={insets.top}
      />
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}>

        {/* ══ COVER ══ */}
        <View style={s.coverWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800' }}
            style={s.cover}
            resizeMode="cover"
          />
          <View style={s.coverOverlay} />
          {/* Gradient bars decoration */}
          <View style={s.coverTickerBar}>
            {['BTC +2.4%', 'ETH +1.8%', 'BIST +0.7%', 'XAU +0.4%', 'SOL -0.6%'].map((t, i) => (
              <Text key={i} style={s.coverTickerItem}>{t}</Text>
            ))}
          </View>
          <View style={s.coverActions}>
            <Pressable style={s.coverBtn} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={19} color="#FFF" />
            </Pressable>
            <Pressable style={s.coverBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={19} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* ══ IDENTITY BLOCK ══ */}
        <View style={s.identBlock}>
          <View style={s.avatarRing}>
            <Image
              source={{ uri: (profile as any)?.avatar_url || `https://i.pravatar.cc/200?u=${user.id}` }}
              style={s.avatar}
            />
            <View style={s.onlineDot} />
          </View>

          <View style={s.nameArea}>
            <View style={s.nameRow}>
              <Text style={s.displayName}>{profile?.full_name ?? user.name ?? 'Marketly Kullanıcısı'}</Text>
              {profile?.verified && (
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark" size={9} color="#FFF" />
                </View>
              )}
              <View style={[s.proBadge, { backgroundColor: tierColor + '28', borderColor: tierColor + '50' }]}>
                <Text style={[s.proTxt, { color: tierColor }]}>{tierLabel.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={s.handle}>@{profile?.username ?? (user.email ?? '').split('@')[0]}</Text>
            <Text style={s.bio} numberOfLines={2}>
              {(profile as any)?.bio || '💼 Marketly kullanıcısı · Profili düzenle →'}
            </Text>
          </View>
        </View>

        {/* ══ EDIT / SHARE BTNS ══ */}
        <View style={s.actionRow}>
          <Pressable style={s.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil-outline" size={14} color={colors.text} />
            <Text style={s.editBtnTxt}>Profili Düzenle</Text>
          </Pressable>
          <Pressable style={s.shareBtn}>
            <Ionicons name="share-social-outline" size={14} color={colors.text} />
          </Pressable>
          <Pressable style={s.shareBtn}>
            <Ionicons name="link-outline" size={14} color={colors.text} />
          </Pressable>
        </View>

        {/* ══ SOCIAL STATS ══ */}
        <View style={s.socialStats}>
          {[
            { val: followersCount > 999 ? `${(followersCount/1000).toFixed(1)}K` : String(followersCount), lbl: 'Takipçi' },
            { val: followingCount > 999 ? `${(followingCount/1000).toFixed(1)}K` : String(followingCount), lbl: 'Takip' },
            { val: String(posts.filter(p => p.user_id === user?.id).length), lbl: 'Gönderi' },
            ...(((profile as any)?.signal_accuracy ?? 0) > 0
              ? [{ val: `${((profile as any).signal_accuracy as number).toFixed(1)}%`, lbl: 'Doğruluk' }]
              : []),
          ].map((st, i) => (
            <React.Fragment key={st.lbl}>
              {i > 0 && <View style={s.statsDivider} />}
              <Pressable style={s.statItem}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        {/* ══ BADGES ══ */}
        <View style={{ marginBottom: 10 }}>
          <BadgesRow earnedIds={earnedBadges} compact />
        </View>

        {/* ══ ANALYST STAT CARD ══ */}
        <AnalystStatCard winRate={82} total={248} followers="2.4K" following="318" />

        {/* ══ CONTENT TABS ══ */}
        <View style={s.tabsBar}>
          {PROFILE_TABS.map((t) => (
            <Pressable key={t} style={s.tabItem} onPress={() => setActiveTab(t)}>
              <Text style={[s.tabTxt, activeTab === t && s.tabTxtActive]}>{t}</Text>
              {activeTab === t && <View style={s.tabUnderline} />}
            </Pressable>
          ))}
        </View>

        {/* ══ TAB CONTENT ══ */}
        <View style={s.tabContent}>
          {activeTab === 'Videolar' && (
            <>
              {/* Gönderi oluştur butonu */}
              <Pressable style={s.profileComposeBtn} onPress={() => setShowPostModal(true)}>
                <Ionicons name="create-outline" size={15} color={colors.primary} />
                <Text style={s.profileComposeTxt}>Gönderi Paylaş</Text>
              </Pressable>
              {/* Kendi postları */}
              {posts.filter(p => p.user_id === user?.id).length > 0 ? (
                posts.filter(p => p.user_id === user?.id).map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={toggleLike}
                    onDelete={deletePost}
                  />
                ))
              ) : (
                <ContentGrid />
              )}
            </>
          )}
          {activeTab === 'Sinyaller' && (
            <View style={{ paddingTop: 10 }}>
              {mySignals.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="analytics-outline" size={40} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 14 }}>Henüz sinyal paylaşmadınız</Text>
                </View>
              ) : (
                mySignals.map((sig) => (
                  <SignalCard key={sig.id} signal={sig as any} />
                ))
              )}
            </View>
          )}
          {activeTab === 'Portföy' && <PortfolioTab />}
          {activeTab === 'İstatistikler' && <StatsTab />}
        </View>

      </ScrollView>

      <CreatePostModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={async (content, tag) => {
          return await createPost(content, tag);
        }}
      />
    </View>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Cover
  coverWrap: { height: COVER_H, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },
  coverTickerBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 16, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  coverTickerItem: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  coverActions: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', gap: 8,
  },
  coverBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.40)', alignItems: 'center', justifyContent: 'center',
  },

  // Identity
  identBlock: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, marginTop: -(AVATAR_SIZE / 2 - 4),
    marginBottom: 12, gap: 12,
  },
  avatarRing: {
    borderWidth: 3, borderColor: colors.bgPure,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: colors.bgPure, position: 'relative',
    ...shadow.sm,
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 13, height: 13, borderRadius: 6.5,
    backgroundColor: colors.rise, borderWidth: 2, borderColor: colors.bgPure,
  },
  nameArea: { flex: 1, paddingTop: AVATAR_SIZE / 2 + 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  displayName: { fontSize: 18, fontWeight: '900', color: colors.text },
  verifiedBadge: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center',
  },
  proBadge: {
    backgroundColor: '#FF9500', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  proTxt: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  handle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  bio: { fontSize: 12.5, color: colors.textSub, marginTop: 5, lineHeight: 18 },

  // Action btns
  actionRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginBottom: 14,
  },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: radius.md,
    backgroundColor: colors.bgPure, borderWidth: 1.5, borderColor: colors.border,
  },
  editBtnTxt: { fontSize: 13, fontWeight: '700', color: colors.text },
  shareBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.bgPure, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Social stats
  socialStats: {
    flexDirection: 'row', backgroundColor: colors.bgPure,
    marginHorizontal: 14, borderRadius: radius.md,
    marginBottom: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statsDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  statVal: { fontSize: 17, fontWeight: '900', color: colors.text },
  statLbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  // Badges
  badgesRow: { paddingHorizontal: 14, gap: 8, marginBottom: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5,
    backgroundColor: colors.bgPure, ...shadow.sm,
  },
  badgeIcon: { fontSize: 13 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },

  // Tabs
  tabsBar: {
    flexDirection: 'row', backgroundColor: colors.bgPure,
    borderTopWidth: 1, borderTopColor: colors.border,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 13, position: 'relative' },
  tabTxt: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  tabTxtActive: { color: colors.text, fontWeight: '800' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%',
    height: 2.5, backgroundColor: colors.primary, borderRadius: 2,
  },
  tabContent: { paddingTop: 10 },

  profileComposeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, padding: 12,
    backgroundColor: colors.primaryLight, borderRadius: 12,
    borderWidth: 1, borderColor: colors.primary + '40',
  },
  profileComposeTxt: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
