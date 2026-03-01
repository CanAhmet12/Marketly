import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// ─── Ortam değişkenleri ───────────────────────────────────────────────────────
// Supabase projen oluşturulduktan sonra bu değerleri gir
// supabase.com > Project Settings > API
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  || 'https://ufljsnqxvqzichwlpfgy.supabase.co';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGpzbnF4dnF6aWNod2xwZmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjM4OTgsImV4cCI6MjA4Nzc5OTg5OH0.OKGqidAABpQiTt3t03YKaCTjQrA42JUMggUfhZfEmjE';

// ─── Güvenli token saklama (iOS Keychain / Android Keystore) ─────────────────
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ─── Supabase istemcisi ───────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:          ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ─── Tip yardımcıları ─────────────────────────────────────────────────────────
export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

export type Profile = {
  id:              string;
  username:        string;
  full_name:       string | null;
  avatar_url:      string | null;
  bio:             string | null;
  tier:            'free' | 'pro' | 'elite';
  verified:        boolean;
  follower_count:  number;
  following_count: number;
  signal_accuracy: number;
  referral_code:   string | null;
  marketcoin:      number;
  streak_days:     number;
  created_at:      string;
};

export type AssetPrice = {
  asset_id:       string;
  price:          number;
  change_percent: number;
  volume:         string;
  market_cap:     string;
  spark:          number[];
  updated_at:     string;
  assets: {
    id:          string;
    symbol:      string;
    name:        string;
    category:    'crypto' | 'stocks' | 'commodities' | 'forex';
    logo_url:    string | null;
    logo_letter: string;
    logo_color:  string;
  };
};
