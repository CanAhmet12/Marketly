import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, FlatList, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { usePosts } from '../hooks/usePosts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSignals } from '../hooks/useSignals';
import { PostCard } from '../components/PostCard';
import { BadgesRow } from '../components/BadgesRow';
import { useToast } from '../contexts/ToastContext';
import { notifyFollower } from '../services/notificationService';
import { radius, shadow, colors } from '../constants/theme';
import { supabase } from '../lib/supabase';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Props {
  userId: string;
  onBack:  () => void;
}

export function UserProfileScreen({ userId, onBack }: Props) {
  const insets     = useSafeAreaInsets();
  const { user: me } = useAuth();
  const toast      = useToast();
  const navigation = useNavigation<any>();

  const { isFollowing, followersCount, followingCount, toggle, loading: followLoading } = useFollow(userId);
  const { posts: userPosts, toggleLike, refresh: refreshPosts } = usePosts(undefined, 'all', userId);
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { signals: userSignals } = useSignals({ creatorId: userId });

  // Bu kullanıcının rozetlerini yükle
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  useEffect(() => {
    supabase.from('user_badges').select('badge_id').eq('user_id', userId)
      .then(({ data }) => setEarnedBadgeIds((data ?? []).map((b: any) => b.badge_id)));
  }, [userId]);

  // Profil bilgisi: Supabase'den çekildi ise kullan, yoksa post verisinden al
  const displayName = profile?.displayName ?? userPosts[0]?.author_name ?? 'Kullanıcı';
  const handle      = profile?.handle ?? userPosts[0]?.author_handle ?? '@kullanici';
  const avatarUri   = profile?.avatarUri ?? userPosts[0]?.author_avatar ?? `https://i.pravatar.cc/200?u=${userId}`;
  const bio         = profile?.bio ?? null;
  const isVerified  = profile?.verified ?? false;
  const tier        = profile?.tier ?? 'free';
  const tierColor   = tier === 'elite' ? '#FFD700' : tier === 'pro' ? '#007AFF' : '#9AA0AF';

  const isMe = me?.id === userId;

  const handleFollow = useCallback(async () => {
    if (!me) { navigation.navigate('Login'); return; }
    const wasFollowing = isFollowing;
    const ok = await toggle();
    if (ok) {
      if (!wasFollowing) {
        toast.success(`${displayName} takip ediliyor ✓`);
        // Takip edilen kişiye bildirim gönder
        notifyFollower({ type: 'new_follower', actorName: me.name ?? 'Biri' });
      } else {
        toast.info(`${displayName} takipten çıkarıldı`);
      }
    }
  }, [isFollowing, toggle, me, displayName, navigation, toast]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>{handle}</Text>
        <Pressable
          style={s.moreBtn}
          onPress={() => Share.share({
            message: `${displayName} (${handle}) — Marketly'de takip et`,
            title: displayName,
          })}
          hitSlop={10}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}>

        {/* Cover */}
        <View style={s.coverWrap}>
          <LinearGradient colors={['#0D1F3C', '#1A1050', '#0A0A1A']} style={s.cover} />
        </View>

        {/* Avatar + identity */}
        <View style={s.identBlock}>
          <View style={s.avatarRing}>
            <Image
              source={{ uri: avatarUri ?? `https://i.pravatar.cc/200?u=${userId}` }}
              style={s.avatar}
            />
          </View>
          <View style={s.nameArea}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.displayName}>{displayName}</Text>
              {isVerified && (
                <View style={s.verifiedDot}>
                  <Ionicons name="checkmark" size={9} color="#FFF" />
                </View>
              )}
              {tier !== 'free' && (
                <View style={[s.tierChip, { backgroundColor: tierColor + '22', borderColor: tierColor + '40' }]}>
                  <Text style={[s.tierChipTxt, { color: tierColor }]}>{tier.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Text style={s.handleTxt}>{handle}</Text>
            {bio ? <Text style={s.bioTxt} numberOfLines={2}>{bio}</Text> : null}
          </View>
        </View>

        {/* Follow / Message buttons */}
        {!isMe && (
          <View style={s.actionRow}>
            <Pressable
              style={[
                s.followBtn,
                isFollowing && s.followBtnActive,
              ]}
              onPress={handleFollow}
              disabled={followLoading}
            >
              {followLoading
                ? <ActivityIndicator size="small" color={isFollowing ? '#fff' : colors.primary} />
                : <>
                    <Ionicons
                      name={isFollowing ? 'checkmark' : 'person-add-outline'}
                      size={15}
                      color={isFollowing ? '#fff' : colors.primary}
                    />
                    <Text style={[s.followBtnTxt, isFollowing && s.followBtnTxtActive]}>
                      {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                    </Text>
                  </>
              }
            </Pressable>
            <Pressable
              style={s.msgBtn}
              onPress={() => toast.info('Mesajlaşma yakında 💬')}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
              <Text style={s.msgBtnTxt}>Mesaj</Text>
            </Pressable>
          </View>
        )}

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: fmt(profile?.follower_count  ?? followersCount), lbl: 'Takipçi' },
            { val: fmt(profile?.following_count ?? followingCount), lbl: 'Takip' },
            { val: String(userPosts.length), lbl: 'Gönderi' },
            ...(userSignals.length > 0 ? [{ val: String(userSignals.length), lbl: 'Sinyal' }] : []),
            ...(profile?.signal_accuracy != null ? [{ val: `${profile.signal_accuracy.toFixed(1)}%`, lbl: 'Doğruluk' }] : []),
          ].map((st, i) => (
            <React.Fragment key={st.lbl}>
              {i > 0 && <View style={s.statsDivider} />}
              <View style={s.stat}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Badges */}
        {earnedBadgeIds.length > 0 && (
          <View style={{ marginTop: 12, marginBottom: 4 }}>
            <BadgesRow earnedIds={earnedBadgeIds} compact />
          </View>
        )}

        {/* Posts */}
        <View style={s.postsSection}>
          <Text style={s.postsSectionTitle}>Gönderiler</Text>
          {userPosts.length === 0 ? (
            <View style={s.emptyPosts}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.textMuted} />
              <Text style={s.emptyPostsTxt}>Henüz gönderi yok</Text>
            </View>
          ) : (
            userPosts.map(p => (
              <PostCard key={p.id} post={p} onLike={toggleLike} onCommentAdded={refreshPosts} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  moreBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  coverWrap: { height: 110 },
  cover:     { width: '100%', height: '100%' },

  identBlock: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 14,
    paddingHorizontal: 16, marginTop: -32,
  },
  avatarRing: {
    width: 76, height: 76, borderRadius: 22,
    borderWidth: 3, borderColor: colors.bgPure,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  nameArea: { flex: 1, paddingBottom: 4 },
  displayName: { fontSize: 17, fontWeight: '900', color: colors.text },
  handleTxt:   { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  actionRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  followBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 42, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.primary + '50',
    backgroundColor: colors.primaryLight,
  },
  followBtnActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  followBtnTxt: { fontSize: 14, fontWeight: '800', color: colors.primary },
  followBtnTxtActive: { color: '#fff' },

  msgBtn: {
    width: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 42, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.bgPure,
  },
  msgBtnTxt: { fontSize: 13, fontWeight: '700', color: colors.text },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.bgPure, marginHorizontal: 16, marginTop: 14,
    borderRadius: 14, ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  stat:         { flex: 1, alignItems: 'center' },
  statVal:      { fontSize: 18, fontWeight: '900', color: colors.text },
  statLbl:      { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  statsDivider: { width: 1, backgroundColor: colors.divider },

  postsSection:     { paddingTop: 8 },
  postsSectionTitle:{ fontSize: 13, fontWeight: '800', color: colors.text, paddingHorizontal: 16, paddingVertical: 8 },
  emptyPosts:       { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyPostsTxt:    { fontSize: 14, color: colors.textMuted },

  bioTxt:      { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
  verifiedDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  tierChip:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  tierChipTxt: { fontSize: 9, fontWeight: '800' },
});
