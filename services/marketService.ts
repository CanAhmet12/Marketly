/**
 * LiveAsset (Supabase/API) ↔ MarketAsset (UI) dönüştürücüler
 * MarketsScreen ve AssetDetailScreen'in mevcut interface'ini korur,
 * arka planda gerçek veri kullanmaya geçişi sağlar.
 */

import type { LiveAsset, MarketCategory } from '../hooks/useMarketPrices';
import type { MarketAsset } from '../data/mockMarkets';

/**
 * LiveAsset → MarketAsset dönüştürücü
 * Tüm mevcut UI bileşenleri (WatchlistStrip, AssetRow, MoverCard vs.)
 * MarketAsset tipiyle çalıştığı için bu dönüşüm gerekli.
 */
export function liveToMarketAsset(a: LiveAsset): MarketAsset {
  return {
    id:            a.id,
    symbol:        a.symbol,
    name:          a.name,
    price:         a.priceFormatted,
    priceNum:      a.price,
    changePercent: a.change_percent,
    volume:        a.volume,
    marketCap:     a.market_cap,
    category:      a.category as MarketCategory,
    spark:         normalizeSpark(a.spark),
    logoColor:     a.logo_color,
    logoLetter:    a.logo_letter,
  };
}

/**
 * Sparkline dizisini 0-100 aralığına normalize et (UI bileşenleri için)
 */
function normalizeSpark(spark: number[]): number[] {
  if (!spark || spark.length === 0) return Array(10).fill(50);

  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const range = max - min;

  if (range === 0) return Array(spark.length).fill(50);

  return spark.map((v) => Math.round(((v - min) / range) * 90 + 5));
}

/**
 * Kategoriye göre gösterim adı
 */
export const CATEGORY_LABELS: Record<MarketCategory, string> = {
  crypto:      'Kripto',
  stocks:      'Hisse',
  commodities: 'Emtia',
  forex:       'Döviz',
};

/**
 * Kategoriye göre varsayılan renk
 */
export const CATEGORY_COLORS: Record<MarketCategory, string> = {
  crypto:      '#F7931A',
  stocks:      '#00C853',
  commodities: '#FF9500',
  forex:       '#007AFF',
};
