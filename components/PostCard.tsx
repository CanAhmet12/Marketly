import React, { useRef, useCallback, memo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Image, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadow } from '../constants/theme';
import type { Post } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';

const TIER_COLOR: Record<string, string> = {
  elite: '#FFD700',
  pro:   '#007AFF',
  free:  '#9AA0AF',
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  return `${d}g`;
}

interface Props {
  post:       Post;
  onLike:     (id: string) => void;
  onDelete?:  (id: string) => void;
}

export const PostCard = memo(function PostCard({ post: p, onLike, onDelete }: Props) {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const scale = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onLike(p.id);
  }, [onLike, p.id, scale]);

  const tierColor = TIER_COLOR[p.author_tier] ?? TIER_COLOR.free;
  const isOwner   = user?.id === p.user_id;

  return (
    <View style={s.card}>
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
                <Text style={s.avatarLetter}>{p.author_name[0]?.toUpperCase()}</Text>
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
        <Image
          source={{ uri: p.image_url }}
          style={s.postImage}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={s.actions}>
        <Pressable style={s.actionBtn} onPress={handleLike}>
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

        <Pressable style={s.actionBtn}>
          <Ionicons name="chatbubble-outline" size={19} color={colors.textMuted} />
          <Text style={s.actionTxt}>{p.comments > 0 ? p.comments : ''}</Text>
        </Pressable>

        <Pressable style={s.actionBtn}>
          <Ionicons name="repeat-outline" size={20} color={colors.textMuted} />
        </Pressable>

        <Pressable style={[s.actionBtn, { marginLeft: 'auto' }]}>
          <Ionicons name="bookmark-outline" size={19} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPure,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },

  authorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    backgroundColor: colors.bgInput,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 15, fontWeight: '800', color: colors.textMuted },
  tierDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: colors.bgPure,
  },

  authorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.text },
  tierBadge: { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1.5 },
  tierTxt:   { fontSize: 9, fontWeight: '800' },
  handleTime:{ fontSize: 11, color: colors.textMuted, marginTop: 1 },

  rightMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assetTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  assetTagTxt: { fontSize: 12, fontWeight: '800', color: colors.primary },
  menuBtn: { padding: 4 },

  content: { fontSize: 14, color: colors.text, lineHeight: 21 },

  postImage: {
    width: '100%', height: 200,
    borderRadius: 12, backgroundColor: colors.bgInput,
  },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8,
  },
  actionTxt: { fontSize: 13, color: colors.textMuted, fontWeight: '600', minWidth: 16 },
});
