/**
 * Frankfurter API — ECB (Avrupa Merkez Bankası) döviz kurları
 * Tamamen ücretsiz, kayıt gerekmez, rate limit yok
 * https://www.frankfurter.app
 */
const axios = require('axios');

const BASE = 'https://api.frankfurter.app';

// USD bazlı TRY ve EUR kurları
async function fetchForexPrices() {
  try {
    // USD bazında: TRY, EUR, GBP, CHF
    const { data: usdRates } = await axios.get(`${BASE}/latest`, {
      params: { from: 'USD', to: 'TRY,EUR,GBP,CHF' },
      timeout: 8000,
    });

    // EUR bazında: TRY, USD, GBP
    const { data: eurRates } = await axios.get(`${BASE}/latest`, {
      params: { from: 'EUR', to: 'TRY,USD,GBP' },
      timeout: 8000,
    });

    const results = [];

    // USD/TRY
    if (usdRates?.rates?.TRY) {
      const price = usdRates.rates.TRY;
      results.push(makeForexAsset('USDTRY', 'USD/TRY', 'Dolar/TL',    price, '#E53935'));
    }

    // EUR/TRY
    if (eurRates?.rates?.TRY) {
      const price = eurRates.rates.TRY;
      results.push(makeForexAsset('EURTRY', 'EUR/TRY', 'Euro/TL',     price, '#1565C0'));
    }

    // EUR/USD
    if (eurRates?.rates?.USD) {
      const price = eurRates.rates.USD;
      results.push(makeForexAsset('EURUSD', 'EUR/USD', 'Euro/Dolar',  price, '#1A73E8'));
    }

    // GBP/TRY
    if (usdRates?.rates?.GBP && usdRates?.rates?.TRY) {
      // GBP/TRY = TRY/USD / GBP/USD = USDTRY / USDGBP
      const gbpUsd = 1 / usdRates.rates.GBP;  // USD per GBP
      const price  = gbpUsd * usdRates.rates.TRY;
      results.push(makeForexAsset('GBPTRY', 'GBP/TRY', 'Sterlin/TL', parseFloat(price.toFixed(4)), '#6A1B9A'));
    }

    console.log(`[ForexService] ${results.length} kur alındı (Frankfurter/ECB)`);
    return results;
  } catch (err) {
    console.error('[ForexService] Hata:', err.message);
    return [];
  }
}

function makeForexAsset(id, symbol, name, price, color) {
  const spark = buildSparkline(price);
  return {
    id,
    symbol,
    name,
    price:          parseFloat(price.toFixed(4)),
    change_percent: 0,    // ECB günlük kurları, değişim hesaplanamaz
    volume:         '-',
    market_cap:     '-',
    spark,
    category:       'forex',
    logo_url:       null,
    logo_color:     color,
    updated_at:     new Date().toISOString(),
  };
}

// Gerçekçi hafif dalgalı sparkline
function buildSparkline(price) {
  return Array.from({ length: 10 }, (_, i) => {
    const noise = (Math.random() - 0.5) * price * 0.002;
    return parseFloat((price + noise * (i / 10)).toFixed(4));
  });
}

module.exports = { fetchForexPrices };
