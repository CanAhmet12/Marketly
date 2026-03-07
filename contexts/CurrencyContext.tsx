/**
 * Global para birimi bağlamı — TRY veya USD seçimini saklar.
 * AsyncStorage'a persist eder, tüm ekranlarda kullanılabilir.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'USD' | 'TRY';

const STORAGE_KEY = '@marketly_currency';
const USD_TRY_RATE = 34.5; // Fallback kur — gerçek kur için useMarketPrices'dan alınabilir

interface CurrencyContextValue {
  currency:  Currency;
  setCurrency: (c: Currency) => void;
  /** Verilen USD tutarını seçili para birimine çevirir */
  format: (usd: number, decimals?: number) => string;
  /** Seçili para birimi sembolü */
  symbol: string;
  tryRate: number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency:    'USD',
  setCurrency: () => {},
  format:      (n) => `$${n.toFixed(2)}`,
  symbol:      '$',
  tryRate:     USD_TRY_RATE,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [tryRate]                     = useState(USD_TRY_RATE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'TRY' || v === 'USD') setCurrencyState(v);
    });
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    AsyncStorage.setItem(STORAGE_KEY, c).catch(() => {});
  }, []);

  const format = useCallback((usd: number, decimals?: number): string => {
    if (currency === 'TRY') {
      const tryVal = usd * tryRate;
      const d = decimals ?? (tryVal >= 1000 ? 0 : tryVal >= 1 ? 2 : 4);
      return `₺${tryVal.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
    }
    const d = decimals ?? (usd >= 1000 ? 0 : usd >= 1 ? 2 : 4);
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  }, [currency, tryRate]);

  const symbol = currency === 'TRY' ? '₺' : '$';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, symbol, tryRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
