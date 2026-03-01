/**
 * Finnhub API — Hisse + Emtia fiyatları
 * Ücretsiz plan: 60 istek/dakika, kayıt gerekiyor
 * https://finnhub.io → Sign Up → API Key (tamamen ücretsiz)
 *
 * Neden Finnhub?
 * - Server IP'lerini bloklamaz (Yahoo Finance gibi)
 * - Günlük limit yok (TwelveData'dan farklı)
 * - Gerçek zamanlı data + değişim yüzdesi
 */
const axios = require('axios');

const BASE = 'https://finnhub.io/api/v1';

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
  { id: 'XAU', symbol: 'XAU/USD', name: 'Altın',     ticker: 'OANDA:XAU_USD' },
  { id: 'XAG', symbol: 'XAG/USD', name: 'Gümüş',     ticker: 'OANDA:XAG_USD' },
  { id: 'WTI', symbol: 'WTI',     name: 'Ham Petrol', ticker: 'OANDA:WTICO_USD' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchQuote(def, key) {
  try {
    // /quote endpoint: c=fiyat, d=değişim, dp=yüzde, pc=önceki kapanış
    const { data } = await axios.get(`${BASE}/quote`, {
      params: { symbol: def.ticker, token: key },
      timeout: 8000,
    });

    // c = current price, dp = % change, v = volume
    const price = data?.c || 0;
    if (!price || price <= 0) return null;

    const changePct = parseFloat((data.dp || 0).toFixed(2));
    const prevClose = data.pc || price;

    return {
      id:             def.id,
      symbol:         def.symbol,
      name:           def.name,
      price:          parseFloat(price.toFixed(6)),
      change_percent: changePct,
      volume:         formatVolume(data.v || 0),
      market_cap:     '-',
      spark:          buildSparkline(price, changePct),
      category:       def.category,
      logo_url:       null,
      updated_at:     new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[Finnhub] ${def.ticker} hata:`, err.response?.status || err.message);
    return null;
  }
}

async function fetchStockPrices() {
  const key = process.env.FINNHUB_KEY;
  if (!key) {
    console.warn('[Finnhub] FINNHUB_KEY yok — hisse atlandı');
    return [];
  }

  const results = [];
  for (const def of STOCKS) {
    const asset = await fetchQuote({ ...def, category: 'stocks' }, key);
    if (asset) results.push(asset);
    await sleep(200); // 60 req/min koruması
  }

  if (results.length > 0) {
    console.log(`[Finnhub] ${results.length} hisse alındı`);
  }
  return results;
}

async function fetchCommodityPrices() {
  const key = process.env.FINNHUB_KEY;
  if (!key) {
    console.warn('[Finnhub] FINNHUB_KEY yok — emtia atlandı');
    return [];
  }

  const results = [];
  for (const def of COMMODITIES) {
    const asset = await fetchQuote({ ...def, category: 'commodities' }, key);
    if (asset) results.push(asset);
    await sleep(200);
  }

  if (results.length > 0) {
    console.log(`[Finnhub] ${results.length} emtia alındı`);
  }
  return results;
}

function formatVolume(num) {
  if (!num || isNaN(num)) return '-';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(1)}M`;
  return `$${(num).toFixed(0)}`;
}

function buildSparkline(price, changePct) {
  const start = price / (1 + changePct / 100);
  const step  = (price - start) / 9;
  return Array.from({ length: 10 }, (_, i) => {
    const noise = (Math.random() - 0.5) * price * 0.003;
    return parseFloat((start + step * i + noise).toFixed(4));
  });
}

module.exports = { fetchStockPrices, fetchCommodityPrices };
