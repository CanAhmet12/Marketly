import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator,
  RefreshControl, Alert, Animated, PanResponder, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { radius, shadow, colors, font } from '../constants/theme';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../contexts/ToastContext';

const SCREEN_W = Dimensions.get('window').width;

type NotifType = 'price_alert' | 'like' | 'comment' | 'follow' | 'market' | 'system';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatar?: string;
  icon?: string;
  iconBg?: string;
  badge?: { text: string; color: string };
}


function daysBetween(isoStr: string): number {
  const diff = Date.now() - new Date(isoStr).getTime();
  return Math.floor(diff / 86400000);
}

interface NotifWithDate extends Notif { created_at: string; }

const SECTIONS: { label: string; filter: (n: NotifWithDate) => boolean }[] = [
  { label: 'Bugün',    filter: (n) => daysBetween(n.created_at) === 0 },
  { label: 'Dün',     filter: (n) => daysBetween(n.created_at) === 1 },
  { label: 'Bu Hafta', filter: (n) => daysBetween(n.created_at) >= 2 && daysBetween(n.created_at) <= 6 },
  { label: 'Daha Eski', filter: (n) => daysBetween(n.created_at) >= 7 },
];

// ─── Swipe-to-delete sarmalayıcı ──────────────────────────────────────────────
function SwipeableRow({ onDelete, children }: { onDelete: () => void; children: React.ReactNode }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteWidth = 80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(Math.max(g.dx, -deleteWidth));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -deleteWidth / 2) {
          // Sola aç
          Animated.spring(translateX, { toValue: -deleteWidth, useNativeDriver: true }).start();
        } else {
          // Geri kapat
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, { toValue: -SCREEN_W, duration: 250, useNativeDriver: true }).start(onDelete);
  };

  return (
    <View style={{ overflow: 'hidden' }}>
      {/* Delete action arkada */}
      <View style={sw.deleteAction} pointerEvents="box-none">
        <Pressable style={sw.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="#FFF" />
          <Text style={sw.deleteTxt}>Sil</Text>
        </Pressable>
      </View>
      {/* İçerik kaydırılabilir */}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const sw = StyleSheet.create({
  deleteAction: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 80, backgroundColor: colors.fall,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: { alignItems: 'center', gap: 3 },
  deleteTxt: { color: '#FFF', fontSize: 11, fontFamily: font.bold },
});

function NotifIcon({ notif }: { notif: Notif }) {
  if (notif.avatar) {
    return (
      <View style={ic.wrap}>
        <Image source={{ uri: notif.avatar }} style={ic.avatar} />
        <View style={[ic.typeDot, { backgroundColor: TYPE_COLORS[notif.type] }]}>
          <Ionicons name={TYPE_ICONS[notif.type]} size={8} color="#FFF" />
        </View>
      </View>
    );
  }
  return (
    <View style={[ic.iconBox, { backgroundColor: notif.iconBg ?? colors.primary }]}>
      <Text style={ic.iconTxt}>{notif.icon ?? '•'}</Text>
    </View>
  );
}

const TYPE_COLORS: Record<NotifType, string> = {
  price_alert: '#FFB800',
  like: colors.fall,
  comment: colors.info,
  follow: colors.primary,
  market: '#007AFF',
  system: '#FFB800',
};

const TYPE_ICONS: Record<NotifType, React.ComponentProps<typeof Ionicons>['name']> = {
  price_alert: 'trending-up',
  like: 'heart',
  comment: 'chatbubble',
  follow: 'person-add',
  market: 'bar-chart',
  system: 'flash',
};

const ic = StyleSheet.create({
  wrap: { width: 46, height: 46, position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  typeDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.bgPure,
  },
  iconBox: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 18, fontWeight: '900', color: '#FFF' },
});

interface Props {
  onBack?: () => void;
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Dün';
  return `${d} gün önce`;
}

export function NotificationsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotifType | 'all'>('all');
  const handleBack = onBack ?? (() => navigation.goBack());
  const {
    notifications: liveNotifs,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotif,
    refetch,
  } = useNotifications();

  const handleNotifPress = useCallback((n: NotifWithDate) => {
    markRead(n.id);
    const meta = n as any;
    switch (n.type) {
      case 'price_alert':
        navigation.navigate('PriceAlerts');
        break;
      case 'like':
      case 'comment': {
        const postItem = meta.meta?.post_item;
        const postType = meta.meta?.post_type ?? postItem?.type;
        if (postItem && (postType === 'video' || postType === 'short' || postType === 'live')) {
          // Video/Short/Live post → VideoDetail
          navigation.navigate('VideoDetail', { item: postItem });
        } else if (meta.meta?.post_id) {
          // Text post → Ana akışa dön (yorum sheet açmak için post_id gerekiyor,
          // şimdilik feed'e yönlendir)
          navigation.navigate('Main', { screen: 'Akış' });
        } else {
          navigation.navigate('Main', { screen: 'Akış' });
        }
        break;
      }
      case 'follow':
        if (meta.meta?.actor_id) {
          navigation.navigate('ProfileView', { userId: meta.meta.actor_id });
        }
        break;
      case 'market':
        navigation.navigate('Main', { screen: 'Piyasalar' });
        break;
      default:
        break;
    }
  }, [markRead, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const notifications: NotifWithDate[] = liveNotifs.map(n => ({
    id:         n.id,
    type:       n.type,
    title:      n.title,
    body:       n.body,
    time:       timeAgo(n.created_at),
    read:       n.read,
    created_at: n.created_at,
    icon:       (n.meta as any)?.icon,
    iconBg:     (n.meta as any)?.iconBg,
    avatar:     (n.meta as any)?.avatar,
    badge:      (n.meta as any)?.badge,
  })).filter(n => typeFilter === 'all' || n.type === typeFilter);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={handleBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Bildirimler</Text>
          {unreadCount > 0 && (
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeTxt}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={async () => { await markAllRead(); toast.success('Tümü okundu ✓'); }}
          style={s.markAllBtn}
          disabled={unreadCount === 0}
        >
          <Ionicons name="checkmark-done-outline" size={20} color={unreadCount > 0 ? colors.primary : colors.textMuted} />
        </Pressable>
      </View>

      {/* ── Kategori filtresi ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterBarContent}
      >
        {([
          { key: 'all',         label: 'Tümü',      icon: 'notifications-outline' },
          { key: 'like',        label: 'Beğeni',    icon: 'heart-outline' },
          { key: 'comment',     label: 'Yorum',     icon: 'chatbubble-outline' },
          { key: 'follow',      label: 'Takip',     icon: 'person-add-outline' },
          { key: 'signal',      label: 'Sinyal',    icon: 'pulse-outline' },
          { key: 'price_alert', label: 'Alarm',     icon: 'alarm-outline' },
          { key: 'system',      label: 'Sistem',    icon: 'information-circle-outline' },
        ] as { key: NotifType | 'all'; label: string; icon: any }[]).map(f => {
          const active = typeFilter === f.key;
          const count = f.key === 'all'
            ? liveNotifs.length
            : liveNotifs.filter(n => n.type === f.key).length;
          if (count === 0 && f.key !== 'all') return null;
          return (
            <Pressable
              key={f.key}
              style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => setTypeFilter(f.key)}
            >
              <Ionicons name={f.icon} size={13} color={active ? '#FFF' : colors.textMuted} />
              <Text style={[s.filterChipTxt, active && s.filterChipTxtActive]}>{f.label}</Text>
              {count > 0 && (
                <View style={[s.filterChipBadge, active && s.filterChipBadgeActive]}>
                  <Text style={[s.filterChipBadgeTxt, active && { color: colors.primary }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {SECTIONS.map((sec) => {
            const items = notifications.filter(sec.filter);
            if (items.length === 0) return null;
            return (
              <View key={sec.label}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionLabel}>{sec.label}</Text>
                  <View style={s.sectionLine} />
                </View>
                {items.map((n) => (
                  <SwipeableRow key={n.id} onDelete={() => deleteNotif(n.id)}>
                    <Pressable
                      style={[s.card, !n.read && s.cardUnread]}
                      onPress={() => handleNotifPress(n)}
                    >
                      {!n.read && <View style={s.unreadDot} />}
                      <NotifIcon notif={n} />
                      <View style={s.cardBody}>
                        <View style={s.cardTitleRow}>
                          <Text style={s.cardTitle} numberOfLines={1}>{n.title}</Text>
                          {n.badge && (
                            <View style={[s.badgePill, { backgroundColor: n.badge.color + '20' }]}>
                              <Text style={[s.badgeTxt, { color: n.badge.color }]}>{n.badge.text}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={s.cardBody2} numberOfLines={2}>{n.body}</Text>
                        <Text style={s.cardTime}>{n.time}</Text>
                      </View>
                    </Pressable>
                  </SwipeableRow>
                ))}
              </View>
            );
          })}

          {/* Empty state — sadece bildirim yoksa göster */}
          {notifications.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🔔</Text>
              <Text style={s.emptyTitle}>Henüz bildirim yok</Text>
              <Text style={s.emptySub}>Yeni bildirimler burada görünecek</Text>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Kategori filtresi
  filterBar: {
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    maxHeight: 52,
  },
  filterBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.bgCard,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipTxt: { fontSize: 12, color: colors.textMuted, fontFamily: font.semiBold },
  filterChipTxtActive: { color: '#FFF' },
  filterChipBadge: {
    backgroundColor: colors.primary + '20', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: 'center',
  },
  filterChipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterChipBadgeTxt: { fontSize: 10, color: colors.primary, fontFamily: font.bold },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 2, marginRight: 8 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  headerBadge: {
    backgroundColor: colors.danger, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.full, minWidth: 20, alignItems: 'center',
  },
  headerBadgeTxt: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  markAllBtn: { padding: 4 },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
  },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.bgPure, marginHorizontal: 12,
    marginBottom: 6, borderRadius: radius.md,
    padding: 14, gap: 12,
    ...shadow.sm, borderWidth: 1, borderColor: colors.border,
    position: 'relative',
  },
  cardUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' },
  unreadDot: {
    position: 'absolute', top: 16, right: 14,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, flex: 1, marginRight: 6 },
  badgePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  cardBody2: { fontSize: 12.5, color: colors.textMuted, lineHeight: 17, marginBottom: 4 },
  cardTime: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.textMuted },
});
