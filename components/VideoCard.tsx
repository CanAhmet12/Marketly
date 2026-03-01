import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Image, ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VideoItem } from '../data/mockVideos';
import { colors, radius, shadow } from '../constants/theme';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ─── Small creator row (avatar + name + verified) ─────────────────────────────
function CreatorRow({
  avatar, name, verified, followers, size = 'md',
}: {
  avatar: string; name: string; verified?: boolean;
  followers?: string; size?: 'sm' | 'md';
}) {
  const small = size === 'sm';
  return (
    <View style={cr.row}>
      <Image
        source={{ uri: avatar }}
        style={[cr.avatar, small && cr.avatarSm]}
      />
      <Text style={[cr.name, small && cr.nameSm]} numberOfLines={1}>{name}</Text>
      {verified && (
        <View style={[cr.badge, small && cr.badgeSm]}>
          <Ionicons name="checkmark" size={small ? 6 : 7} color="#FFF" />
        </View>
      )}
      {followers && !small && (
        <Text style={cr.followers}>{followers}</Text>
      )}
    </View>
  );
}

const cr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  avatarSm: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  name: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: 130 },
  nameSm: { fontSize: 11, color: 'rgba(255,255,255,0.92)', maxWidth: 100 },
  badge: {
    width: 15, height: 15, borderRadius: 7.5,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeSm: { width: 12, height: 12, borderRadius: 6 },
  followers: { fontSize: 11, color: colors.textMuted, fontWeight: '600', flex: 1 },
});

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURED CARD  –  Tam genişlik, sinematik, sosyal feed kartı
// ─────────────────────────────────────────────────────────────────────────────
export function FeaturedVideoCard({ item, onPress }: { item: VideoItem; onPress?: () => void }) {
  const toast      = useToast();
  const { user }   = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const up = (item.changePercent ?? 0) >= 0;

  // Başlangıçta beğeni/kaydetme durumunu yükle
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('video_likes').select('id').eq('user_id', user.id).eq('video_id', item.id).maybeSingle(),
      supabase.from('saved_videos').select('id').eq('user_id', user.id).eq('video_id', item.id).maybeSingle(),
    ]).then(([l, s]) => {
      if (l.data) setLiked(true);
      if (s.data) setSaved(true);
    });
  }, [user?.id, item.id]);

  return (
    <Pressable style={fc.card} onPress={onPress}>
      {/* ── Thumbnail ── */}
      <View style={fc.imgWrap}>
        <Image
          source={{ uri: item.thumbnail }}
          style={fc.img}
          resizeMode="cover"
        />

        {/* Top-left badges */}
        <View style={fc.topLeft}>
          {item.isLive && (
            <View style={fc.liveBadge}>
              <View style={fc.livePulse} />
              <Text style={fc.liveTxt}>CANLI</Text>
            </View>
          )}
          {item.assetTags[0] && (
            <View style={fc.assetBadge}>
              <Text style={fc.assetTxt}>{item.assetTags[0]}</Text>
            </View>
          )}
        </View>

        {/* Top-right: duration / save */}
        <View style={fc.topRight}>
          {item.duration && !item.isLive && (
            <View style={fc.durationBadge}>
              <Text style={fc.durationTxt}>{item.duration}</Text>
            </View>
          )}
          <Pressable
            style={fc.saveBtn}
            onPress={async (e) => {
              e.stopPropagation();
              if (!user?.id) { toast.info('Kaydetmek için giriş yap'); return; }
              const newSaved = !saved;
              setSaved(newSaved);
              if (newSaved) {
                await supabase.from('saved_videos').upsert(
                  { user_id: user.id, video_id: item.id },
                  { onConflict: 'user_id,video_id' }
                );
                toast.success('Kaydedildi 🔖');
              } else {
                await supabase.from('saved_videos').delete().eq('user_id', user.id).eq('video_id', item.id);
                toast.info('Kaydedilenlerden çıkarıldı');
              }
            }}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color={saved ? colors.warning : '#FFF'} />
          </Pressable>
        </View>

        {/* Center play */}
        <View style={fc.playCenter}>
          <View style={fc.playBtn}>
            <Ionicons name="play" size={20} color="#FFF" />
          </View>
        </View>

        {/* Bottom gradient overlay with creator info */}
        <View style={fc.bottomGrad}>
          <View style={fc.overlayContent}>
            <CreatorRow
              avatar={item.creator.avatar}
              name={item.creator.name}
              verified={item.creator.verified}
              size="sm"
            />
            <Text style={fc.overlayTitle} numberOfLines={2}>{item.title}</Text>
          </View>
        </View>
      </View>

      {/* ── Info row below image ── */}
      <View style={fc.infoRow}>
        {/* Price block */}
        {item.price ? (
          <View style={fc.priceBlock}>
            <Text style={fc.priceVal}>{item.price}</Text>
            {item.changePercent != null && (
              <View style={[fc.changePill, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
                <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={9} color={up ? colors.rise : colors.fall} />
                <Text style={[fc.changePct, { color: up ? colors.rise : colors.fall }]}>
                  {Math.abs(item.changePercent)}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <CreatorRow
              avatar={item.creator.avatar}
              name={item.creator.name}
              verified={item.creator.verified}
              followers={item.creator.followers}
            />
          </View>
        )}

        {/* Engagement buttons */}
        <View style={fc.engage}>
          <Pressable
            style={fc.engBtn}
            onPress={async (e) => {
              e.stopPropagation();
              if (!user?.id) { toast.info('Beğenmek için giriş yap'); return; }
              const newLiked = !liked;
              setLiked(newLiked);
              if (newLiked) {
                await supabase.from('video_likes').upsert(
                  { user_id: user.id, video_id: item.id },
                  { onConflict: 'user_id,video_id' }
                );
                toast.success('Video beğenildi ❤️');
              } else {
                await supabase.from('video_likes').delete().eq('user_id', user.id).eq('video_id', item.id);
              }
            }}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={17} color={liked ? colors.fall : '#9AA0AF'} />
            <Text style={[fc.engTxt, liked && { color: colors.fall }]}>
              {fmt(item.stats.likes + (liked ? 1 : 0))}
            </Text>
          </Pressable>

          <Pressable style={fc.engBtn}>
            <Ionicons name="chatbubble-outline" size={16} color="#9AA0AF" />
            <Text style={fc.engTxt}>{fmt(item.stats.comments)}</Text>
          </Pressable>

          <Pressable style={fc.engBtn}>
            <Ionicons name="arrow-redo-outline" size={16} color="#9AA0AF" />
            <Text style={fc.engTxt}>{fmt(item.stats.shares)}</Text>
          </Pressable>

          <View style={fc.engSep} />

          <View style={fc.engBtn}>
            <Ionicons name="eye-outline" size={16} color="#9AA0AF" />
            <Text style={fc.engTxt}>{fmt(item.stats.views)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const fc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.md,
  },

  // Thumbnail
  imgWrap: { width: '100%', aspectRatio: 1.7, position: 'relative', backgroundColor: '#0D0D1E' },
  img: { width: '100%', height: '100%' },

  // Top badges
  topLeft: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  topRight: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E53935', borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  livePulse: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 9.5, fontWeight: '900', letterSpacing: 1 },
  assetBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.sm,
    paddingHorizontal: 7, paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.2)',
  },
  assetTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  durationBadge: {
    backgroundColor: 'rgba(0,0,0,0.60)', borderRadius: radius.xs,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  durationTxt: { color: '#FFF', fontSize: 9.5, fontWeight: '700' },
  saveBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Play button
  playCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    paddingLeft: 3,
  },

  // Bottom overlay on image
  bottomGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  overlayContent: { gap: 5 },
  overlayTitle: {
    color: '#FFF', fontSize: 13, fontWeight: '800', lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },

  // Info row
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  priceBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceVal: { fontSize: 16, fontWeight: '900', color: '#0F0F1A' },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full,
  },
  changePct: { fontSize: 11, fontWeight: '800' },

  engage: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  engBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engTxt: { fontSize: 12, color: '#9AA0AF', fontWeight: '600' },
  engSep: { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: 'rgba(0,0,0,0.10)' },
});

// ─────────────────────────────────────────────────────────────────────────────
//  HORIZONTAL CARD  –  YouTube stili: sol thumbnail + sağ metin
// ─────────────────────────────────────────────────────────────────────────────
export function HorizontalVideoCard({ item, onPress }: { item: VideoItem; onPress?: () => void }) {
  const up = (item.changePercent ?? 0) >= 0;

  return (
    <Pressable onPress={onPress} style={hv.card}>
      {/* Thumbnail */}
      <View style={hv.thumbWrap}>
        <Image source={{ uri: item.thumbnail }} style={hv.thumb} resizeMode="cover" />

        {/* Overlay */}
        {item.isLive ? (
          <View style={hv.liveBadge}>
            <View style={hv.liveDot} />
            <Text style={hv.liveTxt}>CANLI</Text>
          </View>
        ) : item.duration ? (
          <View style={hv.durationBadge}>
            <Text style={hv.durationTxt}>{item.duration}</Text>
          </View>
        ) : null}

        {/* Play icon */}
        <View style={hv.playOverlay}>
          <Ionicons name="play-circle" size={26} color="rgba(255,255,255,0.80)" />
        </View>
      </View>

      {/* Text */}
      <View style={hv.textWrap}>
        <Text style={hv.title} numberOfLines={2}>{item.title}</Text>

        <View style={hv.meta}>
          <Image source={{ uri: item.creator.avatar }} style={hv.avatar} />
          <Text style={hv.creatorTxt} numberOfLines={1}>{item.creator.name}</Text>
          {item.creator.verified && (
            <View style={hv.verifiedBadge}>
              <Ionicons name="checkmark" size={6} color="#FFF" />
            </View>
          )}
        </View>

        <View style={hv.bottomRow}>
          {item.changePercent != null && (
            <View style={[hv.changeBadge, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
              <Ionicons name={up ? 'caret-up' : 'caret-down'} size={8} color={up ? colors.rise : colors.fall} />
              <Text style={[hv.changeText, { color: up ? colors.rise : colors.fall }]}>
                {Math.abs(item.changePercent)}%
              </Text>
            </View>
          )}
          <View style={hv.stat}>
            <Ionicons name="eye-outline" size={11} color="#9AA0AF" />
            <Text style={hv.statTxt}>{fmt(item.stats.views)}</Text>
          </View>
          {item.timeAgo && <Text style={hv.timeAgo}>{item.timeAgo}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const hv = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: 10,
    ...shadow.sm,
  },

  thumbWrap: {
    width: 110, height: 80,
    borderRadius: radius.md, overflow: 'hidden',
    backgroundColor: '#0D0D1E', position: 'relative',
    flexShrink: 0,
  },
  thumb: { width: '100%', height: '100%' },
  liveBadge: {
    position: 'absolute', top: 5, left: 5,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#E53935', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2.5,
  },
  liveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 7.5, fontWeight: '900', letterSpacing: 0.5 },
  durationBadge: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.70)', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2.5,
  },
  durationTxt: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },

  textWrap: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  title: { fontSize: 13, fontWeight: '700', color: '#0F0F1A', lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  avatar: { width: 16, height: 16, borderRadius: 8 },
  creatorTxt: { fontSize: 11, fontWeight: '600', color: '#6B7280', flex: 1 },
  verifiedBadge: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
  },

  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2,
  },
  changeText: { fontSize: 10, fontWeight: '800' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statTxt: { fontSize: 10, color: '#9AA0AF', fontWeight: '600' },
  timeAgo: { fontSize: 10, color: '#B0B8C4', marginLeft: 'auto' },
});

// ─────────────────────────────────────────────────────────────────────────────
//  TRADER CARD  (SavingsCard)  –  analist profil kartı
// ─────────────────────────────────────────────────────────────────────────────
export function SavingsCard({ item, onPress }: { item: VideoItem; onPress?: () => void }) {
  const [following, setFollowing] = useState(false);
  const toast = useToast();
  const gain = item.progress ?? 0;
  const isPos = gain >= 0;

  return (
    <Pressable onPress={onPress} style={tc.card}>
      {/* Top accent bar */}
      <View style={[tc.accentBar, { backgroundColor: isPos ? colors.rise : colors.fall }]} />

      {/* Avatar */}
      <View style={tc.avatarWrap}>
        <Image source={{ uri: item.thumbnail }} style={tc.avatar} resizeMode="cover" />
        {item.creator.verified && (
          <View style={tc.verifiedBadge}>
            <Ionicons name="checkmark" size={7} color="#FFF" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={tc.name} numberOfLines={1}>{item.creator.name}</Text>
      {item.creator.followers && (
        <Text style={tc.followers}>{item.creator.followers} takipçi</Text>
      )}

      {/* Performance pill */}
      {gain !== 0 && (
        <View style={[tc.gainPill, { backgroundColor: isPos ? colors.riseLight : colors.fallLight }]}>
          <Ionicons name={isPos ? 'trending-up' : 'trending-down'} size={12} color={isPos ? colors.rise : colors.fall} />
          <Text style={[tc.gainTxt, { color: isPos ? colors.rise : colors.fall }]}>
            {isPos ? '+' : ''}{gain}%
          </Text>
        </View>
      )}

      {/* Bio */}
      {item.subtitle && (
        <Text style={tc.bio} numberOfLines={2}>{item.subtitle}</Text>
      )}

      {/* Follow button */}
      <Pressable
        style={[tc.followBtn, following && tc.followBtnOn]}
        onPress={(e) => {
          e.stopPropagation();
          setFollowing(!following);
          toast.success(following ? 'Takipten çıkıldı' : `${item.creator.name} takip ediliyor ✓`);
        }}
      >
        {following && <Ionicons name="checkmark" size={11} color="#FFF" />}
        <Text style={[tc.followTxt, following && tc.followTxtOn]}>
          {following ? 'Takip Ediliyor' : 'Takip Et'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const tc = StyleSheet.create({
  card: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: radius.xl, paddingBottom: 14, paddingHorizontal: 12,
    alignItems: 'center', overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.07)',
    ...shadow.sm,
  },
  accentBar: { width: '100%', height: 4, marginBottom: 14 },

  avatarWrap: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: colors.primary,
    marginBottom: 8, position: 'relative', overflow: 'visible',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, margin: 0 },
  verifiedBadge: {
    position: 'absolute', bottom: -1, right: -1,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },

  name: { fontSize: 13, fontWeight: '800', color: '#0F0F1A', textAlign: 'center', marginBottom: 2 },
  followers: { fontSize: 10.5, color: '#9AA0AF', marginBottom: 8, fontWeight: '500' },

  gainPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    marginBottom: 8,
  },
  gainTxt: { fontSize: 13, fontWeight: '900' },

  bio: {
    fontSize: 10.5, color: '#9AA0AF', textAlign: 'center',
    lineHeight: 14.5, marginBottom: 10, paddingHorizontal: 4,
  },

  followBtn: {
    width: '100%', paddingVertical: 9, borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.primary + '40',
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 4,
  },
  followBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  followTxt: { fontSize: 12, fontWeight: '800', color: colors.primary },
  followTxtOn: { color: '#FFF' },
});

// ─ Legacy alias (React.memo ile optimize) ────────────────────────────────────
export const VideoCard = React.memo(function VideoCard({ item, onPress }: { item: VideoItem; onPress?: () => void }) {
  if (item.type === 'savings') return <SavingsCard item={item} onPress={onPress} />;
  return <HorizontalVideoCard item={item} onPress={onPress} />;
});
