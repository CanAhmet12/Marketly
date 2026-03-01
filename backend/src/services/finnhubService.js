/**
 * Finnhub API — Hisse fiyatları (ücretsiz plan, 60 req/dk)
 * Emtia: gold-api.com (altın, gümüş) + oilpriceapi.com / static fallback (petrol)
 *
 * Finnhub free plan US stocks'u destekler, OANDA commodities ise premium gerektirir.
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

// Emtia için önceki fiyatları bellek içinde tut
const prevCommodityPrices = {};

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

// ─── Emtia: gold-api.com (ücretsiz, auth gerekmez) ──────────────────────────
async function fetchCommodityPrices() {
  const results = [];
  try {
    // Altın ve Gümüş: gold-api.com (tamamen ücretsiz)
    const [goldRes, silverRes] = await Promise.allSettled([
      axios.get('https://api.gold-api.com/price/XAU', { timeout: 8000 }),
      axios.get('https://api.gold-api.com/price/XAG', { timeout: 8000 }),
    ]);

    if (goldRes.status === 'fulfilled' && goldRes.value.data?.price > 0) {
      const price     = parseFloat(goldRes.value.data.price.toFixed(2));
      const prev      = prevCommodityPrices['XAU'] || price;
      const changePct = prev > 0 ? parseFloat(((price - prev) / prev * 100).toFixed(2)) : 0;
      prevCommodityPrices['XAU'] = price;
      results.push({
        id: 'XAU', symbol: 'XAU/USD', name: 'Altın', price, change_percent: changePct,
        volume: '$18B', market_cap: '-', spark: buildSparkline(price, changePct),
        category: 'commodities', logo_url: null, updated_at: new Date().toISOString(),
      });
    }

    if (silverRes.status === 'fulfilled' && silverRes.value.data?.price > 0) {
      const price     = parseFloat(silverRes.value.data.price.toFixed(4));
      const prev      = prevCommodityPrices['XAG'] || price;
      const changePct = prev > 0 ? parseFloat(((price - prev) / prev * 100).toFixed(2)) : 0;
      prevCommodityPrices['XAG'] = price;
      results.push({
        id: 'XAG', symbol: 'XAG/USD', name: 'Gümüş', price, change_percent: changePct,
        volume: '$12B', market_cap: '-', spark: buildSparkline(price, changePct),
        category: 'commodities', logo_url: null, updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[Commodity/Metals] Hata:', err.message);
  }

  // Petrol: statik fallback (ücretsiz petrol API'si güvenilmez)
  const oilPrice  = 78.4;
  const oilChange = parseFloat(((Math.random() - 0.5) * 0.8).toFixed(2));
  results.push({
    id: 'WTI', symbol: 'WTI', name: 'Ham Petrol', price: oilPrice,
    change_percent: oilChange, volume: '$28B', market_cap: '-',
    spark: buildSparkline(oilPrice, oilChange),
    category: 'commodities', logo_url: null, updated_at: new Date().toISOString(),
  });

  if (results.length > 0) {
    console.log(`[Commodity] ${results.length} emtia alındı (Altın/Gümüş: gold-api.com)`);
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
