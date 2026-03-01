import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Image, StatusBar, Dimensions, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { ShortItem } from '../data/mockShorts';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../contexts/ToastContext';
import { useVideos } from '../hooks/useVideos';
import { colors, radius } from '../constants/theme';

// ─── TikTok-style video oynatıcı ─────────────────────────────────────────────
function ShortVideoPlayer({ uri, isActive }: { uri: string; isActive: boolean }) {
  const player = useVideoPlayer(uri, p => { p.loop = true; });

  useEffect(() => {
    try { if (isActive) player.play(); else player.pause(); } catch {}
  }, [isActive, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const { width: W, height: H } = Dimensions.get('window');

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ─── Mini Sparkline (inline) ──────────────────────────────────────────────────
function InlineSparkline({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const H_SPARK = 24;
  const barW = 3;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: H_SPARK, gap: 2 }}>
      {data.map((v, i) => {
        const h = ((v - min) / (max - min || 1)) * (H_SPARK - 4) + 4;
        return (
          <View
            key={i}
            style={{
              width: barW, height: h, borderRadius: 1.5,
              backgroundColor: up ? 'rgba(0,230,118,0.8)' : 'rgba(255,107,107,0.8)',
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Signal Overlay ───────────────────────────────────────────────────────────
function SignalOverlay({ signal, onCopy, copied }: {
  signal: NonNullable<ShortItem['signal']>;
  onCopy: () => void;
  copied: boolean;
}) {
  const isBuy  = signal.direction === 'BUY';
  const isSell = signal.direction === 'SELL';
  const dirColor = isBuy ? '#00E676' : isSell ? '#FF6B6B' : '#FFB74D';
  const dirBg   = isBuy ? 'rgba(0,200,83,0.20)' : isSell ? 'rgba(255,59,59,0.20)' : 'rgba(255,152,0,0.20)';

  return (
    <View style={so.card}>
      {/* Direction badge */}
      <View style={[so.dirBadge, { borderColor: dirColor + '60', backgroundColor: dirBg }]}>
        <Ionicons
          name={isBuy ? 'trending-up' : isSell ? 'trending-down' : 'pause'}
          size={12}
          color={dirColor}
        />
        <Text style={[so.dirTxt, { color: dirColor }]}>{signal.direction}</Text>
        {/* Stars */}
        <View style={so.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name={i <= signal.confidence ? 'star' : 'star-outline'} size={8} color="#FFB800" />
          ))}
        </View>
      </View>

      {/* Price levels */}
      <View style={so.levels}>
        <View style={so.level}>
          <Text style={so.levelLbl}>Giriş</Text>
          <Text style={so.levelVal}>{signal.entry}</Text>
        </View>
        <Ionicons name="arrow-forward" size={10} color="rgba(255,255,255,0.5)" />
        <View style={so.level}>
          <Text style={so.levelLbl}>Hedef</Text>
          <Text style={[so.levelVal, { color: '#00E676' }]}>{signal.target}</Text>
        </View>
      </View>

      {/* Copy Trade CTA */}
      <Pressable style={[so.copyBtn, copied && so.copyBtnDone]} onPress={onCopy}>
        <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={13} color={copied ? '#00E676' : '#FFF'} />
        <Text style={[so.copyTxt, copied && { color: '#00E676' }]}>
          {copied ? 'Kopyalandı!' : 'Trade Kopyala'}
        </Text>
      </Pressable>
    </View>
  );
}

const so = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 10,
    gap: 8,
  },
  dirBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dirTxt: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  stars: { flexDirection: 'row', gap: 1 },
  levels: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  level: { gap: 2 },
  levelLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' },
  levelVal: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(0,200,83,0.25)',
    borderWidth: 1, borderColor: 'rgba(0,200,83,0.5)',
    borderRadius: radius.full,
    paddingVertical: 7, paddingHorizontal: 12,
  },
  copyBtnDone: { backgroundColor: 'rgba(0,200,83,0.15)', borderColor: 'rgba(0,230,118,0.5)' },
  copyTxt: { fontSize: 12, fontWeight: '800', color: '#FFF' },
});

// ─── Price Bar (top of video) ─────────────────────────────────────────────────
function PriceBar({ item }: { item: ShortItem }) {
  if (!item.currentPrice) return null;
  const up = (item.changePercent ?? 0) >= 0;
  return (
    <View style={pb.wrap}>
      <View style={pb.left}>
        <Text style={pb.asset}>{item.assetTags[0]}</Text>
        <Text style={pb.price}>{item.currentPrice}</Text>
      </View>
      <View style={pb.mid}>
        {item.spark && <InlineSparkline data={item.spark} up={up} />}
      </View>
      <View style={pb.right}>
        <View style={[pb.changePill, { backgroundColor: up ? 'rgba(0,200,83,0.20)' : 'rgba(255,59,59,0.20)' }]}>
          <Ionicons name={up ? 'caret-up' : 'caret-down'} size={10} color={up ? '#00E676' : '#FF6B6B'} />
          <Text style={[pb.changeTxt, { color: up ? '#00E676' : '#FF6B6B' }]}>
            {up ? '+' : ''}{item.changePercent}%
          </Text>
        </View>
        <Text style={pb.change24h} numberOfLines={1}>{item.priceChange24h ?? ''}</Text>
      </View>
    </View>
  );
}

const pb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12, paddingVertical: 8,
    gap: 10,
  },
  left: { gap: 1 },
  asset: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  price: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  mid: { flex: 1, alignItems: 'center' },
  right: { alignItems: 'flex-end', gap: 4 },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  changeTxt: { fontSize: 12, fontWeight: '800' },
  change24h: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
});

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({
  icon, label, color = '#FFF', onPress, active, badge,
}: {
  icon: string; label: string; color?: string;
  onPress?: () => void; active?: boolean; badge?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function tap() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
    ]).start();
    onPress?.();
  }

  return (
    <Pressable onPress={tap} style={ab.wrap}>
      <View style={ab.iconWrap}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={icon as any} size={30} color={active ? (color !== '#FFF' ? color : '#FF3B3B') : '#FFF'} />
        </Animated.View>
        {badge && (
          <View style={ab.badge}>
            <Text style={ab.badgeTxt}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={ab.label}>{label}</Text>
    </Pressable>
  );
}

const ab = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { position: 'relative', marginBottom: 4 },
  badge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: colors.fall,
    borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1,
    minWidth: 14, alignItems: 'center',
  },
  badgeTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: '700', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});

// ─── Short Card ───────────────────────────────────────────────────────────────
function ShortCard({
  item, screenHeight, isActive,
}: {
  item: ShortItem; screenHeight: number; isActive: boolean;
}) {
  const toast = useToast();
  const [liked, setLiked]     = useState(false);
  const [saved, setSaved]     = useState(false);
  const [following, setFollow] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [showSignal, setShowSignal] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 30000,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [isActive, progressAnim]);

  const up = (item.changePercent ?? 0) >= 0;
  const isBuy  = item.signal?.direction === 'BUY';
  const isSell = item.signal?.direction === 'SELL';
  const sigColor = isBuy ? '#00E676' : isSell ? '#FF6B6B' : '#FFB74D';

  const handleCopyTrade = () => {
    setCopied(true);
    toast.success(`${item.assetTags[0]} trade'i kopyalandı 📋`);
  };

  return (
    <View style={[sc.root, { height: screenHeight }]}>
      {/* Background — video varsa oynat, yoksa thumbnail göster */}
      {item.videoUrl ? (
        <ShortVideoPlayer uri={item.videoUrl} isActive={isActive} />
      ) : (
        <Image source={{ uri: item.thumbnail }} style={sc.bg} resizeMode="cover" />
      )}

      {/* Gradient layers */}
      <View style={sc.gradTop} />
      <View style={sc.gradMid} />
      <View style={sc.gradBottom} />

      {/* ── TOP AREA: Price bar + badges ── */}
      <View style={sc.topArea}>
        <View style={sc.topRow}>
          {/* Category pill */}
          <View style={[sc.catPill, { backgroundColor: up ? 'rgba(0,200,83,0.85)' : 'rgba(255,59,59,0.85)' }]}>
            <Text style={sc.catTxt}>{item.category}</Text>
          </View>

          {/* Signal direction badge */}
          {item.signal && (
            <Pressable
              style={[sc.sigPill, { borderColor: sigColor + '80' }]}
              onPress={() => setShowSignal(!showSignal)}
            >
              <Ionicons
                name={isBuy ? 'trending-up' : isSell ? 'trending-down' : 'pause'}
                size={11}
                color={sigColor}
              />
              <Text style={[sc.sigPillTxt, { color: sigColor }]}>{item.signal.direction}</Text>
            </Pressable>
          )}

          <View style={sc.spacer} />

          {/* Duration */}
          <View style={sc.durationPill}>
            <Ionicons name="play" size={9} color="rgba(255,255,255,0.85)" />
            <Text style={sc.durationTxt}>{item.duration}</Text>
          </View>
        </View>

        {/* Price bar */}
        <PriceBar item={item} />
      </View>

      {/* ── CENTER: Signal overlay (toggleable) ── */}
      {item.signal && showSignal && isActive && (
        <View style={sc.signalCenter}>
          <SignalOverlay signal={item.signal} onCopy={handleCopyTrade} copied={copied} />
        </View>
      )}

      {/* ── BOTTOM LEFT: Creator + content info ── */}
      <View style={sc.bottomLeft}>
        {/* Creator row */}
        <View style={sc.creatorRow}>
          <View style={sc.avatarWrap}>
            <Image source={{ uri: item.creator.avatar }} style={sc.avatar} />
            {!following && (
              <Pressable
                style={sc.followPlus}
                onPress={() => { setFollow(true); toast.success(`${item.creator.name} takip ediliyor ✓`); }}
              >
                <Ionicons name="add" size={12} color="#FFF" />
              </Pressable>
            )}
          </View>
          <View style={sc.creatorInfo}>
            <View style={sc.nameRow}>
              <Text style={sc.creatorName}>{item.creator.name}</Text>
              {item.creator.verified && (
                <View style={sc.verifiedDot}>
                  <Ionicons name="checkmark" size={7} color="#FFF" />
                </View>
              )}
              {following && (
                <View style={sc.followingChip}>
                  <Text style={sc.followingChipTxt}>Takipte</Text>
                </View>
              )}
            </View>
            <View style={sc.creatorMeta}>
              <Text style={sc.followers}>{item.creator.followers}</Text>
              {item.creator.successRate && (
                <>
                  <Text style={sc.metaDot}>·</Text>
                  <View style={sc.ratePill}>
                    <Text style={sc.rateTxt}>%{item.creator.successRate} başarı</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={sc.title} numberOfLines={2}>{item.title}</Text>
        <Text style={sc.desc} numberOfLines={2}>{item.description}</Text>

        {/* Asset tags */}
        <View style={sc.tagRow}>
          {item.assetTags.map((t) => (
            <Pressable key={t} style={sc.tag}>
              <Text style={sc.tagTxt}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Audio row */}
        <View style={sc.audioRow}>
          <View style={sc.audioIcon}>
            <Ionicons name="musical-notes" size={11} color="#FFF" />
          </View>
          <Text style={sc.audioTxt} numberOfLines={1}>{item.audio}</Text>
        </View>
      </View>

      {/* ── RIGHT SIDE: Action buttons ── */}
      <View style={sc.rightActions}>
        <ActionBtn
          icon={liked ? 'heart' : 'heart-outline'}
          label={fmt(liked ? item.stats.likes + 1 : item.stats.likes)}
          active={liked}
          onPress={() => {
            setLiked(!liked);
            if (!liked) toast.success('Short beğenildi ❤️');
          }}
        />
        <ActionBtn icon="chatbubble-outline" label={fmt(item.stats.comments)} />
        <ActionBtn
          icon="share-social-outline"
          label={fmt(item.stats.shares)}
          onPress={() => toast.success('Link kopyalandı 🔗')}
        />
        <ActionBtn
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          label="Kaydet"
          active={saved}
          onPress={() => {
            setSaved(!saved);
            toast.success(saved ? 'Kaydedilenlerden çıkarıldı' : 'Kaydedildi 🔖');
          }}
        />
        {item.signal && (
          <ActionBtn
            icon={copied ? 'checkmark-circle' : 'copy-outline'}
            label={copied ? 'Kopyalandı' : 'Trade Kopyala'}
            color={copied ? '#00E676' : '#FFF'}
            active={copied}
            onPress={handleCopyTrade}
            badge={copied ? undefined : '!'}
          />
        )}
      </View>

      {/* Progress bar (video progress simulation) */}
      <View style={sc.progressBar}>
        <Animated.View style={[sc.progressFill, {
          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any,
        }]} />
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  root: { width: W, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  bg: { position: 'absolute', width: '100%', height: '100%' },

  // Gradient layers
  gradTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  gradMid: {
    position: 'absolute', top: 180, left: 0, right: 0, height: 100,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  gradBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
    backgroundColor: 'rgba(0,0,0,0.60)',
  },

  // Top area
  topArea: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 14, paddingTop: 12, gap: 10,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPill: {
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  catTxt: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  sigPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  sigPillTxt: { fontSize: 10, fontWeight: '900' },
  spacer: { flex: 1 },
  durationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  durationTxt: { color: '#FFF', fontSize: 10, fontWeight: '600' },

  // Signal center
  signalCenter: {
    position: 'absolute', left: 14, right: 90,
    top: '38%',
  },

  // Bottom left
  bottomLeft: {
    position: 'absolute', bottom: 20, left: 0,
    paddingHorizontal: 14, paddingTop: 14, width: W - 76,
  },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#FFF' },
  followPlus: {
    position: 'absolute', bottom: -4, left: '50%', marginLeft: -10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#000',
  },
  creatorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  creatorName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  verifiedDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center',
  },
  followingChip: {
    backgroundColor: 'rgba(0,200,83,0.25)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(0,200,83,0.5)',
  },
  followingChipTxt: { fontSize: 9, fontWeight: '800', color: '#00E676' },
  creatorMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  followers: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  metaDot: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  ratePill: {
    backgroundColor: 'rgba(0,200,83,0.20)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
  },
  rateTxt: { fontSize: 10, fontWeight: '800', color: '#00E676' },
  title: {
    color: '#FFF', fontSize: 15, fontWeight: '800', lineHeight: 20, marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  desc: {
    color: 'rgba(255,255,255,0.78)', fontSize: 12.5, lineHeight: 17, marginBottom: 9,
  },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 9 },
  tag: {
    backgroundColor: 'rgba(0,200,83,0.85)', borderRadius: radius.xs,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  audioIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  audioTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 11, flex: 1 },

  // Right actions
  rightActions: {
    position: 'absolute', right: 10, bottom: 30,
    alignItems: 'center',
  },

  // Progress bar
  progressBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  progressFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: 1,
  },
});

// ─── Feed Tab Bar ─────────────────────────────────────────────────────────────
const FEED_CATEGORIES = ['Tümü', 'Kripto', 'Hisseler', 'Emtia', 'Döviz'];

// ─── Main ShortsScreen ────────────────────────────────────────────────────────
export function ShortsScreen() {
  const insets    = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  // Full screen — no tab bar space reserved (Shorts is in Stack navigator)
  const tabBarH   = 0;
  const ITEM_H    = H;

  const [activeIndex, setActiveIndex]   = useState(0);
  const [activeCat, setActiveCat]       = useState('Tümü');

  const { videos: liveShorts } = useVideos({ type: 'short' });

  const allShorts: ShortItem[] = liveShorts.map((v) => ({
    id:          v.id,
    title:       v.title,
    description: '',
    thumbnail:   v.thumbnail,
    videoUrl:    v.videoUrl,
    assetTags:   v.assetTags ?? [],
    creator: {
      id:          v.creator.id,
      name:        v.creator.name,
      avatar:      v.creator.avatar,
      verified:    v.creator.verified ?? false,
      followers:   v.creator.followers ?? '0',
    },
    stats:    v.stats,
    duration: v.duration ?? '0:30',
    audio:    `${v.creator.name} · Orijinal ses`,
    category: v.category === 'kripto' ? 'Kripto' : v.category === 'hisseler' ? 'Hisseler' : 'Tümü',
  }));

  const filtered = activeCat === 'Tümü'
    ? allShorts
    : allShorts.filter((s) => s.category === activeCat);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 70 });

  const renderItem = useCallback(
    ({ item, index }: { item: ShortItem; index: number }) => (
      <ShortCard item={item} screenHeight={ITEM_H} isActive={index === activeIndex} />
    ),
    [ITEM_H, activeIndex]
  );

  return (
    <View style={ss.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top bar (overlay) ── */}
      <View style={[ss.topBar, { top: insets.top }]}>
        <View style={ss.topLeft}>
          <Pressable style={ss.topBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <Text style={ss.topTitle}>Shorts</Text>
        </View>

        {/* Category filters */}
        <View style={ss.catRow}>
          {FEED_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[ss.catBtn, activeCat === cat && ss.catBtnActive]}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={[ss.catTxt, activeCat === cat && ss.catTxtActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        <View style={ss.topRight}>
          <Pressable style={ss.topBtn}>
            <Ionicons name="camera-outline" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* Progress dots (right side) */}
      <View style={[ss.dots, { top: insets.top + 90 }]}>
        {filtered.slice(0, 8).map((_, i) => (
          <View key={i} style={[ss.dot, i === activeIndex && ss.dotActive]} />
        ))}
      </View>

      {/* Full-screen FlatList */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={ITEM_H}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  topBar: {
    position: 'absolute', left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topTitle: {
    fontSize: 18, fontWeight: '900', color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  catRow: { flex: 1, flexDirection: 'row', gap: 5, overflow: 'hidden' },
  catBtn: {
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  catBtnActive: { backgroundColor: colors.primary },
  catTxt: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  catTxtActive: { color: '#FFF' },
  topRight: {},
  topBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.40)', alignItems: 'center', justifyContent: 'center',
  },

  dots: {
    position: 'absolute', right: 5, zIndex: 10,
    flexDirection: 'column', gap: 3,
  },
  dot: { width: 3, height: 14, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.30)' },
  dotActive: { backgroundColor: '#FFF', height: 22 },
});
