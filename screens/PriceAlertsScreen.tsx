import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useToast } from '../contexts/ToastContext';
import { shadow, colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

// ─── Add Alert Modal ──────────────────────────────────────────────────────────
interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd:   (asset: string, cond: 'above' | 'below', target: number) => Promise<void>;
}
function AddAlertModal({ visible, onClose, onAdd }: AddModalProps) {
  const [asset,     setAsset]     = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [target,    setTarget]    = useState('');
  const [saving,    setSaving]    = useState(false);

  const reset = () => { setAsset(''); setTarget(''); setCondition('above'); };

  const handle = async () => {
    const a = asset.trim().toUpperCase();
    const t = parseFloat(target);
    if (!a || isNaN(t) || t <= 0) return;
    setSaving(true);
    await onAdd(a, condition, t);
    setSaving(false);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        style={m.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={m.backdrop} onPress={onClose} />
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>🔔 Alarm Ekle</Text>

          <View style={m.fieldWrap}>
            <Text style={m.label}>Varlık Sembolü</Text>
            <TextInput
              style={m.input} placeholderTextColor="#9AA0AF"
              placeholder="BTC, AAPL, USDTRY..."
              value={asset} onChangeText={t => setAsset(t.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          <View style={m.condRow}>
            {(['above', 'below'] as const).map(c => (
              <Pressable
                key={c}
                style={[m.condBtn, condition === c && m.condBtnActive]}
                onPress={() => setCondition(c)}
              >
                <Ionicons
                  name={c === 'above' ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={condition === c ? '#fff' : colors.textMuted}
                />
                <Text style={[m.condTxt, condition === c && m.condTxtActive]}>
                  {c === 'above' ? 'Üzerine Çıkınca' : 'Altına Düşünce'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={m.fieldWrap}>
            <Text style={m.label}>Hedef Fiyat ($)</Text>
            <TextInput
              style={m.input} placeholderTextColor="#9AA0AF"
              placeholder="65000"
              value={target} onChangeText={setTarget}
              keyboardType="decimal-pad"
            />
          </View>

          <Pressable style={m.addBtn} onPress={handle} disabled={saving}>
            <LinearGradient
              colors={['#FF9500', '#FF3B3B']}
              style={m.addGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="notifications" size={18} color="#fff" />
                    <Text style={m.addTxt}>Alarm Kur</Text>
                  </>
              }
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function PriceAlertsScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user }   = useAuth();
  const toast      = useToast();
  const { alerts, loading, addAlert, removeAlert } = usePriceAlerts();
  const [addModal, setAddModal] = useState(false);

  const handleAdd = async (asset: string, cond: 'above' | 'below', target: number) => {
    const ok = await addAlert(asset, cond, target);
    if (ok) toast.success(`${asset} alarmı kuruldu ✓`);
    else    toast.error('Alarm kurulamadı');
  };

  const handleRemove = (id: string, sym: string) => {
    Alert.alert('Alarmı Sil', `${sym} alarmını silmek istediğine emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          const ok = await removeAlert(id);
          if (ok) toast.success('Alarm silindi');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[s.root, s.center, { paddingTop: insets.top }]}>
        <Ionicons name="notifications-off-outline" size={44} color={colors.textMuted} />
        <Text style={s.emptyTitle}>Giriş Yap</Text>
        <Pressable style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginTxt}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>Fiyat Alarmları</Text>
        <Pressable onPress={() => setAddModal(true)} style={s.addBtn} hitSlop={8}>
          <Ionicons name="add-circle" size={26} color="#FF9500" />
        </Pressable>
      </View>

      {/* Info banner */}
      <View style={s.banner}>
        <Ionicons name="information-circle-outline" size={16} color="#FF9500" />
        <Text style={s.bannerTxt}>
          Fiyat hedefine ulaştığında bildirim alırsın. Alarm tetiklenince otomatik silinir.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF9500" style={{ marginTop: 40 }} />
      ) : alerts.length === 0 ? (
        <View style={[s.center, { flex: 1 }]}>
          <Ionicons name="notifications-outline" size={52} color={colors.textMuted} />
          <Text style={s.emptyTitle}>Alarm Yok</Text>
          <Text style={s.emptySub}>İlk fiyat alarmını eklemek için{'\n'}sağ üstteki + butonuna bas</Text>
          <Pressable style={s.addFirstBtn} onPress={() => setAddModal(true)}>
            <Text style={s.addFirstTxt}>+ Alarm Ekle</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 100 }}
        >
          {alerts.map(a => (
            <AlertRow
              key={a.id}
              alert={a}
              onRemove={() => handleRemove(a.id, a.asset_id)}
            />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      {alerts.length > 0 && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 90 }]}
          onPress={() => setAddModal(true)}
        >
          <LinearGradient colors={['#FF9500', '#FF3B3B']} style={s.fabGrad}>
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}

      <AddAlertModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onAdd={handleAdd}
      />
    </View>
  );
}

function AlertRow({ alert: a, onRemove }: { alert: any; onRemove: () => void }) {
  const isAbove = a.condition === 'above';
  const color   = isAbove ? '#34C759' : '#FF3B3B';
  return (
    <View style={s.alertRow}>
      <View style={[s.alertIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={isAbove ? 'trending-up' : 'trending-down'} size={20} color={color} />
      </View>
      <View style={s.alertInfo}>
        <View style={s.alertTop}>
          <Text style={s.alertSym}>{a.asset_id}</Text>
          {a.triggered && (
            <View style={s.triggeredBadge}>
              <Text style={s.triggeredTxt}>TETİKLENDİ</Text>
            </View>
          )}
        </View>
        <Text style={s.alertDesc}>
          {isAbove ? 'Üzerine çıkınca' : 'Altına düşünce'} ·{' '}
          <Text style={{ color, fontWeight: '700' }}>${a.target.toLocaleString()}</Text>
        </Text>
      </View>
      <Pressable
        style={s.deleteBtn}
        onPress={onRemove}
        hitSlop={10}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  addBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  banner: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FF950012', padding: 12, margin: 12,
    borderRadius: 10, borderWidth: 1, borderColor: '#FF950033',
  },
  bannerTxt: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgPure, borderRadius: 14, padding: 14,
    ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  alertIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  alertInfo: { flex: 1 },
  alertTop:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertSym:  { fontSize: 15, fontWeight: '800', color: colors.text },
  alertDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  triggeredBadge: {
    backgroundColor: '#FF9500', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  triggeredTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  deleteBtn: { padding: 4 },

  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 12 },
  emptySub:   { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  addFirstBtn: {
    marginTop: 16, backgroundColor: '#FF9500', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  addFirstTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  loginBtn: {
    marginTop: 20, backgroundColor: '#007AFF', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  loginTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  fab: {
    position: 'absolute', right: 20,
    width: 54, height: 54, borderRadius: 27,
    shadowColor: '#FF9500', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabGrad: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
});

const m = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.bgPure, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 14,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.bgInput, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  condRow: { flexDirection: 'row', gap: 10 },
  condBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.bgInput, borderRadius: 12,
    paddingVertical: 12, borderWidth: 1, borderColor: colors.border,
  },
  condBtnActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  condTxt:       { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  condTxtActive: { color: '#fff' },
  addBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4, ...shadow.sm },
  addGrad: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
