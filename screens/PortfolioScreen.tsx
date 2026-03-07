import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, TextInput, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { liveToMarketAsset } from '../services/marketService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PortfolioShareCard } from '../components/PortfolioShareCard';
import { radius, shadow, colors, font } from '../constants/theme';

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
function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

// ─── Edit Holding Modal ───────────────────────────────────────────────────────
interface EditModalProps {
  visible:  boolean;
  holding:  { id: string; symbol: string; quantity: number; avg_cost: number } | null;
  onClose:  () => void;
  onSave:   (id: string, qty: number, cost: number) => Promise<void>;
}
function EditHoldingModal({ visible, holding, onClose, onSave }: EditModalProps) {
  const [qty,    setQty]    = useState('');
  const [cost,   setCost]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (holding) { setQty(String(holding.quantity)); setCost(String(holding.avg_cost)); }
  }, [holding]);

  const handle = async () => {
    const qtyNum  = parseFloat(qty);
    const costNum = parseFloat(cost);
    if (isNaN(qtyNum) || qtyNum <= 0 || isNaN(costNum) || costNum <= 0) return;
    if (!holding) return;
    setSaving(true);
    await onSave(holding.id, qtyNum, costNum);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView style={m.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={m.backdrop} onPress={onClose} />
        <View style={m.sheet}>
          <View style={m.handle} />
          <Text style={m.title}>{holding?.symbol} Düzenle</Text>
          <MInput label="Yeni Miktar" value={qty} onChangeText={setQty}
            placeholder="0.00" keyboardType="decimal-pad" />
          <MInput label="Ortalama Maliyet ($)" value={cost} onChangeText={setCost}
            placeholder="65000" keyboardType="decimal-pad" />
          <Pressable style={m.addBtn} onPress={handle} disabled={saving}>
            <LinearGradient colors={['#007AFF','#5856D6']} style={m.addGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={m.addTxt}>Kaydet</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Add Holding Modal ────────────────────────────────────────────────────────
interface AddModalProps {
  visible:   boolean;
  onClose:   () => void;
  onAdd:     (asset: string, qty: number, cost: number) => Promise<void>;
  allAssets: { symbol: string; name: string; price: number }[];
}
function AddHoldingModal({ visible, onClose, onAdd, allAssets }: AddModalProps) {
  const [asset,       setAsset]       = useState('');
  const [qty,         setQty]         = useState('');
  const [cost,        setCost]        = useState('');
  const [saving,      setSaving]      = useState(false);
  const [fieldError,  setFieldError]  = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredAssets = asset.trim().length >= 1
    ? allAssets
        .filter(a =>
          a.symbol.toLowerCase().includes(asset.toLowerCase()) ||
          a.name.toLowerCase().includes(asset.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const selectAsset = (sym: string, price: number) => {
    setAsset(sym);
    if (!cost) setCost(String(price));
    setShowDropdown(false);
    setFieldError(null);
  };

  const reset = () => { setAsset(''); setQty(''); setCost(''); setFieldError(null); setShowDropdown(false); };

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

          {/* Sembol alanı — autocomplete */}
          <View style={m.fieldWrap}>
            <Text style={m.fieldLabel}>Sembol</Text>
            <TextInput
              style={m.input}
              placeholder="BTC, AAPL, THYAO..."
              placeholderTextColor="#9AA0AF"
              value={asset}
              onChangeText={t => {
                setAsset(t.toUpperCase());
                setFieldError(null);
                setShowDropdown(t.trim().length >= 1);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {showDropdown && filteredAssets.length > 0 && (
              <View style={m.dropdown}>
                {filteredAssets.map(a => (
                  <Pressable
                    key={a.symbol}
                    style={m.dropdownItem}
                    onPress={() => selectAsset(a.symbol, a.price)}
                  >
                    <View style={m.dropdownLeft}>
                      <Text style={m.dropdownSymbol}>{a.symbol}</Text>
                      <Text style={m.dropdownName} numberOfLines={1}>{a.name}</Text>
                    </View>
                    <Text style={m.dropdownPrice}>
                      ${a.price >= 1000
                        ? a.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                        : a.price.toFixed(a.price < 1 ? 4 : 2)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

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
      <Text style={m.fieldLabel}>{label}</Text>
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
    addHolding, removeHolding, updateHolding, refetch,
  } = usePortfolio();
  const { allAssets } = useMarketPrices();

  const [addModal,    setAddModal]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<{ id: string; symbol: string; quantity: number; avg_cost: number } | null>(null);
  const [activeTab,   setActiveTab]   = useState<'holdings' | 'allocation' | 'share'>('holdings');
  const [refreshing,  setRefreshing]  = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  const handleEdit = async (id: string, qty: number, cost: number) => {
    const ok = await updateHolding(id, qty, cost);
    if (ok) toast.success('Güncellendi ✓');
    else    toast.error('Güncellenemedi');
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >

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
                onEdit={() => setEditTarget({ id: h.id, symbol: h.symbol, quantity: h.quantity, avg_cost: h.avg_cost })}
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
                color:      assetColor(h.symbol),
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
        allAssets={allAssets.map(a => ({
          symbol: a.symbol,
          name:   a.name ?? a.symbol,
          price:  a.price ?? 0,
        }))}
      />
      <EditHoldingModal
        visible={editTarget !== null}
        holding={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />
    </View>
  );
}

// ─── HoldingRow ────────────────────────────────────────────────────────────────
function HoldingRow({ holding: h, onRemove, onEdit }: { holding: any; onRemove: () => void; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isUp  = h.pnl >= 0;
  const color = assetColor(h.symbol);
  const pnlAbs = Math.abs(h.pnl);
  return (
    <View>
      <Pressable
        style={s.holdingRow}
        onPress={() => setExpanded(e => !e)}
      >
        <View style={[s.holdingLogo, { backgroundColor: color + '22' }]}>
          <Text style={[s.holdingLogoTxt, { color }]}>{assetLetter(h.symbol)}</Text>
        </View>
        <View style={s.holdingInfo}>
          <Text style={s.holdingSym}>{h.symbol}</Text>
          <Text style={s.holdingQty}>{h.quantity} adet · ort. {fmtUSD(h.avg_cost)}</Text>
        </View>
        <View style={s.holdingRight}>
          <Text style={s.holdingValue}>{fmtUSD(h.current_value)}</Text>
          <View style={[s.holdingPill, { backgroundColor: isUp ? '#34C75918' : '#FF3B3B18' }]}>
            <Text style={[s.holdingPnl, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
              {fmtPct(h.pnl_pct)}
            </Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
      </Pressable>
      {expanded && (
        <View style={s.holdingExpanded}>
          {/* Mini PnL bar */}
          <View style={s.pnlBarWrap}>
            <View style={s.pnlBarTrack}>
              <View style={[
                s.pnlBarFill,
                {
                  width: `${Math.min(Math.abs(h.pnl_pct), 100)}%` as any,
                  backgroundColor: isUp ? '#34C759' : '#FF3B3B',
                }
              ]} />
            </View>
            <Text style={[s.pnlBarLabel, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
              {isUp ? '▲' : '▼'} {Math.abs(h.pnl_pct).toFixed(2)}% PnL
            </Text>
          </View>

          <View style={s.holdingDetail}>
            <Text style={s.holdingDetailLbl}>Mevcut Fiyat</Text>
            <Text style={s.holdingDetailVal}>{fmtUSD(h.current_price)}</Text>
          </View>
          <View style={s.holdingDetail}>
            <Text style={s.holdingDetailLbl}>Kâr/Zarar</Text>
            <Text style={[s.holdingDetailVal, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
              {isUp ? '+' : '-'}{fmtUSD(pnlAbs)}
            </Text>
          </View>
          <View style={s.holdingDetail}>
            <Text style={s.holdingDetailLbl}>Maliyet Bazı</Text>
            <Text style={s.holdingDetailVal}>{fmtUSD(h.cost_basis)}</Text>
          </View>
          <View style={s.holdingActions}>
            <Pressable style={s.holdingEditBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
              <Text style={[s.holdingActionTxt, { color: colors.primary }]}>Düzenle</Text>
            </Pressable>
            <Pressable style={s.holdingDelBtn} onPress={onRemove}>
              <Ionicons name="trash-outline" size={14} color={colors.fall} />
              <Text style={[s.holdingActionTxt, { color: colors.fall }]}>Sil</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── AllocationView ────────────────────────────────────────────────────────────
/** SVG gerektirmeyen basit donut chart — View + borderRadius + rotate trick */
function DonutChart({ holdings }: { holdings: any[] }) {
  const W = Dimensions.get('window').width;
  const SIZE = Math.min(W * 0.55, 200);
  const THICK = SIZE * 0.18;

  // Toplam değere göre açı hesapla
  const total = holdings.reduce((sum, h) => sum + h.allocation, 0) || 1;
  let cumulativeAngle = -90; // Saat 12'den başla

  const segments = holdings.map(h => {
    const angle = (h.allocation / total) * 360;
    const start = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...h, startAngle: start, sweepAngle: angle };
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      {/* Donut merkezi bilgi */}
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {/* Dış halka — her dilim için bir arc View çiziyoruz */}
        {segments.map((seg, i) => {
          if (seg.sweepAngle < 1) return null;
          const color = assetColor(seg.symbol);
          // Büyük dilimler için arc effect — basit yaklaşım: renkli border ile daire dilimi
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                borderWidth: THICK,
                borderColor: color,
                borderTopColor: seg.sweepAngle >= 180 ? color : 'transparent',
                borderRightColor: seg.sweepAngle >= 90 ? color : 'transparent',
                borderBottomColor: seg.sweepAngle >= 270 ? color : 'transparent',
                borderLeftColor: seg.sweepAngle >= 360 ? color : 'transparent',
                transform: [{ rotate: `${seg.startAngle}deg` }],
                opacity: 0.9 - i * 0.05,
              }}
            />
          );
        })}
        {/* Orta metin */}
        <View style={{ width: SIZE - THICK * 2 - 8, height: SIZE - THICK * 2 - 8, borderRadius: (SIZE - THICK * 2) / 2, backgroundColor: colors.bgPure, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Toplam</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>{holdings.length} Varlık</Text>
        </View>
      </View>
    </View>
  );
}

function AllocationView({ holdings }: { holdings: any[] }) {
  return (
    <View style={s.allocList}>
      <DonutChart holdings={holdings} />
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

  holdingExpanded: {
    marginHorizontal: 16, marginTop: -4, marginBottom: 8,
    backgroundColor: colors.bgInput,
    borderRadius: 12, padding: 14, gap: 8,
  },
  pnlBarWrap: { gap: 4, marginBottom: 4 },
  pnlBarTrack: {
    height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden',
  },
  pnlBarFill: { height: '100%', borderRadius: 3 },
  pnlBarLabel: { fontSize: 11, fontFamily: font.bold },
  holdingDetail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  holdingDetailLbl: { fontSize: 12, color: colors.textMuted },
  holdingDetailVal: { fontSize: 13, fontWeight: '700', color: colors.text },
  holdingActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  holdingEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.primary + '15',
  },
  holdingDelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.fall + '15',
  },
  holdingActionTxt: { fontSize: 13, fontWeight: '700' },

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
  fieldLabel: { fontSize: 12, fontFamily: font.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
    backgroundColor: colors.bgPure, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.md, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  dropdownLeft: { flex: 1, gap: 1 },
  dropdownSymbol: { fontSize: 14, fontFamily: font.bold, color: colors.text },
  dropdownName:   { fontSize: 12, color: colors.textMuted },
  dropdownPrice:  { fontSize: 13, fontFamily: font.semiBold, color: colors.primary },
});
