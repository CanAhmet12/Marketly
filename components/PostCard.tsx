import React, { useRef, useCallback, memo, useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Image, Animated, Alert, Share, ActionSheetIOS, Platform, Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadow, font } from '../constants/theme';
import type { Post } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { CommentSheet } from './CommentSheet';

function PostImage({ uri }: { uri: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <View style={[s.postImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgInput }]}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Görsel yüklenemedi</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={s.postImage}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

const TIER_COLOR: Record<string, string> = {
  elite: '#FFD700',
  pro:   '#007AFF',
  free:  '#9AA0AF',
};

function timeAgo(isoStr: string): string {
  if (!isoStr) return '';
  const ts = new Date(isoStr).getTime();
  if (isNaN(ts)) return '';
  const diff = Date.now() - ts;
  if (diff < 0) return 'az önce';
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}g`;
  if (d < 30) return `${Math.floor(d / 7)}hf`;
  return `${Math.floor(d / 30)}ay`;
}

interface Props {
  post:         Post;
  onLike:       (id: string) => void;
  onDelete?:    (id: string) => void;
  onCommentAdded?: () => void;
}

export const PostCard = memo(function PostCard({ post: p, onLike, onDelete, onCommentAdded }: Props) {
  const { user }   = useAuth();
  const navigation = useNavigation<any>();
  const toast      = useToast();
  const scale      = useRef(new Animated.Value(1)).current;

  const isOwner = user?.id === p.user_id;

  const [commentVisible, setCommentVisible] = useState(false);
  const [localComments,  setLocalComments]  = useState(p.comments);
  const [saved,          setSaved]          = useState(false);

  // Saved state'i DB'den başlat
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', user.id)
      .eq('post_id', p.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setSaved(true); });
  }, [user?.id, p.id]);

  // Parent'tan gelen comments güncellenince localComments'i senkronize et
  useEffect(() => {
    setLocalComments(p.comments);
  }, [p.comments]);

  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onLike(p.id);
  }, [onLike, p.id, scale]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${p.author_name}: "${p.content.slice(0, 120)}${p.content.length > 120 ? '…' : ''}" — Marketly'de görüntüle`,
        title: 'Marketly Gönderi',
      });
    } catch { /* kullanıcı iptal etti */ }
  }, [p]);

  const handleBookmark = useCallback(async () => {
    if (!user?.id) { toast.info('Kaydetmek için giriş yap'); return; }
    const newSaved = !saved;
    setSaved(newSaved);
    if (newSaved) {
      await supabase.from('saved_posts').upsert(
        { user_id: user.id, post_id: p.id },
        { onConflict: 'user_id,post_id' }
      );
      toast.success('Gönderi kaydedildi 🔖');
    } else {
      await supabase.from('saved_posts').delete()
        .eq('user_id', user.id).eq('post_id', p.id);
      toast.info('Kaydedilenlerden çıkarıldı');
    }
  }, [user?.id, p.id, saved, toast]);

  const handleLongPress = useCallback(() => {
    const copyText = p.content.slice(0, 200);
    if (Platform.OS === 'ios') {
      const options = [
        saved ? 'Kaydı Kaldır' : 'Kaydet 🔖',
        'Paylaş',
        'Kopyala',
        ...(isOwner && onDelete ? ['Sil'] : []),
        ...(!isOwner ? ['Şikayet Et'] : []),
        'İptal',
      ];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: isOwner && onDelete ? options.length - 2 : undefined },
        (idx) => {
          if (idx === 0) handleBookmark();
          else if (idx === 1) handleShare();
          else if (idx === 2) { Clipboard.setString(copyText); toast.success('Kopyalandı'); }
          else if (idx === 3 && isOwner && onDelete) {
            Alert.alert('Postu Sil', 'Emin misin?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Sil', style: 'destructive', onPress: () => onDelete(p.id) },
            ]);
          } else if (idx === 3 && !isOwner) {
            reportPost();
          }
        }
      );
    } else {
      // Android — Alert tabanlı
      const buttons: any[] = [
        { text: saved ? 'Kaydı Kaldır' : 'Kaydet 🔖', onPress: handleBookmark },
        { text: 'Paylaş', onPress: handleShare },
        { text: 'Kopyala', onPress: () => { Clipboard.setString(copyText); toast.success('Kopyalandı'); } },
        ...(!isOwner ? [{ text: 'Şikayet Et', onPress: reportPost }] : []),
        ...(isOwner && onDelete ? [{ text: 'Sil', style: 'destructive', onPress: () => {
          Alert.alert('Postu Sil', 'Emin misin?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => onDelete!(p.id) },
          ]);
        }}] : []),
        { text: 'İptal', style: 'cancel' },
      ];
      Alert.alert('Gönderi', undefined, buttons);
    }
  }, [saved, isOwner, onDelete, handleBookmark, handleShare, p.content, p.id, toast]);

  const reportPost = useCallback(async () => {
    if (!user?.id) return;
    try {
      await supabase.from('user_reports').insert({
        reporter_id: user.id,
        reported_id: p.user_id,
        post_id:     p.id,
        reason:      'inappropriate_content',
      });
      toast.success('Rapor gönderildi. İnceleyeceğiz.');
    } catch {
      toast.error('Rapor gönderilemedi');
    }
  }, [user?.id, p.id, p.user_id, toast]);

  if (!p?.id) return null;

  const tierColor = TIER_COLOR[p.author_tier] ?? TIER_COLOR.free;

  return (
    <Pressable
      style={s.card}
      onLongPress={handleLongPress}
      delayLongPress={450}
    >
      {/* Author row */}
      <View style={s.authorRow}>
        <Pressable
          style={s.avatarWrap}
          onPress={() => p.user_id !== user?.id && navigation.navigate('ProfileView', { userId: p.user_id })}
          hitSlop={8}
        >
          {p.author_avatar
            ? <Image source={{ uri: p.author_avatar }} style={s.avatar} />
            : <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarLetter}>{(p.author_name?.[0] ?? '?').toUpperCase()}</Text>
              </View>
          }
          {p.author_tier !== 'free' && (
            <View style={[s.tierDot, { backgroundColor: tierColor }]} />
          )}
        </Pressable>

        <Pressable
          style={s.authorInfo}
          onPress={() => p.user_id !== user?.id && navigation.navigate('ProfileView', { userId: p.user_id })}
        >
          <View style={s.nameRow}>
            <Text style={s.authorName}>{p.author_name}</Text>
            {p.author_tier !== 'free' && (
              <View style={[s.tierBadge, { backgroundColor: tierColor + '20' }]}>
                <Text style={[s.tierTxt, { color: tierColor }]}>
                  {p.author_tier.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={s.handleTime}>{p.author_handle} · {timeAgo(p.created_at)}</Text>
        </Pressable>

        {/* Asset tag + 3-dot */}
        <View style={s.rightMeta}>
          {p.asset_tag && (
            <Pressable
              style={s.assetTag}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={s.assetTagTxt}>${p.asset_tag}</Text>
            </Pressable>
          )}
          {isOwner && onDelete && (
            <Pressable
              onPress={() => Alert.alert('Postu Sil', 'Emin misin?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => onDelete(p.id) },
              ])}
              hitSlop={10}
              style={s.menuBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <Text style={s.content}>{p.content}</Text>

      {/* Image */}
      {p.image_url && (
        <PostImage uri={p.image_url} />
      )}

      {/* Actions */}
      <View style={s.actions}>
        {/* Beğen */}
        <Pressable
          style={s.actionBtn}
          onPress={handleLike}
          accessibilityRole="button"
          accessibilityLabel={p.is_liked ? 'Beğeniyi kaldır' : 'Beğen'}
          accessibilityState={{ selected: p.is_liked }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={p.is_liked ? 'heart' : 'heart-outline'}
              size={20}
              color={p.is_liked ? '#FF3B3B' : colors.textMuted}
            />
          </Animated.View>
          <Text style={[s.actionTxt, p.is_liked && { color: '#FF3B3B' }]}>
            {p.likes > 0 ? p.likes : ''}
          </Text>
        </Pressable>

        {/* Yorum */}
        <Pressable
          style={s.actionBtn}
          onPress={() => setCommentVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Yorumlar${localComments > 0 ? `, ${localComments} yorum` : ''}`}
        >
          <Ionicons name="chatbubble-outline" size={19} color={colors.textMuted} />
          <Text style={s.actionTxt}>{localComments > 0 ? localComments : ''}</Text>
        </Pressable>

        {/* Paylaş */}
        <Pressable
          style={s.actionBtn}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
        >
          <Ionicons name="share-social-outline" size={20} color={colors.textMuted} />
        </Pressable>

        {/* Kaydet */}
        <Pressable
          style={[s.actionBtn, { marginLeft: 'auto' }]}
          onPress={handleBookmark}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          accessibilityState={{ selected: saved }}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={19}
            color={saved ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Yorum sayfası */}
      <CommentSheet
        postId={commentVisible ? p.id : null}
        visible={commentVisible}
        onClose={() => setCommentVisible(false)}
        onCommentAdded={() => {
          setLocalComments(n => n + 1);
          onCommentAdded?.();
        }}
      />
    </Pressable>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPure,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },

  authorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarFallback: {
    backgroundColor: colors.bgInput,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, fontFamily: font.black, color: colors.primary },
  tierDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: colors.bgPure,
  },

  authorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontFamily: font.bold, color: colors.text },
  tierBadge: { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1.5 },
  tierTxt:   { fontSize: 9, fontFamily: font.bold },
  handleTime:{ fontSize: 11, fontFamily: font.regular, color: colors.textMuted, marginTop: 2 },

  rightMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assetTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  assetTagTxt: { fontSize: 12, fontFamily: font.bold, color: colors.primary },
  menuBtn: { padding: 4 },

  content: { fontSize: 15, fontFamily: font.regular, color: colors.text, lineHeight: 23 },

  postImage: {
    width: '100%', height: 220,
    borderRadius: 14, backgroundColor: colors.bgInput,
  },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10,
  },
  actionTxt: { fontSize: 13, fontFamily: font.semiBold, color: colors.textMuted, minWidth: 16 },
});
