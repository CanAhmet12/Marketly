import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, FlatList, Share, Dimensions,
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
import { SignalCard } from '../components/SignalCard';
import { BadgesRow } from '../components/BadgesRow';
import { useToast } from '../contexts/ToastContext';
import { notifyFollower } from '../services/notificationService';
import { radius, shadow, colors, font } from '../constants/theme';
import { supabase } from '../lib/supabase';

const SCREEN_W = Dimensions.get('window').width;
const GRID_ITEM = (SCREEN_W - 3) / 3; // 3 sütun, 1px boşluk

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

  type UPTab = 'posts' | 'signals';
  const [activeTab,   setActiveTab]   = useState<UPTab>('posts');
  const [gridView,    setGridView]    = useState(true);   // grid vs liste

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

      {/* Yükleniyor durumu */}
      {profileLoading && userPosts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>Profil yükleniyor...</Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
        style={profileLoading && userPosts.length === 0 ? { opacity: 0 } : undefined}
      >

        {/* Cover */}
        <View style={s.coverWrap}>
          {(profile as any)?.cover_url ? (
            <Image
              source={{ uri: (profile as any).cover_url }}
              style={s.cover}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient colors={['#0D1F3C', '#1A1050', '#0A0A1A']} style={s.cover} />
          )}
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
              onPress={() => navigation.navigate('Messaging', {
                openUserId: userId,
                otherUser: {
                  id:         userId,
                  username:   handle.replace('@', ''),
                  full_name:  displayName,
                  avatar_url: avatarUri,
                  verified:   isVerified,
                },
              })}
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

        {/* ── Tab bar + view toggle ── */}
        <View style={s.tabBar}>
          <View style={s.tabRow}>
            {([
              { id: 'posts',   label: 'Gönderiler', icon: 'grid-outline' },
              { id: 'signals', label: 'Sinyaller',  icon: 'pulse-outline' },
            ] as { id: UPTab; label: string; icon: string }[]).map(t => (
              <Pressable
                key={t.id}
                style={[s.tabBtn, activeTab === t.id && s.tabBtnActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Ionicons
                  name={t.icon as any}
                  size={16}
                  color={activeTab === t.id ? colors.primary : colors.textMuted}
                />
                <Text style={[s.tabBtnTxt, activeTab === t.id && s.tabBtnTxtActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {activeTab === 'posts' && (
            <View style={s.viewToggle}>
              <Pressable
                onPress={() => setGridView(true)}
                style={[s.viewBtn, gridView && s.viewBtnActive]}
                hitSlop={6}
              >
                <Ionicons name="grid" size={16} color={gridView ? colors.primary : colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => setGridView(false)}
                style={[s.viewBtn, !gridView && s.viewBtnActive]}
                hitSlop={6}
              >
                <Ionicons name="list" size={16} color={!gridView ? colors.primary : colors.textMuted} />
              </Pressable>
            </View>
          )}
        </View>

        {/* ── İçerik ── */}
        {activeTab === 'posts' ? (
          userPosts.length === 0 ? (
            <View style={s.emptyPosts}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.textMuted} />
              <Text style={s.emptyPostsTxt}>Henüz gönderi yok</Text>
            </View>
          ) : gridView ? (
            // 3'lü grid görünüm
            <View style={s.grid}>
              {userPosts.map((p, i) => {
                const thumb = p.image_url ?? p.thumbnail_url;
                return (
                  <Pressable
                    key={p.id}
                    style={[s.gridItem, {
                      marginRight: (i + 1) % 3 === 0 ? 0 : 1,
                      marginBottom: 1,
                    }]}
                    onPress={() => {
                      if (p.type === 'video' || p.type === 'short') {
                        navigation.navigate('VideoDetail', { item: p });
                      }
                    }}
                  >
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={s.gridThumb} resizeMode="cover" />
                    ) : (
                      <View style={[s.gridThumb, s.gridThumbText]}>
                        <Text style={s.gridThumbTxt} numberOfLines={3}>{p.content}</Text>
                      </View>
                    )}
                    {(p.type === 'video' || p.type === 'short') && (
                      <View style={s.gridPlayIcon}>
                        <Ionicons name="play" size={14} color="#FFF" />
                      </View>
                    )}
                    {p.likes > 0 && (
                      <View style={s.gridLikes}>
                        <Ionicons name="heart" size={10} color="#FFF" />
                        <Text style={s.gridLikesTxt}>{p.likes >= 1000 ? `${(p.likes/1000).toFixed(1)}K` : p.likes}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            // Liste görünümü
            <View>
              {userPosts.map(p => (
                <PostCard key={p.id} post={p} onLike={toggleLike} onCommentAdded={refreshPosts} />
              ))}
            </View>
          )
        ) : (
          // Sinyaller tab
          userSignals.length === 0 ? (
            <View style={s.emptyPosts}>
              <Ionicons name="pulse-outline" size={36} color={colors.textMuted} />
              <Text style={s.emptyPostsTxt}>Henüz sinyal yok</Text>
            </View>
          ) : (
            <View>
              {userSignals.map(sig => (
                <SignalCard key={sig.id} signal={sig as any} />
              ))}
            </View>
          )
        )}
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

  // Tab bar
  tabBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    backgroundColor: colors.bgPure,
    marginTop: 12,
  },
  tabRow:          { flexDirection: 'row', flex: 1 },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive:    { borderBottomColor: colors.primary },
  tabBtnTxt:       { fontSize: 13, fontFamily: font.semiBold, color: colors.textMuted },
  tabBtnTxtActive: { color: colors.primary, fontFamily: font.bold },
  viewToggle: { flexDirection: 'row', paddingRight: 10, gap: 2 },
  viewBtn:       { padding: 8, borderRadius: 8 },
  viewBtnActive: { backgroundColor: colors.primaryLight },

  // Grid görünüm
  grid:          { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem:      { width: GRID_ITEM, height: GRID_ITEM, overflow: 'hidden', backgroundColor: colors.bg },
  gridThumb:     { width: '100%', height: '100%' },
  gridThumbText: { backgroundColor: colors.bgPure, padding: 8, justifyContent: 'center' },
  gridThumbTxt:  { fontSize: 11, color: colors.text, lineHeight: 15 },
  gridPlayIcon:  {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  gridLikes: {
    position: 'absolute', bottom: 5, left: 5,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  gridLikesTxt: { color: '#FFF', fontSize: 9, fontFamily: font.bold },
});
