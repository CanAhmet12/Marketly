/**
 * Yahoo Finance v8/chart endpoint — auth gerektirmez, herkese açık
 * Her sembol için tek tek chart API çağrısı yapılır
 */
const axios = require('axios');

// Chart endpoint — public, no auth needed
const YF_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

const ASSETS = [
  // ── Hisse senetleri ───────────────────────────────────────
  { id: 'AAPL',    symbol: 'AAPL',     name: 'Apple Inc.',     ticker: 'AAPL',    category: 'stocks'      },
  { id: 'NVDA',    symbol: 'NVDA',     name: 'NVIDIA Corp.',   ticker: 'NVDA',    category: 'stocks'      },
  { id: 'TSLA',    symbol: 'TSLA',     name: 'Tesla Inc.',     ticker: 'TSLA',    category: 'stocks'      },
  { id: 'MSFT',    symbol: 'MSFT',     name: 'Microsoft',      ticker: 'MSFT',    category: 'stocks'      },
  { id: 'AMZN',    symbol: 'AMZN',     name: 'Amazon.com',     ticker: 'AMZN',    category: 'stocks'      },
  { id: 'META',    symbol: 'META',     name: 'Meta Platforms', ticker: 'META',    category: 'stocks'      },
  { id: 'GOOGL',   symbol: 'GOOGL',    name: 'Alphabet Inc.',  ticker: 'GOOGL',   category: 'stocks'      },
  { id: 'NFLX',    symbol: 'NFLX',     name: 'Netflix Inc.',   ticker: 'NFLX',    category: 'stocks'      },
  // ── Döviz çiftleri ────────────────────────────────────────
  { id: 'USDTRY',  symbol: 'USD/TRY',  name: 'Dolar/TL',       ticker: 'USDTRY=X', category: 'forex'     },
  { id: 'EURTRY',  symbol: 'EUR/TRY',  name: 'Euro/TL',        ticker: 'EURTRY=X', category: 'forex'     },
  { id: 'EURUSD',  symbol: 'EUR/USD',  name: 'Euro/Dolar',     ticker: 'EURUSD=X', category: 'forex'     },
  { id: 'GBPTRY',  symbol: 'GBP/TRY',  name: 'Sterlin/TL',    ticker: 'GBPTRY=X', category: 'forex'     },
  // ── Emtialar ──────────────────────────────────────────────
  { id: 'XAU',     symbol: 'XAU/USD',  name: 'Altın',          ticker: 'GC=F',    category: 'commodities' },
  { id: 'XAG',     symbol: 'XAG/USD',  name: 'Gümüş',         ticker: 'SI=F',    category: 'commodities' },
  { id: 'WTI',     symbol: 'WTI',      name: 'Ham Petrol',     ticker: 'CL=F',    category: 'commodities' },
  { id: 'NATGAS',  symbol: 'NAT.GAS',  name: 'Doğal Gaz',     ticker: 'NG=F',    category: 'commodities' },
];

// Gecikme yardımcısı — rate limit için
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tek sembol için chart API'sinden fiyat çek
async function fetchSingleQuote(def) {
  try {
    // Ticker'daki özel karakterleri encode et (GC=F, USDTRY=X vb.)
    const encodedTicker = encodeURIComponent(def.ticker);
    const url = `${YF_CHART}/${encodedTicker}?range=1d&interval=5m&includePrePost=false`;

    const { data } = await axios.get(url, {
      headers: HEADERS,
      timeout: 8000,
    });

    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta   = result.meta;
    const price  = meta.regularMarketPrice || meta.previousClose;
    if (!price || price <= 0) return null;

    const prevClose = meta.previousClose || meta.chartPreviousClose || price;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    // Sparkline: son 10 kapanış fiyatı
    const closes = result.indicators?.quote?.[0]?.close || [];
    const spark  = closes
      .filter((v) => v != null && v > 0)
      .slice(-10);

    return {
      id:            def.id,
      symbol:        def.symbol,
      name:          def.name,
      price:         parseFloat(price.toFixed(6)),
      change_percent: parseFloat(changePct.toFixed(2)),
      volume:        formatVolume(meta.regularMarketVolume || 0),
      market_cap:    '-',
      spark:         spark.length >= 3 ? spark : buildFallbackSparkline(price, changePct),
      category:      def.category,
      logo_url:      null,
      updated_at:    new Date().toISOString(),
    };
  } catch (err) {
    const status = err.response?.status || 'network';
    console.error(`[YahooFinance] ${def.ticker} hata [${status}]:`, err.message);
    return null;
  }
}

async function fetchAllNonCrypto() {
  const results = [];
  for (let i = 0; i < ASSETS.length; i++) {
    const asset = await fetchSingleQuote(ASSETS[i]);
    if (asset) results.push(asset);
    // Her 3 istekte 300ms bekle — rate limit koruması
    if (i > 0 && i % 3 === 0) await sleep(300);
  }
  console.log(`[YahooFinance] ${results.length}/${ASSETS.length} varlık alındı`);
  return results;
}

async function fetchStockPrices() {
  const results = [];
  for (const def of ASSETS.filter((a) => a.category === 'stocks')) {
    const asset = await fetchSingleQuote(def);
    if (asset) results.push(asset);
    await sleep(150);
  }
  return results;
}

async function fetchForexPrices() {
  const results = [];
  for (const def of ASSETS.filter((a) => a.category === 'forex')) {
    const asset = await fetchSingleQuote(def);
    if (asset) results.push(asset);
    await sleep(150);
  }
  return results;
}

async function fetchCommodityPrices() {
  const results = [];
  for (const def of ASSETS.filter((a) => a.category === 'commodities')) {
    const asset = await fetchSingleQuote(def);
    if (asset) results.push(asset);
    await sleep(150);
  }
  return results;
}

function formatVolume(num) {
  if (!num || num === 0) return '-';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3)  return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function buildFallbackSparkline(price, changePct) {
  const start = price / (1 + changePct / 100);
  const step  = (price - start) / 9;
  return Array.from({ length: 10 }, (_, i) => parseFloat((start + step * i).toFixed(4)));
}

module.exports = { fetchAllNonCrypto, fetchStockPrices, fetchForexPrices, fetchCommodityPrices };
