export type ColorPalette = typeof lightColors;

export const lightColors = {
  // Backgrounds
  bg:       '#F2F3F7',
  bgPure:   '#FFFFFF',
  bgCard:   '#FFFFFF',
  bgInput:  '#F4F5F8',

  // Brand
  primary:      '#00C853',
  primaryLight: '#E8FAF0',
  primaryDark:  '#00962E',

  // Accents
  danger:  '#FF3B3B',
  warning: '#FF9500',
  info:    '#007AFF',

  // Text
  text:      '#0D0D0D',
  textSub:   '#5A5F6E',
  textMuted: '#9AA0AF',

  // Finance
  rise:      '#00C853',
  fall:      '#FF3B3B',
  riseLight: '#E8FAF0',
  fallLight: '#FFF0F0',

  // UI
  border:  '#E8EAF0',
  divider: '#F0F1F5',
  live:    '#FF3B3B',
  overlay: 'rgba(0,0,0,0.45)',

  // Bottom nav
  navBg: '#FFFFFF',
};

export const darkColors: ColorPalette = {
  // Backgrounds
  bg:       '#0D0D0D',
  bgPure:   '#1A1A1A',
  bgCard:   '#1A1A1A',
  bgInput:  '#242424',

  // Brand (unchanged)
  primary:      '#00C853',
  primaryLight: '#0D2E1A',
  primaryDark:  '#00962E',

  // Accents (unchanged)
  danger:  '#FF453A',
  warning: '#FF9F0A',
  info:    '#0A84FF',

  // Text
  text:      '#F0F0F0',
  textSub:   '#A0A0A0',
  textMuted: '#666666',

  // Finance
  rise:      '#30D158',
  fall:      '#FF453A',
  riseLight: '#0D2E1A',
  fallLight: '#2E0D0D',

  // UI
  border:  '#2A2A2A',
  divider: '#1E1E1E',
  live:    '#FF453A',
  overlay: 'rgba(0,0,0,0.70)',

  // Bottom nav
  navBg: '#1A1A1A',
};

// Default export (light) – keeps all existing imports working
export const colors = lightColors;

export const typo = {
  h1: { fontSize: 26, fontWeight: '800' as const, color: '#0D0D0D' },
  h2: { fontSize: 20, fontWeight: '700' as const, color: '#0D0D0D' },
  h3: { fontSize: 16, fontWeight: '700' as const, color: '#0D0D0D' },
  body: { fontSize: 14, fontWeight: '400' as const, color: '#0D0D0D' },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, color: '#0D0D0D' },
  small: { fontSize: 12, fontWeight: '400' as const, color: '#5A5F6E' },
  tiny: { fontSize: 10, fontWeight: '500' as const, color: '#9AA0AF' },
  price: { fontSize: 16, fontWeight: '800' as const, color: '#0D0D0D' },
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const shadow = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Legacy compat
export const spacing = { xs: 4, sm: 6, md: 10, lg: 14, xl: 20 };
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
