import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, FlatList, Image, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mockVideos } from '../data/mockVideos';
import { mockMarketAssets } from '../data/mockMarkets';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { liveToMarketAsset } from '../services/marketService';
import { supabase } from '../lib/supabase';
import { radius, shadow, colors } from '../constants/theme';

// ── Data ─────────────────────────────────────────────────────────────────────
const TRENDING_SEARCHES = [
  '#Bitcoin', '#BIST100', '#Tesla', '$ETH', '#Altın', '#Nasdaq', '#DolarTL', '#SOL',
];

const HOT_CREATORS = [
  { id: 'c1', name: 'Crypto Guru',  handle: '@cryptoguru',  followers: '124K', avatar: 'https://i.pravatar.cc/80?u=c1', verified: true },
  { id: 'c2', name: 'Borsa Master', handle: '@borsam',      followers: '89K',  avatar: 'https://i.pravatar.cc/80?u=c2', verified: true },
  { id: 'c3', name: 'Gold Trader',  handle: '@goldtr',      followers: '67K',  avatar: 'https://i.pravatar.cc/80?u=c3', verified: false },
  { id: 'c4', name: 'FX Analyst',   handle: '@fxanalyst',   followers: '45K',  avatar: 'https://i.pravatar.cc/80?u=c4', verified: true },
  { id: 'c5', name: 'Hisse Uzmanı', handle: '@hisseuzman',  followers: '38K',  avatar: 'https://i.pravatar.cc/80?u=c5', verified: false },
];

type ResultTab = 'videos' | 'assets' | 'creators';

interface Props { onBack?: () => void }

// ── Sub-components ────────────────────────────────────────────────────────────
function VideoResult({ item, onPress }: { item: typeof mockVideos[0]; onPress: () => void }) {
  const up = (item.changePercent ?? 0) >= 0;
  return (
    <Pressable style={r.videoCard} onPress={onPress}>
      <Image source={{ uri: item.thumbnail }} style={r.videoThumb} />
      {item.isLive && (
        <View style={r.livePill}>
          <View style={r.liveDot} />
          <Text style={r.liveTxt}>CANLI</Text>
        </View>
      )}
      <View style={r.videoInfo}>
        <Text style={r.videoTitle} numberOfLines={2}>{item.title}</Text>
        <View style={r.videoMeta}>
          <Image source={{ uri: item.creator.avatar }} style={r.videoAvatar} />
          <Text style={r.videoCreator}>{item.creator.name}</Text>
          {item.changePercent !== undefined && (
            <View style={[r.changePill, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
              <Text style={[r.changeTxt, { color: up ? colors.rise : colors.fall }]}>
                {up ? '+' : ''}{item.changePercent}%
              </Text>
            </View>
          )}
        </View>
        {item.assetTags.length > 0 && (
          <View style={r.tagsRow}>
            {item.assetTags.slice(0, 3).map((t) => (
              <View key={t} style={r.tagChip}>
                <Text style={r.tagTxt}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

function AssetResult({ asset, onPress }: { asset: typeof mockMarketAssets[0]; onPress?: () => void }) {
  const up = asset.changePercent >= 0;
  return (
    <Pressable style={r.assetRow} onPress={onPress}>
      <View style={[r.assetLogo, { backgroundColor: asset.logoColor + '18' }]}>
        <Text style={[r.assetLogoTxt, { color: asset.logoColor }]}>
          {asset.logoLetter || asset.symbol[0]}
        </Text>
      </View>
      <View style={r.assetInfo}>
        <Text style={r.assetSym}>{asset.symbol}</Text>
        <Text style={r.assetName}>{asset.name}</Text>
      </View>
      <View style={r.assetRight}>
        <Text style={r.assetPrice}>{asset.price}</Text>
        <View style={[r.assetChange, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
          <Text style={[r.assetChangeTxt, { color: up ? colors.rise : colors.fall }]}>
            {up ? '+' : ''}{asset.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function CreatorResult({ creator }: { creator: typeof HOT_CREATORS[0] }) {
  const [following, setFollowing] = useState(false);
  return (
    <View style={r.creatorRow}>
      <Image source={{ uri: creator.avatar }} style={r.creatorAvatar} />
      <View style={r.creatorInfo}>
        <View style={r.creatorNameRow}>
          <Text style={r.creatorName}>{creator.name}</Text>
          {creator.verified && (
            <View style={r.verifiedDot}>
              <Ionicons name="checkmark" size={8} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={r.creatorHandle}>{creator.handle} • {creator.followers} takipçi</Text>
      </View>
      <Pressable
        style={[r.followBtn, following && r.followBtnActive]}
        onPress={() => setFollowing(!following)}
      >
        <Text style={[r.followBtnTxt, following && r.followBtnTxtActive]}>
          {following ? 'Takipte' : 'Takip Et'}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Main SearchScreen ─────────────────────────────────────────────────────────
export function SearchScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('videos');
  const [dbCreators, setDbCreators] = useState<typeof HOT_CREATORS>([]);
  const { assets: liveAssets } = useMarketPrices();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Gerçek creator araması (debounce)
  useEffect(() => {
    if (!query.trim()) { setDbCreators([]); return; }
    const t = setTimeout(async () => {
      const q2 = query.trim().toLowerCase();
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, verified, follower_count')
        .or(`username.ilike.%${q2}%,full_name.ilike.%${q2}%`)
        .limit(10);
      if (data && data.length > 0) {
        setDbCreators(data.map((p: any) => ({
          id:        p.id,
          name:      p.full_name ?? p.username,
          handle:    `@${p.username}`,
          followers: p.follower_count >= 1000 ? `${(p.follower_count / 1000).toFixed(1)}K` : String(p.follower_count ?? 0),
          avatar:    p.avatar_url ?? `https://i.pravatar.cc/80?u=${p.id}`,
          verified:  p.verified ?? false,
        })));
      } else {
        setDbCreators([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const q = query.toLowerCase().trim();

  const videoResults = q.length > 0
    ? mockVideos.filter(
        (v) => v.title.toLowerCase().includes(q)
          || v.assetTags.some((t) => t.toLowerCase().includes(q))
          || v.creator.name.toLowerCase().includes(q)
      )
    : [];

  const allMarketAssets = liveAssets.length > 0
    ? liveAssets.map(liveToMarketAsset)
    : mockMarketAssets;

  const assetResults = q.length > 0
    ? allMarketAssets.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      )
    : [];

  const creatorResults = q.length > 0
    ? (dbCreators.length > 0 ? dbCreators : HOT_CREATORS).filter(
        (c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
      )
    : [];

  const hasResults = videoResults.length > 0 || assetResults.length > 0 || creatorResults.length > 0;

  const TABS: { key: ResultTab; label: string; count: number }[] = [
    { key: 'videos',   label: 'Videolar',  count: videoResults.length },
    { key: 'assets',   label: 'Varlıklar', count: assetResults.length },
    { key: 'creators', label: 'Creator',   count: creatorResults.length },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={s.searchBar}>
        <Pressable onPress={onBack ?? (() => navigation.goBack())} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={s.inputWrap}>
          <Ionicons name="search-outline" size={17} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder="Video, varlık veya creator ara..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        /* ── Empty state: trending ── */
        <ScrollView
          contentContainerStyle={[s.emptyContent, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Trending searches */}
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>🔥 Trend Aramalar</Text>
            </View>
            <View style={s.trendGrid}>
              {TRENDING_SEARCHES.map((t) => (
                <Pressable key={t} style={s.trendChip} onPress={() => setQuery(t)}>
                  <Text style={s.trendChipTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Hot creators */}
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>⭐ Öne Çıkan Creator'lar</Text>
              <Text style={s.seeAll}>Tümü</Text>
            </View>
            {HOT_CREATORS.map((c) => <CreatorResult key={c.id} creator={c} />)}
          </View>

          {/* Popular assets */}
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>📈 Popüler Varlıklar</Text>
            </View>
            {allMarketAssets.slice(0, 5).map((a) => (
              <AssetResult
                key={a.id}
                asset={a}
                onPress={() => { Keyboard.dismiss(); navigation.navigate('AssetDetail', { asset: a }); }}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        /* ── Results ── */
        <View style={{ flex: 1 }}>
          {hasResults && (
            /* Tabs */
            <View style={s.tabsBar}>
              {TABS.map((t) => (
                <Pressable key={t.key} style={s.tabItem} onPress={() => setActiveTab(t.key)}>
                  <Text style={[s.tabTxt, activeTab === t.key && s.tabTxtActive]}>
                    {t.label}
                    {t.count > 0 && <Text style={s.tabCount}> {t.count}</Text>}
                  </Text>
                  {activeTab === t.key && <View style={s.tabUnderline} />}
                </Pressable>
              ))}
            </View>
          )}

          <ScrollView
            contentContainerStyle={[s.resultsContent, { paddingBottom: insets.bottom + 20 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasResults && (
              <View style={s.noResults}>
                <Text style={s.noResultsIcon}>🔍</Text>
                <Text style={s.noResultsTitle}>Sonuç bulunamadı</Text>
                <Text style={s.noResultsSub}>"{query}" için eşleşme bulunamadı</Text>
                <View style={[s.trendGrid, { justifyContent: 'center', marginTop: 12 }]}>
                  {TRENDING_SEARCHES.slice(0, 4).map((t) => (
                    <Pressable key={t} style={s.trendChip} onPress={() => setQuery(t)}>
                      <Text style={s.trendChipTxt}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'videos' && videoResults.map((item) => (
              <VideoResult
                key={item.id}
                item={item}
                onPress={() => { Keyboard.dismiss(); navigation.navigate('VideoDetail', { item }); }}
              />
            ))}

            {activeTab === 'assets' && assetResults.map((asset) => (
              <AssetResult
                key={asset.id}
                asset={asset}
                onPress={() => { Keyboard.dismiss(); navigation.navigate('AssetDetail', { asset }); }}
              />
            ))}

            {activeTab === 'creators' && creatorResults.map((c) => (
              <CreatorResult key={c.id} creator={c} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bgPure, paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 2 },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgInput, borderRadius: radius.md,
    paddingHorizontal: 12, height: 42,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  input: { flex: 1, fontSize: 15, color: colors.text },

  emptyContent: { paddingBottom: 24 },
  resultsContent: { paddingBottom: 24 },

  section: { marginTop: 18, paddingHorizontal: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  trendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendChip: {
    backgroundColor: colors.bgPure, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    ...shadow.sm,
  },
  trendChipTxt: { fontSize: 13, fontWeight: '600', color: colors.text },

  // Tabs
  tabsBar: {
    flexDirection: 'row', backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabTxt: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTxtActive: { color: colors.text },
  tabCount: { color: colors.primary },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%',
    height: 2.5, backgroundColor: colors.primary, borderRadius: 2,
  },

  // No results
  noResults: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  noResultsIcon: { fontSize: 48, marginBottom: 12 },
  noResultsTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  noResultsSub: { fontSize: 14, color: colors.textMuted, marginBottom: 20, textAlign: 'center' },
});

// ── Result styles ─────────────────────────────────────────────────────────────
const r = StyleSheet.create({
  // Video
  videoCard: {
    flexDirection: 'row', backgroundColor: colors.bgPure,
    marginHorizontal: 12, marginTop: 10, borderRadius: radius.md,
    overflow: 'hidden', ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  videoThumb: { width: 110, height: 74 },
  livePill: {
    position: 'absolute', top: 6, left: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.danger, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  liveTxt: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  videoInfo: { flex: 1, padding: 10, gap: 4 },
  videoTitle: { fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 17 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  videoAvatar: { width: 16, height: 16, borderRadius: 8 },
  videoCreator: { fontSize: 11, color: colors.textMuted, flex: 1 },
  changePill: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  changeTxt: { fontSize: 10, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  tagChip: { backgroundColor: colors.bgInput, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  tagTxt: { fontSize: 10, fontWeight: '600', color: colors.textMuted },

  // Asset
  assetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgPure, marginHorizontal: 12, marginTop: 8,
    borderRadius: radius.md, padding: 12, ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  assetLogo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  assetLogoTxt: { fontSize: 14, fontWeight: '900' },
  assetInfo: { flex: 1 },
  assetSym: { fontSize: 14, fontWeight: '800', color: colors.text },
  assetName: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  assetRight: { alignItems: 'flex-end', gap: 4 },
  assetPrice: { fontSize: 14, fontWeight: '700', color: colors.text },
  assetChange: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  assetChangeTxt: { fontSize: 11, fontWeight: '700' },

  // Creator
  creatorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgPure, marginHorizontal: 12, marginTop: 8,
    borderRadius: radius.md, padding: 12, ...shadow.sm, borderWidth: 1, borderColor: colors.border,
  },
  creatorAvatar: { width: 44, height: 44, borderRadius: 22 },
  creatorInfo: { flex: 1 },
  creatorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  creatorName: { fontSize: 14, fontWeight: '700', color: colors.text },
  verifiedDot: {
    width: 15, height: 15, borderRadius: 7.5, backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
  },
  creatorHandle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  followBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  followBtnActive: { backgroundColor: colors.primaryLight },
  followBtnTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },
  followBtnTxtActive: { color: colors.primaryDark },
});
