import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, Dimensions, Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width: W, height: H } = Dimensions.get('window');

// ─── Plan tanımları ─────────────────────────────────────────────────────────
interface Plan {
  id:         string;
  label:      string;
  price:      string;
  period:     string;
  badge?:     string;
  monthlyEq?: string;  // aylık eşdeğer (yıllıkta göster)
}

const PLANS: Plan[] = [
  {
    id:    'monthly',
    label: 'Aylık',
    price: '₺149',
    period: '/ay',
  },
  {
    id:    'yearly',
    label: 'Yıllık',
    price: '₺999',
    period: '/yıl',
    badge: '2 AY BEDAVA',
    monthlyEq: '₺83.25/ay',
  },
];

// ─── Özellik listesi ─────────────────────────────────────────────────────────
interface ProFeature {
  icon:  React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  desc:  string;
}

const FEATURES: ProFeature[] = [
  {
    icon: 'flash',       color: '#FFB800',
    title: 'Sınırsız Sinyal',
    desc:  'Tüm analistlerin sinyallerini takip et',
  },
  {
    icon: 'notifications', color: '#FF6B6B',
    title: 'Sınırsız Fiyat Alarmı',
    desc:  'Anlık bildirimlerle hiçbir fırsatı kaçırma',
  },
  {
    icon: 'bar-chart',   color: '#34C759',
    title: 'Gelişmiş Grafik',
    desc:  'Candlestick + teknik çizim araçları',
  },
  {
    icon: 'sparkles',    color: '#AF52DE',
    title: 'MarketAI Asistan',
    desc:  'Sınırsız AI destekli piyasa analizi',
  },
  {
    icon: 'document-text', color: '#007AFF',
    title: 'Portföy Raporu',
    desc:  'Haftalık PDF performans analizi',
  },
  {
    icon: 'ban',         color: '#FF9500',
    title: 'Reklamsız Deneyim',
    desc:  'Hiçbir reklam, tamamen odaklanmış kullanım',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function PaywallScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Entrance animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Pulsing glow on PRO badge
  const glowAnim  = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 180 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSubscribe = () => {
    // RevenueCat entegrasyonu eklenecek — şimdilik bilgi göster
    navigation.goBack();
  };

  const handleRestore = () => {
    // RevenueCat restore
    navigation.goBack();
  };

  const activePlan = PLANS.find(p => p.id === plan)!;

  return (
    <View style={styles.root}>
      {/* Arka plan gradient */}
      <LinearGradient
        colors={['#0A0A1A', '#0D1633', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Kapat butonu */}
      <Pressable
        style={[styles.closeBtn, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
        hitSlop={12}
      >
        <Ionicons name="close" size={22} color="#9AA0AF" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          {/* Glow halkası */}
          <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />

          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="flash" size={34} color="#fff" />
          </LinearGradient>

          <Text style={styles.heroTitle}>Marketly Pro</Text>
          <Text style={styles.heroSub}>
            Piyasaların bir adım önünde ol.{'\n'}Her özellik, sınırsız erişim.
          </Text>
        </Animated.View>

        {/* ── Özellikler ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            </View>
          ))}
        </Animated.View>

        {/* ── Plan seçici ── */}
        <Animated.View style={[styles.planRow, { opacity: fadeAnim }]}>
          {PLANS.map(p => {
            const active = plan === p.id;
            return (
              <Pressable
                key={p.id}
                style={[styles.planCard, active && styles.planCardActive]}
                onPress={() => setPlan(p.id as any)}
              >
                {p.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, active && styles.planLabelActive]}>{p.label}</Text>
                <Text style={[styles.planPrice, active && styles.planPriceActive]}>
                  {p.price}
                  <Text style={styles.planPeriod}>{p.period}</Text>
                </Text>
                {p.monthlyEq && (
                  <Text style={styles.planMonthly}>{p.monthlyEq}</Text>
                )}
                {active && (
                  <View style={styles.planCheck}>
                    <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </Animated.View>

        {/* ── CTA ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Pressable onPress={handleSubscribe} style={styles.ctaWrap}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.ctaText}>7 Gün Ücretsiz Dene</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.ctaSub}>
            {activePlan.price}{activePlan.period} · İstediğin zaman iptal et
          </Text>
        </Animated.View>

        {/* ── Restore ── */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Satın almayı geri yükle</Text>
        </Pressable>

        {/* ── Yasal linkler ── */}
        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL('https://marketly.app/privacy')}>
            <Text style={styles.legalLink}>Gizlilik Politikası</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => Linking.openURL('https://marketly.app/terms')}>
            <Text style={styles.legalLink}>Kullanım Şartları</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  scroll: {
    paddingHorizontal: 20,
    alignItems:        'center',
  },
  closeBtn: {
    position:        'absolute',
    right:           20,
    zIndex:          10,
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Hero ──
  hero: {
    alignItems:    'center',
    marginBottom:  32,
  },
  glowRing: {
    position:        'absolute',
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: '#007AFF',
    top:             -10,
    opacity:         0.15,
    transform:       [{ scale: 1.5 }],
  },
  logoBadge: {
    width:          80,
    height:         80,
    borderRadius:   24,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   16,
    shadowColor:    '#007AFF',
    shadowOpacity:  0.5,
    shadowRadius:   16,
    shadowOffset:   { width: 0, height: 4 },
    elevation:      10,
  },
  heroTitle: {
    color:        '#fff',
    fontSize:     28,
    fontWeight:   '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSub: {
    color:      '#9AA0AF',
    fontSize:   15,
    textAlign:  'center',
    lineHeight: 22,
  },

  // ── Features ──
  featureRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    width:          W - 40,
  },
  featureIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color:      '#fff',
    fontSize:   14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    color:    '#9AA0AF',
    fontSize: 12,
    lineHeight: 16,
  },

  // ── Plans ──
  planRow: {
    flexDirection:  'row',
    gap:            12,
    marginTop:      24,
    marginBottom:   24,
    width:          W - 40,
  },
  planCard: {
    flex:            1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius:    16,
    padding:         16,
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     'transparent',
    position:        'relative',
    overflow:        'visible',
  },
  planCardActive: {
    borderColor:     '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.12)',
  },
  planBadge: {
    position:        'absolute',
    top:             -12,
    backgroundColor: '#FFB800',
    borderRadius:    20,
    paddingHorizontal: 8,
    paddingVertical:  3,
  },
  planBadgeText: {
    color:      '#000',
    fontSize:   9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planLabel: {
    color:      '#9AA0AF',
    fontSize:   13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop:  8,
  },
  planLabelActive: {
    color: '#fff',
  },
  planPrice: {
    color:      '#9AA0AF',
    fontSize:   22,
    fontWeight: '800',
  },
  planPriceActive: {
    color: '#fff',
  },
  planPeriod: {
    fontSize:   13,
    fontWeight: '400',
  },
  planMonthly: {
    color:     '#34C759',
    fontSize:  11,
    fontWeight: '500',
    marginTop:  4,
  },
  planCheck: {
    position: 'absolute',
    top:       8,
    right:     8,
  },

  // ── CTA ──
  ctaWrap: {
    width: W - 40,
  },
  ctaBtn: {
    height:         54,
    borderRadius:   16,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#007AFF',
    shadowOpacity:  0.45,
    shadowRadius:   16,
    shadowOffset:   { width: 0, height: 6 },
    elevation:      10,
  },
  ctaText: {
    color:      '#fff',
    fontSize:   17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ctaSub: {
    color:     '#9AA0AF',
    fontSize:  12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // ── Bottom ──
  restoreBtn: {
    paddingVertical: 12,
  },
  restoreText: {
    color:    '#007AFF',
    fontSize: 13,
  },
  legalRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    marginTop:      8,
  },
  legalLink: {
    color:    '#9AA0AF',
    fontSize: 11,
  },
  legalDot: {
    color:    '#9AA0AF',
    fontSize: 11,
  },
});
