import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Image, ImageBackground, StatusBar, Animated, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mockVideos } from '../data/mockVideos';
import { useToast } from '../contexts/ToastContext';
import { useVideos } from '../hooks/useVideos';
import { useMarketCoin } from '../hooks/useMarketCoin';
import { colors, radius, shadow } from '../constants/theme';

const LIVE_CATS = ['Tümü', 'Kripto', 'Hisseler', 'Emtia', 'Döviz', 'Analiz'];

const EXTRA_LIVE = [
  {
    id: 'l1', title: 'BIST100 Günlük Özet – Piyasa Kapanışı Canlı!',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=700',
    creator: { id: 'ul1', name: 'Borsa Uzmanı', avatar: 'https://i.pravatar.cc/60?u=bu99', verified: true, successRate: 78 },
    viewers: 3400, category: 'Hisseler', isLive: true,
    assetTags: ['BIST100', 'THYAO'], price: '₺9,450', changePercent: -0.34,
    stats: { likes: 1200, comments: 87, shares: 54, views: 3400 },
    startedAgo: '32 dk önce',
  },
  {
    id: 'l2', title: 'Altın & Gümüş Fırsat Analizi – Teknik Seviyeler',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=700',
    creator: { id: 'ul2', name: 'Emtia Pro', avatar: 'https://i.pravatar.cc/60?u=ep99', verified: true, successRate: 72 },
    viewers: 1820, category: 'Emtia', isLive: true,
    assetTags: ['XAU', 'XAG'], price: '$2,345', changePercent: 0.42,
    stats: { likes: 890, comments: 43, shares: 29, views: 1820 },
    startedAgo: '1s 15dk önce',
  },
  {
    id: 'l3', title: 'Dolar/TL Nereye Gidiyor? Canlı Forex Analizi',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700',
    creator: { id: 'ul3', name: 'FX Master', avatar: 'https://i.pravatar.cc/60?u=fm99', verified: true, successRate: 81 },
    viewers: 942, category: 'Döviz', isLive: true,
    assetTags: ['USD/TRY'], price: '₺32.45', changePercent: 0.31,
    stats: { likes: 410, comments: 21, shares: 14, views: 942 },
    startedAgo: '45 dk önce',
  },
  {
    id: 'l4', title: 'Solana & DeFi: 2025 Deep Dive – Canlı AMA',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=700',
    creator: { id: 'ul4', name: 'DeFi Guru', avatar: 'https://i.pravatar.cc/60?u=dg99', verified: true, successRate: 69 },
    viewers: 5240, category: 'Kripto', isLive: true,
    assetTags: ['SOL', 'ETH'], price: '$189', changePercent: 5.67,
    stats: { likes: 2800, comments: 196, shares: 143, views: 5240 },
    startedAgo: '2s 4dk önce',
  },
  {
    id: 'l5', title: 'S&P500 ve Nasdaq Haftalık Teknik Analiz',
    thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=700',
    creator: { id: 'ul5', name: 'Wall St. Insider', avatar: 'https://i.pravatar.cc/60?u=wsi7', verified: true, successRate: 84 },
    viewers: 7120, category: 'Analiz', isLive: true,
    assetTags: ['S&P500', 'NASDAQ'], price: '5,234', changePercent: 0.42,
    stats: { likes: 3400, comments: 248, shares: 191, views: 7120 },
    startedAgo: '58 dk önce',
  },
];

const SCHEDULE = [
  {
    id: 'sch1',
    title: 'Bitcoin Halving Sonrası BTC Hedef Analizi',
    creator: { name: 'Crypto Guru', avatar: 'https://i.pravatar.cc/60?u=cg1' },
    time: '20:00', countdown: '1s 24dk',
    assetTags: ['BTC'], category: 'Kripto',
    notified: false,
  },
  {
    id: 'sch2',
    title: 'BIST100 Sabah Seansı Hazırlık',
    creator: { name: 'Borsa Master', avatar: 'https://i.pravatar.cc/60?u=bm2' },
    time: '09:00', countdown: 'Yarın 09:00',
    assetTags: ['BIST100'], category: 'Hisseler',
    notified: true,
  },
  {
    id: 'sch3',
    title: 'Fed Faiz Kararı Canlı Takip & Analiz',
    creator: { name: 'FX Master', avatar: 'https://i.pravatar.cc/60?u=fx5' },
    time: '21:30', countdown: '3s 12dk',
    assetTags: ['USD', 'FOREX'], category: 'Döviz',
    notified: false,
  },
];

const GIFTS = [
  { id: 'g1', icon: '💎', name: 'Elmas', cost: 500, color: '#00BFFF' },
  { id: 'g2', icon: '🚀', name: 'Roket', cost: 200, color: '#FF6B35' },
  { id: 'g3', icon: '🏆', name: 'Kupa', cost: 100, color: '#FFB800' },
  { id: 'g4', icon: '❤️', name: 'Kalp', cost: 50, color: '#FF3B6F' },
  { id: 'g5', icon: '🌟', name: 'Yıldız', cost: 20, color: '#FFD700' },
  { id: 'g6', icon: '👏', name: 'Alkış', cost: 10, color: '#00C853' },
];

function fmtV(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ── Gift Modal ────────────────────────────────────────────────────────────────
function GiftModal({
  visible, onClose, streamTitle,
}: {
  visible: boolean; onClose: () => void; streamTitle: string;
}) {
  const toast            = useToast();
  const { balance, spend } = useMarketCoin();

  const handleGift = async (gift: typeof GIFTS[0]) => {
    if (balance < gift.cost) {
      toast.error(`Yetersiz MarketCoin! Gereken: ${gift.cost} 🪙`);
      return;
    }
    const ok = await spend(gift.cost, `"${gift.name}" hediyesi - ${streamTitle}`);
    if (ok) {
      toast.success(`${gift.icon} "${gift.name}" gönderildi! (-${gift.cost} MC)`);
      onClose();
    } else {
      toast.error('Hediye gönderilemedi, tekrar dene');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={gm.backdrop} onPress={onClose} />
      <View style={gm.sheet}>
        <View style={gm.handle} />
        <View style={gm.header}>
          <Ionicons name="gift" size={20} color="#FFB800" />
          <Text style={gm.title}>Gift Gönder</Text>
          <View style={gm.coins}>
            <Text style={gm.coinsIcon}>🪙</Text>
            <Text style={gm.coinsVal}>{balance}</Text>
          </View>
        </View>
        <Text style={gm.subtitle} numberOfLines={1}>{streamTitle}</Text>
        <View style={gm.grid}>
          {GIFTS.map((g) => (
            <Pressable key={g.id} style={gm.giftCard} onPress={() => handleGift(g)}>
              <Text style={gm.giftIcon}>{g.icon}</Text>
              <Text style={gm.giftName}>{g.name}</Text>
              <View style={[gm.giftCost, { backgroundColor: g.color + '20' }]}>
                <Text style={[gm.giftCostTxt, { color: g.color }]}>🪙 {g.cost}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={gm.buyRow}>
          <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
          <Text style={gm.buyInfo}>Koin satın almak için profil &gt; Premium.</Text>
        </View>
      </View>
    </Modal>
  );
}

const gm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    ...shadow.lg,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '800', color: '#0D0D0D', flex: 1 },
  coins: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9E6', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FFB80040' },
  coinsIcon: { fontSize: 13 },
  coinsVal: { fontSize: 13, fontWeight: '800', color: '#FFB800' },
  subtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  giftCard: {
    width: '30%', alignItems: 'center', gap: 4,
    backgroundColor: '#F8F9FB', borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  giftIcon: { fontSize: 28 },
  giftName: { fontSize: 11, fontWeight: '700', color: '#0D0D0D' },
  giftCost: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  giftCostTxt: { fontSize: 10, fontWeight: '800' },
  buyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyInfo: { fontSize: 11, color: colors.textMuted },
});

// ── Live Card ─────────────────────────────────────────────────────────────────
function LiveCard({
  item, onPress, featured, onGift,
}: {
  item: any; onPress: () => void; featured?: boolean; onGift?: () => void;
}) {
  const up = (item.changePercent ?? 0) >= 0;
  const [followed, setFollowed] = useState(false);
  const toast = useToast();

  return (
    <Pressable onPress={onPress} style={[lc.wrap, featured && lc.wrapFeatured]}>
      <ImageBackground
        source={{ uri: item.thumbnail }}
        style={[lc.img, featured && lc.imgFeatured]}
        imageStyle={{ borderRadius: featured ? radius.lg : radius.md }}
        resizeMode="cover"
      >
        <View style={lc.grad} />
        <View style={lc.gradBottom} />

        {/* Top row */}
        <View style={lc.top}>
          <View style={lc.livePill}>
            <View style={lc.liveDot} />
            <Text style={lc.liveTxt}>CANLI</Text>
          </View>
          <View style={lc.viewerPill}>
            <Ionicons name="eye" size={10} color="#FFF" />
            <Text style={lc.viewerTxt}>{fmtV(item.viewers)}</Text>
          </View>
          {item.changePercent != null && (
            <View style={[lc.pricePill, { backgroundColor: up ? 'rgba(0,200,83,0.85)' : 'rgba(255,59,59,0.85)' }]}>
              <Ionicons name={up ? 'trending-up' : 'trending-down'} size={9} color="#FFF" />
              <Text style={lc.priceTxt}>{up ? '+' : ''}{item.changePercent}%</Text>
            </View>
          )}
          {featured && (
            <View style={lc.featuredPill}>
              <Ionicons name="flame" size={9} color="#FF6B00" />
              <Text style={lc.featuredTxt}>ÖNE ÇIKAN</Text>
            </View>
          )}
        </View>

        {/* Asset tags */}
        <View style={lc.tagsRow}>
          {(item.assetTags || []).slice(0, 3).map((t: string) => (
            <View key={t} style={lc.tag}>
              <Text style={lc.tagTxt}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Bottom */}
        <View style={lc.bottom}>
          <Text style={[lc.title, featured && lc.titleFeatured]} numberOfLines={featured ? 2 : 2}>
            {item.title}
          </Text>
          <View style={lc.creatorRow}>
            <Image source={{ uri: item.creator.avatar }} style={lc.avatar} />
            <View style={lc.creatorInfo}>
              <View style={lc.creatorNameRow}>
                <Text style={lc.creatorName}>{item.creator.name}</Text>
                {item.creator.verified && (
                  <View style={lc.verifiedBadge}>
                    <Ionicons name="checkmark" size={7} color="#FFF" />
                  </View>
                )}
              </View>
              {item.creator.successRate && featured && (
                <Text style={lc.creatorSub}>%{item.creator.successRate} başarı oranı</Text>
              )}
            </View>

            {featured && (
              <View style={lc.ctaRow}>
                {onGift && (
                  <Pressable style={lc.giftBtn} onPress={onGift}>
                    <Text style={lc.giftIcon}>🎁</Text>
                  </Pressable>
                )}
                <Pressable style={lc.joinBtn} onPress={onPress}>
                  <Text style={lc.joinTxt}>Katıl</Text>
                  <Ionicons name="arrow-forward" size={11} color="#FFF" />
                </Pressable>
              </View>
            )}
            {!featured && (
              <Pressable
                style={[lc.followBtn, followed && lc.followBtnActive]}
                onPress={() => {
                  setFollowed(!followed);
                  toast.success(followed ? `${item.creator.name} takipten çıkıldı` : `${item.creator.name} takip ediliyor ✓`);
                }}
              >
                <Text style={[lc.followTxt, followed && lc.followTxtActive]}>
                  {followed ? '✓ Takipte' : '+ Takip Et'}
                </Text>
              </Pressable>
            )}
          </View>

          {item.startedAgo && featured && (
            <Text style={lc.startedAgo}>
              <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.6)" /> {item.startedAgo} başladı
            </Text>
          )}
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const lc = StyleSheet.create({
  wrap: {
    borderRadius: radius.md, overflow: 'hidden',
    ...shadow.sm,
  },
  wrapFeatured: { borderRadius: radius.lg },
  img: { width: '100%', aspectRatio: 1.65, justifyContent: 'space-between' },
  imgFeatured: { aspectRatio: 1.5 },
  grad: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.18)' },
  gradBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  top: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FF3B3B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  viewerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3,
  },
  viewerTxt: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  pricePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3,
  },
  priceTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  featuredPill: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF9E0', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3,
  },
  featuredTxt: { color: '#FF6B00', fontSize: 8, fontWeight: '900' },
  tagsRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 10 },
  tag: { backgroundColor: 'rgba(0,200,83,0.85)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  bottom: { padding: 10, gap: 6 },
  title: {
    color: '#FFF', fontSize: 12, fontWeight: '800', lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  titleFeatured: { fontSize: 16, lineHeight: 22 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#FFF' },
  creatorInfo: { flex: 1 },
  creatorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  creatorName: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  verifiedBadge: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
  },
  creatorSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 1 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  giftBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
  },
  giftIcon: { fontSize: 15 },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  joinTxt: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  followBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  followBtnActive: { backgroundColor: 'rgba(0,200,83,0.25)', borderColor: 'rgba(0,200,83,0.6)' },
  followTxt: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  followTxtActive: { color: '#00E676' },
  startedAgo: { color: 'rgba(255,255,255,0.60)', fontSize: 10, marginTop: 2 },
});

// ── Schedule Card ─────────────────────────────────────────────────────────────
function ScheduleCard({ item, onNotify }: { item: typeof SCHEDULE[0]; onNotify: () => void }) {
  const [notified, setNotified] = useState(item.notified);
  const toast = useToast();
  return (
    <View style={sch.card}>
      <View style={sch.timeWrap}>
        <Text style={sch.time}>{item.time}</Text>
        <Text style={sch.countdown}>{item.countdown}</Text>
      </View>
      <View style={sch.divider} />
      <Image source={{ uri: item.creator.avatar }} style={sch.avatar} />
      <View style={sch.info}>
        <Text style={sch.title} numberOfLines={2}>{item.title}</Text>
        <View style={sch.tagRow}>
          {item.assetTags.map((t) => (
            <View key={t} style={sch.tag}>
              <Text style={sch.tagTxt}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        style={[sch.notifyBtn, notified && sch.notifyBtnActive]}
        onPress={() => {
          setNotified(!notified);
          toast.success(notified ? 'Hatırlatıcı kaldırıldı' : 'Hatırlatıcı kuruldu 🔔');
          onNotify();
        }}
      >
        <Ionicons name={notified ? 'notifications' : 'notifications-outline'} size={16} color={notified ? '#FF9500' : colors.textMuted} />
      </Pressable>
    </View>
  );
}

const sch = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: '#F0F0F0', ...shadow.xs,
  },
  timeWrap: { alignItems: 'center', minWidth: 44 },
  time: { fontSize: 13, fontWeight: '900', color: '#0D0D0D' },
  countdown: { fontSize: 9, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  divider: { width: 1, height: 36, backgroundColor: '#E8EAF0' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 12, fontWeight: '700', color: '#0D0D0D', lineHeight: 16 },
  tagRow: { flexDirection: 'row', gap: 4 },
  tag: { backgroundColor: '#E8FAF0', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagTxt: { fontSize: 9, fontWeight: '800', color: colors.primary },
  notifyBtn: { padding: 8, borderRadius: radius.sm, backgroundColor: '#F4F5F8' },
  notifyBtnActive: { backgroundColor: '#FFF5E0' },
});

// ── Top Streamers Bar ─────────────────────────────────────────────────────────
const TOP_STREAMERS = [
  { id: 't1', name: 'CryptoGuru', avatar: 'https://i.pravatar.cc/60?u=cg1', viewers: '5.2K', isOnline: true },
  { id: 't2', name: 'WallStInsider', avatar: 'https://i.pravatar.cc/60?u=wsi7', viewers: '7.1K', isOnline: true },
  { id: 't3', name: 'BorsaMaster', avatar: 'https://i.pravatar.cc/60?u=bm2', viewers: '3.4K', isOnline: true },
  { id: 't4', name: 'FXMaster', avatar: 'https://i.pravatar.cc/60?u=fx5', viewers: '0.9K', isOnline: true },
  { id: 't5', name: 'EmtiaPro', avatar: 'https://i.pravatar.cc/60?u=ep3', viewers: '1.8K', isOnline: true },
];

function TopStreamersBar() {
  return (
    <View style={ts.wrap}>
      <Text style={ts.label}>🔴 Şu An Canlı</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ts.scroll}>
        {TOP_STREAMERS.map((s) => (
          <View key={s.id} style={ts.card}>
            <View style={ts.avatarWrap}>
              <Image source={{ uri: s.avatar }} style={ts.avatar} />
              <View style={ts.onlineDot} />
            </View>
            <Text style={ts.name} numberOfLines={1}>{s.name}</Text>
            <View style={ts.viewerPill}>
              <Ionicons name="eye" size={8} color="#FF3B3B" />
              <Text style={ts.viewers}>{s.viewers}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const ts = StyleSheet.create({
  wrap: { paddingVertical: 12, paddingLeft: 14, backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  label: { fontSize: 11, fontWeight: '800', color: '#0D0D0D', marginBottom: 10 },
  scroll: { gap: 14, paddingRight: 14 },
  card: { alignItems: 'center', gap: 4, width: 56 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, borderColor: '#FF3B3B' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#00C853', borderWidth: 2, borderColor: '#FFF',
  },
  name: { fontSize: 9, fontWeight: '700', color: '#0D0D0D', textAlign: 'center' },
  viewerPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFF0F0', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  viewers: { fontSize: 8, fontWeight: '700', color: '#FF3B3B' },
});

// ── Live Stats Banner ─────────────────────────────────────────────────────────
function LiveStatsBanner({ totalViewers, liveCount }: { totalViewers: number; liveCount: number }) {
  return (
    <View style={lb.wrap}>
      <View style={lb.item}>
        <View style={lb.iconWrap}>
          <Ionicons name="people" size={16} color="#FF3B3B" />
        </View>
        <View>
          <Text style={lb.val}>{fmtV(totalViewers)}</Text>
          <Text style={lb.lbl}>toplam izleyici</Text>
        </View>
      </View>
      <View style={lb.sep} />
      <View style={lb.item}>
        <View style={[lb.iconWrap, { backgroundColor: '#E8FAF0' }]}>
          <Ionicons name="radio" size={16} color={colors.primary} />
        </View>
        <View>
          <Text style={lb.val}>{liveCount}</Text>
          <Text style={lb.lbl}>aktif yayın</Text>
        </View>
      </View>
      <View style={lb.sep} />
      <View style={lb.item}>
        <View style={[lb.iconWrap, { backgroundColor: '#FFF5E0' }]}>
          <Ionicons name="calendar" size={16} color="#FF9500" />
        </View>
        <View>
          <Text style={lb.val}>{SCHEDULE.length}</Text>
          <Text style={lb.lbl}>yaklaşan yayın</Text>
        </View>
      </View>
    </View>
  );
}

const lb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#FFF', marginHorizontal: 14, marginTop: 12,
    borderRadius: radius.md, padding: 14, gap: 0,
    borderWidth: 1, borderColor: '#F0F0F0', ...shadow.xs,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 15, fontWeight: '900', color: '#0D0D0D' },
  lbl: { fontSize: 9, color: colors.textMuted, fontWeight: '600', marginTop: 1 },
  sep: { width: 1, height: 28, backgroundColor: '#F0F0F0' },
});

// ── Main LiveScreen ───────────────────────────────────────────────────────────
export function LiveScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const toast      = useToast();
  const [cat, setCat]           = useState('Tümü');
  const [giftItem, setGiftItem] = useState<any>(null);

  const { videos: liveVideos } = useVideos({ type: 'live' });

  const baseVideos = (liveVideos.length > 0 ? liveVideos : mockVideos.filter((v) => v.isLive)).map((v) => ({
    ...v,
    viewers: v.stats.views,
    category: v.assetTags?.length > 0 ? 'Kripto' : 'Analiz',
    creator: { ...v.creator, verified: v.creator.verified, successRate: 76 },
    startedAgo: 'Canlı',
  }));
  const allLive  = [...EXTRA_LIVE, ...baseVideos];
  const filtered = cat === 'Tümü' ? allLive : allLive.filter((v) => v.category === cat);
  const [featured, ...rest] = filtered;

  const totalViewers = allLive.reduce((s, v) => s + v.viewers, 0);

  return (
    <View style={[ls.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={ls.header}>
        <View style={ls.headerLeft}>
          <View style={ls.pulse} />
          <View style={ls.pulse2} />
          <Ionicons name="radio" size={20} color="#FF3B3B" />
          <Text style={ls.headerTitle}>Canlı</Text>
        </View>
        <View style={ls.headerRight}>
          <View style={ls.liveBadge}>
            <View style={ls.liveDot} />
            <Text style={ls.liveBadgeTxt}>{allLive.length} YAYIN</Text>
          </View>
          <Pressable style={ls.iconBtn} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={21} color="#0D0D0D" />
          </Pressable>
          <Pressable style={ls.iconBtn} onPress={() => toast.info('Bildirimler')}>
            <Ionicons name="notifications-outline" size={21} color="#0D0D0D" />
          </Pressable>
        </View>
      </View>

      {/* ── Top Streamers ── */}
      <TopStreamersBar />

      {/* ── Category filter ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={ls.catScroll}
        contentContainerStyle={ls.catContent}
      >
        {LIVE_CATS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCat(c)}
            style={[ls.catChip, cat === c && ls.catChipActive]}
          >
            {cat === c && <View style={ls.catDot} />}
            <Text style={[ls.catTxt, cat === c && ls.catTxtActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[ls.feed, { paddingBottom: 90 + insets.bottom }]}>

        {/* Stats banner */}
        <LiveStatsBanner totalViewers={totalViewers} liveCount={allLive.length} />

        {filtered.length === 0 ? (
          <View style={ls.empty}>
            <Ionicons name="radio-outline" size={52} color="#D8D8D8" />
            <Text style={ls.emptyTitle}>Aktif Yayın Yok</Text>
            <Text style={ls.emptyDesc}>Bu kategoride şu an canlı yayın yapılmıyor.</Text>
          </View>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <View style={ls.featuredWrap}>
                <View style={ls.sectionHeader}>
                  <Ionicons name="flame" size={14} color="#FF6B00" />
                  <Text style={ls.sectionTitle}>Öne Çıkan Yayın</Text>
                </View>
                <LiveCard
                  item={featured}
                  featured
                  onPress={() => {
                    if (featured.channelName) {
                      navigation.navigate('LiveWatch', {
                        channelName: featured.channelName,
                        postId:      featured.id,
                        title:       featured.title,
                        hostName:    featured.creator.name,
                        hostAvatar:  featured.creator.avatar,
                        viewers:     featured.viewers,
                      });
                    } else {
                      navigation.navigate('VideoDetail', { item: featured });
                    }
                  }}
                  onGift={() => setGiftItem(featured)}
                />
              </View>
            )}

            {/* Other live */}
            {rest.length > 0 && (
              <>
                <View style={[ls.sectionHeader, { marginTop: 18 }]}>
                  <Ionicons name="radio" size={14} color="#FF3B3B" />
                  <Text style={ls.sectionTitle}>Diğer Yayınlar</Text>
                  <View style={ls.liveCount}>
                    <Text style={ls.liveCountTxt}>{rest.length}</Text>
                  </View>
                </View>
                <View style={ls.grid}>
                  {rest.map((item) => (
                    <View key={item.id} style={ls.gridItem}>
                      <LiveCard
                        item={item}
                        onPress={() => {
                          if (item.channelName) {
                            navigation.navigate('LiveWatch', {
                              channelName: item.channelName,
                              postId:      item.id,
                              title:       item.title,
                              hostName:    item.creator.name,
                              hostAvatar:  item.creator.avatar,
                              viewers:     item.viewers,
                            });
                          } else {
                            navigation.navigate('VideoDetail', { item });
                          }
                        }}
                        onGift={() => setGiftItem(item)}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Schedule */}
            <View style={[ls.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="calendar" size={14} color="#FF9500" />
              <Text style={ls.sectionTitle}>Yaklaşan Yayınlar</Text>
            </View>
            <View style={ls.scheduleList}>
              {SCHEDULE.map((s) => (
                <ScheduleCard
                  key={s.id}
                  item={s}
                  onNotify={() => {}}
                />
              ))}
            </View>

            {/* Disclaimer */}
            <View style={ls.disclaimer}>
              <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
              <Text style={ls.disclaimerTxt}>
                Canlı yayınlar eğitim ve analiz amaçlıdır. Yatırım tavsiyesi değildir.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Gift Modal */}
      {giftItem && (
        <GiftModal
          visible={!!giftItem}
          onClose={() => setGiftItem(null)}
          streamTitle={giftItem.title}
        />
      )}
    </View>
  );
}

const ls = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F3F7' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EBEBEB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, position: 'relative' },
  pulse: {
    position: 'absolute', left: -3, top: -3,
    width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,59,59,0.12)',
  },
  pulse2: {
    position: 'absolute', left: -8, top: -8,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,59,59,0.06)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0D0D0D' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF0F0', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B3B' },
  liveBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#FF3B3B' },
  iconBtn: { padding: 4 },

  catScroll: { backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EBEBEB' },
  catContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 7 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: '#F2F3F7', borderWidth: 1, borderColor: '#EBEBEB',
  },
  catChipActive: { backgroundColor: '#FF3B3B', borderColor: '#FF3B3B' },
  catDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  catTxt: { fontSize: 12, fontWeight: '600', color: '#5A5F6E' },
  catTxtActive: { color: '#FFF', fontWeight: '700' },

  feed: { padding: 14, gap: 0 },
  featuredWrap: { marginBottom: 0 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 10, marginTop: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0D0D0D', flex: 1 },
  liveCount: {
    backgroundColor: '#FFF0F0', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  liveCountTxt: { fontSize: 11, fontWeight: '800', color: '#FF3B3B' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47.5%' },

  scheduleList: { gap: 8, marginBottom: 16 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#5A5F6E' },
  emptyDesc: { fontSize: 13, color: '#9AA0AF', textAlign: 'center' },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FFF9E6', borderRadius: radius.sm, padding: 10, marginTop: 4,
  },
  disclaimerTxt: { flex: 1, fontSize: 11, color: '#9AA0AF', lineHeight: 16 },
});
