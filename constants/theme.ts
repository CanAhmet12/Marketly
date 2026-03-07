// ─── Marketly Design System ───────────────────────────────────────────────────
// Premium light-mode fintech / sosyal medya teması
// Renk, tipografi, spacing, shadow, radius sistemleri

export type ColorPalette = typeof lightColors;

export const lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────────
  bg:       '#F7F8FC',   // Ana sayfa arkaplanı — çok hafif mavi-gri
  bgPure:   '#FFFFFF',   // Kartlar
  bgCard:   '#FFFFFF',   // Kartlar
  bgInput:  '#F2F4F8',   // Input alanları

  // ── Brand ────────────────────────────────────────────────────────────────────
  primary:      '#00C853',   // Ana yeşil
  primaryLight: '#E6FAF0',   // Yeşil açık ton
  primaryDark:  '#009C3E',   // Yeşil koyu ton

  // ── Aksan Renkler ────────────────────────────────────────────────────────────
  danger:  '#F03E3E',
  warning: '#FF9500',
  info:    '#3B82F6',
  purple:  '#8B5CF6',

  // ── Metin ────────────────────────────────────────────────────────────────────
  text:      '#0F1117',   // Neredeyse siyah — daha net
  textSub:   '#4B5563',   // İkincil metin
  textMuted: '#9CA3AF',   // Gri yardımcı metin

  // ── Finans ───────────────────────────────────────────────────────────────────
  rise:      '#00C853',
  fall:      '#F03E3E',
  riseLight: '#E6FAF0',
  fallLight: '#FFF0F0',

  // ── UI ───────────────────────────────────────────────────────────────────────
  border:  '#E5E9F0',
  divider: '#EEF1F6',
  live:    '#F03E3E',
  overlay: 'rgba(0,0,0,0.40)',

  // ── Bottom Nav ───────────────────────────────────────────────────────────────
  navBg: '#FFFFFF',
};

export const colors = lightColors;

// ─── Tipografi — Inter font sistemi ──────────────────────────────────────────
// fontFamily değerleri _layout.tsx'de useFonts ile yüklenmeli
export const font = {
  thin:       'Inter_100Thin',
  light:      'Inter_300Light',
  regular:    'Inter_400Regular',
  medium:     'Inter_500Medium',
  semiBold:   'Inter_600SemiBold',
  bold:       'Inter_700Bold',
  extraBold:  'Inter_800ExtraBold',
  black:      'Inter_900Black',
};

export const typo = {
  h1:       { fontSize: 28, fontFamily: font.black,     color: lightColors.text,     letterSpacing: -0.5 },
  h2:       { fontSize: 22, fontFamily: font.extraBold, color: lightColors.text,     letterSpacing: -0.3 },
  h3:       { fontSize: 17, fontFamily: font.bold,      color: lightColors.text },
  h4:       { fontSize: 15, fontFamily: font.semiBold,  color: lightColors.text },
  body:     { fontSize: 14, fontFamily: font.regular,   color: lightColors.text },
  bodyBold: { fontSize: 14, fontFamily: font.semiBold,  color: lightColors.text },
  small:    { fontSize: 12, fontFamily: font.regular,   color: lightColors.textSub },
  tiny:     { fontSize: 10, fontFamily: font.medium,    color: lightColors.textMuted },
  price:    { fontSize: 18, fontFamily: font.black,     color: lightColors.text,     letterSpacing: -0.5 },
  priceUp:  { fontSize: 18, fontFamily: font.black,     color: lightColors.rise,     letterSpacing: -0.5 },
  priceDown:{ fontSize: 18, fontFamily: font.black,     color: lightColors.fall,     letterSpacing: -0.5 },
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 9999,
};

// ─── Gölge sistemi — daha belirgin, daha modern ───────────────────────────────
export const shadow = {
  xs: {
    shadowColor: '#1A2138',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A2138',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#1A2138',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#1A2138',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
};

// ─── Spacing — tam ekran kullanımı için dar margin ────────────────────────────
// Genel kural: yatay padding max 12px (eski 16px'den küçük)
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,   // Ana yatay padding (eski 16'dan küçük = daha geniş görünüm)
  lg:  16,
  xl:  20,
  xxl: 28,
};

// ─── Gradient presets ─────────────────────────────────────────────────────────
export const gradients = {
  primary:  ['#00C853', '#00A846'] as const,
  danger:   ['#F03E3E', '#CC2828'] as const,
  gold:     ['#F59E0B', '#D97706'] as const,
  blue:     ['#3B82F6', '#2563EB'] as const,
  purple:   ['#8B5CF6', '#7C3AED'] as const,
  dark:     ['#1E2235', '#0F1117'] as const,
  rise:     ['#00C853', '#00A846'] as const,
  fall:     ['#F03E3E', '#CC2828'] as const,
};

// Legacy compat — eski kod bozulmasın
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
