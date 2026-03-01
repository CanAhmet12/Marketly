import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  TextInput, Alert, Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '../contexts/ToastContext';
import { radius, shadow, colors } from '../constants/theme';
import { usePosts } from '../hooks/usePosts';
import { useSignals } from '../hooks/useSignals';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreatePostModal } from '../components/CreatePostModal';
import { useNavigation } from '@react-navigation/native';

// ─── Supabase Storage: video yükle ───────────────────────────────────────────
async function uploadVideoToStorage(localUri: string, userId: string): Promise<string | null> {
  try {
    // Bucket yoksa oluştur
    await supabase.storage.createBucket('videos', { public: true }).catch(() => {});

    const ext      = localUri.split('.').pop()?.toLowerCase() ?? 'mp4';
    const mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('file', { uri: localUri, type: mimeType, name: fileName } as any);

    const { error } = await supabase.storage
      .from('videos')
      .upload(fileName, formData as any, { contentType: mimeType, upsert: true });

    if (error) { console.warn('[Storage] upload error:', error.message); return null; }

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName);
    return urlData.publicUrl ?? null;
  } catch (e) {
    console.warn('[Storage] exception:', e);
    return null;
  }
}

// ─── Content types ────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
  {
    id: 'video',
    label: 'Video',
    icon: 'videocam',
    desc: 'Uzun form analiz & eğitim',
    color: '#007AFF',
    bg: '#EBF4FF',
    badge: 'En Popüler',
  },
  {
    id: 'signal',
    label: 'Sinyal',
    icon: 'trending-up',
    desc: 'Al/Sat sinyali paylaş',
    color: '#00C853',
    bg: '#E8FAF0',
    badge: 'Yeni',
  },
  {
    id: 'short',
    label: 'Short',
    icon: 'flash',
    desc: '60 sn kısa içerik',
    color: '#FF9500',
    bg: '#FFF5E0',
    badge: null,
  },
  {
    id: 'live',
    label: 'Canlı Yayın',
    icon: 'radio',
    desc: 'Gerçek zamanlı trading yayını',
    color: '#FF3B3B',
    bg: '#FFE8E8',
    badge: null,
  },
  {
    id: 'post',
    label: 'Gönderi',
    icon: 'chatbubble-ellipses',
    desc: 'Fikir, analiz veya yorum paylaş',
    color: '#7C3AED',
    bg: '#F3EEFF',
    badge: 'Hızlı',
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'kripto',   label: 'Kripto',   emoji: '₿',  color: '#F7931A' },
  { id: 'hisseler', label: 'Hisseler', emoji: '📈', color: '#007AFF' },
  { id: 'emtialar', label: 'Emtia',    emoji: '🥇', color: '#D4AF37' },
  { id: 'doviz',    label: 'Döviz',    emoji: '💱', color: '#00C853' },
  { id: 'analiz',   label: 'Analiz',   emoji: '📊', color: '#7B1FA2' },
  { id: 'egitim',   label: 'Eğitim',   emoji: '📚', color: '#E53935' },
];

// ─── Popular asset tags ───────────────────────────────────────────────────────
const POPULAR_TAGS = ['$BTC', '$ETH', '$SOL', 'BIST100', 'THYAO', 'AAPL', 'XAU', 'USD/TRY', '$BNB', 'NVDA'];

// ─── Signal direction options ─────────────────────────────────────────────────
const SIGNAL_DIRS = [
  { id: 'BUY',  label: 'AL',   icon: 'trending-up',   color: colors.rise, bg: colors.riseLight },
  { id: 'SELL', label: 'SAT',  icon: 'trending-down', color: colors.fall, bg: colors.fallLight },
  { id: 'HOLD', label: 'BEKLE',icon: 'pause-circle',  color: '#FF9500',   bg: '#FFF5E0' },
];

const SIGNAL_TIMEFRAMES = ['Kısa Vade', 'Orta Vade', 'Uzun Vade'];

// ─── Popular signal assets ────────────────────────────────────────────────────
const SIGNAL_ASSETS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'THYAO', 'BIST100', 'XAU/USD', 'EUR/USD', 'USD/TRY', 'AAPL', 'NVDA'];

// ─── Confidence Stars ─────────────────────────────────────────────────────────
function ConfidencePicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={cp.wrap}>
      <Text style={cp.lbl}>Güven Seviyesi</Text>
      <View style={cp.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => onChange(i)} style={cp.star}>
            <Ionicons
              name={i <= value ? 'star' : 'star-outline'}
              size={28}
              color={i <= value ? '#FFB800' : '#D0D3DB'}
            />
          </Pressable>
        ))}
      </View>
      <Text style={cp.hint}>
        {value === 0 ? 'Seviye seçin' : value <= 2 ? 'Düşük Güven' : value === 3 ? 'Orta Güven' : value === 4 ? 'Yüksek Güven' : 'Çok Yüksek Güven'}
      </Text>
    </View>
  );
}

const cp = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  lbl: { fontSize: 14, fontWeight: '700', color: colors.text, alignSelf: 'flex-start' },
  stars: { flexDirection: 'row', gap: 8 },
  star: { padding: 4 },
  hint: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ type, onDone }: { type: string; onDone: () => void }) {
  const isLive   = type === 'live';
  const isSignal = type === 'signal';
  const scale    = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 18, speed: 10 }).start();
  }, []);

  const iconName = isLive ? 'radio' : isSignal ? 'trending-up' : 'checkmark-circle';
  const iconColor = isLive ? colors.fall : isSignal ? colors.primary : colors.primary;
  const title = isLive ? 'Yayın Başladı! 🔴' : isSignal ? 'Sinyal Paylaşıldı! 📊' : 'İçerik Yayında! 🎉';
  const subtitle = isLive
    ? 'Canlı yayınınız başarıyla başlatıldı. İzleyiciler sizi görebilir.'
    : isSignal
    ? 'Sinyaliniz takipçilerinize ve toplulukla paylaşıldı.'
    : 'İçeriğiniz incelendikten sonra yayına alınacak.';

  return (
    <View style={ss.root}>
      <Animated.View style={[ss.iconWrap, { transform: [{ scale }], backgroundColor: iconColor + '18' }]}>
        <View style={[ss.iconInner, { backgroundColor: iconColor + '30' }]}>
          <Ionicons name={iconName as any} size={52} color={iconColor} />
        </View>
      </Animated.View>
      <Text style={ss.title}>{title}</Text>
      <Text style={ss.subtitle}>{subtitle}</Text>

      <View style={ss.statsRow}>
        {[
          { label: 'Takipçi', value: '2.4K' },
          { label: 'Bildirim', value: '✓' },
          { label: 'Paylaşım', value: 'Aktif' },
        ].map((stat) => (
          <View key={stat.label} style={ss.statItem}>
            <Text style={ss.statVal}>{stat.value}</Text>
            <Text style={ss.statLbl}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={ss.doneBtn} onPress={onDone}>
        <Text style={ss.doneTxt}>Ana Sayfaya Dön</Text>
      </Pressable>
    </View>
  );
}

const ss = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  iconWrap: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, maxWidth: 280 },
  statsRow: {
    flexDirection: 'row', gap: 0,
    backgroundColor: colors.bgPure, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginTop: 8, overflow: 'hidden', width: '100%',
  },
  statItem: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: colors.border,
  },
  statVal: { fontSize: 17, fontWeight: '900', color: colors.text },
  statLbl: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 16, paddingHorizontal: 48,
    ...shadow.md, shadowColor: colors.primary,
  },
  doneTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateScreen() {
  const insets     = useSafeAreaInsets();
  const toast      = useToast();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { createSignal } = useSignals();
  const [publishing,    setPublishing]    = useState(false);
  const [uploadStatus, setUploadStatus]  = useState<'idle' | 'uploading' | 'done'>('idle');

  const [step, setStep]             = useState<1 | 2 | 3 | 4>(1);
  const [contentType, setType]      = useState('video');
  const [showPostModal, setShowPostModal] = useState(false);
  const [videoUri, setVideoUri]     = useState<string | null>(null);
  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('');
  const [tags, setTags]             = useState<string[]>([]);
  const [tagInput, setTagInput]     = useState('');

  // Signal-specific state
  const [sigAsset, setSigAsset]     = useState('');
  const [sigAssetInput, setSigAssetInput] = useState('');
  const [sigDir, setSigDir]         = useState<'BUY' | 'SELL' | 'HOLD'>('BUY');
  const [sigEntry, setSigEntry]     = useState('');
  const [sigTarget, setSigTarget]   = useState('');
  const [sigStop, setSigStop]       = useState('');
  const [sigTimeframe, setSigTf]    = useState('Orta Vade');
  const [sigConfidence, setSigConf] = useState(3);
  const [sigRationale, setSigRat]   = useState('');

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Medya kütüphanesine erişim izni gerekiyor.');
        return;
      }
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'] as any,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!r.canceled && r.assets?.[0]) setVideoUri(r.assets[0].uri);
    } catch (e) {
      toast.error('Video seçilemedi, tekrar dene.');
    }
  };

  const addTag = (t: string) => {
    const clean = t.trim();
    if (!clean) return;
    const tag = (clean.startsWith('$') || clean.startsWith('#')) ? clean : `#${clean}`;
    if (!tags.includes(tag) && tags.length < 8) setTags([...tags, tag]);
    setTagInput('');
  };

  const selectedType = CONTENT_TYPES.find((t) => t.id === contentType)!;

  // Step 2 validity
  const sigEntryNum  = parseFloat(sigEntry);
  const sigTargetNum = parseFloat(sigTarget);
  const canNext2 = contentType === 'live'
    ? true
    : contentType === 'signal'
    ? (
        sigAsset.trim().length > 0 &&
        !isNaN(sigEntryNum)  && sigEntryNum  > 0 &&
        !isNaN(sigTargetNum) && sigTargetNum > 0
      )
    : videoUri !== null;

  // Step 3 validity
  const canPublish = contentType === 'signal'
    ? sigRationale.trim().length > 10 && category.length > 0
    : title.trim().length > 3 && category.length > 0;

  const handlePublish = async () => {
    if (!canPublish || publishing || !user?.id) return;
    setPublishing(true);
    try {
      if (contentType === 'signal') {
        // Gerçek sinyal oluştur
        const ok = await createSignal({
          asset_id:     sigAsset.toUpperCase(),
          direction:    sigDir as 'BUY' | 'SELL' | 'HOLD',
          confidence:   sigConfidence,
          entry_price:  sigEntry  ? parseFloat(sigEntry)  : undefined,
          target_price: sigTarget ? parseFloat(sigTarget) : undefined,
          stop_loss:    sigStop   ? parseFloat(sigStop)   : undefined,
          timeframe:    category || '1G',
          rationale:    sigRationale.trim(),
        });
        if (ok) {
          toast.success(`${sigAsset} sinyali paylaşıldı 📊`);
          setStep(4);
        } else {
          toast.error('Sinyal paylaşılamadı. Tekrar dene.');
        }
      } else if (contentType === 'live') {
        // ── Canlı Yayın: DB'ye kaydet + LiveBroadcastScreen'e geç ──────────
        const channelName = `live_${user.id}_${Date.now()}`;
        const contentText = title.trim() || 'Canlı Yayın';

        const { data: postData, error: postErr } = await supabase.from('posts').insert({
          user_id:    user.id,
          creator_id: user.id,
          content:    contentText,
          type:       'live',
          title:      contentText,
          asset_tag:  tags.length > 0 ? tags[0].replace(/^[$#]/, '') : category || null,
          asset_tags: tags.length > 0 ? tags : category ? [category] : [],
          is_premium: false,
        }).select('id').single();

        if (postErr) {
          // Kolon yoksa temel insert'e düş
          const { data: fb, error: fbErr } = await supabase.from('posts').insert({
            user_id: user.id, content: contentText,
          }).select('id').single();
          if (fbErr) { toast.error('Yayın oluşturulamadı: ' + fbErr.message); setPublishing(false); return; }
          // live_sessions tablosuna yaz
          try { await supabase.from('live_sessions').insert({
            post_id: fb?.id, channel_name: channelName, host_id: user.id,
            title: contentText, is_active: true, viewer_count: 0,
          }); } catch { /* ignore */ }
          navigation.replace('LiveBroadcast', { channelName, title: contentText, postId: fb?.id ?? '' });
        } else {
          try { await supabase.from('live_sessions').insert({
            post_id: postData?.id, channel_name: channelName, host_id: user.id,
            title: contentText, is_active: true, viewer_count: 0,
          }); } catch { /* ignore */ }
          navigation.replace('LiveBroadcast', { channelName, title: contentText, postId: postData?.id ?? '' });
        }

      } else {
        // ── Video / Short: Storage'a yükle + DB'ye kaydet ──────────────────
        const firstTag    = tags.length > 0 ? tags[0].replace(/^[$#]/, '') : category || null;
        const contentText = title.trim() || description.trim() || contentType;
        let   videoPublicUrl: string | null = null;

        if (videoUri) {
          setUploadStatus('uploading');
          videoPublicUrl = await uploadVideoToStorage(videoUri, user.id);
          setUploadStatus(videoPublicUrl ? 'done' : 'idle');
          if (!videoPublicUrl) {
            toast.error('Video yüklenemedi — internet bağlantısını kontrol et');
            setPublishing(false);
            return;
          }
        }

        let { error } = await supabase.from('posts').insert({
          user_id:       user.id,
          creator_id:    user.id,
          content:       contentText,
          type:          contentType,
          title:         title.trim(),
          description:   description.trim() || null,
          video_url:     videoPublicUrl,
          thumbnail_url: videoPublicUrl,
          asset_tag:     firstTag,
          asset_tags:    tags.length > 0 ? tags : category ? [category] : [],
          is_premium:    false,
        });

        if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('property') || error.message?.includes('does not exist'))) {
          const fallback = await supabase.from('posts').insert({
            user_id: user.id, content: contentText, asset_tag: firstTag,
          });
          error = fallback.error;
        }

        setUploadStatus('idle');

        if (error) {
          toast.error('Yayınlanamadı: ' + error.message);
        } else {
          toast.success('İçerik yayınlandı 🎉');
          setStep(4);
        }
      }
    } catch (e: any) {
      toast.error('Sunucu hatası: ' + (e?.message ?? 'Bilinmeyen hata'));
    } finally {
      setPublishing(false);
    }
  };

  const resetAll = () => {
    setStep(1); setType('video'); setVideoUri(null);
    setTitle(''); setDesc(''); setCategory(''); setTags([]);
    setSigAsset(''); setSigDir('BUY'); setSigEntry('');
    setSigTarget(''); setSigStop(''); setSigConf(3); setSigRat('');
  };

  // ── Success screen ──
  if (step === 4) return <SuccessScreen type={contentType} onDone={resetAll} />;

  return (
    <>
    <CreatePostModal
      visible={showPostModal}
      onClose={() => setShowPostModal(false)}
      onSubmit={async (content, tag) => {
        const ok = await createPost(content, tag);
        if (ok) toast.success('Gönderi paylaşıldı! 🎉');
        else    toast.error('Gönderi paylaşılamadı');
        return ok;
      }}
    />
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Top header ── */}
      <View style={s.header}>
        {step > 1 ? (
          <Pressable onPress={() => setStep((p) => (p - 1) as any)} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={s.backBtn} />
        )}
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            {step === 1 ? 'İçerik Oluştur' : step === 2 ? 'Detaylar' : 'Son Dokunuşlar'}
          </Text>
          <Text style={s.headerStep}>Adım {step}/3</Text>
        </View>
        <View style={s.backBtn} />
      </View>

      {/* ── Progress bar ── */}
      <View style={s.progress}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              s.progressBar,
              i < step && s.progressDone,
              i === step && s.progressActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.scroll, { paddingBottom: 80 + insets.bottom }]}
      >

        {/* ══════════════════ STEP 1: Content type ══════════════════ */}
        {step === 1 && (
          <View style={s.stepWrap}>
            <Text style={s.heading}>Ne Paylaşıyorsun?</Text>
            <Text style={s.subhead}>İçerik formatını seçin</Text>

            {CONTENT_TYPES.map((ct) => (
              <Pressable
                key={ct.id}
                onPress={() => setType(ct.id)}
                style={[
                  s.typeCard,
                  contentType === ct.id && { borderColor: ct.color, borderWidth: 2 },
                ]}
              >
                <View style={[s.typeIconWrap, { backgroundColor: ct.bg }]}>
                  <Ionicons name={ct.icon as any} size={26} color={ct.color} />
                </View>
                <View style={s.typeMid}>
                  <View style={s.typeTitleRow}>
                    <Text style={[s.typeLabel, contentType === ct.id && { color: ct.color }]}>
                      {ct.label}
                    </Text>
                    {ct.badge && (
                      <View style={[s.typeBadge, { backgroundColor: ct.color + '18' }]}>
                        <Text style={[s.typeBadgeTxt, { color: ct.color }]}>{ct.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.typeDesc}>{ct.desc}</Text>
                </View>
                <View style={[s.typeCheck, contentType === ct.id && { backgroundColor: ct.color, borderColor: ct.color }]}>
                  {contentType === ct.id && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              </Pressable>
            ))}

            <Pressable
              style={s.mainBtn}
              onPress={() => {
                if (contentType === 'post') {
                  setShowPostModal(true);
                } else {
                  setStep(2);
                }
              }}
            >
              <Text style={s.mainBtnTxt}>
                {contentType === 'post' ? 'Gönderi Yaz' : 'Devam Et'}
              </Text>
              <Ionicons name={contentType === 'post' ? 'pencil' : 'arrow-forward'} size={18} color="#FFF" />
            </Pressable>
          </View>
        )}

        {/* ══════════════════ STEP 2: Main content / Signal ══════════════════ */}
        {step === 2 && (
          <View style={s.stepWrap}>
            <View style={[s.typeIndicator, { backgroundColor: selectedType.bg }]}>
              <Ionicons name={selectedType.icon as any} size={15} color={selectedType.color} />
              <Text style={[s.typeIndicatorTxt, { color: selectedType.color }]}>{selectedType.label}</Text>
            </View>

            {/* ─── SIGNAL FORM ─── */}
            {contentType === 'signal' && (
              <>
                <Text style={s.heading}>Sinyal Detayları</Text>
                <Text style={s.subhead}>Al/Sat sinyalinizi oluşturun</Text>

                {/* Asset input */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Varlık *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="BTC/USDT, THYAO, AAPL..."
                    placeholderTextColor={colors.textMuted}
                    value={sigAssetInput}
                    onChangeText={(v) => { setSigAssetInput(v); setSigAsset(v); }}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
                    {SIGNAL_ASSETS.map((a) => (
                      <Pressable
                        key={a}
                        style={[s.assetChip, sigAsset === a && s.assetChipActive]}
                        onPress={() => { setSigAsset(a); setSigAssetInput(a); }}
                      >
                        <Text style={[s.assetChipTxt, sigAsset === a && s.assetChipTxtActive]}>{a}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Direction */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Yön *</Text>
                  <View style={s.dirRow}>
                    {SIGNAL_DIRS.map((d) => (
                      <Pressable
                        key={d.id}
                        style={[s.dirBtn, sigDir === d.id && { backgroundColor: d.color, borderColor: d.color }]}
                        onPress={() => setSigDir(d.id as any)}
                      >
                        <Ionicons
                          name={d.icon as any}
                          size={18}
                          color={sigDir === d.id ? '#FFF' : d.color}
                        />
                        <Text style={[s.dirTxt, sigDir === d.id && { color: '#FFF' }]}>{d.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Price levels */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Fiyat Seviyeleri *</Text>
                  <View style={s.priceRow}>
                    <View style={s.priceInput}>
                      <Text style={s.priceInputLabel}>Giriş</Text>
                      <TextInput
                        style={s.priceInputField}
                        placeholder="örn. $64,000"
                        placeholderTextColor={colors.textMuted}
                        value={sigEntry}
                        onChangeText={setSigEntry}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={[s.priceInput, { borderColor: colors.rise + '80' }]}>
                      <Text style={[s.priceInputLabel, { color: colors.rise }]}>Hedef ↑</Text>
                      <TextInput
                        style={[s.priceInputField, { color: colors.rise }]}
                        placeholder="örn. $72,000"
                        placeholderTextColor={colors.rise + '60'}
                        value={sigTarget}
                        onChangeText={setSigTarget}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={[s.priceInput, { borderColor: colors.fall + '80' }]}>
                      <Text style={[s.priceInputLabel, { color: colors.fall }]}>Stop ↓</Text>
                      <TextInput
                        style={[s.priceInputField, { color: colors.fall }]}
                        placeholder="örn. $60,000"
                        placeholderTextColor={colors.fall + '60'}
                        value={sigStop}
                        onChangeText={setSigStop}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>

                {/* Timeframe */}
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Vade</Text>
                  <View style={s.tfRow}>
                    {SIGNAL_TIMEFRAMES.map((tf) => (
                      <Pressable
                        key={tf}
                        style={[s.tfChip, sigTimeframe === tf && s.tfChipActive]}
                        onPress={() => setSigTf(tf)}
                      >
                        <Text style={[s.tfTxt, sigTimeframe === tf && s.tfTxtActive]}>{tf}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Confidence */}
                <ConfidencePicker value={sigConfidence} onChange={setSigConf} />
              </>
            )}

            {/* ─── VIDEO / SHORT UPLOAD ─── */}
            {(contentType === 'video' || contentType === 'short') && (
              <>
                <Text style={s.heading}>
                  {contentType === 'short' ? '⚡ Short Video' : '🎬 Video Yükle'}
                </Text>
                <Text style={s.subhead}>Galeriden seç veya kamera ile çek</Text>

                <Pressable
                  style={[s.uploadArea, videoUri && s.uploadAreaSuccess]}
                  onPress={pickVideo}
                >
                  {videoUri ? (
                    <View style={s.uploadSuccessContent}>
                      <View style={[s.uploadIconCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={34} color="#FFF" />
                      </View>
                      <Text style={[s.uploadTitle, { color: colors.primary }]}>Video Seçildi!</Text>
                      <Text style={s.uploadHint}>Değiştirmek için dokun</Text>
                    </View>
                  ) : (
                    <View style={s.uploadEmptyContent}>
                      <View style={[s.uploadIconCircle, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="cloud-upload-outline" size={36} color={colors.primary} />
                      </View>
                      <Text style={s.uploadTitle}>Videoyu Yükle</Text>
                      <Text style={s.uploadHint}>
                        {contentType === 'short' ? 'MP4, MOV • Maks. 60 sn' : 'MP4, MOV • Maks. 5 dk • 1GB'}
                      </Text>
                    </View>
                  )}
                </Pressable>

                <View style={s.orRow}>
                  <View style={s.orLine} /><Text style={s.orTxt}>veya</Text><View style={s.orLine} />
                </View>

                <Pressable
                  style={s.cameraBtn}
                  onPress={async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') return;
                    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
                    if (!r.canceled) setVideoUri(r.assets[0].uri);
                  }}
                >
                  <View style={s.cameraBtnIcon}>
                    <Ionicons name="camera-outline" size={20} color="#FFF" />
                  </View>
                  <Text style={s.cameraBtnTxt}>Kamera ile Çek</Text>
                </Pressable>
              </>
            )}

            {/* ─── LIVE SETUP ─── */}
            {contentType === 'live' && (
              <>
                <Text style={s.heading}>Canlı Yayın</Text>
                <View style={s.liveSetup}>
                  <View style={s.liveCircle}>
                    <View style={s.livePulseOuter} />
                    <View style={s.livePulseInner} />
                    <Ionicons name="radio" size={42} color={colors.fall} />
                  </View>
                  <Text style={s.liveTitle}>Yayına Hazır mısın?</Text>
                  <Text style={s.liveDesc}>
                    Başlık ve kategoriyi ekledikten sonra yayını başlatabilirsin.
                  </Text>
                  <View style={s.liveFeatures}>
                    {['HD Kalite', 'Canlı Sohbet', 'Otomatik Kayıt', 'Anlık Bildirim'].map((f) => (
                      <View key={f} style={s.liveFeatureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={s.liveFeatureTxt}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            <Pressable
              style={[s.mainBtn, !canNext2 && s.mainBtnDisabled]}
              onPress={() => canNext2 && setStep(3)}
            >
              <Text style={s.mainBtnTxt}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>
          </View>
        )}

        {/* ══════════════════ STEP 3: Final details ══════════════════ */}
        {step === 3 && (
          <View style={s.stepWrap}>
            <View style={[s.typeIndicator, { backgroundColor: selectedType.bg }]}>
              <Ionicons name={selectedType.icon as any} size={15} color={selectedType.color} />
              <Text style={[s.typeIndicatorTxt, { color: selectedType.color }]}>{selectedType.label}</Text>
            </View>

            {/* Signal rationale or video title */}
            {contentType === 'signal' ? (
              <View style={s.field}>
                <Text style={s.fieldLabel}>Analiz & Gerekçe *</Text>
                <TextInput
                  style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
                  placeholder="Bu sinyali neden veriyorsunuz? Teknik/temel analiz gerekçenizi açıklayın..."
                  placeholderTextColor={colors.textMuted}
                  value={sigRationale}
                  onChangeText={setSigRat}
                  multiline
                  maxLength={500}
                />
                <Text style={s.charCount}>{sigRationale.length}/500</Text>
              </View>
            ) : (
              <>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Başlık *</Text>
                  <TextInput
                    style={[s.input, { minHeight: 60, textAlignVertical: 'top' }]}
                    placeholder="Analizini özetleyen çarpıcı bir başlık..."
                    placeholderTextColor={colors.textMuted}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={80}
                    multiline
                  />
                  <Text style={s.charCount}>{title.length}/80</Text>
                </View>
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Açıklama</Text>
                  <TextInput
                    style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="İçeriğin hakkında daha fazla bilgi ver..."
                    placeholderTextColor={colors.textMuted}
                    value={description}
                    onChangeText={setDesc}
                    maxLength={300}
                    multiline
                  />
                  <Text style={s.charCount}>{description.length}/300</Text>
                </View>
              </>
            )}

            {/* Category */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Kategori *</Text>
              <View style={s.catGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={[
                      s.catChip,
                      category === cat.id && { backgroundColor: cat.color + '18', borderColor: cat.color },
                    ]}
                  >
                    <Text style={s.catEmoji}>{cat.emoji}</Text>
                    <Text style={[s.catLabel, category === cat.id && { color: cat.color, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Asset tags */}
            <View style={s.field}>
              <Text style={s.fieldLabel}>Varlık Etiketleri</Text>
              <View style={s.tagInputRow}>
                <TextInput
                  style={s.tagInput}
                  placeholder="$BTC, #Bitcoin..."
                  placeholderTextColor={colors.textMuted}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={() => addTag(tagInput)}
                  returnKeyType="done"
                />
                <Pressable
                  style={[s.addTagBtn, !tagInput.trim() && { opacity: 0.4 }]}
                  onPress={() => addTag(tagInput)}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
                {POPULAR_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                  <Pressable key={t} style={s.popularChip} onPress={() => addTag(t)}>
                    <Text style={s.popularChipTxt}>{t}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {tags.length > 0 && (
                <View style={s.selectedTags}>
                  {tags.map((t) => (
                    <Pressable key={t} style={s.selectedTag} onPress={() => setTags(tags.filter((x) => x !== t))}>
                      <Text style={s.selectedTagTxt}>{t}</Text>
                      <Ionicons name="close" size={11} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Publish */}
            <Pressable
              style={[
                s.publishBtn,
                contentType === 'live' && s.publishBtnLive,
                (!canPublish || publishing) && s.publishBtnDisabled,
              ]}
              onPress={handlePublish}
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={s.publishBtnTxt}>
                    {uploadStatus === 'uploading' ? 'Video yükleniyor...' : 'Yayınlanıyor...'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name={contentType === 'live' ? 'radio' : contentType === 'signal' ? 'trending-up' : 'cloud-upload-outline'}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={s.publishBtnTxt}>
                    {contentType === 'live' ? 'Canlı Yayını Başlat' : contentType === 'signal' ? 'Sinyali Paylaş' : 'Yayınla'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.bgPure,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  headerStep: { fontSize: 11, color: colors.textMuted, marginTop: 1 },

  progress: {
    flexDirection: 'row', gap: 5,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.bgPure,
  },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.primary + '70' },
  progressDone: { backgroundColor: colors.primary },

  scroll: { padding: 16 },
  stepWrap: { gap: 18 },
  heading: { fontSize: 24, fontWeight: '900', color: colors.text },
  subhead: { fontSize: 14, color: colors.textMuted, marginTop: -10 },

  // Content type card
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgPure, borderRadius: radius.md, padding: 16,
    borderWidth: 1.5, borderColor: colors.border, ...shadow.sm,
  },
  typeIconWrap: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  typeMid: { flex: 1 },
  typeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  typeLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  typeBadgeTxt: { fontSize: 10, fontWeight: '800' },
  typeDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  typeCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  typeIndicator: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  },
  typeIndicatorTxt: { fontSize: 12, fontWeight: '700' },

  // Fields
  field: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  input: {
    backgroundColor: colors.bgPure, borderRadius: radius.md, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1.5, borderColor: colors.border,
  },
  charCount: { fontSize: 11, color: colors.textMuted, alignSelf: 'flex-end' },

  // Signal - asset chips
  chipRow: { marginTop: 2 },
  assetChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    marginRight: 7,
  },
  assetChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  assetChipTxt: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  assetChipTxtActive: { color: '#FFF' },

  // Signal - direction
  dirRow: { flexDirection: 'row', gap: 10 },
  dirBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.bgPure, borderWidth: 2, borderColor: colors.border,
  },
  dirTxt: { fontSize: 14, fontWeight: '900', color: colors.textMuted },

  // Signal - price levels
  priceRow: { flexDirection: 'row', gap: 8 },
  priceInput: {
    flex: 1, backgroundColor: colors.bgPure, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.border, padding: 10,
  },
  priceInputLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  priceInputField: { fontSize: 13, fontWeight: '700', color: colors.text, padding: 0 },

  // Signal - timeframe
  tfRow: { flexDirection: 'row', gap: 8 },
  tfChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: colors.bg, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.border,
  },
  tfChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tfTxt: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  tfTxtActive: { color: '#FFF' },

  // Upload
  uploadArea: {
    borderRadius: radius.md, borderWidth: 2, borderColor: colors.border,
    borderStyle: 'dashed', paddingVertical: 44, alignItems: 'center',
    backgroundColor: colors.bgPure,
  },
  uploadAreaSuccess: { borderColor: colors.primary, borderStyle: 'solid', backgroundColor: colors.primaryLight },
  uploadEmptyContent: { alignItems: 'center', gap: 12 },
  uploadSuccessContent: { alignItems: 'center', gap: 10 },
  uploadIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  uploadHint: { fontSize: 13, color: colors.textMuted },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orTxt: { fontSize: 13, color: colors.textMuted },

  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: radius.md, paddingVertical: 14,
    backgroundColor: colors.bgPure, borderWidth: 1.5, borderColor: colors.border,
  },
  cameraBtnIcon: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center',
  },
  cameraBtnTxt: { fontSize: 15, fontWeight: '700', color: colors.text },

  // Live
  liveSetup: { alignItems: 'center', gap: 14, paddingVertical: 16 },
  liveCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#FFE8E8', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  livePulseOuter: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,59,59,0.10)',
  },
  livePulseInner: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,59,59,0.07)',
  },
  liveTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  liveDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  liveFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  liveFeatureItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveFeatureTxt: { fontSize: 13, fontWeight: '600', color: colors.text },

  // Tags
  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: {
    flex: 1, backgroundColor: colors.bgPure, borderRadius: radius.sm,
    padding: 12, fontSize: 14, color: colors.text, borderWidth: 1.5, borderColor: colors.border,
  },
  addTagBtn: {
    width: 46, height: 46, borderRadius: radius.sm,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  popularChip: {
    backgroundColor: colors.bgPure, borderRadius: radius.full,
    paddingHorizontal: 11, paddingVertical: 6, marginRight: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  popularChipTxt: { fontSize: 12, fontWeight: '600', color: colors.text },
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  selectedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  selectedTagTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },

  // Category
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    backgroundColor: colors.bgPure, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.border,
  },
  catEmoji: { fontSize: 15 },
  catLabel: { fontSize: 13, fontWeight: '600', color: colors.textSub },

  // CTA buttons
  mainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 8, elevation: 4,
  },
  mainBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  mainBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 17,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 8, elevation: 4,
  },
  publishBtnLive: { backgroundColor: colors.fall, shadowColor: colors.fall },
  publishBtnDisabled: { opacity: 0.40, shadowOpacity: 0 },
  publishBtnTxt: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
