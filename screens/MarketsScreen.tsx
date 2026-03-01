import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, StatusBar, Dimensions, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBar } from '../contexts/TabBarContext';
import { Ionicons } from '@expo/vector-icons';
import type { MarketAsset } from '../data/mockMarkets';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { liveToMarketAsset } from '../services/marketService';
import { useWatchlist } from '../hooks/useWatchlist';
import { Sparkline } from '../components/Sparkline';
import { useToast } from '../contexts/ToastContext';
import { colors, radius, shadow } from '../constants/theme';

const { width: W } = Dimensions.get('window');

type Tab = 'crypto' | 'stocks' | 'commodities' | 'forex';

// ─── Market Segment Config ─────────────────────────────────────────────────────
const SEGMENTS: {
  key: Tab; label: string; subLabel: string;
  color: string; bgLight: string; icon: string; flag: string;
}[] = [
  { key: 'crypto',      label: 'Kripto',    subLabel: 'Dijital Varlıklar', color: '#F7931A', bgLight: '#FFF5E6', icon: 'logo-bitcoin',    flag: '₿'  },
  { key: 'stocks',      label: 'Hisseler',  subLabel: 'Küresel & BIST',    color: '#007AFF', bgLight: '#EBF5FF', icon: 'trending-up',     flag: '📈' },
  { key: 'commodities', label: 'Emtia',     subLabel: 'Altın, Petrol...',  color: '#D4AF37', bgLight: '#FFFBEB', icon: 'diamond-outline', flag: '🥇' },
  { key: 'forex',       label: 'Döviz',     subLabel: 'Kur Çiftleri',      color: '#7C3AED', bgLight: '#F3EEFF', icon: 'swap-horizontal',  flag: '💱' },
];

// ─── Scrolling Ticker ──────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  { sym: 'BTC',     price: '$66,482', change: '+3.18%', up: true  },
  { sym: 'ETH',     price: '$3,521',  change: '+2.45%', up: true  },
  { sym: 'BIST100', price: '9,450',   change: '-0.34%', up: false },
  { sym: 'ALTIN',   price: '$2,345',  change: '+0.28%', up: true  },
  { sym: 'USD/TRY', price: '₺32.45',  change: '+0.31%', up: true  },
];
const TW = 145;

function LiveTicker({ assets }: { assets: { sym: string; price: string; change: string; up: boolean }[] }) {
  const tx = useRef(new Animated.Value(0)).current;
  const data = assets.length > 0 ? assets : TICKER_FALLBACK;
  const total = data.length * TW;
  const items = [...data, ...data, ...data];

  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(tx, { toValue: -total, duration: total * 32, useNativeDriver: true })
    );
    a.start();
    return () => a.stop();
  }, [total]);

  return (
    <View style={tk.root}>
      <View style={tk.liveTag}>
        <View style={tk.dot} />
        <Text style={tk.liveLabel}>CANLI</Text>
      </View>
      <View style={tk.line} />
      <View style={tk.overflow}>
        <Animated.View style={[tk.track, { transform: [{ translateX: tx }] }]}>
          {items.map((item, i) => (
            <View key={i} style={tk.item}>
              <Text style={tk.sym}>{item.sym}</Text>
              <Text style={tk.price}>{item.price}</Text>
              <Text style={[tk.change, { color: item.up ? '#4ADE80' : '#F87171' }]}>
                {item.up ? '▲' : '▼'} {item.change}
              </Text>
              <View style={tk.sep} />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const tk = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#12131A', height: 36, overflow: 'hidden',
  },
  liveTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, flexShrink: 0,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF3B3B' },
  liveLabel: { fontSize: 8.5, fontWeight: '900', color: '#FF3B3B', letterSpacing: 1.5 },
  line: { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: 'rgba(255,255,255,0.15)' },
  overflow: { flex: 1, overflow: 'hidden' },
  track: { flexDirection: 'row', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, width: TW },
  sym: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 },
  price: { fontSize: 9.5, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  change: { fontSize: 9, fontWeight: '800' },
  sep: { width: StyleSheet.hairlineWidth, height: 12, backgroundColor: 'rgba(255,255,255,0.10)', marginLeft: 2 },
});

// ─── Market Segment Card ───────────────────────────────────────────────────────
function SegmentCard({
  seg, selected, assetCount, topAsset, onPress,
}: {
  seg: typeof SEGMENTS[0];
  selected: boolean;
  assetCount: number;
  topAsset: MarketAsset | null;
  onPress: () => void;
}) {
  const up = topAsset ? topAsset.changePercent >= 0 : true;

  return (
    <Pressable
      style={[
        sc.card,
        selected && { borderColor: seg.color, borderWidth: 2, backgroundColor: seg.bgLight },
      ]}
      onPress={onPress}
    >
      {/* Top row: icon + count */}
      <View style={sc.topRow}>
        <View style={[sc.iconWrap, { backgroundColor: seg.color + '20' }]}>
          <Ionicons name={seg.icon as any} size={18} color={seg.color} />
        </View>
        <View style={[sc.countBadge, selected && { backgroundColor: seg.color }]}>
          <Text style={[sc.countTxt, selected && { color: '#FFF' }]}>{assetCount}</Text>
        </View>
      </View>

      {/* Labels */}
      <Text style={[sc.label, selected && { color: seg.color }]}>{seg.label}</Text>
      <Text style={sc.subLabel}>{seg.subLabel}</Text>

      {/* Top performer */}
      {topAsset && (
        <View style={sc.performer}>
          <Text style={sc.performerSym}>{topAsset.symbol}</Text>
          <Text style={[sc.performerChg, { color: up ? colors.rise : colors.fall }]}>
            {up ? '+' : ''}{topAsset.changePercent}%
          </Text>
        </View>
      )}

      {/* Selected indicator bar */}
      {selected && <View style={[sc.activeLine, { backgroundColor: seg.color }]} />}
    </Pressable>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#FFF', borderRadius: radius.lg,
    padding: 14, gap: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
    ...shadow.sm, minWidth: (W - 44) / 2, position: 'relative', overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: '#F0F1F5', borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  label: { fontSize: 15, fontWeight: '900', color: '#0F0F1A', letterSpacing: -0.3 },
  subLabel: { fontSize: 10.5, color: '#9AA0AF', fontWeight: '500' },
  performer: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
    backgroundColor: '#F6F7FB', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  performerSym: { fontSize: 11, fontWeight: '800', color: '#0F0F1A' },
  performerChg: { fontSize: 11, fontWeight: '800' },
  activeLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
  },
});

// ─── Watchlist Strip ──────────────────────────────────────────────────────────
function WatchlistStrip({
  activeTab, seg, onPress,
}: {
  activeTab: Tab;
  seg: typeof SEGMENTS[0];
  onPress: (a: MarketAsset) => void;
}) {
  const { watchlistIds } = useWatchlist();
  const nav = useNavigation<any>();
  const { byCategory } = useMarketPrices();
  const liveAll = byCategory(activeTab as any).map(liveToMarketAsset);
  const watched = liveAll.filter(
    (a) => watchlistIds.includes(a.id.toUpperCase()) || watchlistIds.includes(a.symbol.toUpperCase())
  );

  return (
    <View style={ws.wrap}>
      {/* Header */}
      <View style={ws.header}>
        <View style={ws.titleRow}>
          <View style={[ws.starIcon, { backgroundColor: '#FFF8E0' }]}>
            <Ionicons name="star" size={13} color="#FFB800" />
          </View>
          <Text style={ws.title}>İzleme Listem</Text>
          {/* Category pill */}
          <View style={[ws.catTag, { backgroundColor: seg.bgLight }]}>
            <Ionicons name={seg.icon as any} size={10} color={seg.color} />
            <Text style={[ws.catTagTxt, { color: seg.color }]}>{seg.label}</Text>
          </View>
          <View style={ws.badge}><Text style={ws.badgeTxt}>{watched.length}</Text></View>
        </View>
        <Pressable style={ws.addBtn} onPress={() => nav.navigate('Search')}>
          <Ionicons name="add" size={13} color={seg.color} />
          <Text style={[ws.addTxt, { color: seg.color }]}>Ekle</Text>
        </Pressable>
      </View>

      {/* Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ws.scroll}>
        {watched.map((a) => {
          const up = a.changePercent >= 0;
          return (
            <Pressable
              key={a.id}
              style={[ws.card, { borderColor: seg.color + '25' }]}
              onPress={() => onPress(a)}
            >
              {/* Top accent */}
              <View style={[ws.cardAccent, { backgroundColor: seg.color }]} />

              {/* Logo + change */}
              <View style={ws.cardTop}>
                <View style={[ws.logo, { backgroundColor: a.logoColor + '18' }]}>
                  <Text style={[ws.logoTxt, { color: a.logoColor }]}>{a.logoLetter}</Text>
                </View>
                <View style={[ws.chgBadge, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
                  <Text style={[ws.chgTxt, { color: up ? colors.rise : colors.fall }]}>
                    {up ? '▲' : '▼'} {Math.abs(a.changePercent)}%
                  </Text>
                </View>
              </View>

              {/* Symbol + name */}
              <Text style={ws.sym}>{a.symbol}</Text>
              <Text style={ws.name} numberOfLines={1}>{a.name}</Text>

              {/* Sparkline */}
              <Sparkline data={a.spark} color={up ? colors.rise : colors.fall} width={100} height={28} />

              {/* Price */}
              <Text style={ws.price}>{a.price}</Text>
            </Pressable>
          );
        })}

        {watched.length === 0 && (
          <View style={ws.emptyWrap}>
            <Ionicons name="star-outline" size={28} color={seg.color + '80'} />
            <Text style={[ws.emptyTxt, { color: seg.color }]}>
              İzleme listeniz boş
            </Text>
            <Text style={ws.emptySubTxt}>
              Varlık sayfasında ★ simgesine basarak ekleyin
            </Text>
            <Pressable
              style={[ws.emptyBtn, { backgroundColor: seg.color + '20', borderColor: seg.color + '40' }]}
              onPress={() => nav.navigate('Search')}
            >
              <Ionicons name="search-outline" size={13} color={seg.color} />
              <Text style={[ws.emptyBtnTxt, { color: seg.color }]}>Varlık Ara</Text>
            </Pressable>
          </View>
        )}

        {/* "Varlık Ekle" kartı — boş durumda gizle, empty state'in kendi butonu var */}
        {watched.length > 0 && (
          <Pressable style={[ws.addCard, { borderColor: seg.color + '30' }]} onPress={() => nav.navigate('Search')}>
            <View style={[ws.addCircle, { backgroundColor: seg.bgLight }]}>
              <Ionicons name="add" size={20} color={seg.color} />
            </View>
            <Text style={[ws.addCardTxt, { color: seg.color }]}>Varlık Ekle</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const ws = StyleSheet.create({
  wrap: {
    backgroundColor: '#F6F7FB', marginTop: 12, paddingBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  starIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  catTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  catTagTxt: { fontSize: 10, fontWeight: '800' },
  badge: {
    backgroundColor: '#F0F1F5', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 1,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTxt: { fontSize: 12, fontWeight: '700' },

  scroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },
  card: {
    width: 130, backgroundColor: '#FFF', borderRadius: radius.lg,
    paddingHorizontal: 12, paddingBottom: 12,
    borderWidth: 1.5, overflow: 'hidden',
    ...shadow.sm,
  },
  cardAccent: { height: 3, marginHorizontal: -12, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  logo: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontSize: 12, fontWeight: '900' },
  chgBadge: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 3 },
  chgTxt: { fontSize: 10, fontWeight: '800' },
  sym: { fontSize: 13, fontWeight: '900', color: '#0F0F1A', marginBottom: 1 },
  name: { fontSize: 10, color: '#9AA0AF', fontWeight: '500', marginBottom: 8 },
  price: { fontSize: 12, fontWeight: '800', color: '#0F0F1A', marginTop: 4 },

  addCard: {
    width: 100, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'transparent', paddingVertical: 20,
  },
  addCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addCardTxt: { fontSize: 11, fontWeight: '700' },

  emptyWrap: {
    width: 200, alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 24, paddingHorizontal: 12,
  },
  emptyTxt:    { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  emptySubTxt: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1, marginTop: 4,
  },
  emptyBtnTxt: { fontSize: 12, fontWeight: '700' },
});

// ─── Top Movers ───────────────────────────────────────────────────────────────
function TopMoversRow({
  activeTab, seg, onPress,
}: {
  activeTab: Tab;
  seg: typeof SEGMENTS[0];
  onPress: (a: MarketAsset) => void;
}) {
  const { topMovers: getTopMovers, byCategory: getByCat } = useMarketPrices();
  const liveTop  = getTopMovers(activeTab as any, 10).map(liveToMarketAsset);
  const pool     = liveTop;

  const gainers = pool.filter((a) => a.changePercent > 0).slice(0, 3);
  const losers  = pool.filter((a) => a.changePercent < 0).slice(0, 2);

  return (
    <View style={tm.wrap}>
      {/* Header */}
      <View style={tm.header}>
        <View style={tm.titleRow}>
          <View style={[tm.iconWrap, { backgroundColor: seg.bgLight }]}>
            <Ionicons name="pulse" size={14} color={seg.color} />
          </View>
          <Text style={tm.title}>En Çok Değişen</Text>
          <View style={[tm.catTag, { backgroundColor: seg.bgLight }]}>
            <Text style={[tm.catTagTxt, { color: seg.color }]}>{seg.label}</Text>
          </View>
        </View>
        <Text style={tm.subtitle}>Bugün</Text>
      </View>

      {/* Gainers */}
      {gainers.length > 0 && (
        <>
          <View style={tm.subHeader}>
            <View style={tm.subHeaderDot} />
            <Text style={tm.subHeaderTxt}>Yükselenler</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tm.scroll}>
            {gainers.map((a, idx) => (
              <MoverCard key={a.id} asset={a} rank={idx + 1} seg={seg} onPress={() => onPress(a)} />
            ))}
          </ScrollView>
        </>
      )}

      {/* Losers */}
      {losers.length > 0 && (
        <>
          <View style={[tm.subHeader, { marginTop: 10 }]}>
            <View style={[tm.subHeaderDot, { backgroundColor: colors.fall }]} />
            <Text style={tm.subHeaderTxt}>Düşenler</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tm.scroll}>
            {losers.map((a, idx) => (
              <MoverCard key={a.id} asset={a} rank={idx + 1} seg={seg} onPress={() => onPress(a)} />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function MoverCard({
  asset, rank, seg, onPress,
}: { asset: MarketAsset; rank: number; seg: typeof SEGMENTS[0]; onPress: () => void }) {
  const up = asset.changePercent >= 0;
  const dirColor = up ? colors.rise : colors.fall;
  const dirBg    = up ? colors.riseLight : colors.fallLight;

  return (
    <Pressable style={tm.card} onPress={onPress}>
      {/* Top band */}
      <View style={[tm.cardBand, { backgroundColor: dirColor + '15' }]}>
        <View style={tm.rankBadge}>
          <Text style={tm.rankTxt}>#{rank}</Text>
        </View>
        <Text style={[tm.bigChange, { color: dirColor }]}>
          {up ? '+' : ''}{asset.changePercent}%
        </Text>
      </View>

      {/* Body */}
      <View style={tm.cardBody}>
        <View style={tm.cardTopRow}>
          <View style={[tm.logo, { backgroundColor: asset.logoColor + '18' }]}>
            <Text style={[tm.logoTxt, { color: asset.logoColor }]}>{asset.logoLetter}</Text>
          </View>
          <View style={tm.nameBlock}>
            <Text style={tm.sym}>{asset.symbol}</Text>
            <Text style={tm.assetName} numberOfLines={1}>{asset.name}</Text>
          </View>
        </View>

        {/* Sparkline */}
        <Sparkline data={asset.spark} color={dirColor} width={140} height={36} />

        {/* Price + vol */}
        <View style={tm.priceRow}>
          <Text style={tm.price}>{asset.price}</Text>
          <Text style={tm.vol}>{asset.volume}</Text>
        </View>

        {/* Change pill */}
        <View style={[tm.changePill, { backgroundColor: dirBg }]}>
          <Ionicons name={up ? 'trending-up' : 'trending-down'} size={11} color={dirColor} />
          <Text style={[tm.changeTxt, { color: dirColor }]}>
            {up ? '+' : ''}{asset.changePercent}% bugün
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const tm = StyleSheet.create({
  wrap: { marginTop: 12, paddingBottom: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: '#0F0F1A' },
  catTag: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  catTagTxt: { fontSize: 10, fontWeight: '800' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#9AA0AF' },

  subHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, marginBottom: 8,
  },
  subHeaderDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.rise },
  subHeaderTxt: { fontSize: 12, fontWeight: '700', color: '#6B7280' },

  scroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },

  card: {
    width: 160, backgroundColor: '#FFF', borderRadius: radius.lg,
    overflow: 'hidden', ...shadow.sm,
  },
  cardBand: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rankBadge: { backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  rankTxt: { fontSize: 10, fontWeight: '900', color: '#4B5563' },
  bigChange: { fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },

  cardBody: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8, gap: 8 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontSize: 13, fontWeight: '900' },
  nameBlock: { flex: 1 },
  sym: { fontSize: 13, fontWeight: '900', color: '#0F0F1A' },
  assetName: { fontSize: 10, color: '#9AA0AF', fontWeight: '500', marginTop: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 13, fontWeight: '800', color: '#0F0F1A' },
  vol: { fontSize: 9.5, color: '#9AA0AF', fontWeight: '600' },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 5,
  },
  changeTxt: { fontSize: 11, fontWeight: '800' },
});

// ─── Asset Row ────────────────────────────────────────────────────────────────
const AssetRow = React.memo(function AssetRow({ asset, rank, onPress }: { asset: MarketAsset; rank: number; onPress: () => void }) {
  const up = asset.changePercent >= 0;
  return (
    <Pressable style={ar.row} onPress={onPress}>
      {/* Rank */}
      <Text style={ar.rank}>{rank}</Text>

      {/* Logo */}
      <View style={[ar.logo, { backgroundColor: asset.logoColor + '18' }]}>
        <Text style={[ar.logoTxt, { color: asset.logoColor }]}>{asset.logoLetter}</Text>
      </View>

      {/* Name */}
      <View style={ar.mid}>
        <Text style={ar.symbol}>{asset.symbol}</Text>
        <Text style={ar.name} numberOfLines={1}>{asset.name}</Text>
      </View>

      {/* Sparkline */}
      <Sparkline data={asset.spark} color={up ? colors.rise : colors.fall} width={52} height={26} />

      {/* Price + change */}
      <View style={ar.right}>
        <Text style={ar.price}>{asset.price}</Text>
        <View style={[ar.badge, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
          <Text style={[ar.changeTxt, { color: up ? colors.rise : colors.fall }]}>
            {up ? '+' : ''}{asset.changePercent}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const ar = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  rank: { fontSize: 12, fontWeight: '700', color: '#C0C8D5', width: 18, textAlign: 'center' },
  logo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontSize: 13, fontWeight: '900' },
  mid: { flex: 1 },
  symbol: { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  name: { fontSize: 11.5, color: '#9AA0AF', marginTop: 1.5, fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 4, minWidth: 76 },
  price: { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  badge: {
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  changeTxt: { fontSize: 11, fontWeight: '800' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MKT_HEADER_H = 90; // dark header + ticker approximate

export function MarketsScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { hideTabBar, showTabBar, resetTabBar } = useTabBar();

  useFocusEffect(useCallback(() => {
    showTabBar();
    resetTabBar();
  }, [showTabBar, resetTabBar]));

  const [tab, setTab]       = useState<Tab>('crypto');
  const [search, setSearch] = useState('');
  const searchInputRef      = useRef<any>(null);

  // ── Gerçek veri hook'u ──
  const { byCategory, topMovers, allAssets, isLoading: pricesLoading } = useMarketPrices();
  const { isWatched, toggle: toggleWatch } = useWatchlist();

  const liveAssets = useMemo(() => {
    return byCategory(tab as any).map(liveToMarketAsset);
  }, [byCategory, tab]);

  const liveMoverAssets = useMemo(() => {
    return topMovers(tab as any, 6).map(liveToMarketAsset);
  }, [topMovers, tab]);

  const tickerData = useMemo(() => {
    const TICKER_SYMBOLS = ['BTC','ETH','BNB','SOL','BIST100','XAU','USDTRY'];
    const filtered = allAssets.filter(a => TICKER_SYMBOLS.includes(a.symbol.toUpperCase()));
    const rest = allAssets.filter(a => !TICKER_SYMBOLS.includes(a.symbol.toUpperCase())).slice(0, 5);
    return [...filtered, ...rest].map(a => ({
      sym:    a.symbol,
      price:  a.priceFormatted,
      change: `${a.change_percent >= 0 ? '+' : ''}${a.change_percent.toFixed(2)}%`,
      up:     a.change_percent >= 0,
    }));
  }, [allAssets]);

  // Scroll-driven dark header animation
  const scrollY   = useRef(new Animated.Value(0)).current;
  const lastY     = useRef(0);
  const totalTopH = insets.top + MKT_HEADER_H;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, totalTopH],
    outputRange: [0, -totalTopH],
    extrapolate: 'clamp',
  });

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - lastY.current;
    if (diff > 8 && y > totalTopH) hideTabBar();
    else if (diff < -8 || y <= 20) showTabBar();
    lastY.current = y;
  }, [hideTabBar, showTabBar, totalTopH]);

  const goToAsset = (asset: MarketAsset) => navigation.navigate('AssetDetail', { asset });

  const assetList = useMemo(() =>
    liveAssets.filter((a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase())
    ),
  [liveAssets, search]);

  const seg = SEGMENTS.find((s) => s.key === tab)!;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Animated Dark Header ── */}
      <Animated.View
        style={[
          s.darkHeader,
          { paddingTop: insets.top, transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={s.headerContent}>
          <View>
            <Text style={s.headerTitle}>Piyasalar</Text>
            <Text style={s.headerSub}>Canlı fiyat verileri</Text>
          </View>
          <View style={s.headerActions}>
            <View style={s.livePill}>
              <View style={s.liveDot} />
              <Text style={s.livePillTxt}>CANLI</Text>
            </View>
            <Pressable style={s.iconBtn} onPress={() => searchInputRef.current?.focus()}>
              <Ionicons name="search-outline" size={20} color="#FFF" />
            </Pressable>
            <Pressable style={s.iconBtn} onPress={() => navigation.navigate('Bildirimler' as any)}>
              <Ionicons name="notifications-outline" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>
        <LiveTicker assets={tickerData} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={{ paddingTop: totalTopH, paddingBottom: 90 + insets.bottom }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
      >
        {/* ── Search ── */}
        <View style={s.searchSection}>
          <View style={s.searchBar}>
            <Ionicons name="search" size={15} color="#9AA0AF" />
            <TextInput
              ref={searchInputRef}
              style={s.searchInput}
              placeholder="Varlık ara: BTC, AAPL, Altın..."
              placeholderTextColor="#B0B8C4"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#9AA0AF" />
              </Pressable>
            )}
          </View>
        </View>

        {!search && (
          <>
            {/* ── Market Segment Cards (2x2) ── */}
            <View style={s.segSection}>
              <Text style={s.segTitle}>Piyasa Kategorileri</Text>
              <View style={s.segGrid}>
                {SEGMENTS.map((sg) => {
                  const assets = byCategory(sg.key as any).map(liveToMarketAsset);
                  const top = [...assets].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0] ?? null;
                  return (
                    <SegmentCard
                      key={sg.key}
                      seg={sg}
                      selected={tab === sg.key}
                      assetCount={assets.length}
                      topAsset={top}
                      onPress={() => setTab(sg.key)}
                    />
                  );
                })}
              </View>
            </View>

            {/* ── Watchlist ── */}
            <WatchlistStrip
              activeTab={tab}
              seg={seg}
              onPress={goToAsset}
            />

            {/* ── Top Movers ── */}
            <TopMoversRow
              activeTab={tab}
              seg={seg}
              onPress={goToAsset}
            />
          </>
        )}

        {/* ── Asset List ── */}
        <View style={s.listSection}>
          {/* Section header */}
          {!search && (
            <View style={[s.listSectionHeader, { borderLeftColor: seg.color }]}>
              <View style={[s.listIconWrap, { backgroundColor: seg.bgLight }]}>
                <Ionicons name={seg.icon as any} size={14} color={seg.color} />
              </View>
              <Text style={[s.listSectionTitle, { color: seg.color }]}>{seg.label} Piyasası</Text>
              <Text style={s.listSectionCount}>{assetList.length} varlık{pricesLoading ? ' ↻' : ''}</Text>
            </View>
          )}

          {/* Column headers */}
          <View style={s.colHeaders}>
            <Text style={s.colRank}>#</Text>
            <Text style={s.colAsset}>Varlık</Text>
            <Text style={s.col7d}>7 Gün</Text>
            <Text style={s.colPrice}>Fiyat / Değ.</Text>
          </View>

          {/* Rows */}
          <View style={s.listCard}>
            {assetList.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="search-outline" size={32} color="#D0D5DD" />
                <Text style={s.emptyTitle}>Sonuç bulunamadı</Text>
                <Text style={s.emptySub}>Farklı bir arama deneyin</Text>
              </View>
            ) : (
              assetList.map((asset, i) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  rank={i + 1}
                  onPress={() => goToAsset(asset)}
                />
              ))
            )}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={13} color="#9AA0AF" />
          <Text style={s.disclaimerTxt}>Bu veriler bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.</Text>
        </View>

        <View style={{ height: 80 + insets.bottom }} />
      </Animated.ScrollView>

      {/* Dark header zIndex overlay for proper stacking */}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F7FB' },
  scroll: { flex: 1 },

  // Dark header
  darkHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#0A0B10',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 10,
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 1, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,200,83,0.15)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(0,200,83,0.25)',
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00C853' },
  livePillTxt: { fontSize: 9.5, fontWeight: '900', color: '#00C853', letterSpacing: 1 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Search
  searchSection: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: radius.md,
    paddingHorizontal: 13, paddingVertical: 9, gap: 9,
    ...shadow.sm,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  searchInput: { flex: 1, fontSize: 13.5, color: '#0F0F1A', fontWeight: '500' },

  // Segment cards
  segSection: { paddingHorizontal: 16, paddingTop: 10 },
  segTitle: { fontSize: 12, fontWeight: '700', color: '#9AA0AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  segGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  // List section
  listSection: { paddingTop: 16 },
  listSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, marginBottom: 8,
    borderLeftWidth: 3, paddingLeft: 13,
  },
  listIconWrap: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  listSectionTitle: { fontSize: 14, fontWeight: '900', flex: 1, letterSpacing: -0.2 },
  listSectionCount: { fontSize: 11, fontWeight: '700', color: '#9AA0AF' },
  colHeaders: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: '#F0F1F7',
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  colRank: { width: 18, fontSize: 9.5, fontWeight: '700', color: '#9AA0AF', textTransform: 'uppercase' },
  colAsset: { flex: 1, fontSize: 9.5, fontWeight: '700', color: '#9AA0AF', textTransform: 'uppercase', marginLeft: 50 },
  col7d: { width: 62, fontSize: 9.5, fontWeight: '700', color: '#9AA0AF', textTransform: 'uppercase', textAlign: 'center' },
  colPrice: { width: 86, fontSize: 9.5, fontWeight: '700', color: '#9AA0AF', textTransform: 'uppercase', textAlign: 'right' },

  listCard: {
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#4B5563' },
  emptySub: { fontSize: 12, color: '#9AA0AF' },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: '#FFF', borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  disclaimerTxt: { flex: 1, fontSize: 11, color: '#9AA0AF', lineHeight: 16 },
});
