/**
 * Twelve Data API — Hisse senetleri ve emtialar
 * Ücretsiz: 800 istek/gün, kayıt gerekiyor
 * https://twelvedata.com → Sign Up → API Key al → .env TWELVE_DATA_KEY
 *
 * /quote endpoint kullanılır (fiyat + değişim yüzdesi birlikte gelir).
 * API key yoksa statik fallback veri döner.
 */
const axios = require('axios');

const BASE = 'https://api.twelvedata.com';

const STOCKS = [
  { id: 'AAPL',  symbol: 'AAPL',  name: 'Apple Inc.',     ticker: 'AAPL'  },
  { id: 'NVDA',  symbol: 'NVDA',  name: 'NVIDIA Corp.',   ticker: 'NVDA'  },
  { id: 'TSLA',  symbol: 'TSLA',  name: 'Tesla Inc.',     ticker: 'TSLA'  },
  { id: 'MSFT',  symbol: 'MSFT',  name: 'Microsoft',      ticker: 'MSFT'  },
  { id: 'AMZN',  symbol: 'AMZN',  name: 'Amazon.com',     ticker: 'AMZN'  },
  { id: 'META',  symbol: 'META',  name: 'Meta Platforms', ticker: 'META'  },
  { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.',  ticker: 'GOOGL' },
  { id: 'NFLX',  symbol: 'NFLX',  name: 'Netflix Inc.',   ticker: 'NFLX'  },
];

const COMMODITIES = [
  { id: 'XAU', symbol: 'XAU/USD', name: 'Altın',      ticker: 'XAU/USD' },
  { id: 'XAG', symbol: 'XAG/USD', name: 'Gümüş',      ticker: 'XAG/USD' },
  { id: 'WTI', symbol: 'WTI',     name: 'Ham Petrol',  ticker: 'WTI/USD' },
];

// Günlük API harcamasını düşürmek için toplu /quote isteği
async function fetchBatch(symbols, category, key) {
  const tickerStr = symbols.map((s) => s.ticker).join(',');
  try {
    // /quote endpoint: fiyat + percent_change + volume (birden fazla sembol JSON map döner)
    const { data } = await axios.get(`${BASE}/quote`, {
      params: {
        symbol:   tickerStr,
        apikey:   key,
        dp:       2,       // ondalık basamak
        interval: '1day',
      },
      timeout: 12000,
    });

    const results = [];
    for (const def of symbols) {
      // Tek sembol gönderince obje, çoklu gönderince map döner
      const quote = symbols.length === 1 ? data : data[def.ticker];
      if (!quote || quote.status === 'error') {
        console.warn(`[StocksService] ${def.ticker}: ${quote?.message || 'veri yok'}`);
        continue;
      }

      const price = parseFloat(quote.close || quote.price || 0);
      if (!price || price <= 0) continue;

      const changePct = parseFloat(quote.percent_change || 0);
      const volume    = quote.volume
        ? formatVolume(parseInt(quote.volume, 10) * price)
        : '-';

      results.push({
        id:             def.id,
        symbol:         def.symbol,
        name:           def.name,
        price,
        change_percent: changePct,
        volume,
        market_cap:     '-',
        spark:          buildSparkline(price, changePct),
        category,
        logo_url:       null,
        updated_at:     new Date().toISOString(),
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
    console.warn('[StocksService] TWELVE_DATA_KEY yok — statik fallback');
    return getStaticStocks();
  }
  const results = await fetchBatch(STOCKS, 'stocks', key);
  // API limit aşıldıysa ya da veri gelmediyse statik fallback
  if (results.length === 0) {
    console.warn('[StocksService] TwelveData veri yok — statik fallback');
    return getStaticStocks();
  }
  return results;
}

async function fetchCommodityPrices() {
  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    console.warn('[StocksService] TWELVE_DATA_KEY yok — statik fallback');
    return getStaticCommodities();
  }
  const results = await fetchBatch(COMMODITIES, 'commodities', key);
  if (results.length === 0) {
    console.warn('[StocksService] TwelveData veri yok — statik fallback');
    return getStaticCommodities();
  }
  return results;
}

// API key yokken sabit (makul) veriler döner — tamamen saçma değil ama stale
function getStaticStocks() {
  const now = new Date().toISOString();
  return [
    { id: 'AAPL',  symbol: 'AAPL',  name: 'Apple Inc.',     price: 189.50, change_percent:  0.8, volume: '$4.2B', market_cap: '$2.9T', category: 'stocks', logo_url: null, spark: buildSparkline(189.50,  0.8), updated_at: now },
    { id: 'NVDA',  symbol: 'NVDA',  name: 'NVIDIA Corp.',   price: 875.00, change_percent:  3.1, volume: '$18.5B',market_cap: '$2.1T', category: 'stocks', logo_url: null, spark: buildSparkline(875.00,  3.1), updated_at: now },
    { id: 'TSLA',  symbol: 'TSLA',  name: 'Tesla Inc.',     price: 242.00, change_percent: -2.1, volume: '$8.9B', market_cap: '$770B', category: 'stocks', logo_url: null, spark: buildSparkline(242.00, -2.1), updated_at: now },
    { id: 'MSFT',  symbol: 'MSFT',  name: 'Microsoft',      price: 415.00, change_percent:  1.2, volume: '$6.1B', market_cap: '$3.1T', category: 'stocks', logo_url: null, spark: buildSparkline(415.00,  1.2), updated_at: now },
    { id: 'AMZN',  symbol: 'AMZN',  name: 'Amazon.com',     price: 185.00, change_percent:  0.9, volume: '$5.8B', market_cap: '$1.9T', category: 'stocks', logo_url: null, spark: buildSparkline(185.00,  0.9), updated_at: now },
    { id: 'META',  symbol: 'META',  name: 'Meta Platforms', price: 465.00, change_percent:  1.5, volume: '$4.1B', market_cap: '$1.2T', category: 'stocks', logo_url: null, spark: buildSparkline(465.00,  1.5), updated_at: now },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.',  price: 175.00, change_percent:  0.7, volume: '$3.9B', market_cap: '$2.2T', category: 'stocks', logo_url: null, spark: buildSparkline(175.00,  0.7), updated_at: now },
    { id: 'NFLX',  symbol: 'NFLX',  name: 'Netflix Inc.',   price: 620.00, change_percent:  2.2, volume: '$1.8B', market_cap: '$270B', category: 'stocks', logo_url: null, spark: buildSparkline(620.00,  2.2), updated_at: now },
  ];
}

function getStaticCommodities() {
  const now = new Date().toISOString();
  return [
    { id: 'XAU', symbol: 'XAU/USD', name: 'Altın',     price: 2650.00, change_percent: 0.3, volume: '$18B', market_cap: '-', category: 'commodities', logo_url: null, spark: buildSparkline(2650.00, 0.3), updated_at: now },
    { id: 'XAG', symbol: 'XAG/USD', name: 'Gümüş',     price: 29.50,   change_percent: 0.5, volume: '$12B', market_cap: '-', category: 'commodities', logo_url: null, spark: buildSparkline(29.50,   0.5), updated_at: now },
    { id: 'WTI', symbol: 'WTI',     name: 'Ham Petrol', price: 78.40,   change_percent:-0.6, volume: '$28B', market_cap: '-', category: 'commodities', logo_url: null, spark: buildSparkline(78.40,  -0.6), updated_at: now },
  ];
}

function formatVolume(num) {
  if (!num || isNaN(num)) return '-';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toFixed(0)}`;
}

function buildSparkline(price, changePct = 0) {
  // Değişim yüzdesine göre hafifçe eğimli sparkline
  return Array.from({ length: 10 }, (_, i) => {
    const trend = price * (changePct / 100) * (i / 9);
    const noise = (Math.random() - 0.5) * price * 0.005;
    return parseFloat((price - (price * (changePct / 100)) + trend + noise).toFixed(4));
  });
}

module.exports = { fetchStockPrices, fetchCommodityPrices };
