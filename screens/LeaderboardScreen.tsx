import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Image, Animated, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { radius, shadow, colors } from '../constants/theme';

const { width: W } = Dimensions.get('window');

type LBTab = 'Analistler' | 'Sinyaller' | 'Kazananlar';
const LB_TABS: LBTab[] = ['Analistler', 'Sinyaller', 'Kazananlar'];

// ─── Mock data (gerçek Supabase sorgusuna hazır yapı) ─────────────────────────
const TOP_ANALYSTS = [
  { rank: 1,  id: 'a1', name: 'CryptoGuru',   handle: '@cryptoguru',   avatar: 'https://i.pravatar.cc/80?u=cg1', accuracy: 91.2, signals: 247, followers: '48.2K', gain: '+284%', tier: 'elite',  verified: true,  badge: '🏆' },
  { rank: 2,  id: 'a2', name: 'BorsaMaster',  handle: '@borsam',       avatar: 'https://i.pravatar.cc/80?u=bm2', accuracy: 87.4, signals: 183, followers: '31.7K', gain: '+196%', tier: 'pro',    verified: true,  badge: '🥈' },
  { rank: 3,  id: 'a3', name: 'FXWizard',     handle: '@fxwizard',     avatar: 'https://i.pravatar.cc/80?u=fw3', accuracy: 84.9, signals: 156, followers: '22.4K', gain: '+162%', tier: 'pro',    verified: true,  badge: '🥉' },
  { rank: 4,  id: 'a4', name: 'TechTrader',   handle: '@techtrader',   avatar: 'https://i.pravatar.cc/80?u=tt4', accuracy: 82.3, signals: 201, followers: '18.9K', gain: '+138%', tier: 'pro',    verified: false, badge: '' },
  { rank: 5,  id: 'a5', name: 'DeFiHunter',   handle: '@defihunter',   avatar: 'https://i.pravatar.cc/80?u=dh5', accuracy: 79.8, signals: 134, followers: '15.3K', gain: '+121%', tier: 'pro',    verified: false, badge: '' },
  { rank: 6,  id: 'a6', name: 'GoldAnalyst',  handle: '@goldanalyst',  avatar: 'https://i.pravatar.cc/80?u=ga6', accuracy: 77.1, signals: 98,  followers: '11.2K', gain: '+98%',  tier: 'free',   verified: false, badge: '' },
  { rank: 7,  id: 'a7', name: 'StockHunter',  handle: '@stockhunter',  avatar: 'https://i.pravatar.cc/80?u=sh7', accuracy: 75.6, signals: 112, followers: '8.7K',  gain: '+87%',  tier: 'free',   verified: false, badge: '' },
  { rank: 8,  id: 'a8', name: 'CoinScout',    handle: '@coinscout',    avatar: 'https://i.pravatar.cc/80?u=cs8', accuracy: 73.2, signals: 89,  followers: '6.4K',  gain: '+72%',  tier: 'free',   verified: false, badge: '' },
];

const TOP_SIGNALS = [
  { rank: 1, analyst: 'CryptoGuru',  asset: 'SOL', dir: 'AL',  gain: '+68.4%', copies: 1284, time: '12 gün önce', color: '#9945FF', badge: '🔥' },
  { rank: 2, analyst: 'FXWizard',    asset: 'EUR/USD', dir: 'SAT', gain: '+31.2%', copies: 892, time: '5 gün önce',  color: '#1A73E8', badge: '⚡' },
  { rank: 3, analyst: 'BorsaMaster', asset: 'NVDA', dir: 'AL',  gain: '+44.7%', copies: 741, time: '18 gün önce', color: '#76B900', badge: '📈' },
  { rank: 4, analyst: 'TechTrader',  asset: 'BTC',  dir: 'AL',  gain: '+28.9%', copies: 623, time: '8 gün önce',  color: '#F7931A', badge: '' },
  { rank: 5, analyst: 'DeFiHunter',  asset: 'MATIC',dir: 'AL',  gain: '+52.3%', copies: 487, time: '22 gün önce', color: '#8247E5', badge: '' },
];

const TOP_GAINERS = [
  { rank: 1, name: 'MehmetK',    handle: '@mehmetk',    avatar: 'https://i.pravatar.cc/80?u=mk1', gain: '+342%', value: '$48.2K', badge: '🏆' },
  { rank: 2, name: 'AliTrader',  handle: '@alitrd',     avatar: 'https://i.pravatar.cc/80?u=at2', gain: '+287%', value: '$31.7K', badge: '🥈' },
  { rank: 3, name: 'YildizFX',   handle: '@yildizfx',   avatar: 'https://i.pravatar.cc/80?u=yx3', gain: '+213%', value: '$22.1K', badge: '🥉' },
  { rank: 4, name: 'KriptoAslan',handle: '@kraslan',    avatar: 'https://i.pravatar.cc/80?u=ka4', gain: '+178%', value: '$18.5K', badge: '' },
  { rank: 5, name: 'BorsaUzman', handle: '@borsauzm',   avatar: 'https://i.pravatar.cc/80?u=bu5', gain: '+156%', value: '$14.9K', badge: '' },
];

// ─── Podium bileşeni (ilk 3 için) ────────────────────────────────────────────
function Podium({ data }: { data: { rank: number; id: string; name: string; avatar: string; accuracy: number; verified: boolean; badge: string; tier?: string }[] }) {
  const top3   = data.slice(0, 3);
  const order  = [top3[1], top3[0], top3[2]]; // 2-1-3 dizisi
  const heights = [80, 100, 64];
  const scaleAnim = useRef(top3.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(150, scaleAnim.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 140 })
    )).start();
  }, []);

  return (
    <View style={pd.wrap}>
      {order.map((analyst, i) => {
        const realRank = analyst.rank;
        const height   = heights[i];
        const isFirst  = realRank === 1;
        const scaleIdx = realRank - 1;
        return (
          <Animated.View
            key={analyst.id}
            style={[pd.item, { transform: [{ scale: scaleAnim[scaleIdx] }] }]}
          >
            {/* Crown for #1 */}
            {isFirst && <Text style={pd.crown}>👑</Text>}

            <Image source={{ uri: analyst.avatar }} style={[pd.avatar, isFirst && pd.avatarFirst]} />
            {analyst.verified && (
              <View style={pd.verifyBadge}>
                <Ionicons name="checkmark" size={8} color="#fff" />
              </View>
            )}

            <Text style={pd.name} numberOfLines={1}>{analyst.name}</Text>
            <Text style={pd.accuracy}>{analyst.accuracy}%</Text>

            {/* Podium bar */}
            <LinearGradient
              colors={isFirst ? ['#FFB800','#FF9500'] : realRank === 2 ? ['#9AA0AF','#6B7280'] : ['#CD7F32','#A0522D']}
              style={[pd.bar, { height }]}
            >
              <Text style={pd.rankNum}>{analyst.badge || `#${realRank}`}</Text>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function LeaderboardScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<LBTab>('Analistler');
  const [refreshing, setRefreshing] = useState(false);

  const { analysts, topSignals, gainers, loading, refetch } = useLeaderboard();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#0A0A1A', '#0D1633']} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>🏆 Liderboard</Text>
          <Text style={s.headerSub}>Bu haftanın en iyileri</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* Tabs */}
      <View style={s.tabRow}>
        {LB_TABS.map(t => (
          <Pressable key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {loading && analysts.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* ── Analistler ── */}
        {tab === 'Analistler' && (
          <>
            <Podium data={analysts.slice(0, 3)} />
            <Text style={s.sectionTitle}>Tüm Sıralama</Text>
            {analysts.slice(3).map(a => (
              <AnalystRow key={a.id} analyst={a} />
            ))}
          </>
        )}

        {/* ── Top Sinyaller ── */}
        {tab === 'Sinyaller' && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 16 }]}>Bu Haftanın Sinyalleri</Text>
            {topSignals.map(sig => (
              <SignalRow key={sig.id} signal={sig} />
            ))}
          </>
        )}

        {/* ── Kazananlar ── */}
        {tab === 'Kazananlar' && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 16 }]}>Bu Haftanın Kazananları</Text>
            {gainers.map(g => (
              <GainerRow key={g.id} gainer={g} />
            ))}
            <View style={s.rewardBox}>
              <Text style={s.rewardTitle}>🎁 Haftalık Ödüller</Text>
              <Text style={s.rewardItem}>🥇 1. → 1 Ay Marketly Pro</Text>
              <Text style={s.rewardItem}>🥈 2-3. → 3.000 MarketCoin</Text>
              <Text style={s.rewardItem}>🏅 Top 10 → "Haftalık Şampiyon" rozeti</Text>
            </View>
          </>
        )}
      </ScrollView>
      )}
    </View>
  );
}

// ─── Alt bileşenler ───────────────────────────────────────────────────────────
function AnalystRow({ analyst: a }: { analyst: { rank: number; id: string; name: string; handle: string; avatar: string; accuracy: number; signals: number; followers: string; tier: string; verified: boolean } }) {
  const navigation = useNavigation<any>();
  const tierColor = a.tier === 'elite' ? '#FFD700' : a.tier === 'pro' ? '#007AFF' : '#9AA0AF';
  return (
    <Pressable style={s.analystRow} onPress={() => navigation.navigate('ProfileView', { userId: a.id, username: a.handle })}>
      <Text style={s.rowRank}>#{a.rank}</Text>
      <Image source={{ uri: a.avatar }} style={s.rowAvatar} />
      <View style={s.rowInfo}>
        <View style={s.rowNameRow}>
          <Text style={s.rowName}>{a.name}</Text>
          {a.verified && <Ionicons name="checkmark-circle" size={13} color="#007AFF" />}
          <View style={[s.tierBadge, { backgroundColor: tierColor + '22' }]}>
            <Text style={[s.tierTxt, { color: tierColor }]}>{a.tier.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={s.rowHandle}>{a.handle} · {a.signals} sinyal</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={s.rowAccuracy}>{a.accuracy}%</Text>
        <Text style={s.rowFollowers}>{a.followers}</Text>
      </View>
    </Pressable>
  );
}

function SignalRow({ signal: sig }: { signal: { id: string; rank: number; analystName: string; analystId: string; symbol: string; direction: string; gain: string; copies: number; timeAgo: string; color: string; badge: string } }) {
  return (
    <View style={s.signalRow}>
      <Text style={s.rowRankLg}>{sig.badge || `#${sig.rank}`}</Text>
      <View style={[s.sigAsset, { backgroundColor: sig.color + '20' }]}>
        <Text style={[s.sigAssetTxt, { color: sig.color }]}>{sig.symbol}</Text>
      </View>
      <View style={s.rowInfo}>
        <View style={s.rowNameRow}>
          <View style={[s.dirPill, { backgroundColor: sig.direction === 'AL' ? '#34C75922' : '#FF3B3B22' }]}>
            <Text style={[s.dirTxt, { color: sig.direction === 'AL' ? '#34C759' : '#FF3B3B' }]}>{sig.direction}</Text>
          </View>
          <Text style={s.rowName}>{sig.analystName}</Text>
        </View>
        <Text style={s.rowHandle}>{sig.copies} kopya · {sig.timeAgo}</Text>
      </View>
      <Text style={[s.sigGain, { color: '#34C759' }]}>{sig.gain}</Text>
    </View>
  );
}

function GainerRow({ gainer: g }: { gainer: { rank: number; id: string; name: string; handle: string; avatar: string; gain: string; value: string; badge: string } }) {
  const navigation = useNavigation<any>();
  return (
    <Pressable style={s.analystRow} onPress={() => navigation.navigate('ProfileView', { userId: g.id, username: g.handle })}>
      <Text style={s.rowRankLg}>{g.badge || `#${g.rank}`}</Text>
      <Image source={{ uri: g.avatar }} style={s.rowAvatar} />
      <View style={s.rowInfo}>
        <Text style={s.rowName}>{g.name}</Text>
        <Text style={s.rowHandle}>{g.handle}</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={[s.rowAccuracy, { color: '#34C759' }]}>{g.gain}</Text>
        <Text style={s.rowFollowers}>{g.value}</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  tabRow: {
    flexDirection: 'row', backgroundColor: colors.bgPure,
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    alignItems: 'center', backgroundColor: colors.bgInput,
  },
  tabBtnActive: { backgroundColor: '#007AFF' },
  tabTxt:       { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  tabTxtActive: { color: '#fff' },

  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.7,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },

  analystRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
    backgroundColor: colors.bgPure,
  },
  rowRank:   { width: 24, fontSize: 12, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  rowRankLg: { width: 28, fontSize: 16, textAlign: 'center' },
  rowAvatar: { width: 40, height: 40, borderRadius: 20 },
  rowInfo:   { flex: 1 },
  rowNameRow:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowName:   { fontSize: 14, fontWeight: '700', color: colors.text },
  rowHandle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowRight:  { alignItems: 'flex-end', gap: 2 },
  rowAccuracy:  { fontSize: 14, fontWeight: '800', color: colors.text },
  rowFollowers: { fontSize: 11, color: colors.textMuted },
  tierBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  tierTxt:   { fontSize: 9, fontWeight: '800' },

  signalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
    backgroundColor: colors.bgPure,
  },
  sigAsset: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  sigAssetTxt: { fontSize: 13, fontWeight: '800' },
  dirPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  dirTxt:  { fontSize: 10, fontWeight: '800' },
  sigGain: { fontSize: 14, fontWeight: '800' },

  rewardBox: {
    margin: 16, backgroundColor: colors.bgPure,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#FFB80033',
    ...shadow.sm,
  },
  rewardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 },
  rewardItem:  { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});

const pd = StyleSheet.create({
  wrap: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  crown: { fontSize: 22, marginBottom: 2 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: '#9AA0AF',
  },
  avatarFirst: { width: 64, height: 64, borderRadius: 32, borderColor: '#FFB800' },
  verifyBadge: {
    position: 'absolute', top: 36, right: 8,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.bgPure,
  },
  name:     { fontSize: 11, fontWeight: '700', color: colors.text, textAlign: 'center' },
  accuracy: { fontSize: 10, color: colors.textMuted },
  bar: {
    width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8,
  },
  rankNum: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
