import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ─── AbortSignal.timeout polyfill (Hermes uyumlu) ────────────────────────────
function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// ─── Backend API adresi ───────────────────────────────────────────────────────
// .env → EXPO_PUBLIC_API_BASE ile yönetilir
// HTTPS kurulunca: EXPO_PUBLIC_API_BASE=https://134-122-84-92.sslip.io
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://134.122.84.92:3001';

// ─── Tipler ───────────────────────────────────────────────────────────────────
export type MarketCategory = 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface LiveAsset {
  id:             string;
  symbol:         string;
  name:           string;
  category:       MarketCategory;
  logo_url:       string | null;
  logo_letter:    string;
  logo_color:     string;
  price:          number;
  change_percent: number;
  volume:         string;
  market_cap:     string;
  spark:          number[];
  updated_at:     string;
  // UI için türetilen alanlar
  priceFormatted:  string;
  changeFormatted: string;
  isUp:            boolean;
}

interface UseMarketPricesResult {
  assets:     LiveAsset[];
  allAssets:  LiveAsset[]; // alias for assets
  isLoading:  boolean;
  error:      string | null;
  lastUpdate: Date | null;
  refetch:    () => Promise<void>;
  byCategory: (cat: MarketCategory) => LiveAsset[];
  topMovers:  (cat: MarketCategory, count?: number) => LiveAsset[];
  changePercent: number; // en popüler varlığın değişimi
}

// ─── Fiyat formatlama yardımcıları ───────────────────────────────────────────
function formatPrice(price: number, category: MarketCategory): string {
  if (!price && price !== 0) return '-';

  if (category === 'forex') {
    return price.toFixed(4);
  }
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  return price.toFixed(6);
}

function prefixForCategory(category: MarketCategory): string {
  if (category === 'forex') return '';
  return '$';
}

function enrichAsset(raw: any): LiveAsset {
  const isUp = (raw.change_percent || 0) >= 0;
  const prefix = prefixForCategory(raw.category);
  return {
    id:             raw.asset_id || raw.id,
    symbol:         raw.assets?.symbol || raw.symbol || raw.id,
    name:           raw.assets?.name   || raw.name   || raw.id,
    category:       raw.assets?.category || raw.category,
    logo_url:       raw.assets?.logo_url  || raw.logo_url  || null,
    logo_letter:    raw.assets?.logo_letter || raw.logo_letter || (raw.symbol || raw.id).charAt(0),
    logo_color:     raw.assets?.logo_color  || raw.logo_color  || '#9AA0AF',
    price:          raw.price          || 0,
    change_percent: raw.change_percent || 0,
    volume:         raw.volume         || '-',
    market_cap:     raw.market_cap     || '-',
    spark:          Array.isArray(raw.spark) ? raw.spark : [],
    updated_at:     raw.updated_at     || new Date().toISOString(),
    priceFormatted: `${prefix}${formatPrice(raw.price || 0, raw.assets?.category || raw.category)}`,
    changeFormatted: `${isUp ? '+' : ''}${(raw.change_percent || 0).toFixed(2)}%`,
    isUp,
  };
}

// ─── Ana hook ─────────────────────────────────────────────────────────────────
export function useMarketPrices(): UseMarketPricesResult {
  const [assets,     setAssets]     = useState<LiveAsset[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const realtimeSub                 = useRef<any>(null);
  const isFirstLoad                 = useRef(true);

  // REST API'den ilk yükleme
  const fetchFromAPI = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/prices`, {}, 8000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        const enriched = json.data.map((a: any) => enrichAsset(a));
        setAssets(enriched);
        setLastUpdate(new Date());
        setError(null);
        return true;
      }
    } catch {
      // API erişilemez — Supabase'e düş
    }
    return false;
  }, []);

  // Supabase'den yükle (API erişilemezse yedek)
  const fetchFromSupabase = useCallback(async () => {
    try {
      const { data, error: sbErr } = await supabase
        .from('asset_prices')
        .select(`
          asset_id, price, change_percent, volume, market_cap, spark, updated_at,
          assets ( id, symbol, name, category, logo_url, logo_letter, logo_color )
        `)
        .order('updated_at', { ascending: false });

      if (sbErr || !data?.length) return false;

      const enriched = data
        .filter((row: any) => row.assets)
        .map((row: any) => enrichAsset(row));

      if (enriched.length > 0) {
        setAssets(enriched);
        setLastUpdate(new Date());
        setError(null);
        return true;
      }
    } catch {
      // Supabase de erişilemez
    }
    return false;
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const apiOk = await fetchFromAPI();
    if (!apiOk) await fetchFromSupabase();
    setIsLoading(false);
  }, [fetchFromAPI, fetchFromSupabase]);

  // İlk yükleme
  useEffect(() => {
    refetch().then(() => { isFirstLoad.current = false; });
  }, [refetch]);

  // Supabase Realtime → asset_prices değişince otomatik güncelle
  useEffect(() => {
    realtimeSub.current = supabase
      .channel('asset_prices_live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'asset_prices' },
        (payload) => {
          setAssets((prev) => prev.map((a) => {
            if (a.id === payload.new.asset_id) {
              return enrichAsset({ ...a, ...payload.new, assets: { symbol: a.symbol, name: a.name, category: a.category, logo_url: a.logo_url, logo_letter: a.logo_letter, logo_color: a.logo_color } });
            }
            return a;
          }));
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'asset_prices' },
        () => {
          // Yeni varlık eklendi — listeyi yenile
          refetch();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'asset_prices' },
        (payload) => {
          setAssets((prev) => prev.filter((a) => a.id !== (payload.old as any)?.asset_id));
        }
      )
      .subscribe();

    return () => {
      if (realtimeSub.current) supabase.removeChannel(realtimeSub.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yardımcı fonksiyonlar
  const byCategory = useCallback(
    (cat: MarketCategory) => assets.filter((a) => a.category === cat),
    [assets]
  );

  const topMovers = useCallback(
    (cat: MarketCategory, count = 5) =>
      assets
        .filter((a) => a.category === cat)
        .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
        .slice(0, count),
    [assets]
  );

  const changePercent = assets[0]?.change_percent ?? 0;
  return { assets, allAssets: assets, isLoading, error, lastUpdate, refetch, byCategory, topMovers, changePercent };
}

// ─── Tek varlık hook'u ────────────────────────────────────────────────────────
export function useAssetPrice(assetId: string) {
  const { assets, isLoading } = useMarketPrices();
  const asset = assets.find((a) => a.id === assetId) || null;
  return { asset, isLoading };
}
