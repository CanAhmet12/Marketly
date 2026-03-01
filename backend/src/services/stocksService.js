/**
 * Twelve Data API — Hisse senetleri ve emtialar
 * Ücretsiz: 800 istek/gün, kayıt gerekiyor
 * https://twelvedata.com → Sign Up → API Key al → .env TWELVE_DATA_KEY
 *
 * API key yoksa statik veri döner (uygulamada mock data fallback var)
 */
const axios = require('axios');

const BASE = 'https://api.twelvedata.com';

const STOCKS = [
  { id: 'AAPL',  symbol: 'AAPL',  name: 'Apple Inc.',     ticker: 'AAPL',  exchange: 'NASDAQ' },
  { id: 'NVDA',  symbol: 'NVDA',  name: 'NVIDIA Corp.',   ticker: 'NVDA',  exchange: 'NASDAQ' },
  { id: 'TSLA',  symbol: 'TSLA',  name: 'Tesla Inc.',     ticker: 'TSLA',  exchange: 'NASDAQ' },
  { id: 'MSFT',  symbol: 'MSFT',  name: 'Microsoft',      ticker: 'MSFT',  exchange: 'NASDAQ' },
  { id: 'AMZN',  symbol: 'AMZN',  name: 'Amazon.com',     ticker: 'AMZN',  exchange: 'NASDAQ' },
  { id: 'META',  symbol: 'META',  name: 'Meta Platforms', ticker: 'META',  exchange: 'NASDAQ' },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.',  ticker: 'GOOGL', exchange: 'NASDAQ' },
  { id: 'NFLX',  symbol: 'NFLX',  name: 'Netflix Inc.',   ticker: 'NFLX',  exchange: 'NASDAQ' },
];

const COMMODITIES = [
  { id: 'XAU', symbol: 'XAU/USD', name: 'Altın',      ticker: 'XAU/USD' },
  { id: 'XAG', symbol: 'XAG/USD', name: 'Gümüş',     ticker: 'XAG/USD' },
  { id: 'WTI', symbol: 'WTI/USD', name: 'Ham Petrol', ticker: 'WTI/USD' },
];

async function fetchBatch(symbols, category, key) {
  const symbolStr = symbols.map((s) => s.ticker).join(',');
  try {
    const { data } = await axios.get(`${BASE}/price`, {
      params: { symbol: symbolStr, apikey: key },
      timeout: 10000,
    });

    const results = [];
    for (const def of symbols) {
      const quote = symbols.length === 1 ? data : data[def.ticker];
      if (!quote?.price) continue;

      const price = parseFloat(quote.price);
      if (!price || price <= 0) continue;

      results.push({
        id:            def.id,
        symbol:        def.symbol,
        name:          def.name,
        price,
        change_percent: 0,  // price endpoint değişim vermiyor — /quote endpoint kullanılabilir
        volume:        '-',
        market_cap:    '-',
        spark:         buildSparkline(price),
        category,
        logo_url:      null,
        updated_at:    new Date().toISOString(),
      });
    }
    return results;
  } catch (err) {
    console.error(`[StocksService] ${category} hata:`, err.message);
    return [];
  }
}

async function fetchStockPrices() {
  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    console.warn('[StocksService] TWELVE_DATA_KEY yok — hisse verisi atlandı');
    return [];
  }
  return fetchBatch(STOCKS, 'stocks', key);
}

async function fetchCommodityPrices() {
  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    console.warn('[StocksService] TWELVE_DATA_KEY yok — emtia verisi atlandı');
    return [];
  }
  return fetchBatch(COMMODITIES, 'commodities', key);
}

function buildSparkline(price) {
  return Array.from({ length: 10 }, (_, i) => {
    const noise = (Math.random() - 0.5) * price * 0.003;
    return parseFloat((price + noise).toFixed(4));
  });
}

module.exports = { fetchStockPrices, fetchCommodityPrices };
