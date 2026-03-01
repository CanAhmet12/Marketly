const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // Service role key — tam yetkili
);

/**
 * Tüm fiyatları toplu olarak güncelle (upsert)
 * @param {Array} assets - { id, symbol, name, price, change_percent, volume, market_cap, spark, category, logo_url }
 */
async function updatePrices(assets) {
  if (!assets || assets.length === 0) return;

  // null/undefined/0 fiyatlı varlıkları filtrele
  const valid = assets.filter((a) => a && a.price && a.price > 0 && a.id);
  if (valid.length === 0) return;

  const rows = valid.map((a) => ({
    asset_id:       a.id,
    price:          a.price,
    change_percent: a.change_percent ?? 0,
    volume:         a.volume         || '-',
    market_cap:     a.market_cap     || '-',
    spark:          Array.isArray(a.spark) ? a.spark : [],
    updated_at:     new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('asset_prices')
    .upsert(rows, { onConflict: 'asset_id' });

  if (error) {
    console.error('[Supabase] Fiyat güncelleme hatası:', error.message);
  }
}

// Coin bazında bireysel renkler (kategori rengiyle ezilmemeli)
const COIN_COLORS = {
  BTC:     '#F7931A', ETH:  '#627EEA', BNB:  '#F3BA2F', SOL:  '#9945FF',
  XRP:     '#00AAE4', ADA:  '#0033AD', DOGE: '#C2A633', AVAX: '#E84142',
  DOT:     '#E6007A', UNI:  '#FF007A', LINK: '#2A5ADA', LTC:  '#BFBBBB',
  TRX:     '#EB0029', XLM:  '#7D00FF', MATIC:'#8247E5',
  // Hisse
  AAPL:    '#555555', NVDA: '#76B900', TSLA: '#CC0000', MSFT: '#00A4EF',
  AMZN:    '#FF9900', META: '#1877F2', GOOGL:'#4285F4', NFLX: '#E50914',
  // Emtia
  XAU:     '#D4AF37', XAG:  '#C0C0C0', WTI:  '#333333',
  // Forex
  USDTRY:  '#E53935', EURTRY:'#1565C0', EURUSD:'#1A73E8', GBPTRY:'#6A1B9A',
};

/**
 * Asset metadata'yı güncelle (ilk kurulumda veya yeni coin eklenince)
 * logo_color: coin'e özgü renk varsa onu kullan, yoksa kategori rengine düş.
 * @param {Array} assets
 */
async function upsertAssets(assets) {
  if (!assets || assets.length === 0) return;

  const rows = assets.map((a) => {
    const coinColor = COIN_COLORS[a.id?.toUpperCase()] || COIN_COLORS[a.symbol?.toUpperCase()];
    return {
      id:          a.id,
      symbol:      a.symbol,
      name:        a.name,
      category:    a.category,
      logo_url:    a.logo_url  || null,
      logo_letter: a.symbol.charAt(0).toUpperCase(),
      logo_color:  coinColor || categoryColor(a.category),
    };
  });

  const { error } = await supabase
    .from('assets')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] Asset upsert hatası:', error.message);
  }
}

/**
 * Tarihsel fiyat verisi kaydet (7 günlük, günde 1 kez)
 */
async function saveHistoricalSnapshot(assetId, price) {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('price_history')
    .upsert(
      { asset_id: assetId, date: today, close_price: price },
      { onConflict: 'asset_id,date' }
    );

  if (error) {
    console.error('[Supabase] Tarihsel veri hatası:', error.message);
  }
}

function categoryColor(category) {
  const map = {
    crypto: '#F7931A',
    stocks: '#00C853',
    forex: '#007AFF',
    commodities: '#FF9500',
  };
  return map[category] || '#9AA0AF';
}

module.exports = { updatePrices, upsertAssets, saveHistoricalSnapshot };
