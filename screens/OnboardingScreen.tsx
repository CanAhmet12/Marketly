import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions,
  Animated, FlatList, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

// ─── Onboarding adımları ─────────────────────────────────────────────────────
interface Step {
  id:       string;
  emoji:    string;
  title:    string;
  subtitle: string;
  gradient: [string, string];
  accentColor: string;
}

const STEPS: Step[] = [
  {
    id:       'welcome',
    emoji:    '📈',
    title:    'Piyasaları\nCanlı Takip Et',
    subtitle: 'Bitcoin\'den Apple\'a, Altın\'dan EUR/TRY\'ye — tüm piyasalar tek uygulamada, gerçek zamanlı.',
    gradient: ['#0A0A1A', '#0D1B3E'],
    accentColor: '#007AFF',
  },
  {
    id:       'social',
    emoji:    '⚡',
    title:    'Uzman Sinyallerini\nTakip Et',
    subtitle: 'En başarılı analistlerin al/sat sinyallerini kopyala. Toplulukla birlikte kazan.',
    gradient: ['#0A0A1A', '#1A0A2E'],
    accentColor: '#AF52DE',
  },
  {
    id:       'portfolio',
    emoji:    '💼',
    title:    'Portföyünü\nYönet',
    subtitle: 'Tüm yatırımlarını tek yerden takip et. AI destekli analiz ve kişiselleştirilmiş öneriler.',
    gradient: ['#0A0A1A', '#0A1F0A'],
    accentColor: '#34C759',
  },
];

// ─── İlgi alanı kategorileri ─────────────────────────────────────────────────
interface Category {
  id:    string;
  label: string;
  icon:  React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg:    string;
}

const CATEGORIES: Category[] = [
  { id: 'crypto',      label: 'Kripto',        icon: 'logo-bitcoin',    color: '#F7931A', bg: '#FFF5E6' },
  { id: 'stocks',      label: 'Hisseler',      icon: 'trending-up',     color: '#007AFF', bg: '#EBF5FF' },
  { id: 'forex',       label: 'Döviz',         icon: 'swap-horizontal', color: '#7C3AED', bg: '#F3EEFF' },
  { id: 'commodities', label: 'Emtia',         icon: 'diamond-outline', color: '#D4AF37', bg: '#FFFBEB' },
  { id: 'signals',     label: 'Sinyaller',     icon: 'flash',           color: '#FF6B6B', bg: '#FFF0F0' },
  { id: 'news',        label: 'Haberler',      icon: 'newspaper',       color: '#34C759', bg: '#EDFFF4' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function OnboardingScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, refreshProfile } = useAuth();

  const [step,       setStep]       = useState(0);   // 0,1,2 = slides; 3 = category select; 4 = level
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [level,      setLevel]      = useState<string>('');
  const [saving,     setSaving]     = useState(false);

  // Animations
  const slideX    = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dotsScale = useRef(STEPS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeIn,    { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 120 }),
    ]).start();
  }, []);

  // Dot pulse animation on step change
  useEffect(() => {
    if (step < STEPS.length) {
      dotsScale.forEach((dot, i) => {
        Animated.spring(dot, {
          toValue: i === step ? 1.4 : 1,
          useNativeDriver: true,
          damping: 10,
          stiffness: 200,
        }).start();
      });
    }
  }, [step]);

  const goNext = useCallback(() => {
    // Slide out current
    Animated.timing(slideX, { toValue: -W, duration: 280, useNativeDriver: true }).start(() => {
      setStep(s => s + 1);
      slideX.setValue(W);
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }).start();
    });
  }, [slideX]);

  const toggleCategory = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const finish = async () => {
    setSaving(true);
    try {
      if (user?.id) {
        // interests alanı yoksa JSONB olarak profiles'a ekleyebiliriz
        // Ya da sadece onboarding_done flag'i set ederiz
        await supabase
          .from('profiles')
          .update({
            // onboarding_done ve interests yoksa bu kısmı atlar, hata almaz
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
    } catch (_) {
      // Hata olursa yine de devam et
    } finally {
      setSaving(false);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const currentStep = step < STEPS.length ? STEPS[step] : null;

  // ── Category selection screen ──
  if (step >= STEPS.length) {
    return (
      <View style={[styles.root, { backgroundColor: '#0A0A1A' }]}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.catContainer, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.catTitle}>İlgi Alanlarını Seç</Text>
          <Text style={styles.catSub}>Sana özel içerik ve sinyaller için en az 2 kategori seç</Text>

          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => {
              const active = selected.has(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.catCard, active && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <View style={[styles.catIcon, { backgroundColor: active ? cat.color + '30' : 'rgba(255,255,255,0.06)' }]}>
                    <Ionicons name={cat.icon} size={26} color={active ? cat.color : '#9AA0AF'} />
                  </View>
                  <Text style={[styles.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                  {active && (
                    <View style={[styles.catCheck, { backgroundColor: cat.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.catActions}>
            <Pressable
              style={[styles.finishBtn, selected.size < 2 && styles.finishBtnDisabled]}
              onPress={() => setStep(4)}
              disabled={selected.size < 2}
            >
              <LinearGradient
                colors={selected.size >= 2 ? ['#007AFF', '#5856D6'] : ['#333', '#444']}
                style={styles.finishGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.finishTxt}>Devam Et →</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setStep(4)} style={styles.skipBtn}>
              <Text style={styles.skipTxt}>Şimdi atla</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── Level selection screen ──
  if (step === 4) {
    const LEVELS = [
      { id: 'beginner', icon: '🌱', label: 'Yeni Başlayan', sub: 'Yatırıma yeni adım atıyorum', color: '#34C759' },
      { id: 'mid',      icon: '🚀', label: 'Orta Seviye',   sub: 'Biraz deneyimim var, öğreniyorum', color: '#007AFF' },
      { id: 'expert',   icon: '💎', label: 'Uzman',         sub: 'Aktif trader / analistim', color: '#AF52DE' },
    ];
    return (
      <View style={[styles.root, { backgroundColor: '#0A0A1A' }]}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.catContainer, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.catTitle}>Deneyim Seviyeni Seç</Text>
          <Text style={styles.catSub}>Sana uygun içerikler ve sinyal açıklamaları gösterelim</Text>

          <View style={{ gap: 14, marginTop: 28 }}>
            {LEVELS.map(lv => {
              const active = level === lv.id;
              return (
                <Pressable
                  key={lv.id}
                  style={[styles.levelCard, active && { borderColor: lv.color, backgroundColor: lv.color + '15' }]}
                  onPress={() => setLevel(lv.id)}
                >
                  <View style={[styles.levelIconBox, { backgroundColor: active ? lv.color + '30' : 'rgba(255,255,255,0.06)' }]}>
                    <Text style={{ fontSize: 26 }}>{lv.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.levelLabel, active && { color: lv.color }]}>{lv.label}</Text>
                    <Text style={styles.levelSub}>{lv.sub}</Text>
                  </View>
                  {active && (
                    <View style={[styles.levelCheck, { backgroundColor: lv.color }]}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.catActions, { marginTop: 32 }]}>
            <Pressable
              style={styles.finishBtn}
              onPress={finish}
              disabled={saving}
            >
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.finishGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.finishTxt}>{saving ? 'Hazırlanıyor...' : 'Uygulamayı Başlat →'}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={finish} style={styles.skipBtn}>
              <Text style={styles.skipTxt}>Şimdi atla</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── Slide screen ──
  const s = currentStep!;
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={s.gradient} style={StyleSheet.absoluteFill} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleLg, { borderColor: s.accentColor + '18', top: H * 0.08, right: -80 }]} />
      <View style={[styles.circle, styles.circleMd, { borderColor: s.accentColor + '12', bottom: H * 0.25, left: -60 }]} />
      <View style={[styles.circle, styles.circleSm, { borderColor: s.accentColor + '20', top: H * 0.35, right: 40 }]} />

      {/* Skip */}
      <Pressable
        style={[styles.skipTop, { top: insets.top + 12 }]}
        onPress={() => setStep(STEPS.length)}
      >
        <Text style={styles.skipTopTxt}>Atla</Text>
      </Pressable>

      {/* Content */}
      <Animated.View style={[styles.content, {
        opacity: fadeIn,
        transform: [{ translateX: slideX }, { scale: scaleAnim }],
        paddingTop: insets.top + 60,
      }]}>
        {/* Emoji in glow circle */}
        <View style={[styles.emojiWrap, { shadowColor: s.accentColor }]}>
          <View style={[styles.emojiRing, { borderColor: s.accentColor + '30' }]}>
            <View style={[styles.emojiInner, { backgroundColor: s.accentColor + '18' }]}>
              <Text style={styles.emoji}>{s.emoji}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.slideTitle}>{s.title}</Text>
        <Text style={styles.slideSub}>{s.subtitle}</Text>

        {/* Step-specific visual hint */}
        <View style={styles.hintRow}>
          {step === 0 && ['₿', 'Ξ', '🏆', '$'].map((sym, i) => (
            <View key={i} style={[styles.hintBadge, { backgroundColor: s.accentColor + '22', borderColor: s.accentColor + '40' }]}>
              <Text style={[styles.hintBadgeTxt, { color: s.accentColor }]}>{sym}</Text>
            </View>
          ))}
          {step === 1 && (
            <>
              <View style={[styles.signalPill, { backgroundColor: '#34C75922', borderColor: '#34C75944' }]}>
                <Ionicons name="trending-up" size={12} color="#34C759" />
                <Text style={[styles.signalPillTxt, { color: '#34C759' }]}>BTC AL • %87</Text>
              </View>
              <View style={[styles.signalPill, { backgroundColor: '#FF3B3B22', borderColor: '#FF3B3B44' }]}>
                <Ionicons name="trending-down" size={12} color="#FF3B3B" />
                <Text style={[styles.signalPillTxt, { color: '#FF3B3B' }]}>AAPL SAT • %79</Text>
              </View>
            </>
          )}
          {step === 2 && ['₿ +42%', 'Ξ +18%', '⬡ +6%'].map((txt, i) => (
            <View key={i} style={[styles.hintBadge, { backgroundColor: '#34C75918', borderColor: '#34C75940' }]}>
              <Text style={[styles.hintBadgeTxt, { color: '#34C759' }]}>{txt}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Dots + Next button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step ? s.accentColor : 'rgba(255,255,255,0.25)',
                  width: i === step ? 24 : 8,
                  transform: [{ scale: dotsScale[i] }],
                },
              ]}
            />
          ))}
        </View>

        <Pressable onPress={goNext} style={styles.nextBtn}>
          <LinearGradient
            colors={[s.accentColor, s.accentColor + 'BB']}
            style={styles.nextGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextTxt}>
              {step === STEPS.length - 1 ? 'Başla' : 'İleri'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },

  // Decorative
  circle: {
    position:   'absolute',
    borderWidth: 1,
    borderRadius: 9999,
  },
  circleLg: { width: 280, height: 280 },
  circleMd: { width: 200, height: 200 },
  circleSm: { width: 100, height: 100 },

  // Skip
  skipTop: {
    position: 'absolute',
    right:    20,
    zIndex:   10,
    paddingHorizontal: 14,
    paddingVertical:    7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skipTopTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  // Slide content
  content: {
    flex:       1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emojiWrap: {
    marginBottom:  32,
    shadowOpacity: 0.4,
    shadowRadius:  30,
    shadowOffset:  { width: 0, height: 0 },
    elevation:     10,
  },
  emojiRing: {
    width:          160,
    height:         160,
    borderRadius:   80,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emojiInner: {
    width:          120,
    height:         120,
    borderRadius:   60,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 56 },
  slideTitle: {
    color:       '#FFFFFF',
    fontSize:    30,
    fontWeight:  '800',
    textAlign:   'center',
    lineHeight:  38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideSub: {
    color:       'rgba(255,255,255,0.6)',
    fontSize:    15,
    textAlign:   'center',
    lineHeight:  22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  hintRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
    justifyContent: 'center',
  },
  hintBadge: {
    paddingHorizontal: 14,
    paddingVertical:    8,
    borderRadius:      20,
    borderWidth:       1,
  },
  hintBadgeTxt: { fontSize: 14, fontWeight: '700' },
  signalPill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 12,
    paddingVertical:    7,
    borderRadius:      20,
    borderWidth:       1,
  },
  signalPillTxt: { fontSize: 12, fontWeight: '700' },

  // Footer
  footer: {
    paddingHorizontal: 28,
    gap:               20,
    alignItems:        'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  dot: {
    height:       8,
    borderRadius: 4,
  },
  nextBtn: {
    width:        '100%',
    borderRadius: 16,
    overflow:     'hidden',
    shadowColor:  '#007AFF',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation:    8,
  },
  nextGrad: {
    height:         54,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
  },
  nextTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Category screen
  catContainer: {
    flex:              1,
    paddingHorizontal: 20,
    alignItems:        'center',
  },
  catTitle: {
    color:        '#fff',
    fontSize:     26,
    fontWeight:   '800',
    marginBottom: 8,
    textAlign:    'center',
  },
  catSub: {
    color:        'rgba(255,255,255,0.5)',
    fontSize:     14,
    textAlign:    'center',
    marginBottom: 32,
    lineHeight:   20,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
    justifyContent: 'center',
    width:         '100%',
  },
  catCard: {
    width:           (W - 52) / 3,
    paddingVertical: 18,
    alignItems:      'center',
    borderRadius:    16,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position:        'relative',
    gap:             10,
  },
  catIcon: {
    width:          52,
    height:         52,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
  },
  catLabel: {
    color:      'rgba(255,255,255,0.7)',
    fontSize:   13,
    fontWeight: '600',
  },
  catCheck: {
    position:   'absolute',
    top:         8,
    right:       8,
    width:       18,
    height:      18,
    borderRadius: 9,
    alignItems:  'center',
    justifyContent: 'center',
  },

  catActions: {
    width:     '100%',
    marginTop: 'auto',
    gap:       12,
  },
  finishBtn: {
    borderRadius: 16,
    overflow:     'hidden',
    shadowColor:  '#007AFF',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation:    8,
  },
  finishBtnDisabled: { shadowOpacity: 0 },
  finishGrad: {
    height:         54,
    alignItems:     'center',
    justifyContent: 'center',
  },
  finishTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn:   { alignItems: 'center', paddingVertical: 8 },
  skipTxt:   { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

  // Level screen
  levelCard: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            14,
    padding:        18,
    borderRadius:   18,
    borderWidth:    1.5,
    borderColor:    'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position:       'relative',
    overflow:       'hidden',
  },
  levelIconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  levelLabel: {
    fontSize: 15, fontWeight: '800', color: '#fff',
  },
  levelSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3,
  },
  levelCheck: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
});
