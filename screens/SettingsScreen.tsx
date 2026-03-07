import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Switch, Image, Linking, Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSubscription } from '../hooks/useSubscription';
import { radius, shadow, colors, font } from '../constants/theme';

const NOTIF_PREFS_KEY    = '@marketly_notif_prefs';
const SECURITY_PREFS_KEY = '@marketly_security_prefs';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingRow {
  id: string;
  icon: IoniconName;
  iconBg: string;
  label: string;
  sublabel?: string | ((val: boolean) => string);
  type: 'arrow' | 'toggle' | 'danger';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
}

interface SettingGroup {
  title: string;
  rows: SettingRow[];
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { tier, tierLabel, tierColor, isFree } = useSubscription();

  const [priceAlerts, setPriceAlerts]    = useState(true);
  const [socialNotifs, setSocialNotifs]  = useState(true);
  const [marketNews, setMarketNews]      = useState(false);
  const [biometric, setBiometric]        = useState(false);
  const [twoFactor, setTwoFactor]        = useState(false);
  const [analyticsOpt, setAnalyticsOpt] = useState(true);
  const [deleteModal, setDeleteModal]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting]         = useState(false);

  // AsyncStorage'dan bildirim tercihlerini yükle
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PREFS_KEY).then(raw => {
      if (!raw) return;
      try {
        const prefs = JSON.parse(raw);
        if (typeof prefs.priceAlerts  === 'boolean') setPriceAlerts(prefs.priceAlerts);
        if (typeof prefs.socialNotifs === 'boolean') setSocialNotifs(prefs.socialNotifs);
        if (typeof prefs.marketNews   === 'boolean') setMarketNews(prefs.marketNews);
        if (typeof prefs.analyticsOpt === 'boolean') setAnalyticsOpt(prefs.analyticsOpt);
      } catch {}
    });
    // Güvenlik tercihlerini yükle
    AsyncStorage.getItem(SECURITY_PREFS_KEY).then(raw => {
      if (!raw) return;
      try {
        const prefs = JSON.parse(raw);
        if (typeof prefs.biometric === 'boolean') setBiometric(prefs.biometric);
        if (typeof prefs.twoFactor === 'boolean') setTwoFactor(prefs.twoFactor);
      } catch {}
    });
  }, []);

  const saveSecurityPref = async (key: string, value: boolean) => {
    try {
      const raw   = await AsyncStorage.getItem(SECURITY_PREFS_KEY);
      const prefs = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(SECURITY_PREFS_KEY, JSON.stringify({ ...prefs, [key]: value }));
    } catch {}
  };

  const saveNotifPref = async (key: string, value: boolean) => {
    try {
      const raw = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
      const prefs = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify({ ...prefs, [key]: value }));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    toast.info('Çıkış yapıldı.');
    // Giriş ekranına yönlendir ve stack'i temizle
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const GROUPS: SettingGroup[] = [
    {
      title: 'Hesap',
      rows: [
        {
          id: 'profile', icon: 'person-outline', iconBg: '#007AFF',
          label: 'Profili Düzenle', sublabel: user?.email ?? '',
          type: 'arrow',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'subscription', icon: 'flash', iconBg: '#007AFF',
          label: isFree ? 'Marketly Pro\'ya Geç' : `Plan: ${tierLabel}`,
          sublabel: isFree ? '7 gün ücretsiz dene →' : 'Aboneliğini yönet',
          type: 'arrow',
          onPress: () => navigation.navigate('Paywall'),
        },
        {
          id: 'portfolio', icon: 'pie-chart-outline', iconBg: '#00C853',
          label: 'Portföyüm', sublabel: 'Yatırımları takip et, P&L hesapla',
          type: 'arrow',
          onPress: () => navigation.navigate('Portfolio'),
        },
        {
          id: 'leaderboard', icon: 'trophy-outline', iconBg: '#FFB800',
          label: 'Liderboard', sublabel: 'En iyi analistleri keşfet',
          type: 'arrow',
          onPress: () => navigation.navigate('Leaderboard'),
        },
        {
          id: 'ai', icon: 'sparkles-outline' as any, iconBg: '#5856D6',
          label: 'MarketAI Asistan', sublabel: 'Piyasalar hakkında sor',
          type: 'arrow',
          onPress: () => navigation.navigate('AIAssistant'),
        },
        {
          id: 'signal_mkt', icon: 'flash' as any, iconBg: '#007AFF',
          label: 'Sinyal Marketplace', sublabel: 'Ücretli analist paketleri',
          type: 'arrow',
          onPress: () => navigation.navigate('SignalMarketplace'),
        },
      ],
    },
    {
      title: 'Bildirimler',
      rows: [
        {
          id: 'price_alerts_nav', icon: 'notifications', iconBg: '#FF9500',
          label: 'Fiyat Alarmları', sublabel: 'Alarm kur, yönet',
          type: 'arrow',
          onPress: () => navigation.navigate('PriceAlerts'),
        },
        {
          id: 'price_alerts_toggle', icon: 'notifications-outline', iconBg: '#FF9500',
          label: 'Alarm Bildirimleri', sublabel: 'Tetiklenince push bildirim',
          type: 'toggle', value: priceAlerts,
          onToggle: (v) => { setPriceAlerts(v); saveNotifPref('priceAlerts', v); toast.success(v ? 'Alarm bildirimleri açıldı' : 'Kapatıldı'); },
        },
        {
          id: 'social_notifs', icon: 'heart-outline', iconBg: '#FF3B3B',
          label: 'Sosyal Bildirimler', sublabel: 'Beğeni, yorum, takip',
          type: 'toggle', value: socialNotifs,
          onToggle: (v) => { setSocialNotifs(v); saveNotifPref('socialNotifs', v); },
        },
        {
          id: 'market_news', icon: 'newspaper-outline', iconBg: '#5A5F6E',
          label: 'Piyasa Haberleri', sublabel: 'Breaking news bildirimleri',
          type: 'toggle', value: marketNews,
          onToggle: (v) => { setMarketNews(v); saveNotifPref('marketNews', v); },
        },
      ],
    },
    {
      title: 'Güvenlik',
      rows: [
        {
          id: 'biometric', icon: 'finger-print', iconBg: '#007AFF',
          label: 'Biyometrik Giriş', sublabel: biometric ? 'Aktif — Yüz/Parmak izi' : 'Kapalı',
          type: 'toggle', value: biometric,
          onToggle: (v) => {
            setBiometric(v);
            saveSecurityPref('biometric', v);
            toast.success(v ? 'Biyometrik giriş aktif ✓' : 'Biyometrik giriş kapatıldı');
          },
        },
        {
          id: '2fa', icon: 'shield-checkmark-outline', iconBg: '#00C853',
          label: '2 Faktörlü Doğrulama', sublabel: twoFactor ? 'Aktif — Hesap korumalı' : 'Kapalı',
          type: 'toggle', value: twoFactor,
          onToggle: (v) => {
            setTwoFactor(v);
            saveSecurityPref('twoFactor', v);
            toast.success(v ? '2FA aktif — Hesabınız korunuyor ✓' : '2FA kapatıldı');
          },
        },
        {
          id: 'password', icon: 'lock-closed-outline', iconBg: '#FF9500',
          label: 'Şifre Değiştir', sublabel: user?.email ? `${user.email} adresine link gönder` : undefined,
          type: 'arrow',
          onPress: async () => {
            if (!user?.email) { toast.error('E-posta adresi bulunamadı'); return; }
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
              redirectTo: 'marketly://reset-password',
            });
            if (error) { toast.error('E-posta gönderilemedi'); }
            else { toast.success('Şifre sıfırlama linki gönderildi ✉️'); }
          },
        },
      ],
    },
    {
      title: 'Uygulama',
      rows: [
        {
          id: 'language', icon: 'language-outline', iconBg: '#007AFF',
          label: 'Dil', sublabel: 'Türkçe',
          type: 'arrow',
          onPress: () => toast.info('Yakında: Dil seçimi'),
        },
        {
          id: 'currency', icon: 'cash-outline', iconBg: '#00C853',
          label: 'Para Birimi', sublabel: 'TRY / USD',
          type: 'arrow',
          onPress: () => toast.info('Yakında: Para birimi seçimi'),
        },
      ],
    },
    {
      title: 'Gizlilik & Yasal',
      rows: [
        {
          id: 'analytics', icon: 'analytics-outline', iconBg: '#5A5F6E',
          label: 'Analitik Paylaşımı', sublabel: 'Uygulama iyileştirme için',
          type: 'toggle', value: analyticsOpt,
          onToggle: (v) => { setAnalyticsOpt(v); saveNotifPref('analyticsOpt', v); },
        },
        {
          id: 'privacy', icon: 'eye-off-outline', iconBg: '#5A5F6E',
          label: 'Gizlilik Politikası', type: 'arrow',
          onPress: () => Linking.openURL('https://marketly.io/privacy').catch(() => toast.error('Link açılamadı')),
        },
        {
          id: 'terms', icon: 'document-text-outline', iconBg: '#9AA0AF',
          label: 'Kullanım Koşulları', type: 'arrow',
          onPress: () => Linking.openURL('https://marketly.io/terms').catch(() => toast.error('Link açılamadı')),
        },
        {
          id: 'data', icon: 'trash-outline', iconBg: '#FF3B3B',
          label: 'Hesabı Sil', sublabel: 'Tüm verilerini kalıcı olarak sil',
          type: 'danger',
          onPress: () => setDeleteModal(true),
        },
      ],
    },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.bgPure, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={[s.userCard, { backgroundColor: colors.bgPure, borderColor: colors.border }]}>
          <Image
            source={{ uri: (user as any)?.avatar_url ?? (user as any)?.user_metadata?.avatar_url ?? `https://i.pravatar.cc/200?u=${user?.id ?? 'default'}` }}
            style={s.userAvatar}
          />
          <View style={s.userInfo}>
            <Text style={[s.userName, { color: colors.text }]}>{user?.name ?? 'Kullanıcı'}</Text>
            <Text style={[s.userEmail, { color: colors.textMuted }]}>{user?.email ?? 'Giriş yapılmadı'}</Text>
          </View>
          <View style={[s.proBadge, { backgroundColor: tierColor + '22', borderColor: tierColor + '44' }]}>
            <Text style={[s.proBadgeTxt, { color: tierColor }]}>{tierLabel.toUpperCase()}</Text>
          </View>
        </View>

        {/* Pro Banner — sadece free kullanıcılara göster */}
        {isFree && (
          <Pressable onPress={() => navigation.navigate('Paywall')} style={s.proBanner}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={s.proBannerGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={20} color="#fff" />
              <View style={s.proBannerText}>
                <Text style={s.proBannerTitle}>Marketly Pro'ya Geç</Text>
                <Text style={s.proBannerSub}>7 gün ücretsiz dene · İptal kolayca</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </Pressable>
        )}

        {/* Setting groups */}
        {GROUPS.map((group) => (
          <View key={group.title} style={s.group}>
            <Text style={[s.groupTitle, { color: colors.textMuted }]}>{group.title}</Text>
            <View style={[s.groupCard, { backgroundColor: colors.bgPure, borderColor: colors.border }]}>
              {group.rows.map((row, i) => (
                <SettingRowItem
                  key={row.id}
                  row={row}
                  isLast={i === group.rows.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        {/* App version + logout */}
        <View style={s.footer}>
          <Pressable style={[s.logoutBtn, { borderColor: colors.fall + '50', backgroundColor: colors.fallLight }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.fall} />
            <Text style={[s.logoutTxt, { color: colors.fall }]}>Çıkış Yap</Text>
          </Pressable>
          <Text style={[s.version, { color: colors.textMuted }]}>Marketly v1.0.0 • Build 2025.06</Text>
        </View>

        <View style={{ height: insets.bottom + 30 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={dm.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={dm.sheet}>
            <View style={dm.iconWrap}>
              <Ionicons name="warning" size={34} color="#FF3B3B" />
            </View>
            <Text style={dm.title}>Hesabı Sil</Text>
            <Text style={dm.body}>
              Bu işlem geri alınamaz. Tüm verileriniz (portföy, sinyaller, gönderiler) kalıcı olarak silinecek.
            </Text>
            <Text style={dm.confirmLabel}>Onaylamak için <Text style={{ fontWeight: '800' }}>SİL</Text> yazın:</Text>
            <TextInput
              style={dm.confirmInput}
              placeholder="SİL"
              placeholderTextColor="#888"
              value={deleteConfirm}
              onChangeText={setDeleteConfirm}
              autoCapitalize="characters"
            />
            <View style={dm.btnRow}>
              <Pressable style={dm.cancelBtn} onPress={() => { setDeleteModal(false); setDeleteConfirm(''); }}>
                <Text style={dm.cancelTxt}>İptal</Text>
              </Pressable>
              <Pressable
                style={[dm.deleteBtn, deleteConfirm !== 'SİL' && dm.deleteBtnDisabled]}
                disabled={deleteConfirm !== 'SİL' || deleting}
                onPress={async () => {
                  setDeleting(true);
                  try {
                    const uid = user!.id;
                    // Kullanıcıya ait tüm verileri sil
                    await Promise.allSettled([
                      supabase.from('portfolio_holdings').delete().eq('user_id', uid),
                      supabase.from('posts').delete().eq('user_id', uid),
                      supabase.from('signals').delete().eq('creator_id', uid),
                      supabase.from('post_likes').delete().eq('user_id', uid),
                      supabase.from('saved_posts').delete().eq('user_id', uid),
                      supabase.from('video_likes').delete().eq('user_id', uid),
                      supabase.from('saved_videos').delete().eq('user_id', uid),
                      supabase.from('comments').delete().eq('user_id', uid),
                      supabase.from('video_comments').delete().eq('user_id', uid),
                      supabase.from('comment_likes').delete().eq('user_id', uid),
                      supabase.from('follows').delete().eq('follower_id', uid),
                      supabase.from('follows').delete().eq('following_id', uid),
                      supabase.from('notifications').delete().eq('user_id', uid),
                      supabase.from('watchlists').delete().eq('user_id', uid),
                      supabase.from('price_alerts').delete().eq('user_id', uid),
                      supabase.from('user_badges').delete().eq('user_id', uid),
                      supabase.from('signal_likes').delete().eq('user_id', uid),
                      supabase.from('signal_copies').delete().eq('user_id', uid),
                      supabase.from('ai_sessions').delete().eq('user_id', uid),
                      supabase.from('dm_conversations').delete().eq('user1_id', uid),
                      supabase.from('dm_conversations').delete().eq('user2_id', uid),
                      supabase.from('push_tokens').delete().eq('user_id', uid),
                      supabase.from('marketcoin_wallet').delete().eq('user_id', uid),
                      supabase.from('marketcoin_transactions').delete().eq('user_id', uid),
                    ]);
                    // Profili en son sil
                    await supabase.from('profiles').delete().eq('id', uid);
                    // Auth oturumunu kapat (admin delete API client'tan erişilemez)
                    await supabase.auth.signOut();
                    toast.success('Hesabınız silindi');
                    setDeleteModal(false);
                  } catch {
                    toast.error('Hesap silinemedi. Destek ile iletişime geçin.');
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                <Text style={dm.deleteTxt}>{deleting ? 'Siliniyor...' : 'Hesabı Sil'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Setting row item ──────────────────────────────────────────────────────────
function SettingRowItem({ row, isLast }: { row: SettingRow; isLast: boolean }) {
  const sub = row.sublabel;
  const sublabel = typeof sub === 'function' ? (sub as (v: boolean) => string)(row.value ?? false) : sub;

  return (
    <Pressable
      style={[si.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}
      onPress={row.type !== 'toggle' ? row.onPress : undefined}
    >
      <View style={[si.iconBox, { backgroundColor: row.iconBg + '22' }]}>
        <Ionicons name={row.icon} size={18} color={row.iconBg} />
      </View>
      <View style={si.mid}>
        <Text style={[si.label, { color: row.type === 'danger' ? colors.danger : colors.text }]}>{row.label}</Text>
        {sublabel && <Text style={[si.sub, { color: colors.textMuted }]}>{sublabel}</Text>}
      </View>
      {row.type === 'toggle' && (
        <Switch
          value={row.value ?? false}
          onValueChange={row.onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '88' }}
          thumbColor={row.value ? colors.primary : '#FFF'}
          ios_backgroundColor={colors.border}
        />
      )}
      {row.type === 'arrow' && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
      {row.type === 'danger' && (
        <Ionicons name="chevron-forward" size={16} color={colors.danger} />
      )}
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, borderRadius: radius.lg, padding: 16,
    ...shadow.sm, borderWidth: 1,
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800' },
  userEmail: { fontSize: 12, marginTop: 2 },
  proBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1,
  },
  proBadgeTxt: { fontSize: 11, fontWeight: '800' },

  proBanner: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, overflow: 'hidden' },
  proBannerGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  proBannerText: { flex: 1 },
  proBannerTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  proBannerSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },

  group: { marginBottom: 6 },
  groupTitle: {
    fontSize: 11, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginBottom: 6, marginTop: 10,
  },
  groupCard: {
    marginHorizontal: 16, borderRadius: radius.md, overflow: 'hidden',
    ...shadow.sm, borderWidth: 1,
  },

  footer: { alignItems: 'center', marginTop: 24, gap: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: radius.full, borderWidth: 1.5,
  },
  logoutTxt: { fontSize: 15, fontWeight: '700' },
  version: { fontSize: 11 },
});

const si = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 1 },
});

const dm = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: colors.bgPure, borderRadius: 20, padding: 24, width: '100%',
    alignItems: 'center',
  },
  iconWrap: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#FF3B3B18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  body: {
    fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  confirmLabel: { fontSize: 13, color: colors.textMuted, alignSelf: 'flex-start', marginBottom: 6 },
  confirmInput: {
    width: '100%', borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 15, fontWeight: '700', color: colors.text,
    backgroundColor: colors.bg, letterSpacing: 2, marginBottom: 20,
  },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5,
    borderColor: colors.border, alignItems: 'center',
  },
  cancelTxt: { fontSize: 14, fontWeight: '700', color: colors.text },
  deleteBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#FF3B3B', alignItems: 'center',
  },
  deleteBtnDisabled: { backgroundColor: '#FF3B3B55' },
  deleteTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
});
