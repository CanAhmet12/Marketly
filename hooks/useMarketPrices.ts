import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ─── Backend API adresi ───────────────────────────────────────────────────────
// DigitalOcean sunucunuzun IP'si — HTTPS kurulunca değiştirilecek
const API_BASE = 'http://134.122.84.92:3001';

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

// ─── Mock veri (backend hazır olmadan çalışması için) ────────────────────────
const MOCK_ASSETS: LiveAsset[] = [
  { id:'BTC',  symbol:'BTC',     name:'Bitcoin',        category:'crypto',       logo_url:null, logo_letter:'B', logo_color:'#F7931A', price:67420,  change_percent:2.4,   volume:'$28.5B',  market_cap:'$1.3T',  spark:[60,62,61,65,67,66,68,67,69,67], updated_at:new Date().toISOString(), priceFormatted:'$67,420.00', changeFormatted:'+2.40%', isUp:true  },
  { id:'ETH',  symbol:'ETH',     name:'Ethereum',       category:'crypto',       logo_url:null, logo_letter:'E', logo_color:'#627EEA', price:3240,   change_percent:1.8,   volume:'$14.2B',  market_cap:'$389B',  spark:[30,31,32,31,33,32,34,33,35,32], updated_at:new Date().toISOString(), priceFormatted:'$3,240.00',  changeFormatted:'+1.80%', isUp:true  },
  { id:'BNB',  symbol:'BNB',     name:'BNB',            category:'crypto',       logo_url:null, logo_letter:'B', logo_color:'#F3BA2F', price:415,    change_percent:-0.9,  volume:'$1.8B',   market_cap:'$62B',   spark:[42,41,43,42,41,40,41,42,41,42], updated_at:new Date().toISOString(), priceFormatted:'$415.00',    changeFormatted:'-0.90%', isUp:false },
  { id:'SOL',  symbol:'SOL',     name:'Solana',         category:'crypto',       logo_url:null, logo_letter:'S', logo_color:'#9945FF', price:178,    change_percent:4.2,   volume:'$5.1B',   market_cap:'$82B',   spark:[16,17,17,18,17,18,19,18,19,18], updated_at:new Date().toISOString(), priceFormatted:'$178.00',    changeFormatted:'+4.20%', isUp:true  },
  { id:'XRP',  symbol:'XRP',     name:'XRP',            category:'crypto',       logo_url:null, logo_letter:'X', logo_color:'#00AAE4', price:0.63,   change_percent:-1.2,  volume:'$2.4B',   market_cap:'$34B',   spark:[6,6,6,7,6,6,6,7,6,6],           updated_at:new Date().toISOString(), priceFormatted:'$0.630000',  changeFormatted:'-1.20%', isUp:false },
  { id:'AAPL', symbol:'AAPL',    name:'Apple Inc.',     category:'stocks',       logo_url:null, logo_letter:'A', logo_color:'#555555', price:189.5,  change_percent:0.8,   volume:'$4.2B',   market_cap:'$2.9T',  spark:[18,19,19,19,19,19,19,19,19,19], updated_at:new Date().toISOString(), priceFormatted:'$189.50',    changeFormatted:'+0.80%', isUp:true  },
  { id:'NVDA', symbol:'NVDA',    name:'NVIDIA Corp.',   category:'stocks',       logo_url:null, logo_letter:'N', logo_color:'#76B900', price:875,    change_percent:3.1,   volume:'$18.5B',  market_cap:'$2.1T',  spark:[82,83,85,84,86,86,87,87,88,88], updated_at:new Date().toISOString(), priceFormatted:'$875.00',    changeFormatted:'+3.10%', isUp:true  },
  { id:'TSLA', symbol:'TSLA',    name:'Tesla Inc.',     category:'stocks',       logo_url:null, logo_letter:'T', logo_color:'#CC0000', price:242,    change_percent:-2.1,  volume:'$8.9B',   market_cap:'$770B',  spark:[25,24,24,25,25,24,24,24,24,24], updated_at:new Date().toISOString(), priceFormatted:'$242.00',    changeFormatted:'-2.10%', isUp:false },
  { id:'MSFT', symbol:'MSFT',    name:'Microsoft',      category:'stocks',       logo_url:null, logo_letter:'M', logo_color:'#00A4EF', price:415,    change_percent:1.2,   volume:'$6.1B',   market_cap:'$3.1T',  spark:[40,40,41,41,41,41,41,41,42,42], updated_at:new Date().toISOString(), priceFormatted:'$415.00',    changeFormatted:'+1.20%', isUp:true  },
  { id:'XAU',  symbol:'XAU/USD', name:'Altın',          category:'commodities',  logo_url:null, logo_letter:'A', logo_color:'#FFD700', price:2345,   change_percent:0.4,   volume:'-',       market_cap:'-',      spark:[233,234,234,234,234,235,235,235,235,235], updated_at:new Date().toISOString(), priceFormatted:'$2,345.00',  changeFormatted:'+0.40%', isUp:true  },
  { id:'WTI',  symbol:'WTI',     name:'Ham Petrol',     category:'commodities',  logo_url:null, logo_letter:'P', logo_color:'#333333', price:78.4,   change_percent:-0.6,  volume:'-',       market_cap:'-',      spark:[79,78,79,78,79,78,79,78,79,78], updated_at:new Date().toISOString(), priceFormatted:'$78.40',     changeFormatted:'-0.60%', isUp:false },
  { id:'USDTRY',symbol:'USD/TRY',name:'Dolar/TL',       category:'forex',        logo_url:null, logo_letter:'$', logo_color:'#007AFF', price:32.14,  change_percent:0.2,   volume:'-',       market_cap:'-',      spark:[32,32,32,32,32,32,32,32,32,32], updated_at:new Date().toISOString(), priceFormatted:'32.1400',    changeFormatted:'+0.20%', isUp:true  },
  { id:'EURTRY',symbol:'EUR/TRY',name:'Euro/TL',        category:'forex',        logo_url:null, logo_letter:'€', logo_color:'#003399', price:34.82,  change_percent:0.3,   volume:'-',       market_cap:'-',      spark:[35,35,35,35,35,35,35,35,35,35], updated_at:new Date().toISOString(), priceFormatted:'34.8200',    changeFormatted:'+0.30%', isUp:true  },
];

// ─── Ana hook ─────────────────────────────────────────────────────────────────
export function useMarketPrices(): UseMarketPricesResult {
  const [assets,     setAssets]     = useState<LiveAsset[]>(MOCK_ASSETS);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const realtimeSub                 = useRef<any>(null);
  const isFirstLoad                 = useRef(true);

  // REST API'den ilk yükleme
  const fetchFromAPI = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/prices`, { signal: AbortSignal.timeout(8000) });
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
      // Supabase de erişilemez — mock kalsın
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
          setAssets((prev) => {
            const updated = prev.map((a) => {
              if (a.id === payload.new.asset_id) {
                return enrichAsset({ ...a, ...payload.new, assets: { symbol: a.symbol, name: a.name, category: a.category, logo_url: a.logo_url, logo_letter: a.logo_letter, logo_color: a.logo_color } });
              }
              return a;
            });
            return updated;
          });
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      if (realtimeSub.current) supabase.removeChannel(realtimeSub.current);
    };
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
