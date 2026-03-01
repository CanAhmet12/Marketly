import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, ScrollView, StyleSheet, Text, Animated,
  Pressable, Image, Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { FeaturedVideoCard, HorizontalVideoCard, SavingsCard } from '../components/VideoCard';
import { SignalCard } from '../components/SignalCard';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { useAuth } from '../contexts/AuthContext';
import { useTabBar } from '../contexts/TabBarContext';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { usePosts } from '../hooks/usePosts';
import { useVideos } from '../hooks/useVideos';
import { useSignals } from '../hooks/useSignals';
import { useFollow } from '../hooks/useFollow';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import { colors, radius, shadow } from '../constants/theme';

const { width: W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type FeedTab = 'Senin İçin' | 'Sinyaller' | 'Takip' | 'CANLI';
const FEED_TABS: FeedTab[] = ['Senin İçin', 'Sinyaller', 'Takip', 'CANLI'];

// ─── Market Ticker ────────────────────────────────────────────────────────────
const TICKER_W = 132;

const FALLBACK_ITEMS = [
  { sym: 'BTC',   price: '$64,280', change: '+2.4%',  up: true  },
  { sym: 'ETH',   price: '$3,185',  change: '+1.8%',  up: true  },
  { sym: 'SOL',   price: '$142.5',  change: '-0.6%',  up: false },
  { sym: 'BNB',   price: '$412',    change: '+0.9%',  up: true  },
  { sym: 'XRP',   price: '$0.624',  change: '-1.2%',  up: false },
  { sym: 'DOGE',  price: '$0.158',  change: '-2.0%',  up: false },
  { sym: 'DOLAR', price: '₺32.44',  change: '-0.3%',  up: false },
  { sym: 'XAU',   price: '$2,356',  change: '+0.4%',  up: true  },
];

function fmtTickerPrice(price: number, id: string): string {
  const tryPairs = ['USDTRY', 'EURTRY', 'GBPTRY'];
  if (tryPairs.includes(id.toUpperCase())) return `${price.toFixed(2)} ₺`;
  if (price >= 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 100)   return `$${price.toFixed(1)}`;
  if (price >= 1)     return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function MarketTicker() {
  const { allAssets } = useMarketPrices();
  const tx       = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  const liveItems = useMemo(() => {
    if (!allAssets || allAssets.length === 0) return FALLBACK_ITEMS;
    return allAssets.slice(0, 10).map(a => ({
      sym:    a.symbol,
      price:  fmtTickerPrice(a.price, a.id),
      change: `${a.change_percent >= 0 ? '+' : ''}${a.change_percent.toFixed(1)}%`,
      up:     a.change_percent >= 0,
    }));
  }, [allAssets]);

  const total = liveItems.length * TICKER_W;
  const items = [...liveItems, ...liveItems, ...liveItems];

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(tx, { toValue: -total, duration: total * 30, useNativeDriver: true })
    );
    anim.start();
    // Pulse the live dot
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.8, duration: 700, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => { anim.stop(); pulse.stop(); };
  }, []);

  return (
    <View style={tk.root}>
      {/* Left fade */}
      <View style={[tk.fade, tk.fadeLeft]} />

      {/* Live tag */}
      <View style={tk.liveWrap}>
        <Animated.View style={[tk.liveDot, { transform: [{ scale: dotPulse }] }]} />
        <Text style={tk.liveTxt}>CANLI</Text>
      </View>
      <View style={tk.sep} />

      <View style={tk.overflow}>
        <Animated.View style={[tk.track, { transform: [{ translateX: tx }] }]}>
          {items.map((item, i) => (
            <View key={`${item.sym}-${i}`} style={tk.item}>
              <Text style={tk.sym}>{item.sym}</Text>
              <Text style={tk.price}>{item.price}</Text>
              <View style={[tk.pill, { backgroundColor: item.up ? 'rgba(0,200,83,0.15)' : 'rgba(255,59,59,0.15)' }]}>
                <Text style={[tk.change, { color: item.up ? '#00E676' : '#FF6B6B' }]}>
                  {item.up ? '▲' : '▼'} {item.change}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Right fade */}
      <View style={[tk.fade, tk.fadeRight]} />
    </View>
  );
}

const tk = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0C0C17', height: 38, overflow: 'hidden',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  fade: {
    position: 'absolute', top: 0, bottom: 0, width: 28, zIndex: 3,
  },
  fadeLeft: { left: 66 },
  fadeRight: { right: 0 },
  liveWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, zIndex: 2,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF3B3B' },
  liveTxt: { fontSize: 8.5, fontWeight: '900', color: '#FF3B3B', letterSpacing: 1.5 },
  sep: { width: StyleSheet.hairlineWidth, height: 16, backgroundColor: 'rgba(255,255,255,0.12)' },
  overflow: { flex: 1, overflow: 'hidden' },
  track: { flexDirection: 'row', alignItems: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, paddingHorizontal: 8, width: TICKER_W,
  },
  sym: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  price: { fontSize: 9.5, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  pill: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5 },
  change: { fontSize: 9, fontWeight: '800' },
});

// ─── Stories / Highlights row ─────────────────────────────────────────────────
const ASSET_STORIES = [
  { id: 'as_btc',  label: 'BTC',    color: '#F7931A', icon: 'logo-bitcoin' },
  { id: 'as_xau',  label: 'Altın',  color: '#D4AF37', icon: 'star' },
  { id: 'as_bist', label: 'BIST',   color: '#E81F2A', icon: 'trending-up' },
];

function StoriesRow({ onShortsPress, userId }: { onShortsPress: () => void; userId?: string }) {
  const navigation = useNavigation<any>();
  const { allAssets } = useMarketPrices();
  const [followingUsers, setFollowingUsers] = useState<{ id: string; username: string; avatar_url: string | null }[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .limit(6)
      .then(async ({ data }) => {
        if (!data || data.length === 0) return;
        const ids = data.map((r: any) => r.following_id);
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', ids);
        setFollowingUsers(profs ?? []);
      });
  }, [userId]);

  // Takip edilen kullanıcıları story olarak göster
  const followStories = followingUsers.map((f) => ({
    id:     f.id,
    type:   'creator' as const,
    label:  f.username || 'Kullanıcı',
    avatar: f.avatar_url || `https://i.pravatar.cc/80?u=${f.id}`,
    live:   false,
    up:     true,
  }));

  // Canlı piyasa fiyatlarından asset stories oluştur
  const assetStories = ASSET_STORIES.map((a) => {
    const live = allAssets.find(x => x.symbol === a.label || x.id.toUpperCase() === a.label);
    const pct  = live ? live.change_percent : 0;
    return { ...a, type: 'asset' as const, change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, up: pct >= 0 };
  });

  const allStories = [
    { id: 'sh1', type: 'shorts' as const, label: 'Shorts', color: '#FF3B3B', icon: 'play' },
    ...followStories,
    ...assetStories,
  ];

  return (
    <View style={st.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.scroll}
      >
        {allStories.map((s) => {
          const ringColor = s.type === 'creator'
            ? '#00C853'
            : s.type === 'shorts' ? '#FF3B3B' : ((s as any).up ? '#00C853' : '#FF3B3B');

          return (
            <Pressable
              key={s.id}
              style={st.item}
              onPress={
                s.type === 'shorts' ? onShortsPress
                : s.type === 'creator' ? () => navigation.navigate('ProfileView', { userId: s.id, username: (s as any).label })
                : s.type === 'asset' ? () => {
                    const live = allAssets.find(x => x.symbol === (s as any).label || x.id.toUpperCase() === (s as any).label);
                    if (live) {
                      const { liveToMarketAsset } = require('../services/marketService');
                      navigation.navigate('AssetDetail', { asset: liveToMarketAsset(live) });
                    } else {
                      navigation.navigate('Search');
                    }
                  }
                : undefined
              }
            >
              <View style={[st.ring, { borderColor: ringColor }]}>
                {s.type === 'creator' && (s as any).avatar ? (
                  <Image source={{ uri: (s as any).avatar }} style={st.avatar} />
                ) : (
                  <View style={[st.iconCircle, { backgroundColor: ringColor + '20' }]}>
                    <Ionicons
                      name={(s.type === 'shorts' ? 'play' : ((s as any).icon ?? 'trending-up')) as any}
                      size={20}
                      color={ringColor}
                    />
                  </View>
                )}
                {s.type === 'creator' && (s as any).live && (
                  <View style={st.liveBadge}><Text style={st.liveTxt}>CANLI</Text></View>
                )}
              </View>
              <Text style={st.label} numberOfLines={1}>{s.label}</Text>
              {(s as any).change && (
                <View style={[st.changePill, { backgroundColor: (s as any).up ? 'rgba(0,200,83,0.12)' : 'rgba(255,59,59,0.12)' }]}>
                  <Text style={[st.changeTxt, { color: (s as any).up ? '#00C853' : '#FF3B3B' }]}>{(s as any).change}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    paddingVertical: 10,
  },
  scroll: { paddingHorizontal: 14, gap: 16 },
  item: { alignItems: 'center', gap: 5, width: 62 },
  ring: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2.5, padding: 2,
    position: 'relative',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  iconCircle: {
    width: '100%', height: '100%', borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute', bottom: -6, left: '50%', marginLeft: -14,
    backgroundColor: '#FF3B3B', borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1.5,
    borderWidth: 1.5, borderColor: '#FFF',
  },
  liveTxt: { fontSize: 7, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  label: {
    fontSize: 10, fontWeight: '700', color: '#1A1A2E',
    textAlign: 'center', maxWidth: 62,
  },
  changePill: {
    borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2,
  },
  changeTxt: { fontSize: 9, fontWeight: '800' },
});

// ─── Feed Tab Bar ─────────────────────────────────────────────────────────────
function FeedTabBar({ active, onChange }: { active: FeedTab; onChange: (t: FeedTab) => void }) {
  return (
    <View style={ftb.wrap}>
      {FEED_TABS.map((t) => {
        const isActive = t === active;
        const isLive   = t === 'CANLI';
        return (
          <Pressable
            key={t}
            style={ftb.tab}
            onPress={() => onChange(t)}
          >
            <View style={ftb.tabInner}>
              {isLive && (
                <View style={[ftb.liveDot, isActive && ftb.liveDotActive]} />
              )}
              <Text style={[
                ftb.txt,
                isActive && ftb.txtActive,
                isLive && !isActive && ftb.txtLive,
              ]}>
                {t}
              </Text>
            </View>
            {isActive && (
              <View style={[ftb.underline, isLive && ftb.underlineLive]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const ftb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    position: 'relative',
  },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,59,59,0.4)' },
  liveDotActive: { backgroundColor: '#FF3B3B' },
  txt: { fontSize: 13, fontWeight: '600', color: '#9AA0AF', letterSpacing: 0.1 },
  txtActive: { color: '#0F0F1A', fontWeight: '800' },
  txtLive: { color: '#FF3B3B', fontWeight: '700' },
  underline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, borderRadius: 2,
    backgroundColor: colors.primary,
  },
  underlineLive: { backgroundColor: '#FF3B3B' },
});

// ─── Heights ──────────────────────────────────────────────────────────────────
const HEADER_H  = 54;   // Header paddingVertical:8*2 + content
const TABAR_H   = 42;   // FeedTabBar paddingVertical:10*2 + text
const TOPBAR_H  = HEADER_H + TABAR_H;

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigation      = useNavigation<any>();
  const safeInsets      = useSafeAreaInsets();
  const { hideTabBar, showTabBar, resetTabBar } = useTabBar();
  const { user } = useAuth();

  const [feedTab, setFeedTab] = useState<FeedTab>('Senin İçin');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const feedMode = feedTab === 'Takip' ? 'following' : 'all';
  const { posts, loading: postsLoading, toggleLike, deletePost, createPost, refresh: refreshPosts } = usePosts(undefined, feedMode);

  // Gerçek video ve sinyal verileri
  const { videos: liveVideos, loading: videosLoading, refetch: refetchVideos } = useVideos({ type: feedTab === 'CANLI' ? 'live' : 'all' });
  const { signals: liveSignals, loading: signalsLoading, refetch: refetchSignals } = useSignals({ activeOnly: true });
  const { unreadCount: notifCount } = useNotifications();

  const displayVideos = liveVideos;

  // ── "Senin İçin" popülerlik algoritması (HackerNews skoru) ──────────────────
  const forYouPosts = useMemo(() => {
    if (feedTab !== 'Senin İçin' || posts.length === 0) return posts;
    const score = (p: typeof posts[0]) => {
      const ageHours = (Date.now() - new Date(p.created_at).getTime()) / 3_600_000;
      const gravity  = 1.8;
      // Beğeni * 2 + Yorum * 3 — zaman azaltma ile
      return (p.likes * 2 + p.comments * 3 + 1) / Math.pow(ageHours + 2, gravity);
    };
    return [...posts].sort((a, b) => score(b) - score(a));
  }, [posts, feedTab]);

  const displaySignals = liveSignals.map(s => ({
    id:           s.id,
    asset_id:     s.asset_id,
    symbol:       s.symbol,
    direction:    s.direction as 'BUY' | 'SELL' | 'HOLD',
    confidence:   s.confidence,
    entry_price:  s.entry_price  ?? null,
    target_price: s.target_price ?? null,
    stop_loss:    s.stop_loss    ?? null,
    timeframe:    s.timeframe,
    rationale:    s.rationale    ?? null,
    copies_count: s.copies_count,
    likes_count:  s.likes_count,
    creator:      { name: s.creator.name, avatar: s.creator.avatar, accuracy: s.creator.accuracy, verified: s.creator.verified },
    isNew:        true,
    created_at:   s.created_at,
  }));

  // Show tab bar when screen comes into focus
  useFocusEffect(useCallback(() => {
    showTabBar();
    resetTabBar();
  }, [showTabBar, resetTabBar]));

  // ── Scroll-driven header animation ──
  const scrollY      = useRef(new Animated.Value(0)).current;
  const lastScrollY  = useRef(0);
  const topInset     = safeInsets.top;
  const totalTopH    = topInset + TOPBAR_H;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, totalTopH],
    outputRange: [0, -totalTopH],
    extrapolate: 'clamp',
  });

  // Reset on focus
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetTabBar();
    scrollY.setValue(0);
    await Promise.all([refreshPosts(), refetchVideos(), refetchSignals()]).catch(() => {});
    setRefreshing(false);
  }, [scrollY, resetTabBar, refreshPosts, refetchVideos]);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - lastScrollY.current;
    if (diff > 8 && y > totalTopH) {
      hideTabBar();
    } else if (diff < -8 || y <= 20) {
      showTabBar();
    }
    lastScrollY.current = y;
  }, [hideTabBar, showTabBar, totalTopH]);

  const filtered = useMemo(() => {
    let list = [...displayVideos];
    if (feedTab === 'CANLI') list = list.filter((v) => v.isLive);
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedTab, displayVideos]);

  const featured = filtered.find((v) => v.isLive) || filtered[0];
  const overlays = filtered.filter((v) => v.type !== 'savings' && v.id !== featured?.id);
  const savings  = filtered.filter((v) => v.type === 'savings');
  const go = (item: typeof displayVideos[0]) => () => navigation.navigate('VideoDetail', { item });

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Animated top bar (header + feed tabs) — slides up on scroll */}
      <Animated.View
        style={[
          s.topBar,
          { paddingTop: topInset, transform: [{ translateY: headerTranslateY }], backgroundColor: colors.bgPure, borderBottomColor: colors.border },
        ]}
      >
        <Header
          hasNotification={notifCount > 0}
          notificationCount={notifCount}
          avatarUri={user?.avatar ?? `https://i.pravatar.cc/80?u=${user?.id ?? 'default'}`}
          onProfilePress={() => navigation.navigate('Profil')}
          onNotificationPress={() => navigation.navigate('Notifications')}
          onSearchPress={() => navigation.navigate('Search')}
        />
        <FeedTabBar active={feedTab} onChange={setFeedTab} />
      </Animated.View>

      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingTop: totalTopH, paddingBottom: 96 + safeInsets.bottom }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={totalTopH}
          />
        }
      >
        {/* ── Ticker & Stories at top of feed ── */}
        <MarketTicker />
        <StoriesRow onShortsPress={() => navigation.navigate('Shorts')} userId={user?.id} />

        {/* ── Gönderi yaz butonu (Senin İçin + Takip) ── */}
        {(feedTab === 'Senin İçin' || feedTab === 'Takip') && user && (
          <Pressable style={s.composeBar} onPress={() => setShowCreatePost(true)}>
            <View style={s.composeAvatar}>
              <Text style={s.composeAvatarTxt}>
                {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={s.composePlaceholder}>Piyasalar hakkında ne düşünüyorsun?</Text>
            <View style={s.composeBtn}>
              <Text style={s.composeBtnTxt}>Yaz</Text>
            </View>
          </Pressable>
        )}

        {/* ── Takip tab → gerçek Supabase postları ── */}
        {feedTab === 'Takip' && (
          <View>
            {postsLoading && posts.length === 0 ? (
              <View style={s.emptyFeed}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : posts.length === 0 ? (
              <View style={s.emptyFeed}>
                <Text style={s.emptyFeedIcon}>📭</Text>
                <Text style={s.emptyFeedTitle}>Henüz kimseyi takip etmiyorsun</Text>
                <Text style={s.emptyFeedSub}>Analistleri takip et, onların gönderileri burada görünür</Text>
                <Pressable
                  style={s.discoverBtn}
                  onPress={() => navigation.navigate('Leaderboard' as never)}
                >
                  <Ionicons name="people-outline" size={14} color="#FFF" />
                  <Text style={s.discoverBtnTxt}>Analistleri Keşfet</Text>
                </Pressable>
              </View>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={toggleLike}
                  onDelete={post.user_id === user?.id ? deletePost : undefined}
                />
              ))
            )}
          </View>
        )}

        {/* ── Senin İçin tab → Popülerlik algoritmali Supabase postları ── */}
        {feedTab === 'Senin İçin' && forYouPosts.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <View style={s.tabSectionHeader}>
              <Ionicons name="chatbubbles-outline" size={15} color={colors.primary} />
              <Text style={s.tabSectionTitle}>Topluluk Gönderileri</Text>
            </View>
            {forYouPosts.slice(0, 5).map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                onDelete={post.user_id === user?.id ? deletePost : undefined}
              />
            ))}
          </View>
        )}

        {/* ── Sinyaller tab ── */}
        {feedTab === 'Sinyaller' && (
          <View style={s.tabSection}>
            <View style={s.tabSectionHeader}>
              <Ionicons name="pulse" size={15} color={colors.primary} />
              <Text style={s.tabSectionTitle}>Güncel Sinyaller</Text>
              <View style={s.tabSectionBadge}>
                <Text style={s.tabSectionBadgeTxt}>{displaySignals.length} yeni</Text>
              </View>
            </View>
            {signalsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              (displaySignals as any[]).map((sig: any) => (
                <SignalCard key={sig.id} signal={sig} />
              ))
            )}
          </View>
        )}

        {/* ── Video feed ── */}
        {feedTab !== 'Sinyaller' && (
          <>
            {/* Featured card — full width, no horizontal padding */}
            {featured && (
              <View style={s.featuredWrap}>
                <FeaturedVideoCard item={featured} onPress={go(featured)} />
              </View>
            )}

            {/* Feed items — videos with inline signals */}
            <View style={s.feedList}>
              {overlays.map((item, i) => (
                <React.Fragment key={item.id}>
                  <HorizontalVideoCard item={item} onPress={go(item)} />
                  {(i + 1) % 3 === 0 && displaySignals[Math.floor(i / 3)] && (
                    <View style={s.inlineSignal}>
                      <View style={s.inlineSignalLabel}>
                        <View style={s.inlineSignalDot} />
                        <Text style={s.inlineSignalTxt}>Trend Sinyal</Text>
                      </View>
                      <SignalCard signal={displaySignals[Math.floor(i / 3)] as any} />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Trader cards */}
            {savings.length > 0 && (
              <>
                <View style={s.sectionDivider}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerTxt}>Trend Analistler</Text>
                  <View style={s.dividerLine} />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.tradersScroll}
                >
                  {savings.map((item) => (
                    <View key={item.id} style={s.traderCard}>
                      <SavingsCard item={item} onPress={go(item)} />
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </>
        )}
      </Animated.ScrollView>

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={async (content, tag) => {
          const ok = await createPost(content, tag);
          if (ok) refreshPosts();
          return ok;
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F7FB' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 4,
  },
  scroll: { flex: 1 },
  content: {},

  tabSection: { paddingTop: 6 },
  tabSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  tabSectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F0F1A', flex: 1 },
  tabSectionBadge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  tabSectionBadgeTxt: { fontSize: 11, fontWeight: '800', color: colors.primary },

  featuredWrap: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4 },

  feedList: { paddingHorizontal: 14, paddingTop: 8, gap: 10 },
  inlineSignal: { marginTop: 4 },
  inlineSignalLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 6, paddingHorizontal: 2,
  },
  inlineSignalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  inlineSignalTxt: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.10)' },
  dividerTxt: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  tradersScroll: { paddingHorizontal: 14, gap: 10, paddingBottom: 4 },
  traderCard: { width: 160 },

  composeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bgPure, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
  },
  composeAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  composeAvatarTxt: { fontSize: 14, fontWeight: '800', color: colors.textMuted },
  composePlaceholder: { flex: 1, fontSize: 14, color: colors.textMuted },
  composeBtn: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  composeBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },

  emptyFeed: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyFeedIcon:  { fontSize: 44 },
  emptyFeedTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyFeedSub:   { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 30 },

  discoverBtn:    {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 24, marginTop: 8,
  },
  discoverBtnTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
});
