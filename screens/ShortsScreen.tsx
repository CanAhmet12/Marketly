import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Image, StatusBar, Dimensions, Animated, Alert,
  Share, TextInput, KeyboardAvoidingView, Platform,
  Modal, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { ShortItem } from '../data/mockShorts';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../contexts/ToastContext';
import { useVideos } from '../hooks/useVideos';
import { useAuth } from '../contexts/AuthContext';
import { useVideoComments } from '../hooks/useVideoComments';
import { supabase } from '../lib/supabase';
import { colors, radius, font } from '../constants/theme';

// ─── TikTok-style video oynatıcı ─────────────────────────────────────────────
function ShortVideoPlayer({ uri, isActive, preload }: { uri: string; isActive: boolean; preload?: boolean }) {
  const player = useVideoPlayer(uri, p => {
    p.loop = true;
    // Preload: video başta durdurulmuş ama yüklenmiş olsun
    if (!isActive) p.pause();
  });

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
  item, screenHeight, isActive, preload,
}: {
  item: ShortItem; screenHeight: number; isActive: boolean; preload?: boolean;
}) {
  const toast        = useToast();
  const { user }     = useAuth();
  const [liked, setLiked]           = useState(false);
  const [saved, setSaved]           = useState(false);
  const [following, setFollow]      = useState(false);
  const [copied, setCopied]         = useState(false);
  const [showSignal, setShowSignal] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Double-tap like
  const lastTap = useRef(0);
  const heartAnim = useRef(new Animated.Value(0)).current;

  const triggerDoubleTapLike = () => {
    if (!liked) {
      setLiked(true);
      supabase.from('video_likes').upsert({ user_id: user?.id, video_id: item.id }, { onConflict: 'user_id,video_id' }).then(() => {});
    }
    // Kalp animasyonu
    heartAnim.setValue(0);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.delay(600),
      Animated.timing(heartAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleScreenPress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerDoubleTapLike();
    }
    lastTap.current = now;
  };

  const {
    comments,
    loading: cmtLoading,
    sending: cmtSending,
    sendComment,
    likeComment,
    deleteComment,
  } = useVideoComments(item.id);

  // Başlangıç durumlarını DB'den yükle
  useEffect(() => {
    if (!user?.id || !item.id) return;
    supabase.from('video_likes').select('id').eq('user_id', user.id).eq('video_id', item.id).maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
    supabase.from('saved_videos').select('id').eq('user_id', user.id).eq('video_id', item.id).maybeSingle()
      .then(({ data }) => { if (data) setSaved(true); });
    if (item.creator?.id) {
      supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', item.creator.id).maybeSingle()
        .then(({ data }) => { if (data) setFollow(true); });
    }
  }, [user?.id, item.id, item.creator?.id]);

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

  const handleLike = async () => {
    if (!user) { toast.info('Beğenmek için giriş yap'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    if (newLiked) {
      await supabase.from('video_likes').upsert({ user_id: user.id, video_id: item.id }, { onConflict: 'user_id,video_id' });
      await supabase.from('posts').update({ likes_count: (item.stats.likes || 0) + 1 }).eq('id', item.id);
      toast.success('Short beğenildi ❤️');
    } else {
      await supabase.from('video_likes').delete().eq('user_id', user.id).eq('video_id', item.id);
    }
  };

  const handleSave = async () => {
    if (!user) { toast.info('Kaydetmek için giriş yap'); return; }
    const newSaved = !saved;
    setSaved(newSaved);
    if (newSaved) {
      await supabase.from('saved_videos').upsert({ user_id: user.id, video_id: item.id }, { onConflict: 'user_id,video_id' });
      toast.success('Kaydedildi 🔖');
    } else {
      await supabase.from('saved_videos').delete().eq('user_id', user.id).eq('video_id', item.id);
      toast.info('Kaydedilenlerden çıkarıldı');
    }
  };

  const handleFollow = async () => {
    if (!user) { toast.info('Takip için giriş yap'); return; }
    if (!item.creator?.id || following) return;
    setFollow(true);
    await supabase.from('follows').upsert(
      { follower_id: user.id, following_id: item.creator.id },
      { onConflict: 'follower_id,following_id' }
    );
    toast.success(`${item.creator.name} takip ediliyor ✓`);
  };

  const handleCopyTrade = async () => {
    if (!user) { toast.info('Kopyalamak için giriş yap'); return; }
    if (!item.signal) return;
    const newCopied = !copied;
    setCopied(newCopied);
    if (newCopied) {
      const sig = item.signal as any;
      await supabase.from('signal_copies').upsert(
        { user_id: user.id, signal_id: sig.id ?? item.id },
        { onConflict: 'user_id,signal_id' }
      );
      const entryP = Number(sig.entry_price ?? sig.entryPrice ?? 0);
      if (entryP > 0) {
        Alert.alert(
          'Portföye Ekle?',
          `${item.assetTags[0] ?? 'Varlık'} sinyalini portföye de eklemek ister misin?`,
          [
            { text: 'Sadece Kopyala', style: 'cancel', onPress: () => toast.success(`Sinyal kopyalandı 📋`) },
            {
              text: 'Portföye Ekle',
              onPress: async () => {
                await supabase.from('portfolio_holdings').insert({
                  user_id:  user.id,
                  asset_id: (item.assetTags[0] ?? '').replace('#', '').toUpperCase(),
                  symbol:   (item.assetTags[0] ?? '').replace('#', '').toUpperCase(),
                  name:     item.assetTags[0] ?? '',
                  quantity: 1,
                  avg_cost: entryP,
                });
                toast.success('Portföye eklendi ✓');
              },
            },
          ]
        );
      } else {
        toast.success(`Sinyal kopyalandı 📋`);
      }
    } else {
      const sig = item.signal as any;
      await supabase.from('signal_copies').delete().eq('user_id', user.id).eq('signal_id', sig.id ?? item.id);
      toast.info('Sinyal kopyası iptal edildi');
    }
  };

  return (
    <View style={[sc.root, { height: screenHeight }]}>
      {/* Background — video varsa oynat, yoksa thumbnail göster */}
      {item.videoUrl ? (
        <ShortVideoPlayer uri={item.videoUrl} isActive={isActive} preload={preload} />
      ) : (
        <Image source={{ uri: item.thumbnail }} style={sc.bg} resizeMode="cover" />
      )}

      {/* Double-tap yakalayıcı — görünmez tam ekran Pressable */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleScreenPress} />

      {/* Double-tap kalp animasyonu */}
      <Animated.View
        pointerEvents="none"
        style={[sc.doubleTapHeart, {
          opacity: heartAnim,
          transform: [{ scale: heartAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.4, 1.2] }) }],
        }]}
      >
        <Ionicons name="heart" size={90} color="#FF3B3B" />
      </Animated.View>

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
                onPress={handleFollow}
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
          onPress={handleLike}
        />
        <ActionBtn icon="chatbubble-outline" label={fmt(comments.length > 0 ? comments.length : item.stats.comments)} onPress={() => setShowComments(true)} />
        <ActionBtn
          icon="share-social-outline"
          label={fmt(item.stats.shares)}
          onPress={async () => {
            try {
              await Share.share({
                message: `${item.title} — Marketly'de izle`,
                title: item.title,
              });
            } catch { /* kullanıcı iptal etti */ }
          }}
        />
        <ActionBtn
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          label="Kaydet"
          active={saved}
          onPress={handleSave}
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

      {/* ── Comment Sheet ── */}
      <Modal
        visible={showComments}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <Pressable style={cms.backdrop} onPress={() => setShowComments(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={cms.sheet}
        >
          {/* Header */}
          <View style={cms.header}>
            <Text style={cms.headerTitle}>Yorumlar</Text>
            <Pressable style={cms.closeBtn} onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>

          {/* Comment list */}
          <ScrollView
            style={cms.list}
            contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8, gap: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {cmtLoading && comments.length === 0 ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
            ) : comments.length === 0 ? (
              <View style={cms.empty}>
                <Ionicons name="chatbubble-outline" size={38} color="rgba(255,255,255,0.3)" />
                <Text style={cms.emptyTxt}>Henüz yorum yok. İlk yorumu sen yap!</Text>
              </View>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={cms.cmtRow}>
                  <Image
                    source={{ uri: c.author_avatar ?? `https://i.pravatar.cc/40?u=${c.user_id}` }}
                    style={cms.cmtAvatar}
                  />
                  <View style={cms.cmtBody}>
                    <View style={cms.cmtHeader}>
                      <Text style={cms.cmtUser}>{c.author_name}</Text>
                      {c.is_pinned && (
                        <View style={cms.pinBadge}>
                          <Ionicons name="pin" size={9} color={colors.primary} />
                          <Text style={cms.pinTxt}>Sabitlendi</Text>
                        </View>
                      )}
                      <Text style={cms.cmtTime}>
                        {(() => {
                          const diff = Date.now() - new Date(c.created_at).getTime();
                          const m = Math.floor(diff / 60000);
                          if (m < 1) return 'az önce';
                          if (m < 60) return `${m} dk`;
                          const h = Math.floor(m / 60);
                          if (h < 24) return `${h} sa`;
                          return `${Math.floor(h / 24)} gün`;
                        })()}
                      </Text>
                      {c.user_id === user?.id && (
                        <Pressable onPress={() => deleteComment(c.id)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={13} color="rgba(255,100,100,0.8)" />
                        </Pressable>
                      )}
                    </View>
                    <Text style={cms.cmtText}>{c.content}</Text>
                    <Pressable
                      style={cms.cmtLike}
                      onPress={() => likeComment(c.id)}
                    >
                      <Ionicons name="heart-outline" size={13} color="rgba(255,255,255,0.6)" />
                      <Text style={cms.cmtLikeTxt}>{c.likes}</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Input */}
          <View style={cms.inputRow}>
            <TextInput
              style={cms.input}
              placeholder={user ? 'Yorum yaz...' : 'Yorum için giriş yap'}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={commentText}
              onChangeText={setCommentText}
              returnKeyType="send"
              onSubmitEditing={async () => {
                if (!user) { toast.info('Yorum için giriş yap'); return; }
                if (!commentText.trim()) return;
                const ok = await sendComment(commentText.trim());
                if (ok) { setCommentText(''); toast.success('Yorum eklendi ✓'); }
              }}
            />
            <Pressable
              style={[cms.sendBtn, (!commentText.trim() || cmtSending) && { opacity: 0.5 }]}
              disabled={!commentText.trim() || cmtSending}
              onPress={async () => {
                if (!user) { toast.info('Yorum için giriş yap'); return; }
                if (!commentText.trim()) return;
                const ok = await sendComment(commentText.trim());
                if (ok) { setCommentText(''); toast.success('Yorum eklendi ✓'); }
              }}
            >
              {cmtSending
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="send" size={16} color="#FFF" />
              }
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const sc = StyleSheet.create({
  root: { width: W, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  bg: { position: 'absolute', width: '100%', height: '100%' },
  doubleTapHeart: {
    position: 'absolute', top: '35%', left: '50%', marginLeft: -45,
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  },

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

// ─── Comment Sheet Styles ─────────────────────────────────────────────────────
const cms = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '70%',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  list: { maxHeight: 360 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center' },
  cmtRow: { flexDirection: 'row', gap: 10 },
  cmtAvatar: { width: 34, height: 34, borderRadius: 17 },
  cmtBody: { flex: 1 },
  cmtHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' },
  cmtUser: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  pinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(0,200,83,0.2)', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  pinTxt: { fontSize: 9, fontWeight: '700', color: colors.primary },
  cmtTime: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  cmtText: { color: 'rgba(255,255,255,0.87)', fontSize: 13, lineHeight: 18 },
  cmtLike: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  cmtLikeTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.12)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
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
  const flatListRef = useRef<FlatList>(null);

  const { videos: liveShorts } = useVideos({ type: 'short' });

  const allShorts: ShortItem[] = liveShorts.map((v) => ({
    id:          v.id,
    title:       v.title,
    description: v.assetTags.length > 0 ? `#${v.assetTags.join(' #')}` : '',
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
    category:
      v.category === 'kripto'   ? 'Kripto'   :
      v.category === 'hisseler' ? 'Hisseler' :
      v.category === 'emtialar' ? 'Emtia'    :
      v.category === 'for_you'  ? 'Tümü'     :
      (() => {
        const tags = (v.assetTags ?? []).map((t: string) => t.toUpperCase());
        if (['USD','EUR','GBP','JPY','TRY','USDTRY','EURTRY'].some(c => tags.some(t => t.includes(c)))) return 'Döviz';
        if (['XAU','GOLD','OIL','SILVER','WTI'].some(c => tags.includes(c))) return 'Emtia';
        return 'Tümü';
      })(),
  }));

  const filtered = activeCat === 'Tümü'
    ? allShorts
    : allShorts.filter((s) => s.category === activeCat);

  // Kategori değişince en başa dön
  useEffect(() => {
    setActiveIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [activeCat]);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = useCallback(
    ({ item, index }: { item: ShortItem; index: number }) => (
      <ShortCard
        item={item}
        screenHeight={ITEM_H}
        isActive={index === activeIndex}
        preload={index === activeIndex + 1}
      />
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
      {filtered.length === 0 ? (
        <View style={ss.emptyWrap}>
          <Ionicons name="videocam-outline" size={52} color="rgba(255,255,255,0.3)" />
          <Text style={ss.emptyTitle}>Henüz Short Yok</Text>
          <Text style={ss.emptyDesc}>
            {activeCat === 'Tümü'
              ? 'Topluluk shortları burada görünecek'
              : `${activeCat} kategorisinde henüz short paylaşılmamış`}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
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
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 20 },

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
