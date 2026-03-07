import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, ScrollView, StyleSheet, Text, Animated,
  Pressable, Image, Dimensions, RefreshControl, ActivityIndicator, Modal, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { avatarUrl } from '../lib/avatarUrl';
import { colors, radius, shadow, font } from '../constants/theme';

const { width: W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type FeedTab = 'Senin İçin' | 'Sinyaller' | 'Takip' | 'CANLI';
const FEED_TABS: FeedTab[] = ['Senin İçin', 'Sinyaller', 'Takip', 'CANLI'];

// ─── Market Ticker ────────────────────────────────────────────────────────────
const TICKER_W = 132;

// Fallback sadece sembol isimlerini gösterir, fiyat göstermez
const FALLBACK_ITEMS = [
  { sym: 'BTC',   price: '—', change: '—',  up: true  },
  { sym: 'ETH',   price: '—', change: '—',  up: true  },
  { sym: 'SOL',   price: '—', change: '—',  up: false },
  { sym: 'BNB',   price: '—', change: '—',  up: true  },
  { sym: 'XRP',   price: '—', change: '—',  up: false },
  { sym: 'DOGE',  price: '—', change: '—',  up: false },
  { sym: 'DOLAR', price: '—', change: '—',  up: false },
  { sym: 'XAU',   price: '—', change: '—',  up: true  },
];

function fmtTickerPrice(price: number, id: string): string {
  const tryPairs = ['USDTRY', 'EURTRY', 'GBPTRY'];
  if (tryPairs.includes(id.toUpperCase())) return `${price.toFixed(2)} ₺`;
  if (price >= 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 100)   return `$${price.toFixed(1)}`;
  if (price >= 1)     return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

/** Bir fiyat ticker kaydı — fiyat değişince kısa yeşil/kırmızı flash yapar */
function TickerItemView({ sym, price, change, up }: { sym: string; price: string; change: string; up: boolean }) {
  const prevPrice = useRef(price);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prevPrice.current !== price && prevPrice.current !== '') {
      // Fiyat değişti — flash tetikle
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();
    }
    prevPrice.current = price;
  }, [price]);

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', up ? 'rgba(0,200,83,0.25)' : 'rgba(255,59,59,0.25)'],
  });

  return (
    <Animated.View style={[tk.item, { backgroundColor: flashBg }]}>
      <Text style={tk.sym}>{sym}</Text>
      <Text style={tk.price}>{price}</Text>
      <View style={[tk.pill, { backgroundColor: up ? 'rgba(0,200,83,0.15)' : 'rgba(255,59,59,0.15)' }]}>
        <Text style={[tk.change, { color: up ? '#00E676' : '#FF6B6B' }]}>
          {up ? '▲' : '▼'} {change}
        </Text>
      </View>
    </Animated.View>
  );
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
    if (total <= 0) return;
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
  }, [total]); // total değişince animasyonu yeniden başlat

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
            <TickerItemView
              key={`${item.sym}-${i}`}
              sym={item.sym}
              price={item.price}
              change={item.change}
              up={item.up}
            />
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
  liveTxt: { fontSize: 8.5, fontFamily: font.black, color: '#FF3B3B', letterSpacing: 1.5 },
  sep: { width: StyleSheet.hairlineWidth, height: 16, backgroundColor: 'rgba(255,255,255,0.12)' },
  overflow: { flex: 1, overflow: 'hidden' },
  track: { flexDirection: 'row', alignItems: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, paddingHorizontal: 8, width: TICKER_W,
  },
  sym: { fontSize: 10.5, fontFamily: font.extraBold, color: '#FFFFFF', letterSpacing: 0.3 },
  price: { fontSize: 9.5, fontFamily: font.medium, color: 'rgba(255,255,255,0.5)' },
  pill: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5 },
  change: { fontSize: 9, fontFamily: font.bold },
});

// ─── Stories / Highlights row ─────────────────────────────────────────────────
const FALLBACK_ASSET_STORIES = [
  { id: 'as_btc',  label: 'BTC',    color: '#F7931A', icon: 'logo-bitcoin' },
  { id: 'as_xau',  label: 'XAU',    color: '#D4AF37', icon: 'star' },
  { id: 'as_bist', label: 'BIST100',color: '#E81F2A', icon: 'trending-up' },
];

const ASSET_ICON_MAP: Record<string, string> = {
  BTC: 'logo-bitcoin', ETH: 'logo-ethereum', SOL: 'flash', BNB: 'star',
  XAU: 'star', BIST100: 'trending-up', USDTRY: 'swap-horizontal', AAPL: 'phone-portrait',
  NVDA: 'hardware-chip', TSLA: 'car', MSFT: 'grid',
};

const ASSET_COLOR_MAP: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
  XAU: '#D4AF37', BIST100: '#E81F2A', USDTRY: '#6B7280', AAPL: '#555',
  NVDA: '#76B900', TSLA: '#CC0000', MSFT: '#00A4EF',
};

/** Instagram-benzeri fullscreen hikaye görüntüleyici */
function StoryViewerModal({ storyUrl, username, onClose }: {
  storyUrl: string; username: string; onClose: () => void;
}) {
  const DURATION = 5000;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1, duration: DURATION, useNativeDriver: false,
    });
    anim.start(({ finished }) => { if (finished) onClose(); });
    return () => anim.stop();
  }, [storyUrl]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={sv.root}>
        {/* Arka plan */}
        <Image source={{ uri: storyUrl }} style={sv.image} resizeMode="cover" />
        <View style={sv.overlay} />

        {/* İlerleme çubuğu */}
        <View style={[sv.progressBar, { top: insets.top + 8 }]}>
          <Animated.View style={[sv.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]} />
        </View>

        {/* Kullanıcı adı + kapat */}
        <View style={[sv.header, { top: insets.top + 24 }]}>
          <View style={sv.userInfo}>
            <View style={sv.avatarDot}>
              <Text style={sv.avatarLetter}>{username?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={sv.username}>{username}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={26} color="#FFF" />
          </Pressable>
        </View>

        {/* Dokunarak geçiş */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>
    </Modal>
  );
}

const sv = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#000' },
  image:        { ...StyleSheet.absoluteFillObject },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  progressBar:  { position: 'absolute', left: 12, right: 12, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },
  header:       { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userInfo:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarDot:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 2, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  username:     { color: '#FFF', fontSize: 14, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});

function StoriesRow({ onShortsPress, userId }: { onShortsPress: () => void; userId?: string }) {
  const navigation = useNavigation<any>();
  const { allAssets } = useMarketPrices();
  const [followingUsers, setFollowingUsers] = useState<{ id: string; username: string; full_name?: string | null; avatar_url: string | null }[]>([]);
  const [myStoryUrl, setMyStoryUrl] = useState<string | null>(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [viewingStory, setViewingStory] = useState<{ url: string; username: string } | null>(null);

  // Takipçilerin hikayelerini çek
  const [followingStories, setFollowingStories] = useState<{ userId: string; username: string; imageUrl: string }[]>([]);
  useEffect(() => {
    if (!userId) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .limit(10)
      .then(async ({ data }) => {
        if (!data?.length) return;
        const ids = data.map((r: any) => r.following_id);
        const { data: stories } = await supabase
          .from('stories')
          .select('user_id, image_url, profiles!stories_user_id_fkey(username, full_name)')
          .in('user_id', ids)
          .gte('created_at', since)
          .order('created_at', { ascending: false });
        if (!stories) return;
        // Her kullanıcı için sadece en son hikayeyi al
        const seen = new Set<string>();
        const result: { userId: string; username: string; imageUrl: string }[] = [];
        for (const s of stories) {
          if (!seen.has(s.user_id)) {
            seen.add(s.user_id);
            const prof: any = s.profiles;
            result.push({
              userId:   s.user_id,
              username: prof?.username ?? prof?.full_name ?? 'Kullanıcı',
              imageUrl: s.image_url,
            });
          }
        }
        setFollowingStories(result);
      });
  }, [userId]);

  // Kendi aktif hikayesini yükle (24s içinde)
  useEffect(() => {
    if (!userId) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from('stories')
      .select('image_url')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.image_url) setMyStoryUrl(data.image_url); });
  }, [userId]);

  const handleAddStory = async () => {
    if (!userId) return;
    try {
      const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } = await import('expo-image-picker');
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      setUploadingStory(true);
      const asset = result.assets[0];
      const ext   = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${userId}/${Date.now()}.${ext}`;
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      await supabase.storage.createBucket('stories', { public: true }).catch(() => {});
      const { error: upErr } = await supabase.storage
        .from('stories')
        .upload(fileName, blob, { contentType: `image/${ext}`, upsert: true });
      if (upErr) { setUploadingStory(false); return; }
      const { data: urlData } = supabase.storage.from('stories').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      await supabase.from('stories').insert({
        user_id:    userId,
        image_url:  publicUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setMyStoryUrl(publicUrl);
    } catch { /* ignore */ } finally {
      setUploadingStory(false);
    }
  };

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
    avatar: f.avatar_url || avatarUrl(f.id, f.full_name ?? f.username),
    live:   false,
    up:     true,
  }));

  // Canlı piyasa verisinden top 4 hareketli varlığı seç
  const assetStories = useMemo(() => {
    const baseAssets = allAssets.length > 0
      ? [...allAssets].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, 4)
      : null;

    if (!baseAssets || baseAssets.length === 0) {
      return FALLBACK_ASSET_STORIES.map(a => ({
        ...a, type: 'asset' as const, change: '', up: true,
      }));
    }

    return baseAssets.map(a => ({
      id:     `as_${a.symbol.toLowerCase()}`,
      label:  a.symbol,
      color:  ASSET_COLOR_MAP[a.symbol.toUpperCase()] ?? '#007AFF',
      icon:   ASSET_ICON_MAP[a.symbol.toUpperCase()] ?? 'trending-up',
      type:   'asset' as const,
      change: `${a.change_percent >= 0 ? '+' : ''}${a.change_percent.toFixed(1)}%`,
      up:     a.change_percent >= 0,
    }));
  }, [allAssets]);

  const allStories = [
    { id: 'sh1', type: 'shorts' as const, label: 'Shorts', color: '#FF3B3B', icon: 'play' },
    ...followStories,
    ...assetStories,
  ];

  return (
  <>
    <View style={st.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.scroll}
      >
        {/* ── Kendi hikayem ── */}
        {userId && (
          <Pressable
            style={st.item}
            onPress={myStoryUrl
              ? () => setViewingStory({ url: myStoryUrl, username: 'Hikayem' })
              : handleAddStory
            }
            disabled={uploadingStory}
          >
            <View style={[st.ring, { borderColor: myStoryUrl ? colors.primary : colors.border, borderStyle: myStoryUrl ? 'solid' : 'dashed' }]}>
              {myStoryUrl ? (
                <Image source={{ uri: myStoryUrl }} style={st.avatar} />
              ) : (
                <View style={[st.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  {uploadingStory
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Ionicons name="add" size={22} color={colors.primary} />
                  }
                </View>
              )}
              {!myStoryUrl && !uploadingStory && (
                <View style={[st.liveBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={8} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={st.label} numberOfLines={1}>Hikayem</Text>
          </Pressable>
        )}

        {/* ── Takip edilen kullanıcıların hikayeleri ── */}
        {followingStories.map(fs => (
          <Pressable
            key={`story_${fs.userId}`}
            style={st.item}
            onPress={() => setViewingStory({ url: fs.imageUrl, username: fs.username })}
          >
            <View style={[st.ring, { borderColor: '#00C853' }]}>
              <Image source={{ uri: fs.imageUrl }} style={st.avatar} />
            </View>
            <Text style={st.label} numberOfLines={1}>{fs.username}</Text>
          </Pressable>
        ))}
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

    {/* Hikaye görüntüleyici modal */}
    {viewingStory && (
      <StoryViewerModal
        storyUrl={viewingStory.url}
        username={viewingStory.username}
        onClose={() => setViewingStory(null)}
      />
    )}
  </>
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
  liveTxt: { fontSize: 7, fontFamily: font.black, color: '#FFF', letterSpacing: 0.5 },
  label: {
    fontSize: 10, fontFamily: font.bold, color: colors.text,
    textAlign: 'center', maxWidth: 62,
  },
  changePill: {
    borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2,
  },
  changeTxt: { fontSize: 9, fontFamily: font.bold },
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
  txt: { fontSize: 13, fontFamily: font.semiBold, color: colors.textMuted, letterSpacing: 0.1 },
  txtActive: { color: colors.text, fontFamily: font.extraBold },
  txtLive: { color: colors.live, fontFamily: font.bold },
  underline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, borderRadius: 2,
    backgroundColor: colors.primary,
  },
  underlineLive: { backgroundColor: '#FF3B3B' },
});

// ─── Post Card Skeleton ───────────────────────────────────────────────────────
function PostCardSkeleton() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  return (
    <Animated.View style={[sk.card, { opacity }]}>
      <View style={sk.header}>
        <View style={sk.avatar} />
        <View style={sk.headerText}>
          <View style={sk.line1} />
          <View style={sk.line2} />
        </View>
      </View>
      <View style={sk.body1} />
      <View style={sk.body2} />
      <View style={sk.footer} />
    </Animated.View>
  );
}
const sk = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', marginHorizontal: 14, marginBottom: 10,
    borderRadius: radius.lg, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  header: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E8EC' },
  headerText: { flex: 1, gap: 6, justifyContent: 'center' },
  line1: { height: 12, borderRadius: 6, backgroundColor: '#E8E8EC', width: '55%' },
  line2: { height: 10, borderRadius: 5, backgroundColor: '#E8E8EC', width: '35%' },
  body1: { height: 13, borderRadius: 6, backgroundColor: '#E8E8EC', marginBottom: 8 },
  body2: { height: 13, borderRadius: 6, backgroundColor: '#E8E8EC', width: '75%', marginBottom: 16 },
  footer: { height: 10, borderRadius: 5, backgroundColor: '#E8E8EC', width: '45%' },
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
  const { posts, loading: postsLoading, hasMore: postsHasMore, loadMore: loadMorePosts, toggleLike, deletePost, createPost, refresh: refreshPosts } = usePosts(undefined, feedMode);

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

  const displaySignals = liveSignals.map(s => {
    const ageHours = (Date.now() - new Date(s.created_at).getTime()) / 3_600_000;
    return {
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
      isNew:        ageHours < 24,
      created_at:   s.created_at,
    };
  });

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

  // FAB pulse animasyonu — "Yaz" butonu için yavaş looping glow
  const fabPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fabPulse]);

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
          avatarUri={user?.avatar ?? (user?.id ? avatarUrl(user.id, user.name) : undefined)}
          onProfilePress={() => navigation.navigate('Profil')}
          onNotificationPress={() => navigation.navigate('Notifications')}
          onSearchPress={() => navigation.navigate('Search')}
        />
        <FeedTabBar active={feedTab} onChange={(tab) => {
          setFeedTab(tab);
          // H7: Sekme değişince scroll'u başa al
          try { scrollY.setValue(0); } catch {}
        }} />
      </Animated.View>

      <Animated.ScrollView
        ref={(ref: any) => {
          // H7: Sekme değişince scroll'u başa al
          if (ref) (ref as any)._scrollViewRef = ref;
        }}
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingTop: totalTopH, paddingBottom: 96 + safeInsets.bottom }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        onMomentumScrollEnd={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
          if (distanceFromBottom < 300 && postsHasMore && !postsLoading) {
            loadMorePosts();
          }
        }}
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
        {/* H6: Yumuşak renk geçişi — ticker (#0C0C17) → sayfa arka planı */}
        <View style={{
          height: 6,
          background: 'linear-gradient(#0C0C17, transparent)',
        }}>
          <LinearGradient
            colors={['#0C0C17', colors.bg]}
            style={{ height: 6 }}
          />
        </View>
        <StoriesRow onShortsPress={() => navigation.navigate('Shorts')} userId={user?.id} />

        {/* ── Gönderi yaz butonu (Senin İçin + Takip) ── */}
        {(feedTab === 'Senin İçin' || feedTab === 'Takip') && user && (
          <Pressable style={s.composeBar} onPress={() => setShowCreatePost(true)}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={s.composeAvatarImg} />
            ) : (
              <View style={s.composeAvatar}>
                <Text style={s.composeAvatarTxt}>
                  {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={s.composePlaceholder}>Piyasalar hakkında ne düşünüyorsun?</Text>
            <Animated.View style={[s.composeBtn, { transform: [{ scale: fabPulse }] }]}>
              <Text style={s.composeBtnTxt}>Yaz</Text>
            </Animated.View>
          </Pressable>
        )}

        {/* ── Takip tab → gerçek Supabase postları ── */}
        {feedTab === 'Takip' && (
          <View>
            {postsLoading && posts.length === 0 ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : posts.length === 0 ? (
              <View style={s.emptyFeed}>
                <Text style={s.emptyFeedIcon}>{followingUsers.length > 0 ? '📬' : '📭'}</Text>
                <Text style={s.emptyFeedTitle}>
                  {followingUsers.length > 0
                    ? 'Takip ettiklerinizden henüz gönderi yok'
                    : 'Henüz kimseyi takip etmiyorsun'}
                </Text>
                <Text style={s.emptyFeedSub}>
                  {followingUsers.length > 0
                    ? 'Takip ettiğin kişiler paylaşım yaptığında burada görünür'
                    : 'Analistleri takip et, onların gönderileri burada görünür'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Pressable style={s.discoverBtn} onPress={() => navigation.navigate('Leaderboard' as never)}>
                    <Ionicons name="people-outline" size={14} color="#FFF" />
                    <Text style={s.discoverBtnTxt}>Analistleri Keşfet</Text>
                  </Pressable>
                  <Pressable style={[s.discoverBtn, { backgroundColor: colors.info }]} onPress={() => navigation.navigate('Main', { screen: 'Keşfet' } as never)}>
                    <Ionicons name="compass-outline" size={14} color="#FFF" />
                    <Text style={s.discoverBtnTxt}>Keşfet</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={toggleLike}
                    onDelete={post.user_id === user?.id ? deletePost : undefined}
                    onCommentAdded={refreshPosts}
                  />
                ))}
                {postsHasMore && (
                  postsLoading
                    ? <View style={s.loadMoreBtn}><ActivityIndicator size="small" color={colors.primary} /></View>
                    : <Pressable style={s.loadMoreBtn} onPress={loadMorePosts}>
                        <Ionicons name="chevron-down" size={15} color={colors.primary} />
                        <Text style={s.loadMoreTxt}>Daha Fazla Göster</Text>
                      </Pressable>
                )}
              </>
            )}
          </View>
        )}

        {/* ── Senin İçin tab → Popülerlik algoritmali Supabase postları ── */}
        {feedTab === 'Senin İçin' && (
          <View style={{ marginTop: 8 }}>
            <View style={s.tabSectionHeader}>
              <Ionicons name="chatbubbles-outline" size={15} color={colors.primary} />
              <Text style={s.tabSectionTitle}>Topluluk Gönderileri</Text>
            </View>
            {postsLoading && forYouPosts.length === 0 ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : forYouPosts.length === 0 ? (
              <View style={s.emptyFeed}>
                <Text style={s.emptyFeedIcon}>✍️</Text>
                <Text style={s.emptyFeedTitle}>Henüz gönderi yok</Text>
                <Text style={s.emptyFeedSub}>Topluluk gönderileri burada görünecek</Text>
                <Pressable style={s.discoverBtn} onPress={() => setShowCreatePost(true)}>
                  <Ionicons name="add" size={14} color="#FFF" />
                  <Text style={s.discoverBtnTxt}>İlk Gönderiyi Sen Yaz</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {forYouPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={toggleLike}
                    onDelete={post.user_id === user?.id ? deletePost : undefined}
                    onCommentAdded={refreshPosts}
                  />
                ))}
                {postsHasMore && (
                  postsLoading
                    ? <View style={s.loadMoreBtn}><ActivityIndicator size="small" color={colors.primary} /></View>
                    : <Pressable style={s.loadMoreBtn} onPress={loadMorePosts}>
                        <Ionicons name="chevron-down" size={15} color={colors.primary} />
                        <Text style={s.loadMoreTxt}>Daha Fazla Göster</Text>
                      </Pressable>
                )}
              </>
            )}
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
            {/* CANLI boş durum */}
            {feedTab === 'CANLI' && !videosLoading && filtered.length === 0 && (
              <View style={s.emptyFeed}>
                <Text style={s.emptyFeedIcon}>📡</Text>
                <Text style={s.emptyFeedTitle}>Şu an aktif yayın yok</Text>
                <Text style={s.emptyFeedSub}>Canlı yayınlar başladığında burada görünecek</Text>
                <Pressable
                  style={s.discoverBtn}
                  onPress={() => {
                    try { navigation.navigate('Live' as never); }
                    catch { navigation.navigate('Main' as never, { screen: 'CANLI' } as never); }
                  }}
                >
                  <Ionicons name="radio-outline" size={14} color="#FFF" />
                  <Text style={s.discoverBtnTxt}>Canlı Yayınlar</Text>
                </Pressable>
              </View>
            )}

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
        onSubmit={async (content, tag, imageUrl) => {
          const ok = await createPost(content, tag, imageUrl);
          if (ok) refreshPosts();
          return ok;
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    shadowColor: '#1A2138', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  scroll: { flex: 1 },
  content: {},

  tabSection: { paddingTop: 4 },
  tabSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  tabSectionTitle: { fontSize: 15, fontFamily: font.extraBold, color: colors.text, flex: 1 },
  tabSectionBadge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  tabSectionBadgeTxt: { fontSize: 11, fontFamily: font.bold, color: colors.primary },

  featuredWrap: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 4 },

  feedList: { paddingHorizontal: 10, paddingTop: 8, gap: 8 },
  inlineSignal: { marginTop: 4 },
  inlineSignalLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 6, paddingHorizontal: 2,
  },
  inlineSignalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  inlineSignalTxt: { fontSize: 11, fontFamily: font.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, marginTop: 14, marginBottom: 8,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.10)' },
  dividerTxt: { fontSize: 11, fontFamily: font.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  tradersScroll: { paddingHorizontal: 10, gap: 8, paddingBottom: 4 },
  traderCard: { width: 156 },

  composeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bgPure, paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
  },
  composeAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  composeAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  composeAvatarTxt: { fontSize: 14, fontFamily: font.bold, color: colors.textMuted },
  composePlaceholder: { flex: 1, fontSize: 14, fontFamily: font.regular, color: colors.textMuted },
  composeBtn: {
    backgroundColor: colors.primary, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  composeBtnTxt: { color: '#fff', fontFamily: font.bold, fontSize: 13 },

  emptyFeed: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyFeedIcon:  { fontSize: 44 },
  emptyFeedIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyFeedTitle: { fontSize: 17, fontFamily: font.bold, color: colors.text },
  emptyFeedSub:   { fontSize: 13, fontFamily: font.regular, color: colors.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 30 },

  discoverBtn:    {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 24, marginTop: 8,
  },
  discoverBtnTxt: { fontSize: 14, fontFamily: font.bold, color: '#FFF' },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 10, marginVertical: 10, paddingVertical: 14,
    backgroundColor: colors.bgPure, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.divider,
  },
  loadMoreTxt: { fontSize: 14, fontFamily: font.semiBold, color: colors.primary },
});
