import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, FlatList, Image, Keyboard, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { liveToMarketAsset } from '../services/marketService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SignalCard } from '../components/SignalCard';
import type { VideoItem } from '../data/mockVideos';
import { radius, shadow, colors, font } from '../constants/theme';

// ── Static fallback (piyasa verisi yokken) ───────────────────────────────────
const STATIC_TRENDING = [
  '#Bitcoin', '#BIST100', '#Tesla', '$ETH', '#Altın', '#Nasdaq', '#DolarTL', '#SOL',
];

type ResultTab = 'videos' | 'assets' | 'creators' | 'signals';

interface Props { onBack?: () => void }

// ── Sub-components ────────────────────────────────────────────────────────────
function VideoResult({ item, onPress }: { item: VideoItem; onPress: () => void }) {
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

function AssetResult({ asset, onPress }: { asset: ReturnType<typeof liveToMarketAsset>; onPress?: () => void }) {
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

function CreatorResult({ creator }: { creator: SimpleCreator }) {
  const [following, setFollowing] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!user?.id || !creator.id) return;
    supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', creator.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setFollowing(true); });
  }, [user?.id, creator.id]);

  const handleFollow = async () => {
    if (!user) { toast.info('Takip etmek için giriş yap'); return; }
    const next = !following;
    setFollowing(next);
    if (next) {
      await supabase.from('follows').upsert(
        { follower_id: user.id, following_id: creator.id },
        { onConflict: 'follower_id,following_id' }
      );
      toast.success(`${creator.name} takip ediliyor ✓`);
    } else {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', creator.id);
      toast.info(`${creator.name} takipten çıkıldı`);
    }
  };

  return (
    <Pressable
      style={r.creatorRow}
      onPress={() => navigation.navigate('ProfileView', { userId: creator.id })}
    >
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
        onPress={(e) => { e.stopPropagation?.(); handleFollow(); }}
        hitSlop={8}
      >
        {following && <Ionicons name="checkmark" size={11} color={colors.primaryDark} />}
        <Text style={[r.followBtnTxt, following && r.followBtnTxtActive]}>
          {following ? 'Takipte' : 'Takip Et'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

// ── Main SearchScreen ─────────────────────────────────────────────────────────
type SimpleCreator = { id: string; name: string; handle: string; followers: string; avatar: string; verified: boolean };

export function SearchScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('videos');
  const [dbCreators, setDbCreators] = useState<SimpleCreator[]>([]);
  const [dbVideos,   setDbVideos]   = useState<VideoItem[]>([]);
  const [dbSignals,  setDbSignals]  = useState<any[]>([]);
  const [searching,  setSearching]  = useState(false);
  const { assets: liveAssets, allAssets } = useMarketPrices();
  const { analysts } = useLeaderboard();

  // Trend aramalar: piyasada en çok hareket eden varlıklar
  const trendingSearches = React.useMemo(() => {
    if (allAssets.length === 0) return STATIC_TRENDING;
    return [...allAssets]
      .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
      .slice(0, 8)
      .map(a => `#${a.symbol}`);
  }, [allAssets]);

  // Featured creators from leaderboard (real data)
  const featuredCreators: SimpleCreator[] = analysts.slice(0, 5).map((a) => ({
    id:        a.id,
    name:      a.name,
    handle:    a.handle,
    followers: a.followers,
    avatar:    a.avatar,
    verified:  a.verified,
  }));

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Supabase video + creator araması (debounce)
  useEffect(() => {
    if (!query.trim()) { setDbCreators([]); setDbVideos([]); setDbSignals([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const q2 = query.trim().toLowerCase();
      try {

      // Video araması
      const { data: vData } = await supabase
        .from('posts')
        .select('id, user_id, creator_id, type, title, content, asset_tag, thumbnail_url, image_url, video_url, likes_count, comments_count, views_count, created_at')
        .or(`title.ilike.%${q2}%,content.ilike.%${q2}%,asset_tag.ilike.%${q2}%`)
        .not('type', 'eq', 'text')
        .limit(10);
      if (vData && vData.length > 0) {
        const uids = vData.map((r: any) => r.creator_id ?? r.user_id).filter(Boolean);
        const { data: profs } = await supabase.from('profiles').select('id, username, full_name, avatar_url, verified').in('id', [...new Set(uids)]);
        const pm: Record<string, any> = {};
        for (const p of profs ?? []) pm[p.id] = p;
        setDbVideos(vData.map((row: any): VideoItem => {
          const prof = pm[row.creator_id ?? row.user_id];
          return {
            id: row.id,
            title: row.title ?? row.content ?? 'Video',
            thumbnail: row.thumbnail_url ?? row.image_url ?? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
            videoUrl: row.video_url,
            category: 'for_you',
            assetTags: row.asset_tag ? [row.asset_tag] : [],
            isLive: row.type === 'live',
            timeAgo: '',
            creator: { id: prof?.id ?? row.user_id, name: prof?.full_name ?? prof?.username ?? 'Kullanıcı', avatar: prof?.avatar_url ?? `https://i.pravatar.cc/80?u=${row.user_id}`, verified: prof?.verified ?? false },
            stats: { likes: row.likes_count ?? 0, comments: row.comments_count ?? 0, shares: 0, views: row.views_count ?? 0 },
          };
        }));
      } else {
        setDbVideos([]);
      }

      // Creator araması
      const { data: pData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, verified, follower_count')
        .or(`username.ilike.%${q2}%,full_name.ilike.%${q2}%`)
        .limit(10);
      if (pData && pData.length > 0) {
        setDbCreators(pData.map((p: any) => ({
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

      // Sinyal araması
      const { data: sData } = await supabase
        .from('signals')
        .select(`
          id, asset_id, direction, confidence, entry_price, target_price,
          stop_loss, timeframe, rationale, copies_count, created_at,
          profiles!signals_creator_id_fkey(id, username, full_name, avatar_url, verified, signal_accuracy)
        `)
        .or(`asset_id.ilike.%${q2}%,rationale.ilike.%${q2}%`)
        .order('created_at', { ascending: false })
        .limit(15);
      setDbSignals(sData ?? []);

      // En fazla sonuç olan sekmeye otomatik geç
      const counts = {
        videos:   (vData ?? []).length,
        signals:  (sData ?? []).length,
        creators: (pData ?? []).length,
      };
      const best = (Object.entries(counts) as [ResultTab, number][]).sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) setActiveTab(best[0]);

      } catch (e) {
        console.warn('[SearchScreen] arama hatası:', e);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { clearTimeout(t); };
  }, [query]);

  const q = query.toLowerCase().trim();

  const videoResults   = dbVideos;
  const signalResults  = dbSignals;

  const allMarketAssets = liveAssets.map(liveToMarketAsset);

  const assetResults = q.length > 0
    ? allMarketAssets.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      )
    : [];

  const creatorResults = dbCreators;

  const hasResults = videoResults.length > 0 || assetResults.length > 0 || creatorResults.length > 0 || signalResults.length > 0;

  const TABS: { key: ResultTab; label: string; count: number }[] = [
    { key: 'videos',   label: 'Gönderiler', count: videoResults.length },
    { key: 'signals',  label: 'Sinyaller',  count: signalResults.length },
    { key: 'assets',   label: 'Varlıklar',  count: assetResults.length },
    { key: 'creators', label: 'Creator',    count: creatorResults.length },
  ];

  // Arama sonuçları gelince en çok sonucu olan tab'ı otomatik seç
  React.useEffect(() => {
    if (query.length < 2) return;
    const counts: Record<ResultTab, number> = {
      videos:   videoResults.length,
      assets:   assetResults.length,
      creators: creatorResults.length,
    };
    const best = (Object.entries(counts) as [ResultTab, number][])
      .sort(([, a], [, b]) => b - a)[0];
    if (best && best[1] > 0 && counts[activeTab] === 0) {
      setActiveTab(best[0]);
    }
  }, [videoResults.length, assetResults.length, creatorResults.length, query]);

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
              {trendingSearches.map((t) => (
                <Pressable key={t} style={s.trendChip} onPress={() => setQuery(t.replace('#', ''))}>
                  <Text style={s.trendChipTxt}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Hot creators */}
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>⭐ Öne Çıkan Creator'lar</Text>
              <Pressable onPress={() => navigation.navigate('Leaderboard' as any)} hitSlop={8}>
                <Text style={s.seeAll}>Tümü →</Text>
              </Pressable>
            </View>
            {featuredCreators.map((c) => <CreatorResult key={c.id} creator={c} />)}
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

          {/* Arama yükleniyor */}
          {searching && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 }}>
              <Ionicons name="search-outline" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Aranıyor…</Text>
            </View>
          )}

          <ScrollView
            contentContainerStyle={[s.resultsContent, { paddingBottom: insets.bottom + 20 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!hasResults && !searching && (
              <View style={s.noResults}>
                {activeTab === 'users' && (
                  <>
                    <Ionicons name="people-outline" size={52} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={s.noResultsTitle}>Kullanıcı bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" adında bir kullanıcı yok.{'\n'}Tam kullanıcı adı veya gerçek isim deneyin.</Text>
                  </>
                )}
                {activeTab === 'posts' && (
                  <>
                    <Ionicons name="document-text-outline" size={52} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={s.noResultsTitle}>Gönderi bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" içeren gönderi yok.{'\n'}Farklı anahtar kelime ya da hashtag deneyin.</Text>
                  </>
                )}
                {activeTab === 'videos' && (
                  <>
                    <Ionicons name="videocam-outline" size={52} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={s.noResultsTitle}>Video bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" için video yok.{'\n'}Konu başlığı veya içerik üreticisi adı deneyin.</Text>
                  </>
                )}
                {activeTab === 'assets' && (
                  <>
                    <Ionicons name="trending-up-outline" size={52} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={s.noResultsTitle}>Varlık bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" sembolü veya adında varlık yok.{'\n'}BTC, ETH, AAPL gibi semboller deneyin.</Text>
                  </>
                )}
                {activeTab === 'signals' && (
                  <>
                    <Ionicons name="pulse-outline" size={52} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={s.noResultsTitle}>Sinyal bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" için sinyal yok.{'\n'}Varlık sembolü (BTC, ETH) ile arayın.</Text>
                  </>
                )}
                {!['users','posts','videos','assets','signals'].includes(activeTab) && (
                  <>
                    <Text style={s.noResultsIcon}>🔍</Text>
                    <Text style={s.noResultsTitle}>Sonuç bulunamadı</Text>
                    <Text style={s.noResultsSub}>"{query}" için eşleşme bulunamadı</Text>
                  </>
                )}
                <Text style={[s.noResultsSub, { marginTop: 16, fontWeight: '600', color: colors.textMuted }]}>
                  Trend aramalar:
                </Text>
                <View style={[s.trendGrid, { justifyContent: 'center', marginTop: 8 }]}>
                  {trendingSearches.slice(0, 4).map((t: string) => (
                    <Pressable key={t} style={s.trendChip} onPress={() => setQuery(t.replace('#', ''))}>
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

            {activeTab === 'signals' && (
              signalResults.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
                  <Ionicons name="pulse-outline" size={40} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>Sinyal bulunamadı</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', paddingHorizontal: 30 }}>
                    Varlık adı (BTC, ETH, AAPL) veya analist adı ile arayın
                  </Text>
                </View>
              ) : (
                signalResults.map((sig: any) => (
                  <SignalCard
                    key={sig.id}
                    signal={{
                      ...sig,
                      creator: sig.profiles,
                    } as any}
                  />
                ))
              )
            )}

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
