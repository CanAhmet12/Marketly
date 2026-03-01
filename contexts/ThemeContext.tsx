/**
 * ThemeContext — sadece light tema (dark mode kaldırıldı)
 * Tüm eski useTheme() çağrıları sorunsuz çalışmaya devam eder.
 */
import React, { createContext, useContext } from 'react';
import { colors, ColorPalette } from '../constants/theme';

interface ThemeContextValue {
  colors:  ColorPalette;
  isDark:  boolean;
  mode:    'light';
  setMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors,
  isDark:  false,
  mode:    'light',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors, isDark: false, mode: 'light', setMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
