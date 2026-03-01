import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ScrollView,
  TextInput, StatusBar, ImageBackground, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { VideoItem } from '../data/mockVideos';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useVideoComments } from '../hooks/useVideoComments';
import { radius, shadow, colors } from '../constants/theme';

// ─── Video oynatıcı bileşeni ──────────────────────────────────────────────────
function VideoPlayer({ uri, thumbnail }: { uri: string; thumbnail: string }) {
  const [playing, setPlaying] = useState(false);
  const player = useVideoPlayer(uri, p => { p.loop = false; });

  const toggle = () => {
    try {
      if (playing) { player.pause(); setPlaying(false); }
      else         { player.play();  setPlaying(true);  }
    } catch {}
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={toggle}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {!playing && (
        <View style={vp.overlay}>
          <View style={vp.playBtn}>
            <Ionicons name="play" size={34} color="#FFF" />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const vp = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
});

interface Props { item: VideoItem; onBack: () => void }

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'az önce';
  if (mins < 60)  return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COMMENTS = [
  {
    id: '1', user: 'Ali Kaya',   avatar: 'https://i.pravatar.cc/40?u=ak1',
    time: '2 sa önce', text: '🔥 Harika analiz! BTC için 70K hedefi gerçekçi görünüyor.', likes: 48,
    isPinned: true,
  },
  {
    id: '2', user: 'Zeynep M.',  avatar: 'https://i.pravatar.cc/40?u=zm1',
    time: '3 sa önce', text: 'Ethereum için de analiz yapabilir misin? 🤔', likes: 23,
    isPinned: false,
  },
  {
    id: '3', user: 'Burak Sarı', avatar: 'https://i.pravatar.cc/40?u=bs1',
    time: '5 sa önce', text: 'Stop loss 60K olarak aldım, hedef 72K. Teşekkürler! 💪', likes: 31,
    isPinned: false,
  },
  {
    id: '4', user: 'Selin Ak.',  avatar: 'https://i.pravatar.cc/40?u=sa1',
    time: '7 sa önce', text: 'Uzun süredir bu kalitede içerik arıyordum ❤️', likes: 19,
    isPinned: false,
  },
];

const RELATED = [
  {
    id: 'r1', title: 'Altın Fırsat mı? XAU/USD Analiz',
    thumb: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
    creator: 'Emtia Pro', views: '8.2K', duration: '11:05',
  },
  {
    id: 'r2', title: 'Nasdaq Teknik Analiz — Kritik Seviyeler',
    thumb: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400',
    creator: 'Market Day', views: '12K', duration: '14:20',
  },
  {
    id: 'r3', title: 'BIST100 Günlük Özet ve Tahminler',
    thumb: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
    creator: 'BIST Takip', views: '5.1K', duration: '9:48',
  },
  {
    id: 'r4', title: 'Fed Kararı Sonrası Portföy Stratejisi',
    thumb: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=400',
    creator: 'Macro King', views: '31K', duration: '17:44',
  },
];

// ─── Asset Mini Card ──────────────────────────────────────────────────────────
function AssetMiniCard({ tag, price, change }: { tag: string; price?: string; change?: number }) {
  if (!price) return null;
  const up = (change ?? 0) >= 0;
  return (
    <View style={am.card}>
      <View style={[am.logo, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
        <Text style={[am.logoTxt, { color: up ? colors.rise : colors.fall }]}>
          {tag.replace('$', '').slice(0, 3)}
        </Text>
      </View>
      <View style={am.info}>
        <Text style={am.sym}>{tag}</Text>
        <Text style={am.name}>Canlı Fiyat</Text>
      </View>
      <View style={am.right}>
        <Text style={am.price}>{price}</Text>
        {change != null && (
          <View style={[am.pill, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
            <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={9} color={up ? colors.rise : colors.fall} />
            <Text style={[am.pct, { color: up ? colors.rise : colors.fall }]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
      <View style={[am.alertBtn]}>
        <Ionicons name="notifications-outline" size={14} color={colors.textMuted} />
      </View>
    </View>
  );
}

const am = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  logo: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  logoTxt: { fontSize: 11, fontWeight: '900' },
  info: { flex: 1 },
  sym: { fontSize: 13, fontWeight: '800', color: colors.text },
  name: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: 15, fontWeight: '900', color: colors.text },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full,
  },
  pct: { fontSize: 11, fontWeight: '800' },
  alertBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.bgPure, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Creator Stats Bar ────────────────────────────────────────────────────────
function CreatorStatsBar({ creator, following, onFollow }: {
  creator: VideoItem['creator'];
  following: boolean;
  onFollow: () => void;
}) {
  return (
    <View style={csb.wrap}>
      <View style={csb.left}>
        <Image source={{ uri: creator.avatar }} style={csb.avatar} />
        <View style={csb.info}>
          <View style={csb.nameRow}>
            <Text style={csb.name}>{creator.name}</Text>
            {creator.verified && (
              <View style={csb.verifiedBadge}>
                <Ionicons name="checkmark" size={8} color="#FFF" />
              </View>
            )}
          </View>
          <View style={csb.statsRow}>
            <View style={csb.successPill}>
              <Text style={csb.successTxt}>%82 başarı</Text>
            </View>
            <Text style={csb.dot}>·</Text>
            <Text style={csb.followersTxt}>{creator.followers ?? '–'} takipçi</Text>
          </View>
        </View>
      </View>
      <Pressable style={[csb.followBtn, following && csb.followBtnActive]} onPress={onFollow}>
        <Text style={[csb.followTxt, following && csb.followTxtActive]}>
          {following ? '✓ Takipte' : '+ Takip'}
        </Text>
      </Pressable>
    </View>
  );
}

const csb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    gap: 10,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontWeight: '800', color: colors.text },
  verifiedBadge: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  successPill: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  successTxt: { fontSize: 10, fontWeight: '700', color: colors.primaryDark },
  dot: { fontSize: 10, color: colors.textMuted },
  followersTxt: { fontSize: 11, color: colors.textMuted },
  followBtn: {
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 7,
  },
  followBtnActive: { backgroundColor: colors.primary },
  followTxt: { fontSize: 13, fontWeight: '700', color: colors.primary },
  followTxtActive: { color: '#FFF' },
});

// ─── Action Bar ───────────────────────────────────────────────────────────────
function ActionBar({ liked, saved, likeCount, commentCount, shareCount, onLike, onSave, onShare }: {
  liked: boolean; saved: boolean;
  likeCount: number; commentCount: number; shareCount: number;
  onLike: () => void; onSave: () => void; onShare: () => void;
}) {
  const likeAnim = useRef(new Animated.Value(1)).current;
  const handleLike = () => {
    Animated.sequence([
      Animated.timing(likeAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(likeAnim, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start();
    onLike();
  };

  return (
    <View style={ab.wrap}>
      {/* Left side: like / comment / share */}
      <View style={ab.leftGroup}>
        <Pressable style={ab.item} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.fall : colors.textSub} />
          </Animated.View>
          <Text style={[ab.itemTxt, liked && { color: colors.fall }]}>{fmt(likeCount + (liked ? 1 : 0))}</Text>
        </Pressable>

        <Pressable style={ab.item}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.textSub} />
          <Text style={ab.itemTxt}>{fmt(commentCount)}</Text>
        </Pressable>

        <Pressable style={ab.item} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color={colors.textSub} />
          <Text style={ab.itemTxt}>{fmt(shareCount)}</Text>
        </Pressable>
      </View>

      {/* Right side: bookmark + flag */}
      <View style={ab.rightGroup}>
        <Pressable
          style={[ab.saveBtn, saved && ab.saveBtnActive]}
          onPress={onSave}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? '#FFF' : colors.textSub} />
          <Text style={[ab.saveTxt, saved && ab.saveTxtActive]}>{saved ? 'Kaydedildi' : 'Kaydet'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ab = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  itemTxt: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  saveBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  saveTxt: { fontSize: 12, fontWeight: '700', color: colors.textSub },
  saveTxtActive: { color: '#FFF' },
});

// ─── Comment Row ──────────────────────────────────────────────────────────────
function CommentRow({ c, liked, onLike, onDelete }: {
  c: { id: string; user: string; avatar: string; time: string; text: string; likes: number; isPinned: boolean };
  liked: boolean;
  onLike: () => void;
  onDelete?: () => void;
}) {
  return (
    <View style={cm.row}>
      <Image source={{ uri: c.avatar }} style={cm.avatar} />
      <View style={cm.body}>
        <View style={cm.header}>
          <Text style={cm.user}>{c.user}</Text>
          {c.isPinned && (
            <View style={cm.pinBadge}>
              <Ionicons name="pin" size={9} color={colors.primary} />
              <Text style={cm.pinTxt}>Sabitlendi</Text>
            </View>
          )}
          <Text style={cm.time}>{c.time}</Text>
          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={13} color={colors.fall} />
            </Pressable>
          )}
        </View>
        <Text style={cm.text}>{c.text}</Text>
        <View style={cm.footer}>
          <Pressable style={cm.likeBtn} onPress={onLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? colors.fall : colors.textMuted} />
            <Text style={[cm.likeTxt, liked && { color: colors.fall }]}>{liked ? c.likes + 1 : c.likes}</Text>
          </Pressable>
          <Pressable>
            <Text style={cm.reply}>Yanıtla</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const cm = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  body: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  user: { fontSize: 13, fontWeight: '700', color: colors.text },
  pinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  pinTxt: { fontSize: 9, fontWeight: '700', color: colors.primary },
  time: { fontSize: 11, color: colors.textMuted },
  text: { fontSize: 14, color: colors.text, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeTxt: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  reply: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export function VideoDetailScreen({ item, onBack }: Props) {
  const insets  = useSafeAreaInsets();
  const toast   = useToast();
  const { user, profile } = useAuth();

  const [liked, setLiked]         = useState(false);
  const [saved, setSaved]         = useState(false);
  const [following, setFollowing] = useState(false);
  const [comment, setComment]     = useState('');
  const [likedCmts, setLikedCmts] = useState<Record<string, boolean>>({});

  const {
    comments: liveComments,
    loading:  cmtLoading,
    sending:  cmtSending,
    sendComment,
    deleteComment,
    likeComment,
  } = useVideoComments(item.id);

  // Gerçek yorum varsa onları göster, yoksa mock'a düş
  const displayComments = liveComments.length > 0
    ? liveComments.map(c => ({
        id:       c.id,
        user:     c.author_name,
        avatar:   c.author_avatar ?? `https://i.pravatar.cc/40?u=${c.user_id}`,
        time:     timeAgo(c.created_at),
        text:     c.content,
        likes:    c.likes,
        isPinned: c.is_pinned,
        isOwn:    c.user_id === user?.id,
      }))
    : MOCK_COMMENTS.map(c => ({ ...c, isOwn: false }));

  const up    = (item.changePercent ?? 0) >= 0;
  const stats = item.stats ?? { likes: 0, comments: 0, shares: 0, views: 0 };

  const handleFollow = () => {
    const nf = !following;
    setFollowing(nf);
    toast.success(nf ? `${item.creator.name} takip ediliyor ✓` : 'Takipten çıkıldı');
  };

  const handleSendComment = useCallback(async () => {
    if (!comment.trim()) return;
    if (!user) { toast.error('Yorum yapmak için giriş yap'); return; }
    const ok = await sendComment(comment.trim());
    if (ok) { setComment(''); toast.success('Yorum eklendi ✓'); }
    else    { toast.error('Yorum gönderilemedi'); }
  }, [comment, user, sendComment, toast]);

  return (
    <View style={[v.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Video / Thumbnail ── */}
      <View style={v.videoWrap}>
        {/* Gerçek video varsa VideoPlayer, yoksa thumbnail */}
        {item.videoUrl ? (
          <VideoPlayer uri={item.videoUrl} thumbnail={item.thumbnail} />
        ) : (
          <Image source={{ uri: item.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        <View style={v.videoOverlay} />

        {/* Top bar */}
        <View style={v.topBar}>
          <Pressable onPress={onBack} style={v.circleBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>
          <View style={v.topCenter}>
            {item.isLive && (
              <View style={v.liveBadge}>
                <View style={v.liveDot} />
                <Text style={v.liveTxt}>CANLI</Text>
              </View>
            )}
          </View>
          <View style={v.topRight}>
            <Pressable
              style={v.circleBtn}
              onPress={() => toast.success('Link kopyalandı 🔗')}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
            <Pressable style={v.circleBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Center play — sadece thumbnail gösteriliyorsa göster */}
        {!item.isLive && !item.videoUrl && (
          <View style={v.playWrap}>
            <View style={v.playBtn}>
              <Ionicons name="play" size={30} color="#FFF" />
            </View>
          </View>
        )}

        {/* Bottom: pills + progress bar */}
        <View style={v.videoBottom}>
          {item.assetTags.length > 0 && (
            <View style={v.pillRow}>
              {item.assetTags.map((t) => (
                <View key={t} style={v.pill}>
                  <Text style={v.pillTxt}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          {!item.isLive && (
            <View style={v.progressBar}>
              <View style={v.progressFill} />
              <View style={v.progressThumb} />
            </View>
          )}
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={v.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 + insets.bottom }}
      >
        {/* ── Title + Price ── */}
        <View style={v.titleSection}>
          <View style={v.titleRow}>
            <Text style={v.title}>{item.title}</Text>
            {item.price && (
              <View style={v.priceBox}>
                <Text style={v.price}>{item.price}</Text>
                {item.changePercent != null && (
                  <View style={[v.changePill, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
                    <Ionicons name={up ? 'caret-up' : 'caret-down'} size={10} color={up ? colors.rise : colors.fall} />
                    <Text style={[v.changeTxt, { color: up ? colors.rise : colors.fall }]}>
                      {Math.abs(item.changePercent)}%
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {item.assetTags.length > 0 && (
            <View style={v.tagRow}>
              {item.assetTags.map((t) => (
                <Pressable key={t} style={v.tag}>
                  <Text style={v.tagTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={v.meta}>
            {fmt(stats.views)} görüntülenme  ·  {item.timeAgo ?? '2 gün önce'}
            {item.duration ? `  ·  ${item.duration}` : ''}
          </Text>
        </View>

        {/* ── Asset Mini Cards ── */}
        {item.assetTags.length > 0 && (
          <View style={v.assetCards}>
            {item.assetTags.slice(0, 2).map((tag) => (
              <AssetMiniCard
                key={tag}
                tag={tag}
                price={item.price}
                change={item.changePercent}
              />
            ))}
          </View>
        )}

        {/* ── Creator Bar ── */}
        <CreatorStatsBar creator={item.creator} following={following} onFollow={handleFollow} />

        {/* ── Action Bar ── */}
        <ActionBar
          liked={liked}
          saved={saved}
          likeCount={stats.likes}
          commentCount={stats.comments}
          shareCount={stats.shares}
          onLike={() => { setLiked(!liked); if (!liked) toast.success('Video beğenildi ❤️'); }}
          onSave={() => { setSaved(!saved); toast.success(saved ? 'Kaydedilenlerden çıkarıldı' : 'Kaydedildi 🔖'); }}
          onShare={() => toast.success('Link paylaşıldı 🔗')}
        />

        {/* ── Disclaimer ── */}
        <View style={v.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.warning} />
          <Text style={v.disclaimerTxt}>
            Bu içerik yatırım tavsiyesi değildir. Yalnızca eğitim ve bilgilendirme amaçlıdır.
          </Text>
        </View>

        {/* ── Related Videos ── */}
        <View style={v.section}>
          <View style={v.sectionHeader}>
            <View style={v.sectionAccent} />
            <Text style={v.sectionTitle}>İlgili Videolar</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={v.relatedRow}>
            {RELATED.map((r) => (
              <Pressable key={r.id} style={v.relatedCard}>
                <View style={v.relatedImgWrap}>
                  <Image source={{ uri: r.thumb }} style={v.relatedThumb} />
                  <View style={v.relatedOverlay} />
                  <View style={v.relatedDuration}>
                    <Text style={v.relatedDurationTxt}>{r.duration}</Text>
                  </View>
                </View>
                <View style={v.relatedInfo}>
                  <Text style={v.relatedCardTitle} numberOfLines={2}>{r.title}</Text>
                  <Text style={v.relatedMeta}>{r.creator}  ·  {r.views} izlenme</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Comments ── */}
        <View style={v.commentsSection}>
          <View style={v.sectionHeader}>
            <View style={v.sectionAccent} />
            <Text style={v.sectionTitle}>Yorumlar</Text>
            <Text style={v.commentsCount}>{fmt(stats.comments)}</Text>
          </View>

          {/* Input */}
          <View style={v.commentInputWrap}>
            <View style={v.myAvatar}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
                {(profile?.full_name ?? user?.email ?? 'M').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={v.inputBox}>
              <TextInput
                style={v.input}
                placeholder={user ? 'Düşüncelerini paylaş...' : 'Yorum yapmak için giriş yap'}
                placeholderTextColor={colors.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />
            </View>
            {comment.length > 0 && (
              <Pressable
                style={v.sendBtn}
                onPress={handleSendComment}
                disabled={cmtSending}
              >
                {cmtSending
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Ionicons name="send" size={16} color="#FFF" />
                }
              </Pressable>
            )}
          </View>

          {/* Comment list */}
          {cmtLoading && liveComments.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            displayComments.map((c) => (
              <CommentRow
                key={c.id}
                c={c}
                liked={!!likedCmts[c.id]}
                onLike={() => {
                  setLikedCmts((l) => ({ ...l, [c.id]: !l[c.id] }));
                  if (!likedCmts[c.id]) likeComment(c.id);
                }}
                onDelete={(c as any).isOwn ? () => deleteComment(c.id) : undefined}
              />
            ))
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const v = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPure },
  scroll: { flex: 1 },

  // Video
  videoWrap: { width: '100%', aspectRatio: 1.65, justifyContent: 'space-between' },
  videoOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.22)' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, gap: 8,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center', justifyContent: 'center',
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topRight: { flexDirection: 'row', gap: 6 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.fall, borderRadius: radius.xs,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  playWrap: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.52)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    paddingLeft: 4,
  },
  videoBottom: { paddingHorizontal: 12, paddingBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  pill: { backgroundColor: colors.primary, borderRadius: radius.xs, paddingHorizontal: 9, paddingVertical: 4 },
  pillTxt: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  progressBar: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: 2, flexDirection: 'row', alignItems: 'center',
  },
  progressFill: { width: '35%', height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  progressThumb: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF',
    marginLeft: -1, ...shadow.sm,
  },

  // Title section
  titleSection: {
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text, lineHeight: 24 },
  priceBox: { alignItems: 'flex-end', gap: 5 },
  price: { fontSize: 17, fontWeight: '900', color: colors.text },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  changeTxt: { fontSize: 12, fontWeight: '800' },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  meta: { fontSize: 12, color: colors.textMuted },

  // Asset cards
  assetCards: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 14, marginVertical: 10,
    backgroundColor: '#FFFBF0', borderRadius: radius.sm, padding: 10,
    borderLeftWidth: 3, borderLeftColor: colors.warning,
  },
  disclaimerTxt: { flex: 1, fontSize: 11, color: colors.textMuted, lineHeight: 16 },

  // Sections
  section: { paddingTop: 14, paddingBottom: 4 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, marginBottom: 10,
  },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.text },
  commentsCount: { fontSize: 13, color: colors.textMuted },

  // Related
  relatedRow: { paddingHorizontal: 14, gap: 10 },
  relatedCard: {
    width: 170, backgroundColor: colors.bgPure, borderRadius: radius.md,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },
  relatedImgWrap: { position: 'relative' },
  relatedThumb: { width: '100%', aspectRatio: 16 / 10 },
  relatedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },
  relatedDuration: {
    position: 'absolute', bottom: 5, right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  relatedDurationTxt: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  relatedInfo: { padding: 10 },
  relatedCardTitle: { fontSize: 12, fontWeight: '700', color: colors.text, lineHeight: 16, marginBottom: 4 },
  relatedMeta: { fontSize: 10, color: colors.textMuted },

  // Comments
  commentsSection: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  commentInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 10, paddingVertical: 8, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  myAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  inputBox: { flex: 1 },
  input: { fontSize: 14, color: colors.text, paddingVertical: 0 },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 12, marginTop: 4,
    backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  loadMoreTxt: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
