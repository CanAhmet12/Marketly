import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Animated, Dimensions, Platform, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, shadow } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

// â”€â”€â”€ Plan tanÄ±mlarÄ± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Plan {
  id:         string;
  label:      string;
  price:      string;
  period:     string;
  badge?:     string;
  monthlyEq?: string;  // aylÄ±k eÅŸdeÄŸer (yÄ±llÄ±kta gÃ¶ster)
}

const PLANS: Plan[] = [
  {
    id:    'monthly',
    label: 'AylÄ±k',
    price: 'â‚º149',
    period: '/ay',
  },
  {
    id:    'yearly',
    label: 'YÄ±llÄ±k',
    price: 'â‚º999',
    period: '/yÄ±l',
    badge: '2 AY BEDAVA',
    monthlyEq: 'â‚º83.25/ay',
  },
];

// â”€â”€â”€ Ã–zellik listesi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ProFeature {
  icon:  React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  desc:  string;
}

const FEATURES: ProFeature[] = [
  {
    icon: 'flash',       color: '#FFB800',
    title: 'SÄ±nÄ±rsÄ±z Sinyal',
    desc:  'TÃ¼m analistlerin sinyallerini takip et',
  },
  {
    icon: 'notifications', color: '#FF6B6B',
    title: 'SÄ±nÄ±rsÄ±z Fiyat AlarmÄ±',
    desc:  'AnlÄ±k bildirimlerle hiÃ§bir fÄ±rsatÄ± kaÃ§Ä±rma',
  },
  {
    icon: 'bar-chart',   color: '#34C759',
    title: 'GeliÅŸmiÅŸ Grafik',
    desc:  'Candlestick + teknik Ã§izim araÃ§larÄ±',
  },
  {
    icon: 'sparkles',    color: '#AF52DE',
    title: 'MarketAI Asistan',
    desc:  'SÄ±nÄ±rsÄ±z AI destekli piyasa analizi',
  },
  {
    icon: 'document-text', color: '#007AFF',
    title: 'PortfÃ¶y Raporu',
    desc:  'HaftalÄ±k PDF performans analizi',
  },
  {
    icon: 'ban',         color: '#FF9500',
    title: 'ReklamsÄ±z Deneyim',
    desc:  'HiÃ§bir reklam, tamamen odaklanmÄ±ÅŸ kullanÄ±m',
  },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    Alert.alert(
      'Ödeme Sistemi',
      `${plan === 'yearly' ? 'Yıllık' : 'Aylık'} plan için ödeme altyapısı yakın zamanda aktifleşecek.\n\nŞu an tüm özellikler ücretsiz kullanılabilir.`,
      [
        { text: 'Tamam', onPress: () => navigation.goBack() },
        {
          text: 'Daha Fazla Bilgi',
          onPress: () => Linking.openURL('https://marketly.app').catch(() => {}),
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Satin Alma Geri Yukle',
      'Odeme sistemi henuz aktif degil. Satin alma gecmisi su an dogrulanamÄ±yor.',
      [{ text: 'Tamam' }]
    );
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
        {/* â”€â”€ Hero â”€â”€ */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          {/* Glow halkasÄ± */}
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
            PiyasalarÄ±n bir adÄ±m Ã¶nÃ¼nde ol.{'\n'}Her Ã¶zellik, sÄ±nÄ±rsÄ±z eriÅŸim.
          </Text>
        </Animated.View>

        {/* â”€â”€ Ã–zellikler â”€â”€ */}
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

        {/* â”€â”€ Plan seÃ§ici â”€â”€ */}
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

        {/* â”€â”€ CTA â”€â”€ */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Pressable onPress={handleSubscribe} style={styles.ctaWrap}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.ctaText}>7 GÃ¼n Ãœcretsiz Dene</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.ctaSub}>
            {activePlan.price}{activePlan.period} Â· Ä°stediÄŸin zaman iptal et
          </Text>
        </Animated.View>

        {/* â”€â”€ Restore â”€â”€ */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>SatÄ±n almayÄ± geri yÃ¼kle</Text>
        </Pressable>

        {/* â”€â”€ Yasal linkler â”€â”€ */}
        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL('https://marketly.app/privacy')}>
            <Text style={styles.legalLink}>Gizlilik PolitikasÄ±</Text>
          </Pressable>
          <Text style={styles.legalDot}>Â·</Text>
          <Pressable onPress={() => Linking.openURL('https://marketly.app/terms')}>
            <Text style={styles.legalLink}>KullanÄ±m ÅartlarÄ±</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// â”€â”€â”€ Stiller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Hero â”€â”€
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

  // â”€â”€ Features â”€â”€
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
    fontFamily: font.semiBold,
    marginBottom: 2,
  },
  featureDesc: {
    color:    '#9AA0AF',
    fontSize: 12,
    lineHeight: 16,
  },

  // â”€â”€ Plans â”€â”€
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
    fontFamily: font.extraBold,
    letterSpacing: 0.5,
  },
  planLabel: {
    color:      '#9AA0AF',
    fontSize:   13,
    fontFamily: font.semiBold,
    marginBottom: 6,
    marginTop:  8,
  },
  planLabelActive: {
    color: '#fff',
  },
  planPrice: {
    color:      '#9AA0AF',
    fontSize:   22,
    fontFamily: font.extraBold,
  },
  planPriceActive: {
    color: '#fff',
  },
  planPeriod: {
    fontSize:   13,
    fontFamily: font.regular,
  },
  planMonthly: {
    color:     '#34C759',
    fontSize:  11,
    fontFamily: font.medium,
    marginTop:  4,
  },
  planCheck: {
    position: 'absolute',
    top:       8,
    right:     8,
  },

  // â”€â”€ CTA â”€â”€
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
    fontFamily: font.bold,
    letterSpacing: -0.3,
  },
  ctaSub: {
    color:     '#9AA0AF',
    fontSize:  12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // â”€â”€ Bottom â”€â”€
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




