const axios = require('axios');

// Takip edilecek kripto coinler
const CRYPTO_IDS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
  'avalanche-2', 'dogecoin', 'matic-network', 'chainlink', 'uniswap',
  'cardano', 'polkadot', 'tron', 'litecoin', 'stellar',
];

// CoinGecko ID → uygulama asset ID eşlemesi
const ID_MAP = {
  'bitcoin':      'BTC',
  'ethereum':     'ETH',
  'binancecoin':  'BNB',
  'solana':       'SOL',
  'ripple':       'XRP',
  'avalanche-2':  'AVAX',
  'dogecoin':     'DOGE',
  'matic-network':'MATIC',
  'chainlink':    'LINK',
  'uniswap':      'UNI',
  'cardano':      'ADA',
  'polkadot':     'DOT',
  'tron':         'TRX',
  'litecoin':     'LTC',
  'stellar':      'XLM',
};

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

async function fetchCryptoPrices() {
  try {
    const headers = {};
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    }

    const [marketsResp, sparkResp] = await Promise.all([
      // Anlık fiyat + değişim + hacim
      axios.get(`${COINGECKO_BASE}/coins/markets`, {
        headers,
        params: {
          vs_currency: 'usd',
          ids: CRYPTO_IDS.join(','),
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        },
        timeout: 10000,
      }),
    ]);

    return marketsResp.data.map((coin) => {
      const spark = (coin.sparkline_in_7d?.price || []).slice(-10).map(Number);
      return {
        id: ID_MAP[coin.id] || coin.symbol.toUpperCase(),
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change_percent: coin.price_change_percentage_24h || 0,
        volume: formatVolume(coin.total_volume),
        market_cap: formatVolume(coin.market_cap),
        spark: spark.length === 10 ? spark : normalizeSparkline(spark),
        category: 'crypto',
        logo_url: coin.image,
        updated_at: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[CoinGecko] Hata:', err.message);
    return [];
  }
}

function formatVolume(num) {
  if (!num) return '$0';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function normalizeSparkline(arr) {
  if (arr.length === 0) return Array(10).fill(1);
  while (arr.length < 10) arr.push(arr[arr.length - 1]);
  return arr.slice(0, 10);
}

module.exports = { fetchCryptoPrices };
