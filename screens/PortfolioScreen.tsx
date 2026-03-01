import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, TextInput, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PortfolioShareCard } from '../components/PortfolioShareCard';
import { radius, shadow, colors } from '../constants/theme';

const { width: W } = Dimensions.get('window');

// ─── Renk yardımcıları ────────────────────────────────────────────────────────
const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', BNB: '#F3BA2F', SOL: '#9945FF',
  XRP: '#00AAE4', ADA: '#0033AD', DOGE: '#C2A633', DOT: '#E6007A',
  MATIC: '#8247E5', LINK: '#2A5ADA', AVAX: '#E84142', TRX: '#EB0029',
  AAPL: '#555555', NVDA: '#76B900', TSLA: '#CC0000', MSFT: '#00A4EF',
  AMZN: '#FF9900', META: '#1877F2', GOOGL: '#4285F4', NFLX: '#E50914',
  XAU: '#D4AF37', XAG: '#C0C0C0', WTI: '#2C2C2C',
  USDTRY: '#E53935', EURTRY: '#1565C0', EURUSD: '#1A73E8',
};
function assetColor(sym: string) { return ASSET_COLORS[sym.toUpperCase()] ?? '#9AA0AF'; }
function assetLetter(sym: string) { return sym.slice(0, 2).toUpperCase(); }

// ─── Para formatlama ─────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
function fmtPct(n: number, sign = true) {
  return `${sign && n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

// ─── Add Holding Modal ────────────────────────────────────────────────────────
interface AddModalProps {
  visible:  boolean;
  onClose:  () => void;
  onAdd:    (asset: string, qty: number, cost: number) => Promise<void>;
}
function AddHoldingModal({ visible, onClose, onAdd }: AddModalProps) {
  const [asset,   setAsset]   = useState('');
  const [qty,     setQty]     = useState('');
  const [cost,    setCost]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const reset = () => { setAsset(''); setQty(''); setCost(''); setFieldError(null); };

  const handleAdd = async () => {
    setFieldError(null);
    const assetClean = asset.trim().toUpperCase();
    const qtyNum  = parseFloat(qty);
    const costNum = parseFloat(cost);
    if (!assetClean) { setFieldError('Varlık sembolü boş olamaz.'); return; }
    if (!/^[A-Z0-9.]{1,12}$/.test(assetClean)) { setFieldError('Geçersiz sembol (örn: BTC, AAPL, THYAO.IS)'); return; }
    if (isNaN(qtyNum) || qtyNum <= 0) { setFieldError('Miktar geçerli bir sayı olmalı.'); return; }
    if (isNaN(costNum) || costNum <= 0) { setFieldError('Maliyet geçerli bir sayı olmalı.'); return; }
    setSaving(true);
    await onAdd(assetClean, qtyNum, costNum);
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
          <Text style={m.title}>Varlık Ekle</Text>

          {fieldError && (
            <View style={m.errorBanner}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.fall} />
              <Text style={m.errorTxt}>{fieldError}</Text>
            </View>
          )}

          <MInput label="Sembol (örn: BTC, AAPL)" value={asset}
            onChangeText={t => { setAsset(t.toUpperCase()); setFieldError(null); }} placeholder="BTC"
            autoCapitalize="characters" />
          <MInput label="Miktar" value={qty}
            onChangeText={t => { setQty(t); setFieldError(null); }} placeholder="0.00"
            keyboardType="decimal-pad" />
          <MInput label="Ortalama Maliyet ($)" value={cost}
            onChangeText={t => { setCost(t); setFieldError(null); }} placeholder="65000"
            keyboardType="decimal-pad" />

          <Pressable style={m.addBtn} onPress={handleAdd} disabled={saving}>
            <LinearGradient colors={['#007AFF','#5856D6']} style={m.addGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={m.addTxt}>Portföye Ekle</Text>
              }
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MInput({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={m.fieldWrap}>
      <Text style={m.label}>{label}</Text>
      <TextInput style={m.input} placeholderTextColor="#9AA0AF" {...props} />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function PortfolioScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user }   = useAuth();
  const toast      = useToast();
  const {
    holdings, loading, totalValue, totalCost, totalPnL, totalPnLPct,
    addHolding, removeHolding, refetch,
  } = usePortfolio();

  const [addModal, setAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'share'>('holdings');

  const isUp = totalPnL >= 0;

  const handleRemove = (id: string, sym: string) => {
    Alert.alert(
      `${sym} Sil`,
      'Bu varlığı portföyünden kaldırmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır', style: 'destructive',
          onPress: async () => {
            const ok = await removeHolding(id);
            if (ok) toast.success(`${sym} portföyden kaldırıldı`);
            else    toast.error('Silinemedi');
          },
        },
      ]
    );
  };

  const handleAdd = async (asset: string, qty: number, cost: number) => {
    const ok = await addHolding(asset, qty, cost);
    if (ok) toast.success(`${asset} portföye eklendi ✓`);
    else    toast.error('Eklenemedi. Sembolü kontrol et.');
  };

  if (!user) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="lock-closed-outline" size={44} color={colors.textMuted} />
        <Text style={s.emptyTitle}>Giriş Yapman Gerekiyor</Text>
        <Pressable style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginTxt}>Giriş Yap</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>Portföyüm</Text>
        <Pressable onPress={() => setAddModal(true)} style={s.addIconBtn}>
          <Ionicons name="add-circle" size={26} color="#007AFF" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* ── Summary Card ── */}
        <View style={s.summaryCard}>
          <LinearGradient
            colors={isUp ? ['#0A1F0A', '#0D2E15'] : ['#1F0A0A', '#2E0D0D']}
            style={s.summaryGrad}
          >
            <Text style={s.summaryLabel}>Toplam Değer</Text>
            <Text style={s.summaryValue}>{fmtUSD(totalValue)}</Text>
            <View style={s.summaryRow}>
              <View style={[s.pnlPill, { backgroundColor: isUp ? '#34C75928' : '#FF3B3B28' }]}>
                <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? '#34C759' : '#FF3B3B'} />
                <Text style={[s.pnlTxt, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
                  {fmtUSD(totalPnL)} ({fmtPct(totalPnLPct)})
                </Text>
              </View>
              <Text style={s.summaryMaliyet}>Maliyet: {fmtUSD(totalCost)}</Text>
            </View>

            {/* Mini bar chart */}
            {holdings.length > 0 && (
              <View style={s.allocBar}>
                {holdings.map((h, i) => (
                  <View
                    key={h.id}
                    style={[s.allocBarSlice, {
                      flex: h.allocation / 100,
                      backgroundColor: assetColor(h.symbol),
                      borderRadius: i === 0 ? 4 : i === holdings.length - 1 ? 4 : 0,
                    }]}
                  />
                ))}
              </View>
            )}
          </LinearGradient>
        </View>

        {/* ── Tabs ── */}
        <View style={s.tabs}>
          {([
            { id: 'holdings',   label: 'Varlıklar' },
            { id: 'allocation', label: 'Dağılım'   },
            { id: 'share',      label: 'Paylaş'    },
          ] as const).map(tab => (
            <Pressable
              key={tab.id}
              style={[s.tab, activeTab === tab.id && s.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[s.tabTxt, activeTab === tab.id && s.tabTxtActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Content ── */}
        {loading ? (
          <ActivityIndicator color="#007AFF" style={{ marginTop: 40 }} />
        ) : holdings.length === 0 && activeTab !== 'share' ? (
          <View style={s.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyTitle}>Portföy Boş</Text>
            <Text style={s.emptySubtitle}>
              İlk varlığını eklemek için{'\n'}sağ üstteki + butonuna bas
            </Text>
            <Pressable style={s.emptyAddBtn} onPress={() => setAddModal(true)}>
              <Text style={s.emptyAddTxt}>+ Varlık Ekle</Text>
            </Pressable>
          </View>
        ) : activeTab === 'holdings' ? (
          <View style={s.list}>
            {holdings.map(h => (
              <HoldingRow
                key={h.id}
                holding={h}
                onRemove={() => handleRemove(h.id, h.symbol)}
              />
            ))}
          </View>
        ) : activeTab === 'allocation' ? (
          <AllocationView holdings={holdings} />
        ) : (
          <View style={{ paddingTop: 16 }}>
            <PortfolioShareCard
              totalValue={totalValue}
              totalPnL={totalPnL}
              totalPnLPct={totalPnLPct}
              holdings={holdings.map(h => ({
                symbol:     h.symbol,
                allocation: h.allocation,
                color:      '',
              }))}
            />
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {holdings.length > 0 && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 90 }]}
          onPress={() => setAddModal(true)}
        >
          <LinearGradient colors={['#007AFF','#5856D6']} style={s.fabGrad}>
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}

      <AddHoldingModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onAdd={handleAdd}
      />
    </View>
  );
}

// ─── HoldingRow ────────────────────────────────────────────────────────────────
function HoldingRow({ holding: h, onRemove }: { holding: any; onRemove: () => void }) {
  const isUp = h.pnl >= 0;
  const color = assetColor(h.symbol);
  return (
    <Pressable
      style={s.holdingRow}
      onLongPress={onRemove}
      delayLongPress={600}
    >
      <View style={[s.holdingLogo, { backgroundColor: color + '22' }]}>
        <Text style={[s.holdingLogoTxt, { color }]}>{assetLetter(h.symbol)}</Text>
      </View>
      <View style={s.holdingInfo}>
        <Text style={s.holdingSym}>{h.symbol}</Text>
        <Text style={s.holdingQty}>{h.quantity} adet · maliyet ${h.avg_cost.toFixed(2)}</Text>
      </View>
      <View style={s.holdingRight}>
        <Text style={s.holdingValue}>{fmtUSD(h.current_value)}</Text>
        <View style={[s.holdingPill, { backgroundColor: isUp ? '#34C75918' : '#FF3B3B18' }]}>
          <Text style={[s.holdingPnl, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
            {fmtPct(h.pnl_pct)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── AllocationView ────────────────────────────────────────────────────────────
function AllocationView({ holdings }: { holdings: any[] }) {
  return (
    <View style={s.allocList}>
      {holdings.map(h => (
        <View key={h.id} style={s.allocRow}>
          <View style={[s.allocDot, { backgroundColor: assetColor(h.symbol) }]} />
          <Text style={s.allocSym}>{h.symbol}</Text>
          <View style={s.allocBarWrap}>
            <View style={[s.allocBarFill, {
              width: `${h.allocation}%` as any,
              backgroundColor: assetColor(h.symbol),
            }]} />
          </View>
          <Text style={s.allocPct}>{h.allocation.toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  addIconBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  summaryCard:  { margin: 16, borderRadius: 20, overflow: 'hidden', ...shadow.md },
  summaryGrad:  { padding: 20 },
  summaryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  summaryRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  pnlPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  pnlTxt:         { fontWeight: '700', fontSize: 13 },
  summaryMaliyet: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  allocBar: {
    flexDirection: 'row', height: 6, borderRadius: 4,
    overflow: 'hidden', marginTop: 16, gap: 2,
  },
  allocBarSlice: { height: '100%' },

  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8,
    backgroundColor: colors.bgInput, borderRadius: 12, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center',
  },
  tabActive:   { backgroundColor: colors.bgPure, ...shadow.sm },
  tabTxt:      { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTxtActive:{ color: colors.text, fontWeight: '700' },

  list: { paddingHorizontal: 16, gap: 10 },

  holdingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgPure, borderRadius: 14, padding: 14,
    ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  holdingLogo: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  holdingLogoTxt: { fontSize: 14, fontWeight: '800' },
  holdingInfo:    { flex: 1 },
  holdingSym:     { fontSize: 15, fontWeight: '800', color: colors.text },
  holdingQty:     { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  holdingRight:   { alignItems: 'flex-end', gap: 4 },
  holdingValue:   { fontSize: 15, fontWeight: '700', color: colors.text },
  holdingPill:    { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  holdingPnl:     { fontSize: 12, fontWeight: '700' },

  allocList: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },
  allocRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  allocDot: { width: 10, height: 10, borderRadius: 5 },
  allocSym: { width: 52, fontSize: 13, fontWeight: '700', color: colors.text },
  allocBarWrap: {
    flex: 1, height: 8, backgroundColor: colors.bgInput, borderRadius: 4, overflow: 'hidden',
  },
  allocBarFill: { height: '100%', borderRadius: 4 },
  allocPct: { width: 42, textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.textMuted },

  emptyState:   { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySubtitle:{ fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyAddBtn: {
    marginTop: 12, backgroundColor: '#007AFF', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 11,
  },
  emptyAddTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  loginBtn: {
    marginTop: 20, backgroundColor: '#007AFF', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  loginTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  fab: {
    position: 'absolute', right: 20,
    width: 54, height: 54, borderRadius: 27,
    shadowColor: '#007AFF', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
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
  addBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4, ...shadow.sm },
  addGrad: { height: 52, alignItems: 'center', justifyContent: 'center' },
  addTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.fallLight, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: colors.fall + '40',
  },
  errorTxt: { flex: 1, fontSize: 13, color: colors.fall, fontWeight: '600' },
});
