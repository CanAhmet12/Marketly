import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  StatusBar, Dimensions, Image, Animated,
  Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../contexts/ToastContext';
import { radius, shadow, colors } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { liveToMarketAsset } from '../services/marketService';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useVideos } from '../hooks/useVideos';
import type { MarketAsset } from '../data/mockMarkets';

const { width: W } = Dimensions.get('window');

// ─── Community Sentiment ─────────────────────────────────────────────────────
function CommunitySentiment({ symbol }: { symbol: string }) {
  const [vote, setVote] = useState<'bull' | 'bear' | null>(null);
  const [bull, setBull] = useState(50);
  const [bear, setBear] = useState(50);
  const [totalVotes, setTotalVotes] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const toast = useToast();
  const VOTE_KEY = `@sentiment_${symbol}`;

  // Supabase'den canlı sentiment verisi yükle
  useEffect(() => {
    const load = async () => {
      // 1. Kullanıcının önceki oyu (local cache)
      const saved = await AsyncStorage.getItem(VOTE_KEY);
      if (saved === 'bull' || saved === 'bear') setVote(saved);

      // 2. Gerçek oy sayılarını Supabase'den al
      const { data } = await supabase
        .from('sentiment_votes')
        .select('direction')
        .eq('symbol', symbol.toUpperCase());

      if (data && data.length > 0) {
        const total  = data.length;
        const bullCt = data.filter((r: any) => r.direction === 'bull').length;
        const bearCt = total - bullCt;
        setTotalVotes(total);
        setBull(Math.round((bullCt / total) * 100));
        setBear(Math.round((bearCt / total) * 100));
      }
    };
    load();
  }, [symbol]);

  const handleVote = async (v: 'bull' | 'bear') => {
    if (vote === v) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim,  { toValue: 1,    useNativeDriver: true, tension: 200 }),
    ]).start();
    const prev = vote;
    setVote(v);
    await AsyncStorage.setItem(VOTE_KEY, v);

    // Supabase'e kaydet — user_device_id olarak AsyncStorage cihaz ID kullan
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }
    await supabase.from('sentiment_votes').upsert(
      { symbol: symbol.toUpperCase(), device_id: deviceId, direction: v },
      { onConflict: 'symbol,device_id' }
    );

    // Local optimistic update
    if (!prev) setTotalVotes(t => t + 1);
    if (v === 'bull') {
      setBull(b => Math.min(b + (prev === 'bear' ? 2 : 1), 99));
      setBear(b => Math.max(b - (prev === 'bear' ? 2 : 1), 1));
    } else {
      setBear(b => Math.min(b + (prev === 'bull' ? 2 : 1), 99));
      setBull(b => Math.max(b - (prev === 'bull' ? 2 : 1), 1));
    }
    toast.success(v === 'bull' ? `${symbol} için Boğa oyladın 🐂` : `${symbol} için Ayı oyladın 🐻`);
  };

  return (
    <View style={cs.wrap}>
      <View style={cs.header}>
        <View style={[cs.iconWrap, { backgroundColor: '#007AFF18' }]}>
          <Ionicons name="people" size={13} color="#007AFF" />
        </View>
        <Text style={cs.title}>Topluluk Sentiment</Text>
        <Text style={cs.total}>{totalVotes >= 1000 ? `${(totalVotes/1000).toFixed(1)}K` : totalVotes} oy</Text>
      </View>

      {/* Progress bar */}
      <View style={cs.barWrap}>
        <Animated.View style={[cs.barBull, { flex: bull / 100 }, { transform: [{ scale: scaleAnim }] }]} />
        <View style={[cs.barBear, { flex: bear / 100 }]} />
      </View>

      {/* Labels */}
      <View style={cs.labels}>
        <View style={cs.labelLeft}>
          <Text style={cs.bullTxt}>🐂 Boğa</Text>
          <Text style={cs.bullPct}>{bull}%</Text>
        </View>
        <View style={cs.labelRight}>
          <Text style={cs.bearPct}>{bear}%</Text>
          <Text style={cs.bearTxt}>🐻 Ayı</Text>
        </View>
      </View>

      {/* Vote buttons */}
      <View style={cs.btnRow}>
        <Pressable
          style={[cs.voteBtn, cs.bullBtn, vote === 'bull' && cs.bullBtnActive]}
          onPress={() => handleVote('bull')}
        >
          <Text style={[cs.voteBtnTxt, vote === 'bull' && { color: '#fff' }]}>
            {vote === 'bull' ? '✓ ' : ''}Boğa 🐂
          </Text>
        </Pressable>
        <Pressable
          style={[cs.voteBtn, cs.bearBtn, vote === 'bear' && cs.bearBtnActive]}
          onPress={() => handleVote('bear')}
        >
          <Text style={[cs.voteBtnTxt, vote === 'bear' && { color: '#fff' }]}>
            {vote === 'bear' ? '✓ ' : ''}Ayı 🐻
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const cs = StyleSheet.create({
  wrap:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F0F1F5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  iconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title:  { flex: 1, fontSize: 13, fontWeight: '800', color: '#0D0D0D' },
  total:  { fontSize: 11, color: '#9AA0AF', fontWeight: '600' },

  barWrap: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2, marginBottom: 8 },
  barBull: { backgroundColor: '#34C759', borderRadius: 5 },
  barBear: { backgroundColor: '#FF3B3B', borderRadius: 5 },

  labels:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  labelLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelRight:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  bullTxt: { fontSize: 12, fontWeight: '700', color: '#34C759' },
  bullPct: { fontSize: 14, fontWeight: '900', color: '#34C759' },
  bearTxt: { fontSize: 12, fontWeight: '700', color: '#FF3B3B' },
  bearPct: { fontSize: 14, fontWeight: '900', color: '#FF3B3B' },

  btnRow:       { flexDirection: 'row', gap: 10 },
  voteBtn:      { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5 },
  bullBtn:      { borderColor: '#34C75940', backgroundColor: '#34C75910' },
  bullBtnActive:{ backgroundColor: '#34C759', borderColor: '#34C759' },
  bearBtn:      { borderColor: '#FF3B3B40', backgroundColor: '#FF3B3B10' },
  bearBtnActive:{ backgroundColor: '#FF3B3B', borderColor: '#FF3B3B' },
  voteBtnTxt:   { fontSize: 13, fontWeight: '800', color: '#0D0D0D' },
});

// ─── Related Videos ───────────────────────────────────────────────────────────
function RelatedVideos({ symbol }: { symbol: string }) {
  const navigation = useNavigation<any>();
  const [videos, setVideos] = useState<{ id: string; thumb: string; title: string; creator: string; views: string; duration: string; videoUrl?: string }[]>([]);

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, title, content, thumbnail_url, image_url, video_url, duration, views_count, user_id, creator_id')
      .or(`asset_tag.ilike.%${symbol}%,content.ilike.%${symbol}%,title.ilike.%${symbol}%`)
      .not('video_url', 'is', null)
      .order('views_count', { ascending: false })
      .limit(5)
      .then(async ({ data }) => {
        if (!data || data.length === 0) return;
        const uids = data.map((r: any) => r.creator_id ?? r.user_id).filter(Boolean);
        const { data: profs } = await supabase.from('profiles').select('id, username, full_name').in('id', [...new Set(uids)]);
        const pm: Record<string, any> = {};
        for (const p of profs ?? []) pm[p.id] = p;
        setVideos(data.map((r: any) => {
          const prof = pm[r.creator_id ?? r.user_id];
          const dur = r.duration ? `${Math.floor(r.duration / 60)}:${String(r.duration % 60).padStart(2, '0')}` : '';
          const views = r.views_count >= 1000 ? `${(r.views_count / 1000).toFixed(1)}K` : String(r.views_count ?? 0);
          return { id: r.id, thumb: r.thumbnail_url ?? r.image_url ?? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=320', title: r.title ?? r.content ?? 'Video', creator: `@${prof?.username ?? 'kullanici'}`, views, duration: dur, videoUrl: r.video_url };
        }));
      });
  }, [symbol]);

  if (videos.length === 0) return (
    <View style={rv.wrap}>
      <View style={rv.header}>
        <View style={[rv.iconBox, { backgroundColor: '#FF3B3B18' }]}>
          <Ionicons name="play-circle" size={13} color="#FF3B3B" />
        </View>
        <Text style={rv.title}>{symbol} Videoları</Text>
      </View>
      <View style={rv.emptyState}>
        <Ionicons name="videocam-outline" size={28} color={colors.textMuted} />
        <Text style={rv.emptyTxt}>Bu varlık için henüz video yok</Text>
      </View>
    </View>
  );

  return (
    <View style={rv.wrap}>
      <View style={rv.header}>
        <View style={[rv.iconBox, { backgroundColor: '#FF3B3B18' }]}>
          <Ionicons name="play-circle" size={13} color="#FF3B3B" />
        </View>
        <Text style={rv.title}>{symbol} Videoları</Text>
        <Pressable onPress={() => navigation.navigate('Akış')}>
          <Text style={rv.seeAll}>Tümü →</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
        {videos.map(v => (
          <Pressable key={v.id} style={rv.card} onPress={() => navigation.navigate('VideoDetail', { item: v })}>
            <Image source={{ uri: v.thumb }} style={rv.thumb} />
            <View style={rv.overlay} />
            {v.duration ? (
              <View style={rv.duration}>
                <Text style={rv.durationTxt}>{v.duration}</Text>
              </View>
            ) : null}
            <View style={rv.cardBody}>
              <Text style={rv.videoTitle} numberOfLines={2}>{v.title}</Text>
              <Text style={rv.creator}>{v.creator} · {v.views} izlenme</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const rv = StyleSheet.create({
  wrap:    { marginHorizontal: 16, marginBottom: 12 },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconBox: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title:   { flex: 1, fontSize: 13, fontWeight: '800', color: '#0D0D0D' },
  seeAll:  { fontSize: 12, color: '#007AFF', fontWeight: '700' },

  card:    { width: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  thumb:   { width: '100%', height: 100 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)', height: 100 },
  duration:{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  durationTxt: { fontSize: 10, color: '#fff', fontWeight: '700' },
  cardBody:    { padding: 8 },
  videoTitle:  { fontSize: 12, fontWeight: '700', color: '#0D0D0D', lineHeight: 16, marginBottom: 4 },
  creator:     { fontSize: 10, color: '#9AA0AF', fontWeight: '600' },
  emptyState:  { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyTxt:    { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});

// ─── Top Analysts Row ─────────────────────────────────────────────────────────
function TopAnalystsRow({ symbol, onMarketplacePress }: { symbol: string; onMarketplacePress: () => void }) {
  const navigation = useNavigation<any>();
  const [analysts, setAnalysts] = useState<{ id: string; letter: string; color: string; name: string; accuracy: number; verified: boolean }[]>([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, verified, signal_accuracy, tier')
      .gt('signal_accuracy', 0)
      .order('signal_accuracy', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const COLORS = ['#F7931A', '#007AFF', '#D4AF37', '#9945FF', '#34C759'];
        setAnalysts(data.map((p: any, i: number) => ({
          id: p.id,
          letter: (p.full_name ?? p.username ?? '?')[0].toUpperCase(),
          color: COLORS[i % COLORS.length],
          name: p.full_name ?? p.username ?? 'Analist',
          accuracy: Math.round(p.signal_accuracy ?? 0),
          verified: p.verified ?? false,
        })));
      });
  }, [symbol]);

  if (analysts.length === 0) return (
    <View style={ta.wrap}>
      <View style={ta.header}>
        <View style={[ta.iconBox, { backgroundColor: '#34C75918' }]}>
          <Ionicons name="people" size={13} color="#34C759" />
        </View>
        <Text style={ta.title}>{symbol} Analistleri</Text>
      </View>
      <View style={rv.emptyState}>
        <Ionicons name="person-outline" size={28} color={colors.textMuted} />
        <Text style={rv.emptyTxt}>Henüz analist yok</Text>
      </View>
    </View>
  );

  return (
    <View style={ta.wrap}>
      <View style={ta.header}>
        <View style={[ta.iconBox, { backgroundColor: '#34C75918' }]}>
          <Ionicons name="people" size={13} color="#34C759" />
        </View>
        <Text style={ta.title}>{symbol} Analistleri</Text>
        <Pressable onPress={onMarketplacePress}>
          <Text style={ta.seeAll}>Marketplace →</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {analysts.map(a => (
          <Pressable
            key={a.id}
            style={ta.analystCard}
            onPress={() => navigation.navigate('ProfileView', { userId: a.id })}
          >
            <View style={[ta.avatar, { backgroundColor: a.color + '22' }]}>
              <Text style={[ta.avatarLetter, { color: a.color }]}>{a.letter}</Text>
              {a.verified && (
                <View style={ta.verifiedDot}>
                  <Ionicons name="checkmark" size={7} color="#fff" />
                </View>
              )}
            </View>
            <Text style={ta.analystName} numberOfLines={1}>{a.name}</Text>
            <View style={[ta.accPill, { backgroundColor: a.accuracy >= 75 ? '#34C75918' : '#FF950018' }]}>
              <Text style={[ta.accTxt, { color: a.accuracy >= 75 ? '#34C759' : '#FF9500' }]}>
                {a.accuracy}%
              </Text>
            </View>
          </Pressable>
        ))}
        <Pressable style={ta.addCard} onPress={onMarketplacePress}>
          <View style={ta.addIcon}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </View>
          <Text style={ta.addTxt}>Daha{'\n'}Fazla</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const ta = StyleSheet.create({
  wrap:    { marginHorizontal: 16, marginBottom: 12 },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconBox: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title:   { flex: 1, fontSize: 13, fontWeight: '800', color: '#0D0D0D' },
  seeAll:  { fontSize: 12, color: '#007AFF', fontWeight: '700' },

  analystCard: { width: 76, alignItems: 'center', gap: 5 },
  avatar:      { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarLetter:{ fontSize: 18, fontWeight: '900' },
  verifiedDot: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  analystName: { fontSize: 11, fontWeight: '700', color: '#0D0D0D', textAlign: 'center' },
  accPill:     { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  accTxt:      { fontSize: 10, fontWeight: '800' },

  addCard:     { width: 52, alignItems: 'center', gap: 6, justifyContent: 'center' },
  addIcon:     { width: 52, height: 52, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#007AFF50', alignItems: 'center', justifyContent: 'center' },
  addTxt:      { fontSize: 10, color: '#007AFF', fontWeight: '700', textAlign: 'center' },
});

// ─── Category config ──────────────────────────────────────────────────────────
const SEG_CFG: Record<string, { color: string; bgLight: string; label: string; icon: string }> = {
  crypto:      { color: '#F7931A', bgLight: '#FFF5E6', label: 'Kripto',   icon: 'logo-bitcoin'    },
  stocks:      { color: '#007AFF', bgLight: '#EBF5FF', label: 'Hisseler', icon: 'trending-up'     },
  commodities: { color: '#D4AF37', bgLight: '#FFFBEB', label: 'Emtia',    icon: 'diamond-outline' },
  forex:       { color: '#7C3AED', bgLight: '#F3EEFF', label: 'Döviz',    icon: 'swap-horizontal'  },
};

// ─── Time ranges ─────────────────────────────────────────────────────────────
type Range = '1S' | '4S' | '1G' | '1H' | '1A' | '1Y';
const RANGES: Range[] = ['1S', '4S', '1G', '1H', '1A', '1Y'];
const RANGE_LABELS: Record<Range, string> = {
  '1S': '1 Saat', '4S': '4 Saat', '1G': '1 Gün', '1H': '1 Hafta', '1A': '1 Ay', '1Y': '1 Yıl',
};
const RANGE_CANDLES: Record<Range, number> = {
  '1S': 30, '4S': 28, '1G': 24, '1H': 28, '1A': 30, '1Y': 52,
};

// ─── Candlestick data generation ──────────────────────────────────────────────
interface Candle {
  open: number; close: number; high: number; low: number; volume: number;
}

/** Deterministic seeded pseudo-random based on asset id */
function makeRng(seed: number) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateCandles(priceNum: number, changePercent: number, count: number, seed: number): Candle[] {
  const rng = makeRng(seed + count);
  const candles: Candle[] = [];
  const trendBias = changePercent >= 0 ? 0.53 : 0.47;
  // Work backwards from current price
  let price = priceNum * (1 - (changePercent / 100) * (count / 24));

  for (let i = 0; i < count; i++) {
    const volatility = price * (0.006 + rng() * 0.016);
    const dir = rng() < trendBias ? 1 : -1;
    const change = dir * volatility;
    const open = price;
    const close = Math.max(price * 0.001, price + change);
    const wickExtra = Math.abs(change) * (0.3 + rng() * 0.8);
    const high = Math.max(open, close) + wickExtra;
    const low = Math.max(price * 0.001, Math.min(open, close) - wickExtra);
    const volume = 0.4 + rng() * 2.5;
    candles.push({ open, close, high, low, volume });
    price = close;
  }
  return candles;
}

// ─── Price display formatter (with currency symbol) ──────────────────────────
const TRY_FOREX_PAIRS = ['USDTRY','EURTRY','GBPTRY','XAUTRY','BIST100'];
function formatPriceDisplay(price: number, category: string, symbol?: string): string {
  const isTry = category === 'forex' && symbol != null && TRY_FOREX_PAIRS.includes(symbol.toUpperCase());
  const isBist = category === 'stocks' && symbol != null && !['AAPL','NVDA','TSLA','MSFT','GOOGL','AMZN'].includes(symbol.toUpperCase());
  const prefix = (isTry || isBist) ? '₺' : '$';
  if (price >= 10000) return `${prefix}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1000)  return `${prefix}${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (price >= 100)   return `${prefix}${price.toFixed(2)}`;
  if (price >= 1)     return `${prefix}${price.toFixed(4)}`;
  return `${prefix}${price.toFixed(6)}`;
}

// ─── Price formatter ──────────────────────────────────────────────────────────
function fmtPrice(p: number): string {
  if (p >= 10000)  return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1000)   return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 100)    return p.toFixed(1);
  if (p >= 10)     return p.toFixed(2);
  if (p >= 1)      return p.toFixed(3);
  return p.toFixed(4);
}

// ─── Asset Descriptions ───────────────────────────────────────────────────────
const ABOUT: Record<string, string> = {
  btc:    'Bitcoin (BTC), 2009\'da Satoshi Nakamoto tarafından yaratılan ilk ve en büyük kripto para birimidir. Merkezi olmayan yapısı, sınırlı arzı (21M) ve blokzincir teknolojisi ile dijital altın olarak kabul görür.',
  eth:    'Ethereum (ETH), akıllı sözleşmeler ve merkeziyetsiz uygulamalar (dApps) için öncü blokzincir platformudur. DeFi, NFT ve Web3 ekosisteminin temel altyapısıdır.',
  sol:    'Solana (SOL), yüksek işlem hızı (65.000 TPS) ve düşük maliyetleriyle öne çıkan akıllı sözleşme platformudur. DeFi ve NFT alanlarında hızla büyümektedir.',
  bnb:    'BNB (Binance Coin), Binance borsasının yerel tokeni ve BNB Chain\'in gas token\'ıdır. Borsada işlem ücretlerinde indirim sağlar.',
  xrp:    'XRP, Ripple tarafından geliştirilen, hızlı ve düşük maliyetli uluslararası para transferleri için tasarlanmış kripto paradır.',
  aapl:   'Apple Inc. (AAPL), dünyaca ünlü iPhone, Mac, iPad ve hizmetleriyle teknoloji sektörünün en değerli şirketidir. 2 trilyon dolardan fazla piyasa değeriyle S&P 500\'ün en büyük bileşenidir.',
  nvda:   'NVIDIA Corporation (NVDA), GPU teknolojisinde dünya lideridir. Yapay zeka, veri merkezleri ve oyun sektörlerinde güçlü büyüme kaydeden şirket, AI çağının kritik altyapı sağlayıcısıdır.',
  tsla:   'Tesla Inc. (TSLA), elektrikli araç ve yenilenebilir enerji sektörünün öncü şirketidir. Otonom sürüş ve enerji depolama teknolojilerinde önemli atılımlar yapmaktadır.',
  msft:   'Microsoft Corporation (MSFT), kurumsal yazılım, bulut hizmetleri (Azure) ve yapay zeka alanında dünya liderlerinden biridir. Office, Windows ve Xbox ürün ailesinin sahibidir.',
  gold:   'Altın (XAU/USD), binlerce yıldır değer saklama aracı olarak kullanılan kıymetli metaldir. Enflasyona ve ekonomik belirsizliklere karşı güvenli liman olarak tercih edilir.',
  silver: 'Gümüş (XAG/USD), hem yatırım aracı hem de endüstriyel kullanımı yüksek kıymetli metaldir. Güneş panelleri ve elektronik sektöründe yaygın kullanımı bulunmaktadır.',
  oil:    'Ham Petrol (WTI), küresel enerji piyasasının temel emtiasıdır. ABD\'nin benchmark ham petrol fiyatını temsil eden WTI, enerji sektörünün yönünü belirler.',
  usdtry: 'USD/TRY paritesi, Türk Lirası\'nın ABD Doları karşısındaki değerini gösterir. Türkiye ekonomisi ve merkez bankası kararları bu parite üzerinde belirleyici rol oynar.',
  eurtry: 'EUR/TRY paritesi, Türk Lirası\'nın Euro karşısındaki değerini gösterir. Türkiye\'nin AB ile dış ticareti bu pariteyi doğrudan etkiler.',
  eurusd: 'EUR/USD, dünyanın en çok işlem gören döviz çiftidir. Eurozone ve ABD ekonomilerinin performansı, faiz oranları ve jeopolitik gelişmelere duyarlıdır.',
};


// ─── Candlestick Chart Component ──────────────────────────────────────────────
const CHART_H = 200;
const CHART_W = W - 32;
const Y_AXIS_W = 52;
const VOL_H = 36;

interface ChartProps {
  candles: Candle[];
  color: string;
  pricePrefix: string;
}

function CandlestickChart({ candles, color, pricePrefix }: ChartProps) {
  const prices = useMemo(() => candles.flatMap((c) => [c.high, c.low]), [candles]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const pad = range * 0.10;
  const dispMin = minP - pad;
  const dispMax = maxP + pad;
  const dispRange = dispMax - dispMin;

  const maxVol = Math.max(...candles.map((c) => c.volume));
  const innerW = CHART_W - Y_AXIS_W;
  const cSlot = innerW / candles.length;
  const bodyW = Math.max(Math.floor(cSlot * 0.65), 2);

  const toY = (p: number) => ((dispMax - p) / dispRange) * CHART_H;

  // Y-axis price levels (5 gridlines)
  const yLevels = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    price: dispMax - t * dispRange,
    y: t * CHART_H,
  }));

  // Last candle close price line
  const lastPrice = candles[candles.length - 1]?.close ?? 0;
  const lastY = toY(lastPrice);
  const isUp = candles[candles.length - 1]?.close >= candles[candles.length - 1]?.open;

  return (
    <View style={ch.root}>
      {/* Chart area */}
      <View style={ch.chartArea}>
        {/* Y-axis labels */}
        <View style={ch.yAxis}>
          {yLevels.map((lv, i) => (
            <View key={i} style={[ch.yLabel, { top: lv.y - 7 }]}>
              <Text style={ch.yLabelTxt}>
                {pricePrefix}{fmtPrice(lv.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Inner chart */}
        <View style={[ch.inner, { width: innerW }]}>
          {/* Grid lines */}
          {yLevels.map((lv, i) => (
            <View key={i} style={[ch.gridLine, { top: lv.y }]} />
          ))}

          {/* Current price line */}
          <View style={[ch.lastPriceLine, { top: lastY, borderColor: isUp ? colors.rise : colors.fall }]} />

          {/* Candles */}
          {candles.map((c, i) => {
            const isGreen = c.close >= c.open;
            const col = isGreen ? '#00E676' : '#FF5252';
            const bodyTop = toY(Math.max(c.open, c.close));
            const bodyH = Math.max(1.5, Math.abs(toY(c.open) - toY(c.close)));
            const wickTop = toY(c.high);
            const wickH = Math.max(1, toY(c.low) - toY(c.high));
            const xCenter = i * cSlot + cSlot / 2;

            return (
              <View key={i} style={ch.candleWrap}>
                {/* Wick */}
                <View style={[ch.wick, {
                  left: xCenter - 0.5,
                  top: wickTop,
                  height: wickH,
                  backgroundColor: col,
                }]} />
                {/* Body */}
                <View style={[ch.body, {
                  left: xCenter - bodyW / 2,
                  top: bodyTop,
                  width: bodyW,
                  height: bodyH,
                  backgroundColor: col,
                }]} />
              </View>
            );
          })}
        </View>
      </View>

      {/* Current price badge on right */}
      <View style={[ch.lastPriceBadge, {
        top: lastY - 10,
        backgroundColor: isUp ? colors.rise : colors.fall,
      }]}>
        <Text style={ch.lastPriceTxt}>{pricePrefix}{fmtPrice(lastPrice)}</Text>
      </View>

      {/* Volume bars */}
      <View style={ch.volArea}>
        <View style={{ width: Y_AXIS_W }} />
        <View style={[ch.volInner, { width: innerW }]}>
          {candles.map((c, i) => {
            const isGreen = c.close >= c.open;
            const volH = Math.max(2, (c.volume / maxVol) * (VOL_H - 4));
            return (
              <View
                key={i}
                style={[ch.volBar, {
                  left: i * cSlot + (cSlot - bodyW) / 2,
                  width: bodyW,
                  height: volH,
                  backgroundColor: isGreen ? 'rgba(0,230,118,0.35)' : 'rgba(255,82,82,0.35)',
                }]}
              />
            );
          })}
        </View>
      </View>

      {/* Vol label */}
      <View style={ch.volLabel}>
        <Text style={ch.volLabelTxt}>VOL</Text>
      </View>
    </View>
  );
}

const ch = StyleSheet.create({
  root: {
    backgroundColor: '#0C0D14',
    paddingBottom: 4,
    position: 'relative',
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_H,
    position: 'relative',
  },
  yAxis: {
    width: Y_AXIS_W, height: CHART_H, position: 'relative',
  },
  yLabel: {
    position: 'absolute', right: 6, alignItems: 'flex-end',
  },
  yLabelTxt: { fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: '600' },
  inner: {
    height: CHART_H, position: 'relative', overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute', left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  lastPriceLine: {
    position: 'absolute', left: 0, right: 0,
    height: 0.5, borderStyle: 'dashed', borderWidth: 0.5,
  },
  candleWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  wick: {
    position: 'absolute', width: 1, opacity: 0.85,
  },
  body: {
    position: 'absolute', borderRadius: 1,
  },
  lastPriceBadge: {
    position: 'absolute', right: 0, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2.5, zIndex: 10,
  },
  lastPriceTxt: { fontSize: 9.5, fontWeight: '900', color: '#FFF' },
  volArea: {
    height: VOL_H, flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  volInner: { height: VOL_H, position: 'relative' },
  volBar: { position: 'absolute', bottom: 2, borderRadius: 1 },
  volLabel: {
    position: 'absolute', left: 4, bottom: 6,
  },
  volLabelTxt: { fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: '700', letterSpacing: 0.5 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Props {
  asset: MarketAsset;
  onBack: () => void;
}

export function AssetDetailScreen({ asset: initialAsset, onBack }: Props) {
  const insets     = useSafeAreaInsets();
  const toast      = useToast();
  const navigation = useNavigation<any>();

  const [range, setRange]     = useState<Range>('1G');
  const [alertModal, setAlertModal] = useState(false);
  const [alertCond,  setAlertCond]  = useState<'above' | 'below'>('above');
  const [alertTarget, setAlertTarget] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);

  const { isWatched, toggle: toggleWatch } = useWatchlist();
  const watchlisted = isWatched(initialAsset.id);

  const { alerts, addAlert, removeAlert } = usePriceAlerts(initialAsset.id);
  const hasAlerts = alerts.length > 0;

  // ── Gerçek zamanlı fiyat güncelleme ──
  const [asset, setAsset] = useState<MarketAsset>(initialAsset);
  const priceFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Supabase'den anlık fiyatı çek
    supabase
      .from('asset_prices')
      .select('price, change_percent, volume, market_cap, spark, updated_at')
      .eq('asset_id', initialAsset.id.toUpperCase())
      .single()
      .then(({ data }) => {
        if (data && data.price > 0) {
          setAsset(prev => ({
            ...prev,
            priceNum:      data.price,
            price:         formatPriceDisplay(data.price, initialAsset.category),
            changePercent: data.change_percent ?? prev.changePercent,
          }));
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`asset-detail-${initialAsset.id}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'asset_prices',
        filter: `asset_id=eq.${initialAsset.id.toUpperCase()}`,
      }, (payload) => {
        const d = payload.new as any;
        if (d?.price > 0) {
          setAsset(prev => ({
            ...prev,
            priceNum:      d.price,
            price:         formatPriceDisplay(d.price, initialAsset.category),
            changePercent: d.change_percent ?? prev.changePercent,
          }));
          // Flash animation on price update
          Animated.sequence([
            Animated.timing(priceFlash, { toValue: 1, duration: 150, useNativeDriver: false }),
            Animated.timing(priceFlash, { toValue: 0, duration: 400, useNativeDriver: false }),
          ]).start();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [initialAsset.id, initialAsset.category]);

  const seg = SEG_CFG[asset.category] ?? SEG_CFG.crypto;
  const up  = asset.changePercent >= 0;
  const dirColor = up ? colors.rise : colors.fall;

  // Prefix for price labels in chart
  const pricePrefix = asset.price.startsWith('₺') ? '₺' :
    asset.price.startsWith('$') ? '$' : '';

  // Generate candles (deterministic)
  const seed = asset.priceNum * 7 + asset.id.charCodeAt(0);
  const candles = useMemo(
    () => generateCandles(asset.priceNum, asset.changePercent, RANGE_CANDLES[range], seed + RANGE_CANDLES[range]),
    [range, asset.priceNum, asset.changePercent, seed]
  );

  // 24 saatlik gerçek high/low + ATH (Supabase'den spark verisi ile hesaplanır)
  const dp = asset.priceNum > 100 ? 0 : 4;
  const [high24, setHigh24] = useState((asset.priceNum * 1.032).toFixed(dp));
  const [low24,  setLow24]  = useState((asset.priceNum * 0.968).toFixed(dp));
  const [ath,    setAth]    = useState((asset.priceNum * 1.22).toFixed(dp));

  useEffect(() => {
    supabase.from('asset_prices').select('spark, ath').eq('asset_id', initialAsset.id.toUpperCase()).single()
      .then(({ data }) => {
        const spark: number[] = data?.spark ?? [];
        if (spark.length > 1) {
          setHigh24(Math.max(...spark, asset.priceNum).toFixed(dp));
          setLow24(Math.max(0.0001, Math.min(...spark, asset.priceNum)).toFixed(dp));
        }
        if (data?.ath && data.ath > 0) {
          setAth(data.ath.toFixed(dp));
        } else if (spark.length > 1) {
          // ATH yoksa spark maksimumunu kullan
          const sparkMax = Math.max(...spark, asset.priceNum);
          setAth(sparkMax.toFixed(dp));
        }
      });
  }, [initialAsset.id, asset.priceNum]);

  const [categoryRank, setCategoryRank] = useState<number | null>(null);
  useEffect(() => {
    // Aynı kategorideki varlıkları market cap'e göre sırala, bu varlığın sıralamasını bul
    supabase.from('asset_prices')
      .select('asset_id, market_cap')
      .eq('category', initialAsset.category)
      .gt('market_cap', 0)
      .order('market_cap', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data) return;
        const idx = data.findIndex((r: any) => r.asset_id?.toUpperCase() === initialAsset.id.toUpperCase());
        if (idx >= 0) setCategoryRank(idx + 1);
      });
  }, [initialAsset.id, initialAsset.category]);

  const { videos: relatedVideos } = useVideos({ assetTag: asset.symbol });
  const about = ABOUT[asset.id] ?? `${asset.name} (${asset.symbol}), ${seg.label} kategorisinde işlem gören bir varlıktır.`;

  const onWatchlist = useCallback(async () => {
    const added = await toggleWatch(asset.id);
    toast.success(added ? `${asset.symbol} izlemeye alındı ⭐` : `${asset.symbol} listeden çıkarıldı`);
  }, [toggleWatch, asset.id, asset.symbol, toast]);

  const onAlert = useCallback(() => {
    if (hasAlerts) {
      // Birden fazla alarm olabilir — hepsini sil
      Promise.all(alerts.map(a => removeAlert(a.id))).then(() => {
        toast.success(`${asset.symbol} alarmları silindi`);
      });
    } else {
      setAlertTarget(asset.priceNum.toFixed(dp));
      setAlertModal(true);
    }
  }, [hasAlerts, alerts, removeAlert, asset, toast, dp]);

  const onSaveAlert = useCallback(async () => {
    const t = parseFloat(alertTarget);
    if (isNaN(t) || t <= 0) return;
    setSavingAlert(true);
    const ok = await addAlert(asset.id, alertCond, t);
    setSavingAlert(false);
    setAlertModal(false);
    if (ok) toast.success(`${asset.symbol} alarmı kuruldu 🔔`);
    else    toast.error('Alarm kurulamadı');
  }, [alertTarget, alertCond, addAlert, asset, toast]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Dark Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 6 }]}>
        {/* Back + title */}
        <View style={s.headerTop}>
          <Pressable style={s.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </Pressable>

          <View style={s.headerMid}>
            <View style={[s.logoCircle, { backgroundColor: asset.logoColor + '22' }]}>
              <Text style={[s.logoTxt, { color: asset.logoColor }]}>{asset.logoLetter}</Text>
            </View>
            <View style={s.headerNames}>
              <Text style={s.headerSymbol}>{asset.symbol}</Text>
              <Text style={s.headerName}>{asset.name}</Text>
            </View>
            <View style={[s.catBadge, { backgroundColor: seg.color + '22' }]}>
              <Text style={[s.catBadgeTxt, { color: seg.color }]}>{seg.label}</Text>
            </View>
          </View>

          <View style={s.headerActions}>
            <Pressable style={s.headerBtn} onPress={onWatchlist}>
              <Ionicons name={watchlisted ? 'star' : 'star-outline'} size={20} color={watchlisted ? '#FFB800' : '#FFF'} />
            </Pressable>
            <Pressable style={s.headerBtn} onPress={onAlert}>
              <Ionicons name={hasAlerts ? 'notifications' : 'notifications-outline'} size={20} color={hasAlerts ? '#FF9500' : '#FFF'} />
            </Pressable>
            <Pressable
              style={s.headerBtn}
              onPress={() => Share.share({
                message: `${asset.symbol} — ${asset.price} (${up ? '+' : ''}${asset.changePercent}%) | Marketly'de takip et`,
                title: `${asset.name} fiyatı`,
              })}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Price row */}
        <View style={s.priceSection}>
          <View style={s.priceLeft}>
            <Animated.Text style={[s.currentPrice, {
              color: priceFlash.interpolate({
                inputRange: [0, 1],
                outputRange: [dirColor, up ? '#34C759' : '#FF3B3B'],
              }),
            }]}>{asset.price}</Animated.Text>
            <View style={[s.changePill, { backgroundColor: up ? 'rgba(0,200,83,0.18)' : 'rgba(255,59,59,0.18)' }]}>
              <Ionicons name={up ? 'trending-up' : 'trending-down'} size={14} color={dirColor} />
              <Text style={[s.changePct, { color: dirColor }]}>
                {up ? '+' : ''}{asset.changePercent}%
              </Text>
            </View>
          </View>
          <View style={s.priceRight}>
            <View style={s.hiloRow}>
              <View style={s.hiloItem}>
                <Text style={s.hiloLabel}>24s Yüksek</Text>
                <Text style={[s.hiloVal, { color: '#00E676' }]}>{pricePrefix}{high24}</Text>
              </View>
              <View style={s.hiloDivider} />
              <View style={s.hiloItem}>
                <Text style={s.hiloLabel}>24s Düşük</Text>
                <Text style={[s.hiloVal, { color: '#FF5252' }]}>{pricePrefix}{low24}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>
        {/* ── Candlestick Chart ── */}
        <View style={s.chartCard}>
          <CandlestickChart candles={candles} color={dirColor} pricePrefix={pricePrefix} />

          {/* Range selector */}
          <View style={s.rangeBar}>
            {RANGES.map((r) => {
              const active = r === range;
              return (
                <Pressable
                  key={r}
                  style={[s.rangeBtn, active && { backgroundColor: up ? colors.riseLight : colors.fallLight }]}
                  onPress={() => setRange(r)}
                >
                  <Text style={[s.rangeTxt, active && { color: dirColor, fontWeight: '800' }]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Stats Grid ── */}
        <View style={s.statsCard}>
          <View style={s.statsHeader}>
            <Ionicons name="stats-chart" size={14} color={seg.color} />
            <Text style={s.statsHeaderTxt}>Piyasa Verileri</Text>
          </View>
          <View style={s.statsGrid}>
            {[
              { label: '24s Yüksek',   value: `${pricePrefix}${high24}`,        icon: 'arrow-up-circle',    color: colors.rise },
              { label: '24s Düşük',    value: `${pricePrefix}${low24}`,         icon: 'arrow-down-circle',  color: colors.fall },
              { label: '24s Hacim',    value: asset.volume,                      icon: 'bar-chart',          color: '#007AFF'    },
              { label: 'Piyasa Değ.',  value: asset.marketCap ?? '—',            icon: 'globe',              color: '#7C3AED'    },
              { label: 'Tüm Zamanlar Yük.', value: `${pricePrefix}${ath}`,       icon: 'trophy',             color: '#FFB800'    },
              { label: 'Kategori Sır.', value: categoryRank ? `#${categoryRank}` : '—', icon: 'ribbon', color: seg.color },
            ].map((st, i) => (
              <View key={i} style={[s.statCell, i % 3 !== 2 && s.statCellBorderR, i < 3 && s.statCellBorderB]}>
                <View style={[s.statIcon, { backgroundColor: st.color + '15' }]}>
                  <Ionicons name={st.icon as any} size={12} color={st.color} />
                </View>
                <Text style={s.statLabel}>{st.label}</Text>
                <Text style={s.statValue}>{st.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Community Sentiment ── */}
        <CommunitySentiment symbol={asset.symbol} />

        {/* ── Related Videos ── */}
        <RelatedVideos symbol={asset.symbol} />

        {/* ── Top Analysts ── */}
        <TopAnalystsRow symbol={asset.symbol} onMarketplacePress={() => navigation.navigate('SignalMarketplace' as never)} />

        {/* ── Related News ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: '#FFF5E0' }]}>
              <Ionicons name="newspaper" size={13} color="#FF9500" />
            </View>
            <Text style={s.sectionTitle}>İlgili Analizler</Text>
            {relatedVideos.length > 0 && (
              <View style={s.sectionBadge}>
                <Text style={s.sectionBadgeTxt}>{relatedVideos.length} analiz</Text>
              </View>
            )}
          </View>

          {relatedVideos.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="newspaper-outline" size={24} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
                {asset.symbol} için henüz analiz yok
              </Text>
            </View>
          ) : (
            relatedVideos.slice(0, 4).map((v, i) => (
              <Pressable key={v.id} style={[s.newsItem, i < Math.min(relatedVideos.length, 4) - 1 && s.newsItemBorder]}
                onPress={() => navigation.navigate('VideoDetail', { item: v })}
              >
                <Image source={{ uri: v.thumbnail }} style={s.newsImg} />
                <View style={s.newsBody}>
                  {v.assetTags.length > 0 && (
                    <View style={[s.newsTag, { backgroundColor: seg.bgLight }]}>
                      <Text style={[s.newsTagTxt, { color: seg.color }]}>{v.assetTags[0]}</Text>
                    </View>
                  )}
                  <Text style={s.newsTitle} numberOfLines={2}>{v.title}</Text>
                  <View style={s.newsMeta}>
                    <Text style={s.newsSource}>{v.creator.name}</Text>
                    <View style={s.newsDot} />
                    <Text style={s.newsTime}>{v.timeAgo}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#D0D5DD" />
              </Pressable>
            ))
          )}
        </View>

        {/* ── About ── */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: seg.bgLight }]}>
              <Ionicons name={seg.icon as any} size={13} color={seg.color} />
            </View>
            <Text style={s.sectionTitle}>{asset.name} Hakkında</Text>
          </View>
          <Text style={s.aboutTxt}>{about}</Text>

          {/* Key facts */}
          <View style={s.factsRow}>
            <View style={s.factItem}>
              <Text style={s.factLabel}>Sembol</Text>
              <Text style={s.factVal}>{asset.symbol}</Text>
            </View>
            <View style={s.factDivider} />
            <View style={s.factItem}>
              <Text style={s.factLabel}>Kategori</Text>
              <Text style={[s.factVal, { color: seg.color }]}>{seg.label}</Text>
            </View>
            <View style={s.factDivider} />
            <View style={s.factItem}>
              <Text style={s.factLabel}>Hacim</Text>
              <Text style={s.factVal}>{asset.volume}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>

      {/* ── Sticky Bottom Actions ── */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          style={[s.actBtn, watchlisted && s.actBtnActive, { borderColor: '#FFB80050' }]}
          onPress={onWatchlist}
        >
          <Ionicons name={watchlisted ? 'star' : 'star-outline'} size={16} color={watchlisted ? '#FFB800' : '#6B7280'} />
          <Text style={[s.actTxt, watchlisted && { color: '#FFB800' }]}>
            {watchlisted ? 'İzleniyor' : 'İzlemeye Al'}
          </Text>
        </Pressable>

        <Pressable
          style={[s.actBtn, hasAlerts && s.actBtnAlertActive, { borderColor: '#FF950050' }]}
          onPress={onAlert}
        >
          <Ionicons name={hasAlerts ? 'notifications' : 'notifications-outline'} size={16} color={hasAlerts ? '#FF9500' : '#6B7280'} />
          <Text style={[s.actTxt, hasAlerts && { color: '#FF9500' }]}>
            {hasAlerts ? `Alarm (${alerts.length})` : 'Alarm Kur'}
          </Text>
        </Pressable>

        <Pressable
          style={[s.actBtn, { backgroundColor: '#5856D615', borderColor: '#5856D650', borderWidth: 1 }]}
          onPress={() => navigation.navigate('AIAssistant' as never)}
        >
          <Ionicons name="sparkles-outline" size={16} color="#5856D6" />
          <Text style={[s.actTxt, { color: '#5856D6' }]}>AI'ya Sor</Text>
        </Pressable>
      </View>

      {/* ── Alert Modal ── */}
      <Modal visible={alertModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView
          style={am.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={am.backdrop} onPress={() => setAlertModal(false)} />
          <View style={am.sheet}>
            <View style={am.handle} />
            <View style={am.titleRow}>
              <View style={[am.assetBadge, { backgroundColor: seg.color + '20' }]}>
                <Text style={[am.assetBadgeTxt, { color: seg.color }]}>{asset.symbol}</Text>
              </View>
              <Text style={am.title}>Fiyat Alarmı</Text>
            </View>
            <Text style={am.currentPriceTxt}>Anlık: {asset.price}</Text>

            <View style={am.condRow}>
              {(['above', 'below'] as const).map(c => (
                <Pressable
                  key={c}
                  style={[am.condBtn, alertCond === c && am.condBtnActive]}
                  onPress={() => setAlertCond(c)}
                >
                  <Ionicons
                    name={c === 'above' ? 'trending-up' : 'trending-down'}
                    size={15}
                    color={alertCond === c ? '#fff' : colors.textMuted}
                  />
                  <Text style={[am.condTxt, alertCond === c && am.condTxtActive]}>
                    {c === 'above' ? 'Üzerine çıkınca' : 'Altına düşünce'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={am.inputWrap}>
              <Text style={am.inputLabel}>Hedef Fiyat ({pricePrefix})</Text>
              <TextInput
                style={am.input}
                value={alertTarget}
                onChangeText={setAlertTarget}
                keyboardType="decimal-pad"
                placeholderTextColor="#9AA0AF"
                placeholder={asset.priceNum.toFixed(2)}
              />
            </View>

            <Pressable style={am.saveBtn} onPress={onSaveAlert} disabled={savingAlert}>
              <LinearGradient
                colors={['#FF9500', '#FF3B3B']}
                style={am.saveGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {savingAlert
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="notifications" size={18} color="#fff" />
                      <Text style={am.saveTxt}>Alarm Kur</Text>
                    </>
                }
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F7FB' },
  scroll: { flex: 1 },

  // Header
  header: {
    backgroundColor: '#0A0B10',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerMid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontSize: 14, fontWeight: '900' },
  headerNames: { flex: 1 },
  headerSymbol: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  headerName: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500', marginTop: 1 },
  catBadge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  catBadgeTxt: { fontSize: 10, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Price
  priceSection: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  priceLeft: { gap: 8 },
  currentPrice: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  changePct: { fontSize: 14, fontWeight: '800' },
  priceRight: {},
  hiloRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hiloItem: { alignItems: 'flex-end' },
  hiloLabel: { fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginBottom: 2 },
  hiloVal: { fontSize: 12, fontWeight: '800' },
  hiloDivider: { width: StyleSheet.hairlineWidth, height: 24, backgroundColor: 'rgba(255,255,255,0.12)' },

  // Chart card
  chartCard: {
    backgroundColor: '#0C0D14',
    marginTop: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
    paddingBottom: 4,
    ...shadow.lg,
  },
  rangeBar: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 4, paddingVertical: 12, paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  rangeBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  rangeTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },

  // Stats
  statsCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16,
    borderRadius: radius.xl, overflow: 'hidden', ...shadow.sm,
  },
  statsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statsHeaderTxt: { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statCell: {
    width: '33.33%', padding: 14, gap: 5,
  },
  statCellBorderR: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: 'rgba(0,0,0,0.06)' },
  statCellBorderB: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  statIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, color: '#9AA0AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.2 },
  statValue: { fontSize: 13, fontWeight: '800', color: '#0F0F1A' },

  // Section Card
  sectionCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12,
    borderRadius: radius.xl, overflow: 'hidden', ...shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sectionIconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F0F1A', flex: 1 },
  sectionBadge: { backgroundColor: '#FFF5E0', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  sectionBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#FF9500' },

  // News
  newsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  newsItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  newsImg: { width: 64, height: 64, borderRadius: radius.md, flexShrink: 0 },
  newsBody: { flex: 1, gap: 4 },
  newsTag: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2.5 },
  newsTagTxt: { fontSize: 9.5, fontWeight: '800' },
  newsTitle: { fontSize: 13, fontWeight: '700', color: '#0F0F1A', lineHeight: 18 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newsSource: { fontSize: 10.5, fontWeight: '700', color: '#6B7280' },
  newsDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D0D5DD' },
  newsTime: { fontSize: 10.5, color: '#9AA0AF' },

  // About
  aboutTxt: {
    fontSize: 13.5, color: '#4B5563', lineHeight: 21,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
  },
  factsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#F6F7FB', borderRadius: radius.md, padding: 12,
  },
  factItem: { flex: 1, alignItems: 'center', gap: 3 },
  factLabel: { fontSize: 10, color: '#9AA0AF', fontWeight: '600' },
  factVal: { fontSize: 13, fontWeight: '800', color: '#0F0F1A' },
  factDivider: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: 'rgba(0,0,0,0.08)' },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.08)',
    ...shadow.md,
  },
  actBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 46, borderRadius: radius.md,
    backgroundColor: '#F6F7FB',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
  },
  actBtnActive: { backgroundColor: '#FFFBE6' },
  actBtnAlertActive: { backgroundColor: '#FFF5E6' },
  actBtnShare: { backgroundColor: '#EBF5FF', borderColor: '#007AFF20' },
  actTxt: { fontSize: 11.5, fontWeight: '700', color: '#6B7280' },
});

const am = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: colors.bgPure,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 14,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4,
  },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assetBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  assetBadgeTxt: { fontSize: 13, fontWeight: '800' },
  title:       { fontSize: 20, fontWeight: '800', color: colors.text },
  currentPriceTxt: { fontSize: 13, color: colors.textMuted },
  condRow:     { flexDirection: 'row', gap: 10 },
  condBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.bgInput, borderRadius: 12,
    paddingVertical: 11, borderWidth: 1, borderColor: colors.border,
  },
  condBtnActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  condTxt:       { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  condTxtActive: { color: '#fff' },
  inputWrap:   { gap: 6 },
  inputLabel: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bgInput, borderRadius: 12, padding: 14,
    fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  saveBtn:  { borderRadius: 14, overflow: 'hidden' },
  saveGrad: {
    height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
