import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, shadow, colors } from '../constants/theme';
import { useNotifications } from '../hooks/useNotifications';

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

const MOCK: Notif[] = [
  // Today
  {
    id: '1', type: 'price_alert',
    title: 'BTC Fiyat Alarmı 🚨',
    body: 'Bitcoin $65,000 seviyesini geçti! Hedef fiyatınıza ulaştı.',
    time: '2 dk önce', read: false,
    icon: '₿', iconBg: '#F7931A',
    badge: { text: '+4.2%', color: colors.rise },
  },
  {
    id: '2', type: 'like',
    title: 'CryptoAhmet beğendi',
    body: '"Bitcoin neden $100K\'a gidecek?" videonuzu beğendi.',
    time: '15 dk önce', read: false,
    avatar: 'https://i.pravatar.cc/80?u=ahmet1',
  },
  {
    id: '3', type: 'comment',
    title: 'FinansGuru yorum yaptı',
    body: '"Harika analiz! DCA stratejisi gerçekten işe yarıyor 💪"',
    time: '1 sa önce', read: false,
    avatar: 'https://i.pravatar.cc/80?u=guru2',
  },
  {
    id: '4', type: 'market',
    title: 'Piyasa Özeti',
    body: 'Kripto piyasası genel olarak yeşilde. Bitcoin dominansı %52\'ye yükseldi.',
    time: '2 sa önce', read: false,
    icon: '📊', iconBg: '#007AFF',
  },
  {
    id: '5', type: 'follow',
    title: 'Yeni takipçi',
    body: 'SolanaMaxi sizi takip etmeye başladı.',
    time: '3 sa önce', read: true,
    avatar: 'https://i.pravatar.cc/80?u=sol3',
  },
  // Yesterday
  {
    id: '6', type: 'price_alert',
    title: 'ETH Fiyat Alarmı',
    body: 'Ethereum $3,200 desteğini koruyor. İzleme listenizde.',
    time: 'Dün 18:30', read: true,
    icon: 'Ξ', iconBg: '#627EEA',
    badge: { text: '-1.1%', color: colors.fall },
  },
  {
    id: '7', type: 'like',
    title: '12 kişi beğendi',
    body: '"Altcoin sezonuna hazır mısınız?" videonuzu 12 kişi beğendi.',
    time: 'Dün 14:15', read: true,
    icon: '♥', iconBg: colors.fall,
  },
  {
    id: '8', type: 'system',
    title: 'Marketly Pro',
    body: 'AI destekli sinyal özelliği şimdi kullanılabilir. Hemen dene!',
    time: 'Dün 09:00', read: true,
    icon: '⚡', iconBg: '#FFB800',
  },
  // This week
  {
    id: '9', type: 'market',
    title: 'Fed Kararı',
    body: 'Fed faiz oranlarını %0.25 düşürdü. Kripto piyasası tepkisi bekleniyor.',
    time: '2 gün önce', read: true,
    icon: '🏦', iconBg: '#5A5F6E',
  },
  {
    id: '10', type: 'follow',
    title: '5 yeni takipçi',
    body: 'Bu hafta 5 kişi sizi takip etmeye başladı.',
    time: '3 gün önce', read: true,
    icon: '👥', iconBg: colors.primary,
  },
];

const SECTIONS = [
  { label: 'Bugün', filter: (n: Notif) => ['2 dk önce', '15 dk önce', '1 sa önce', '2 sa önce', '3 sa önce'].some(t => n.time === t) },
  { label: 'Dün', filter: (n: Notif) => n.time.startsWith('Dün') },
  { label: 'Bu Hafta', filter: (n: Notif) => n.time.includes('gün önce') },
];

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
  const {
    notifications: liveNotifs,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotif,
  } = useNotifications();

  // Supabase'den veri yoksa mock'a düş
  const notifications = liveNotifs.length > 0 ? liveNotifs.map(n => ({
    id:       n.id,
    type:     n.type,
    title:    n.title,
    body:     n.body,
    time:     timeAgo(n.created_at),
    read:     n.read,
    icon:     (n.meta as any)?.icon,
    iconBg:   (n.meta as any)?.iconBg,
    avatar:   (n.meta as any)?.avatar,
    badge:    (n.meta as any)?.badge,
  })) : MOCK;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backBtn} hitSlop={10}>
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
        <Pressable onPress={markAllRead} style={s.markAllBtn}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  <Pressable
                    key={n.id}
                    style={[s.card, !n.read && s.cardUnread]}
                    onPress={() => markRead(n.id)}
                    onLongPress={() => deleteNotif(n.id)}
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
                ))}
              </View>
            );
          })}

          {/* Empty state */}
          {notifications.length === 0 || notifications.every((n) => n.read) ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🔔</Text>
              <Text style={s.emptyTitle}>Tüm bildirimler okundu</Text>
              <Text style={s.emptySub}>Yeni bildirimler burada görünecek</Text>
            </View>
          ) : null}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

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
