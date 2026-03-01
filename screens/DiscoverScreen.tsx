import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, Image, ImageBackground, StatusBar, Animated,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { FeaturedVideoCard } from '../components/VideoCard';
import { SignalCard } from '../components/SignalCard';
import { liveToMarketAsset } from '../services/marketService';
import { useToast } from '../contexts/ToastContext';
import { useTabBar } from '../contexts/TabBarContext';
import { useVideos } from '../hooks/useVideos';
import { useSignals } from '../hooks/useSignals';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { radius, shadow, colors } from '../constants/theme';

const { width: W } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRENDING_TAGS = [
  { tag: '#Bitcoin',  count: '48.2K', color: '#F7931A', up: true  },
  { tag: '#BIST100',  count: '32.1K', color: '#E81F2A', up: true  },
  { tag: '#Tesla',    count: '21.8K', color: '#CC0000', up: true  },
  { tag: '#Nasdaq',   count: '19.4K', color: '#007AFF', up: true  },
  { tag: '#Altın',    count: '17.2K', color: '#D4AF37', up: true  },
  { tag: '#Ethereum', count: '15.9K', color: '#627EEA', up: true  },
  { tag: '#Petrol',   count: '11.3K', color: '#2D6A4F', up: false },
  { tag: '#DolarTL',  count: '9.8K',  color: '#6B7280', up: false },
];

const BANNERS = [
  {
    id: 'b1',
    title: 'Kripto Piyasasını Anla',
    desc: 'Bitcoin 70K\'ya yaklaşırken fırsatları kaçırma',
    label: 'ÖNE ÇIKAN',
    labelColor: '#7B61FF',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
  },
  {
    id: 'b2',
    title: 'Hisse Analiz Rehberi',
    desc: 'Temel ve teknik analizin püf noktaları',
    label: 'EĞİTİM',
    labelColor: '#007AFF',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  },
  {
    id: 'b3',
    title: 'Altın & Emtia 2025',
    desc: 'Merkez bankası alımları ve fiyat tahminleri',
    label: 'ANALIZ',
    labelColor: '#D4AF37',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800',
  },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtV(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n); }

// ─── Tab bar ──────────────────────────────────────────────────────────────────
type DiscoverTab = 'kesfet' | 'haberler' | 'sinyaller' | 'analistler';
const TABS: { key: DiscoverTab; label: string }[] = [
  { key: 'kesfet',     label: 'Keşfet'     },
  { key: 'haberler',   label: 'Haberler'   },
  { key: 'sinyaller',  label: 'Sinyaller'  },
  { key: 'analistler', label: 'Analistler' },
];

// ─── Section Header ───────────────────────────────────────────────────────────
function SecHeader({
  icon, title, onMore, count,
}: { icon: string; title: string; onMore?: () => void; count?: number }) {
  return (
    <View style={sh.row}>
      <View style={sh.left}>
        <View style={sh.iconWrap}>
          <Ionicons name={icon as any} size={14} color={colors.primary} />
        </View>
        <Text style={sh.title}>{title}</Text>
        {count !== undefined && (
          <View style={sh.badge}>
            <Text style={sh.badgeTxt}>{count}</Text>
          </View>
        )}
      </View>
      {onMore && (
        <Pressable onPress={onMore} style={sh.moreBtn}>
          <Text style={sh.moreTxt}>Tümü</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '800', color: '#0F0F1A' },
  badge: {
    backgroundColor: '#0F0F1A', borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeTxt: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const DISC_HEADER_H = 100; // header (title+search) height approx
const DISC_TABS_H   = 42;  // tab bar height

export function DiscoverScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const toast      = useToast();
  const { hideTabBar, showTabBar, resetTabBar } = useTabBar();

  useFocusEffect(useCallback(() => {
    showTabBar();
    resetTabBar();
  }, [showTabBar, resetTabBar]));

  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState<DiscoverTab>('kesfet');
  const [following, setFollowing]     = useState<Record<string, boolean>>({});
  const [bannerIndex, setBannerIndex] = useState(0);
  const [sigFilter, setSigFilter]     = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const bannerRef                     = useRef<ScrollView>(null);

  // ── Gerçek veriler ───────────────────────────────────────────────────────────
  const { videos: liveVideos }   = useVideos({ type: 'all' });
  const { signals: liveSignals } = useSignals({ activeOnly: true });
  const { analysts }             = useLeaderboard();
  const { allAssets }            = useMarketPrices();

  const displayVideos  = liveVideos;
  const liveStreams     = liveVideos.filter((v) => v.isLive);

  // Market movers: top 6 by absolute change
  const marketMovers = [...(allAssets ?? [])]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 6);

  // Signals for SignalCard (SignalCardData format)
  const displaySignals = liveSignals.map(s => ({
    id:           s.id,
    asset_id:     s.asset_id,
    symbol:       s.symbol,
    direction:    s.direction as 'BUY' | 'SELL' | 'HOLD',
    confidence:   s.confidence,
    entry_price:  s.entry_price  ?? null,
    target_price: s.target_price ?? null,
    stop_loss:    s.stop_loss    ?? null,
    timeframe:    s.timeframe,
    rationale:    s.rationale    ?? null,
    copies_count: s.copies_count,
    likes_count:  s.likes_count,
    creator:      { name: s.creator.name, avatar: s.creator.avatar, accuracy: s.creator.accuracy, verified: s.creator.verified },
    isNew:        true,
    created_at:   s.created_at,
  }));

  // Scroll-driven header animation
  const scrollY     = useRef(new Animated.Value(0)).current;
  const lastY       = useRef(0);
  const totalTopH   = insets.top + DISC_HEADER_H + DISC_TABS_H;

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

  const trendVideos = displayVideos.filter((v) => v.type !== 'savings').slice(0, 3);
  const filteredVideos = search.length > 1
    ? displayVideos.filter((v) =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.assetTags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const filteredSigs = sigFilter === 'ALL'
    ? displaySignals
    : (displaySignals as any[]).filter((s: any) => s.direction === sigFilter || s.direction === (sigFilter === 'BUY' ? 'BUY' : 'SELL'));

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── Animated top bar ── */}
      <Animated.View
        style={[s.topBar, { paddingTop: insets.top, transform: [{ translateY: headerTranslateY }] }]}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.headerTitle}>Keşfet</Text>
            <Pressable style={s.filterBtn}>
              <Ionicons name="options-outline" size={18} color="#1A1A2E" />
            </Pressable>
          </View>
          <View style={s.searchWrap}>
            <View style={s.searchIcon}>
              <Ionicons name="search-outline" size={16} color="#9AA0AF" />
            </View>
            <TextInput
              style={s.searchInput}
              placeholder="Video, #etiket, analist ara..."
              placeholderTextColor="#B0B8C4"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={s.searchClear}>
                <Ionicons name="close-circle" size={16} color="#9AA0AF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Tab Bar */}
        {search.length === 0 && (
          <View style={s.tabBar}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Pressable key={t.key} style={s.tabItem} onPress={() => setTab(t.key)}>
                  <Text style={[s.tabTxt, active && s.tabTxtActive]}>{t.label}</Text>
                  {active && <View style={s.tabUnderline} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH, paddingBottom: 100 + insets.bottom }}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
      >
        {/* ─── SEARCH RESULTS ─── */}
        {search.length > 1 && (
          <View style={s.section}>
            <Text style={s.searchResultTitle}>
              {filteredVideos.length > 0
                ? `${filteredVideos.length} sonuç — "${search}"`
                : `"${search}" için sonuç bulunamadı`}
            </Text>
            {filteredVideos.length === 0 ? (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Ionicons name="search-outline" size={28} color="#B0B8C4" />
                </View>
                <Text style={s.emptyTitle}>Sonuç bulunamadı</Text>
                <Text style={s.emptyDesc}>Farklı bir arama terimi deneyin</Text>
              </View>
            ) : (
              <View style={s.searchResults}>
                {filteredVideos.map((item) => (
                  <FeaturedVideoCard
                    key={item.id}
                    item={item}
                    onPress={() => navigation.navigate('VideoDetail', { item })}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ─── AI ASISTAN BANNER ─── */}
        {search.length === 0 && tab === 'kesfet' && (
          <Pressable
            style={dc.aiBanner}
            onPress={() => navigation.navigate('AIAssistant')}
          >
            <LinearGradient colors={['#0D1F3C', '#1A1050']} style={dc.aiBannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={dc.aiIconWrap}>
                <Text style={dc.aiIcon}>🤖</Text>
              </View>
              <View style={dc.aiTextWrap}>
                <Text style={dc.aiTitle}>MarketAI Asistan</Text>
                <Text style={dc.aiSub}>Piyasalar hakkında her şeyi sor</Text>
              </View>
              <View style={dc.aiArrow}>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
              </View>
            </LinearGradient>
          </Pressable>
        )}

        {/* ─── TAB: KEŞFET ─── */}
        {search.length === 0 && tab === 'kesfet' && (
          <>
            {/* Hero Banner */}
            <View style={s.bannerWrap}>
              <ScrollView
                ref={bannerRef}
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
                  setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (W - 32)))
                }
                scrollEventThrottle={16}
              >
                {BANNERS.map((b) => (
                  <Pressable key={b.id}>
                    <ImageBackground
                      source={{ uri: b.thumbnail }}
                      style={[s.banner, { width: W - 32 }]}
                      imageStyle={s.bannerImg}
                      resizeMode="cover"
                    >
                      <View style={s.bannerGrad} />
                      <View style={s.bannerContent}>
                        <View style={[s.bannerLabel, { backgroundColor: b.labelColor }]}>
                          <Text style={s.bannerLabelTxt}>{b.label}</Text>
                        </View>
                        <Text style={s.bannerTitle}>{b.title}</Text>
                        <Text style={s.bannerDesc}>{b.desc}</Text>
                        <View style={s.bannerCta}>
                          <Text style={s.bannerCtaTxt}>Keşfet</Text>
                          <Ionicons name="arrow-forward" size={13} color="#FFF" />
                        </View>
                      </View>
                    </ImageBackground>
                  </Pressable>
                ))}
              </ScrollView>
              {/* Dots */}
              <View style={s.bannerDots}>
                {BANNERS.map((_, i) => (
                  <Pressable
                    key={i}
                    style={[s.dot, i === bannerIndex && s.dotActive]}
                    onPress={() => {
                      setBannerIndex(i);
                      bannerRef.current?.scrollTo({ x: i * (W - 32), animated: true });
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Trending Topics */}
            <View style={s.section}>
              <SecHeader icon="flame-outline" title="Trend Konular" onMore={() => {}} />
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tagsScroll}
              >
                {TRENDING_TAGS.map((t) => (
                  <Pressable key={t.tag} style={[s.tagChip, { borderColor: t.color + '40', backgroundColor: t.color + '0D' }]}>
                    <Text style={[s.tagChipTxt, { color: t.color }]}>{t.tag}</Text>
                    <View style={s.tagChipDivider} />
                    <Text style={s.tagChipCount}>{t.count}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Live Now */}
            {liveStreams.length > 0 && (
              <View style={[s.section, { paddingHorizontal: 0 }]}>
                <View style={{ paddingHorizontal: 16 }}>
                  <SecHeader
                    icon="radio-outline"
                    title="Şu An Canlı"
                    count={liveStreams.length}
                    onMore={() => navigation.navigate('LiveFeed')}
                  />
                </View>
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.liveScroll}
                >
                  {liveStreams.map((item) => (
                    <Pressable key={item.id} style={s.liveCard} onPress={() => navigation.navigate('LiveFeed')}>
                      <View style={s.liveThumbWrap}>
                        <Image source={{ uri: item.thumbnail }} style={s.liveThumb} />
                        <View style={s.liveGrad} />
                        <View style={s.liveTopRow}>
                          <View style={s.liveBadge}>
                            <View style={s.livePulse} />
                            <Text style={s.liveBadgeTxt}>CANLI</Text>
                          </View>
                          {item.stats.views > 0 && (
                            <View style={s.viewerBadge}>
                              <Ionicons name="eye-outline" size={9} color="#FFF" />
                              <Text style={s.viewerTxt}>{fmtV(item.stats.views)}</Text>
                            </View>
                          )}
                        </View>
                        {item.assetTags.length > 0 && (
                          <View style={s.catPill}>
                            <Text style={s.catPillTxt}>{item.assetTags[0]}</Text>
                          </View>
                        )}
                      </View>
                      <View style={s.liveInfo}>
                        <View style={s.liveCreatorRow}>
                          <Image source={{ uri: item.creator.avatar }} style={s.liveAvatar} />
                          <Text style={s.liveCreator} numberOfLines={1}>{item.creator.name}</Text>
                        </View>
                        <Text style={s.liveTitle} numberOfLines={2}>{item.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trend Videos */}
            <View style={s.section}>
              <SecHeader icon="play-circle-outline" title="Trend Videolar" onMore={() => {}} />
              <View style={s.trendVideos}>
                {trendVideos.map((item) => (
                  <FeaturedVideoCard
                    key={item.id}
                    item={item}
                    onPress={() => navigation.navigate('VideoDetail', { item })}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {/* ─── TAB: HABERLER ─── */}
        {search.length === 0 && tab === 'haberler' && (
          <>
            {/* Market Movers */}
            {marketMovers.length > 0 && (
              <View style={[s.section, { paddingHorizontal: 0 }]}>
                <View style={{ paddingHorizontal: 16 }}>
                  <SecHeader icon="trending-up-outline" title="Piyasa Hareketlileri" onMore={() => navigation.navigate('Piyasalar' as never)} />
                </View>
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.moversScroll}
                >
                  {marketMovers.map((m) => {
                    const up    = m.change_percent >= 0;
                    const color = m.logo_color ?? (up ? colors.rise : colors.fall);
                    const price = m.price >= 10000
                      ? `$${m.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                      : m.price >= 1 ? `$${m.price.toFixed(2)}`
                      : `$${m.price.toFixed(4)}`;
                    return (
                      <Pressable key={m.id} style={s.moverCard}
                        onPress={() => navigation.navigate('AssetDetail', { asset: liveToMarketAsset(m) })}
                      >
                        <View style={[s.moverIcon, { backgroundColor: color + '18' }]}>
                          <Text style={[s.moverIconTxt, { color }]}>{m.logo_letter ?? m.symbol.slice(0, 3)}</Text>
                        </View>
                        <Text style={s.moverSym}>{m.symbol}</Text>
                        <Text style={s.moverName} numberOfLines={1}>{m.name}</Text>
                        <Text style={s.moverPrice}>{price}</Text>
                        <View style={[s.moverBadge, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
                          <Ionicons name={up ? 'caret-up' : 'caret-down'} size={8} color={up ? colors.rise : colors.fall} />
                          <Text style={[s.moverChange, { color: up ? colors.rise : colors.fall }]}>
                            {up ? '+' : ''}{m.change_percent.toFixed(2)}%
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Trend Videos as news substitute */}
            <View style={s.section}>
              <SecHeader icon="play-circle-outline" title="Trend Analizler" onMore={() => {}} />
              {displayVideos.slice(0, 4).map((item) => (
                <Pressable key={item.id} style={s.newsCard} onPress={() => navigation.navigate('VideoDetail', { item })}>
                  <Image source={{ uri: item.thumbnail }} style={s.newsThumbnail} />
                  <View style={s.newsBody}>
                    {item.assetTags.length > 0 && (
                      <View style={[s.newsTag, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[s.newsTagTxt, { color: colors.primary }]}>{item.assetTags[0]}</Text>
                      </View>
                    )}
                    <Text style={s.newsTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={s.newsMeta}>
                      <Text style={s.newsSource}>{item.creator.name}</Text>
                      <View style={s.newsDot} />
                      <Text style={s.newsTime}>{item.timeAgo}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#C8CDD8" />
                </Pressable>
              ))}
              {displayVideos.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Ionicons name="newspaper-outline" size={32} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13 }}>Henüz analiz yok</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ─── TAB: SİNYALLER ─── */}
        {search.length === 0 && tab === 'sinyaller' && (
          <View style={s.section}>
            <SecHeader
              icon="pulse-outline"
              title="Canlı Sinyaller"
              count={filteredSigs.length}
            />

            {/* Filter pills */}
            <View style={s.sigFilters}>
              {(['ALL', 'BUY', 'SELL'] as const).map((f) => {
                const active = sigFilter === f;
                const cfg = {
                  ALL:  { label: 'Tümü',  bg: '#F6F7FB', activeBg: '#0F0F1A',  txt: '#6B7280', activeTxt: '#FFF' },
                  BUY:  { label: '▲ AL',  bg: colors.riseLight, activeBg: colors.rise, txt: colors.rise, activeTxt: '#FFF' },
                  SELL: { label: '▼ SAT', bg: colors.fallLight, activeBg: colors.fall, txt: colors.fall, activeTxt: '#FFF' },
                }[f];
                return (
                  <Pressable
                    key={f}
                    style={[s.sigFilter, { backgroundColor: active ? cfg.activeBg : cfg.bg }]}
                    onPress={() => setSigFilter(f)}
                  >
                    <Text style={[s.sigFilterTxt, { color: active ? cfg.activeTxt : cfg.txt }]}>
                      {cfg.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {filteredSigs.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="pulse-outline" size={32} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13 }}>Henüz sinyal yok</Text>
              </View>
            ) : (
              filteredSigs.map((sig) => (
                <SignalCard key={sig.id} signal={sig as any} />
              ))
            )}
          </View>
        )}

        {/* ─── TAB: ANALİSTLER ─── */}
        {search.length === 0 && tab === 'analistler' && (
          <View style={s.section}>
            {/* Marketplace banner */}
            <Pressable
              style={ds.mktBanner}
              onPress={() => navigation.navigate('SignalMarketplace' as never)}
            >
              <LinearGradient colors={['#007AFF', '#5856D6']} style={ds.mktBannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={ds.mktBannerLeft}>
                  <Text style={ds.mktBannerTitle}>⚡ Sinyal Marketplace</Text>
                  <Text style={ds.mktBannerSub}>Ücretli analist paketlerine abone ol</Text>
                </View>
                <View style={ds.mktBannerChevron}>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </Pressable>
            <SecHeader icon="people-outline" title="Öne Çıkan Analistler" count={analysts.length} />
            {analysts.slice(0, 6).map((c) => (
              <Pressable key={c.id} style={s.analystCard} onPress={() => navigation.navigate('ProfileView', { userId: c.id, username: c.handle })}>
                {/* Cover + avatar */}
                <View style={s.analystCover}>
                  <Image
                    source={{ uri: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&sig=${c.id}` }}
                    style={s.analystCoverImg}
                  />
                  <View style={s.analystCoverGrad} />
                  {c.tier === 'pro' && (
                    <View style={s.proBadge}><Text style={s.proBadgeTxt}>PRO</Text></View>
                  )}
                  {c.tier === 'elite' && (
                    <View style={[s.proBadge, { backgroundColor: '#FFD700' }]}><Text style={s.proBadgeTxt}>ELITE</Text></View>
                  )}
                </View>
                <View style={s.analystAvatarWrap}>
                  <Image source={{ uri: c.avatar }} style={s.analystAvatar} />
                  {c.verified && (
                    <View style={s.verifiedBadge}>
                      <Ionicons name="checkmark" size={8} color="#FFF" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={s.analystInfo}>
                  <View style={s.analystNameRow}>
                    <Text style={s.analystName}>{c.name}</Text>
                    <Text style={s.analystHandle}>{c.handle}</Text>
                  </View>
                  <Text style={s.analystBio} numberOfLines={2}>{c.accuracy}% doğruluk · {c.signals} sinyal · {c.followers} takipçi</Text>

                  {/* Stats row */}
                  <View style={s.analystStats}>
                    <View style={s.analystStat}>
                      <Text style={s.analystStatVal}>{c.followers}</Text>
                      <Text style={s.analystStatLabel}>Takipçi</Text>
                    </View>
                    <View style={s.analystStatDivider} />
                    <View style={s.analystStat}>
                      <Text style={s.analystStatVal}>{c.signals}</Text>
                      <Text style={s.analystStatLabel}>Sinyal</Text>
                    </View>
                    <View style={s.analystStatDivider} />
                    <View style={s.analystStat}>
                      <Text style={[s.analystStatVal, { color: colors.rise }]}>{c.accuracy.toFixed(1)}%</Text>
                      <Text style={s.analystStatLabel}>Başarı</Text>
                    </View>
                  </View>

                  {/* Follow */}
                  <Pressable
                    style={[s.followBtn, following[c.id] && s.followBtnOn]}
                    onPress={() => {
                      const nowF = !following[c.id];
                      setFollowing((f) => ({ ...f, [c.id]: nowF }));
                      toast.success(nowF ? `${c.name} takip ediliyor ✓` : `${c.name} takipten çıkıldı`);
                    }}
                  >
                    {following[c.id] && <Ionicons name="checkmark" size={13} color="#FFF" />}
                    <Text style={[s.followTxt, following[c.id] && s.followTxtOn]}>
                      {following[c.id] ? 'Takip Ediliyor' : 'Takip Et'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F7FB' },

  // Animated top bar wrapper
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#FFF', zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 4,
  },

  // Header
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    gap: 8,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F0F1A', letterSpacing: -0.5 },
  filterBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F6F7FB',
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F6F7FB', borderRadius: radius.md,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 12, height: 42, gap: 8,
  },
  searchIcon: { opacity: 0.7 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F0F1A', fontWeight: '500' },
  searchClear: { padding: 2 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1, paddingVertical: 10, alignItems: 'center', position: 'relative',
  },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#9AA0AF' },
  tabTxtActive: { color: '#0F0F1A', fontWeight: '800' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, borderRadius: 2, backgroundColor: colors.primary,
  },

  // Search results
  section: { paddingHorizontal: 16, paddingTop: 20 },
  searchResultTitle: { fontSize: 13, fontWeight: '700', color: '#9AA0AF', marginBottom: 12 },
  searchResults: { gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F0F1F5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563' },
  emptyDesc: { fontSize: 13, color: '#9AA0AF' },

  // Banner
  bannerWrap: { paddingHorizontal: 16, paddingTop: 16 },
  banner: {
    height: 200, borderRadius: radius.xl,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  bannerImg: { borderRadius: radius.xl },
  bannerGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: radius.xl,
  },
  bannerContent: { padding: 16, gap: 5 },
  bannerLabel: {
    alignSelf: 'flex-start', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  bannerLabelTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', lineHeight: 24, letterSpacing: -0.3 },
  bannerDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17 },
  bannerCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  bannerCtaTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bannerDots: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, marginTop: 10,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#D0D3DB' },
  dotActive: { width: 20, height: 5, borderRadius: 2.5, backgroundColor: colors.primary },

  // Tags
  tagsScroll: { gap: 8, paddingBottom: 2 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 0,
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  tagChipTxt: { fontSize: 12, fontWeight: '800' },
  tagChipDivider: { width: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.10)', marginHorizontal: 8 },
  tagChipCount: { fontSize: 10, fontWeight: '600', color: '#9AA0AF' },

  // Live
  liveScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 2 },
  liveCard: {
    width: 200, backgroundColor: '#FFF', borderRadius: radius.lg,
    overflow: 'hidden', ...shadow.sm,
  },
  liveThumbWrap: { width: '100%', height: 120, position: 'relative' },
  liveThumb: { width: '100%', height: '100%' },
  liveGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  liveTopRow: {
    position: 'absolute', top: 8, left: 8, right: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E53935', borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  livePulse: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  liveBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  viewerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  viewerTxt: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  catPill: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2.5,
  },
  catPillTxt: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  liveInfo: { padding: 10, gap: 6 },
  liveCreatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveAvatar: { width: 18, height: 18, borderRadius: 9 },
  liveCreator: { fontSize: 11, color: '#6B7280', flex: 1, fontWeight: '600' },
  liveChange: {
    backgroundColor: colors.riseLight, borderRadius: radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveChangeFall: { backgroundColor: colors.fallLight },
  liveChangeTxt: { fontSize: 9, fontWeight: '800', color: colors.rise },
  liveChangeTxtFall: { color: colors.fall },
  liveTitle: { fontSize: 12, fontWeight: '700', color: '#0F0F1A', lineHeight: 17 },

  // Trend videos
  trendVideos: { gap: 10 },

  // Market Movers
  moversScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },
  moverCard: {
    width: 96, backgroundColor: '#FFF', borderRadius: radius.lg,
    padding: 12, alignItems: 'center', gap: 5,
    ...shadow.sm,
  },
  moverIcon: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  moverIconTxt: { fontSize: 12, fontWeight: '900' },
  moverSym: { fontSize: 11, fontWeight: '800', color: '#0F0F1A' },
  moverName: { fontSize: 9.5, color: '#9AA0AF', fontWeight: '500' },
  moverPrice: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  moverBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 3,
  },
  moverChange: { fontSize: 10, fontWeight: '800' },

  // News
  newsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF', borderRadius: radius.lg,
    padding: 12, marginBottom: 8,
    ...shadow.sm,
  },
  newsThumbnail: { width: 72, height: 72, borderRadius: radius.md, flexShrink: 0 },
  newsBody: { flex: 1, gap: 4 },
  newsTag: {
    alignSelf: 'flex-start', borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 2.5,
  },
  newsTagTxt: { fontSize: 9.5, fontWeight: '800' },
  newsTitle: { fontSize: 13, fontWeight: '700', color: '#0F0F1A', lineHeight: 18 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newsSource: { fontSize: 10.5, fontWeight: '700', color: '#6B7280' },
  newsDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D0D3DB' },
  newsTime: { fontSize: 10.5, color: '#9AA0AF' },

  // Signals
  sigFilters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sigFilter: {
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  sigFilterTxt: { fontSize: 12, fontWeight: '800' },
  sigCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: radius.lg,
    marginBottom: 8, overflow: 'hidden',
    ...shadow.sm,
  },
  sigAccent: { width: 4, alignSelf: 'stretch' },
  sigLogo: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    margin: 12,
  },
  sigLogoTxt: { fontSize: 15, fontWeight: '900' },
  sigBody: { flex: 1, paddingVertical: 10, gap: 4 },
  sigTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sigAsset: { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  sigDirBadge: { borderRadius: radius.xs, paddingHorizontal: 8, paddingVertical: 2.5 },
  sigDirTxt: { fontSize: 10, fontWeight: '900' },
  sigPrices: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sigPriceLabel: { fontSize: 9.5, color: '#9AA0AF', fontWeight: '600' },
  sigPriceVal: { fontSize: 11, fontWeight: '800', color: '#0F0F1A' },
  sigPriceSep: { width: 1, height: 10, backgroundColor: '#E5E7EB' },
  sigCreatorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  sigCreatorAvatar: { width: 14, height: 14, borderRadius: 7 },
  sigCreatorTxt: { fontSize: 10, color: '#9AA0AF', fontWeight: '600' },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  confBarBg: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: '#F0F1F5', overflow: 'hidden',
  },
  confBarFill: { height: '100%', borderRadius: 2 },
  confPct: { fontSize: 10, fontWeight: '800', width: 32, textAlign: 'right' },
  sigRight: { alignItems: 'flex-end', gap: 5, paddingRight: 12 },
  sigPerfPill: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  sigPerfTxt: { fontSize: 12, fontWeight: '800' },
  sigTime: { fontSize: 10, color: '#9AA0AF' },

  // Analysts
  analystCard: {
    backgroundColor: '#FFF', borderRadius: radius.xl,
    marginBottom: 12, overflow: 'hidden', ...shadow.sm,
  },
  analystCover: { height: 80, position: 'relative' },
  analystCoverImg: { width: '100%', height: '100%' },
  analystCoverGrad: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)',
  },
  proBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#FFD600', borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  proBadgeTxt: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  analystAvatarWrap: {
    position: 'absolute', top: 44, left: 16,
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3, borderColor: '#FFF',
    overflow: 'visible',
  },
  analystAvatar: { width: 50, height: 50, borderRadius: 25 },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.info,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  analystInfo: { paddingHorizontal: 16, paddingTop: 36, paddingBottom: 14, gap: 10 },
  analystNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analystName: { fontSize: 15, fontWeight: '800', color: '#0F0F1A' },
  analystHandle: { fontSize: 12, color: '#9AA0AF', fontWeight: '500' },
  analystBio: { fontSize: 12.5, color: '#6B7280', lineHeight: 18 },
  analystStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  analystStat: { flex: 1, alignItems: 'center', gap: 2 },
  analystStatVal: { fontSize: 15, fontWeight: '900', color: '#0F0F1A' },
  analystStatLabel: { fontSize: 10, color: '#9AA0AF', fontWeight: '500' },
  analystStatDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11, borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.primary + '40',
  },
  followBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  followTxt: { fontSize: 13, fontWeight: '800', color: colors.primary },
  followTxtOn: { color: '#FFF' },
});

const ds = StyleSheet.create({
  mktBanner:        { marginHorizontal: 16, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  mktBannerGrad:    { flexDirection: 'row', alignItems: 'center', padding: 16 },
  mktBannerLeft:    { flex: 1 },
  mktBannerTitle:   { fontSize: 15, fontWeight: '900', color: '#fff' },
  mktBannerSub:     { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  mktBannerChevron: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});

const dc = StyleSheet.create({
  aiBanner:    { marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  aiBannerGrad:{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  aiIconWrap:  { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  aiIcon:      { fontSize: 22 },
  aiTextWrap:  { flex: 1 },
  aiTitle:     { fontSize: 14, fontWeight: '800', color: '#fff' },
  aiSub:       { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  aiArrow:     {},
});
