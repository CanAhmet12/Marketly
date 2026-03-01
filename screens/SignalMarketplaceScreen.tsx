import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  FlatList, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../contexts/ToastContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { shadow, colors } from '../constants/theme';

interface AnalystPackage {
  id:             string;
  analyst_name:   string;
  handle:         string;
  avatar_letter:  string;
  avatar_color:   string;
  speciality:     string;
  accuracy:       number;
  total_signals:  number;
  subscribers:    number;
  price_monthly:  number;   // ₺
  description:    string;
  tags:           string[];
  is_verified:    boolean;
  top_picks:      { symbol: string; pct: number; up: boolean }[];
  tier_required:  'free' | 'pro' | 'elite';
}

// ─── Sort / Filter ────────────────────────────────────────────────────────────
type SortKey = 'accuracy' | 'subscribers' | 'price_low' | 'price_high';
type FilterKey = 'all' | 'verified' | 'free_access';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'accuracy',    label: 'Başarı %' },
  { key: 'subscribers', label: 'Abone' },
  { key: 'price_low',   label: 'Fiyat ↑' },
  { key: 'price_high',  label: 'Fiyat ↓' },
];

// ─── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, onPress }: { pkg: AnalystPackage; onPress: () => void }) {
  const accColor = pkg.accuracy >= 75 ? '#34C759' : pkg.accuracy >= 65 ? '#FF9500' : '#FF3B3B';

  return (
    <Pressable
      style={[pc.card, { backgroundColor: colors.bgPure, borderColor: colors.border }]}
      onPress={onPress}
    >
      {/* Header row */}
      <View style={pc.header}>
        <View style={[pc.avatar, { backgroundColor: pkg.avatar_color + '22' }]}>
          <Text style={[pc.avatarTxt, { color: pkg.avatar_color }]}>{pkg.avatar_letter}</Text>
        </View>
        <View style={pc.info}>
          <View style={pc.nameRow}>
            <Text style={[pc.name, { color: colors.text }]}>{pkg.analyst_name}</Text>
            {pkg.is_verified && (
              <View style={pc.verifiedBadge}>
                <Ionicons name="checkmark" size={9} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[pc.handle, { color: colors.textMuted }]}>{pkg.handle}</Text>
          <Text style={[pc.speciality, { color: colors.textSub }]}>{pkg.speciality}</Text>
        </View>
        <View style={pc.priceBox}>
          <Text style={[pc.price, { color: colors.text }]}>₺{pkg.price_monthly}</Text>
          <Text style={[pc.pricePer, { color: colors.textMuted }]}>/ay</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[pc.statsRow, { borderTopColor: colors.divider, borderBottomColor: colors.divider }]}>
        <View style={pc.stat}>
          <Text style={[pc.statVal, { color: accColor }]}>{pkg.accuracy}%</Text>
          <Text style={[pc.statLbl, { color: colors.textMuted }]}>Başarı</Text>
        </View>
        <View style={[pc.statDivider, { backgroundColor: colors.divider }]} />
        <View style={pc.stat}>
          <Text style={[pc.statVal, { color: colors.text }]}>{pkg.total_signals}</Text>
          <Text style={[pc.statLbl, { color: colors.textMuted }]}>Sinyal</Text>
        </View>
        <View style={[pc.statDivider, { backgroundColor: colors.divider }]} />
        <View style={pc.stat}>
          <Text style={[pc.statVal, { color: colors.text }]}>{pkg.subscribers >= 1000 ? `${(pkg.subscribers / 1000).toFixed(1)}K` : pkg.subscribers}</Text>
          <Text style={[pc.statLbl, { color: colors.textMuted }]}>Abone</Text>
        </View>
      </View>

      {/* Recent picks */}
      <View style={pc.picksRow}>
        {pkg.top_picks.map(p => (
          <View key={p.symbol} style={[pc.pick, { backgroundColor: p.up ? '#34C75914' : '#FF3B3B14' }]}>
            <Text style={[pc.pickSym, { color: colors.text }]}>{p.symbol}</Text>
            <Text style={[pc.pickPct, { color: p.up ? '#34C759' : '#FF3B3B' }]}>
              {p.up ? '+' : ''}{p.pct}%
            </Text>
          </View>
        ))}
      </View>

      {/* Tags */}
      <View style={pc.tagsRow}>
        {pkg.tags.map(t => (
          <View key={t} style={[pc.tag, { backgroundColor: colors.bgInput }]}>
            <Text style={[pc.tagTxt, { color: colors.textSub }]}>${t}</Text>
          </View>
        ))}
        <View style={{ flex: 1 }} />
        {pkg.tier_required !== 'free' && (
          <View style={[pc.tierBadge, {
            backgroundColor: pkg.tier_required === 'elite' ? '#AF52DE20' : '#007AFF15',
          }]}>
            <Ionicons
              name={pkg.tier_required === 'elite' ? 'diamond' : 'flash'}
              size={10}
              color={pkg.tier_required === 'elite' ? '#AF52DE' : '#007AFF'}
            />
            <Text style={[pc.tierTxt, { color: pkg.tier_required === 'elite' ? '#AF52DE' : '#007AFF' }]}>
              {pkg.tier_required === 'elite' ? 'Elite' : 'Pro'}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function PackageDetailModal({
  pkg,
  visible,
  onClose,
}: {
  pkg: AnalystPackage | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { isFree } = useSubscription();
  const { user } = useAuth();
  const toast = useToast();
  const navigation = useNavigation<any>();

  if (!pkg) return null;

  const canSubscribe = pkg.tier_required === 'free' || !isFree;
  const accColor = pkg.accuracy >= 75 ? '#34C759' : pkg.accuracy >= 65 ? '#FF9500' : '#FF3B3B';

  const handleSubscribe = () => {
    if (!user) { onClose(); navigation.navigate('Login'); return; }
    if (!canSubscribe) { onClose(); navigation.navigate('Paywall'); return; }
    toast.success(`${pkg.analyst_name} paketine abone oldun! ✅`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={dm.overlay}>
        <Pressable style={dm.backdrop} onPress={onClose} />
        <View style={[dm.sheet, { backgroundColor: colors.bgPure }]}>
          <View style={[dm.handle, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={dm.header}>
              <View style={[dm.avatar, { backgroundColor: pkg.avatar_color + '22' }]}>
                <Text style={[dm.avatarTxt, { color: pkg.avatar_color }]}>{pkg.avatar_letter}</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[dm.name, { color: colors.text }]}>{pkg.analyst_name}</Text>
                  {pkg.is_verified && (
                    <View style={dm.verifiedBadge}><Ionicons name="checkmark" size={10} color="#fff" /></View>
                  )}
                </View>
                <Text style={[dm.handle, { color: colors.textMuted }]}>{pkg.handle}</Text>
                <Text style={[dm.speciality, { color: colors.textSub }]}>{pkg.speciality}</Text>
              </View>
            </View>

            {/* Accuracy bar */}
            <View style={dm.accSection}>
              <Text style={[dm.accLabel, { color: colors.textMuted }]}>Başarı Oranı</Text>
              <View style={[dm.accBar, { backgroundColor: colors.bgInput }]}>
                <View style={[dm.accFill, { width: `${pkg.accuracy}%` as any, backgroundColor: accColor }]} />
              </View>
              <Text style={[dm.accPct, { color: accColor }]}>{pkg.accuracy}%</Text>
            </View>

            {/* Description */}
            <Text style={[dm.desc, { color: colors.textSub }]}>{pkg.description}</Text>

            {/* Recent performance */}
            <Text style={[dm.sectionTitle, { color: colors.text }]}>Son Sinyaller</Text>
            <View style={dm.picksGrid}>
              {pkg.top_picks.map(p => (
                <View key={p.symbol} style={[dm.pickCard, { backgroundColor: p.up ? '#34C75910' : '#FF3B3B10', borderColor: p.up ? '#34C75930' : '#FF3B3B30' }]}>
                  <Text style={[dm.pickSym, { color: colors.text }]}>{p.symbol}</Text>
                  <Text style={[dm.pickPct, { color: p.up ? '#34C759' : '#FF3B3B' }]}>
                    {p.up ? '+' : ''}{p.pct}%
                  </Text>
                  <Ionicons name={p.up ? 'trending-up' : 'trending-down'} size={16} color={p.up ? '#34C759' : '#FF3B3B'} />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Subscribe button */}
          <View style={[dm.footer, { borderTopColor: colors.border }]}>
            <Pressable style={dm.subscribeBtn} onPress={handleSubscribe}>
              <LinearGradient
                colors={canSubscribe ? ['#007AFF', '#5856D6'] : ['#FF9500', '#FF6B2B']}
                style={dm.subscribeGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={dm.subscribeTxt}>
                  {!canSubscribe
                    ? `Pro'ya Geç — ₺${pkg.price_monthly}/ay`
                    : `Abone Ol — ₺${pkg.price_monthly}/ay`
                  }
                </Text>
              </LinearGradient>
            </Pressable>
            {canSubscribe && (
              <Text style={[dm.trialNote, { color: colors.textMuted }]}>
                7 gün ücretsiz dene · İstediğin zaman iptal
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function SignalMarketplaceScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const toast      = useToast();
  const { analysts, loading: analystsLoading } = useLeaderboard();

  const [sortKey,    setSortKey]    = useState<SortKey>('accuracy');
  const [filterKey,  setFilterKey]  = useState<FilterKey>('all');
  const [selectedPkg, setSelectedPkg] = useState<AnalystPackage | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Leaderboard analistlerini AnalystPackage formatına dönüştür
  const livePackages: AnalystPackage[] = useMemo(() => analysts.map((a, i) => ({
    id:            a.id,
    analyst_name:  a.name,
    handle:        a.handle,
    avatar_letter: (a.name[0] || 'A').toUpperCase(),
    avatar_color:  ['#F7931A', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5856D6'][i % 6],
    speciality:    a.specialty ?? 'Finansal Analiz',
    accuracy:      a.accuracy,
    total_signals: a.signals,
    subscribers:   a.followers,
    price_monthly: 149 + (i % 4) * 50,
    description:   `${a.name} tarafından profesyonel sinyal paketi. ${a.accuracy}% başarı oranı ile ${a.signals} sinyal yayımlandı.`,
    tags:          ['BTC', 'ETH', 'SOL'].slice(0, 2),
    is_verified:   a.verified,
    top_picks:     [],
    tier_required: i < 2 ? 'free' : i < 4 ? 'pro' : 'elite',
  })), [analysts]);

  const allPackages = livePackages;

  const sorted = useMemo(() => {
    let list = [...allPackages];
    if (filterKey === 'verified')    list = list.filter(p => p.is_verified);
    if (filterKey === 'free_access') list = list.filter(p => p.tier_required === 'free');

    switch (sortKey) {
      case 'accuracy':    list.sort((a, b) => b.accuracy - a.accuracy); break;
      case 'subscribers': list.sort((a, b) => b.subscribers - a.subscribers); break;
      case 'price_low':   list.sort((a, b) => a.price_monthly - b.price_monthly); break;
      case 'price_high':  list.sort((a, b) => b.price_monthly - a.price_monthly); break;
    }
    return list;
  }, [sortKey, filterKey, allPackages]);

  const openDetail = useCallback((pkg: AnalystPackage) => {
    setSelectedPkg(pkg);
    setDetailVisible(true);
  }, []);

  return (
    <View style={[s.root, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.bgPure, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[s.headerTitle, { color: colors.text }]}>Sinyal Marketplace</Text>
          <Text style={[s.headerSub, { color: colors.textMuted }]}>{allPackages.length} analist paketi</Text>
        </View>
        <Pressable
          style={s.infoBtn}
          onPress={() => toast.info('Analistlerin ücretli sinyal paketlerine abone ol')}
        >
          <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Hero Banner */}
      <View style={s.heroBanner}>
        <LinearGradient colors={['#0D1F3C', '#1A1050']} style={s.heroBannerGrad}>
          <View style={s.heroLeft}>
            <Text style={s.heroTitle}>Top Analistlerin{'\n'}Sinyallerini Takip Et</Text>
            <Text style={s.heroSub}>Onaylı analistlerden doğrudan sinyal al</Text>
          </View>
          <Text style={s.heroEmoji}>⚡</Text>
        </LinearGradient>
      </View>

      {/* Filter tabs */}
      <View style={[s.filterRow, { backgroundColor: colors.bgPure, borderBottomColor: colors.divider }]}>
        {([
          { key: 'all',         label: 'Tümü' },
          { key: 'verified',    label: '✓ Onaylı' },
          { key: 'free_access', label: 'Free Erişim' },
        ] as { key: FilterKey; label: string }[]).map(f => (
          <Pressable
            key={f.key}
            style={[s.filterChip, filterKey === f.key && { backgroundColor: colors.primary + '18', borderColor: colors.primary + '50' }]}
            onPress={() => setFilterKey(f.key)}
          >
            <Text style={[s.filterChipTxt, { color: filterKey === f.key ? colors.primary : colors.textMuted }]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sort row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.sortRow}
        style={{ backgroundColor: colors.bgPure, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider, maxHeight: 48 }}
      >
        <Text style={[s.sortLabel, { color: colors.textMuted }]}>Sırala:</Text>
        {SORT_OPTIONS.map(opt => (
          <Pressable
            key={opt.key}
            style={[s.sortChip, sortKey === opt.key && { backgroundColor: '#007AFF15' }]}
            onPress={() => setSortKey(opt.key)}
          >
            <Text style={[s.sortChipTxt, { color: sortKey === opt.key ? '#007AFF' : colors.textSub }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Package list */}
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PackageCard pkg={item} onPress={() => openDetail(item)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 90, gap: 14 }}
        showsVerticalScrollIndicator={false}
      />

      <PackageDetailModal
        pkg={selectedPkg}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub:   { fontSize: 11, marginTop: 1 },
  infoBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  heroBanner:     { margin: 16, borderRadius: 16, overflow: 'hidden' },
  heroBannerGrad: { flexDirection: 'row', alignItems: 'center', padding: 18, justifyContent: 'space-between' },
  heroLeft:       {},
  heroTitle:      { fontSize: 16, fontWeight: '900', color: '#fff', lineHeight: 22 },
  heroSub:        { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  heroEmoji:      { fontSize: 40 },

  filterRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'transparent',
  },
  filterChipTxt: { fontSize: 12, fontWeight: '700' },

  sortRow:     { paddingHorizontal: 14, gap: 8, alignItems: 'center', paddingVertical: 8 },
  sortLabel:   { fontSize: 12, fontWeight: '600' },
  sortChip:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sortChipTxt: { fontSize: 12, fontWeight: '700' },
});

const pc = StyleSheet.create({
  card: {
    borderRadius: 16, padding: 14,
    borderWidth: 1, ...shadow.sm,
  },
  header:    { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18, fontWeight: '900' },
  info:      { flex: 1 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name:      { fontSize: 15, fontWeight: '800' },
  verifiedBadge: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  handle:    { fontSize: 12, marginTop: 1 },
  speciality:{ fontSize: 11, marginTop: 2, fontWeight: '600' },

  priceBox: { alignItems: 'flex-end' },
  price:    { fontSize: 18, fontWeight: '900' },
  pricePer: { fontSize: 10, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10, marginVertical: 10,
  },
  stat:        { flex: 1, alignItems: 'center', gap: 2 },
  statVal:     { fontSize: 15, fontWeight: '800' },
  statLbl:     { fontSize: 10, fontWeight: '600' },
  statDivider: { width: 1 },

  picksRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  pick:     { flexDirection: 'row', gap: 5, alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pickSym:  { fontSize: 11, fontWeight: '700' },
  pickPct:  { fontSize: 12, fontWeight: '800' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  tag:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt:  { fontSize: 11, fontWeight: '700' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tierTxt:   { fontSize: 10, fontWeight: '800' },
});

const dm = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  header:    { flexDirection: 'row', gap: 14, paddingHorizontal: 20, marginBottom: 16 },
  avatar:    { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '900' },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  name:      { fontSize: 18, fontWeight: '900' },
  handle:    { fontSize: 13, marginTop: 2 },
  speciality:{ fontSize: 12, marginTop: 3, fontWeight: '600' },

  accSection: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  accLabel:   { fontSize: 12, fontWeight: '600', width: 80 },
  accBar:     { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  accFill:    { height: '100%', borderRadius: 4 },
  accPct:     { fontSize: 14, fontWeight: '800', width: 36 },

  desc:         { fontSize: 13, lineHeight: 20, paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', paddingHorizontal: 20, marginBottom: 10 },

  picksGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  pickCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1,
  },
  pickSym: { fontSize: 12, fontWeight: '800' },
  pickPct: { fontSize: 15, fontWeight: '900' },

  footer:       { padding: 20, borderTopWidth: 1, gap: 8 },
  subscribeBtn: { borderRadius: 14, overflow: 'hidden' },
  subscribeGrad:{ height: 54, alignItems: 'center', justifyContent: 'center' },
  subscribeTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  trialNote:    { fontSize: 11, textAlign: 'center' },
});
