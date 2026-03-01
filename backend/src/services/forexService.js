/**
 * Frankfurter API — ECB (Avrupa Merkez Bankası) döviz kurları
 * Tamamen ücretsiz, kayıt gerekmez, rate limit yok
 * https://www.frankfurter.app
 *
 * change_percent: Supabase'deki önceki fiyatla karşılaştırılarak hesaplanır.
 */
const axios  = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BASE = 'https://api.frankfurter.app';

// Önceki fiyatları bellekte tut (uygulama süresi boyunca)
const prevPrices = {};

async function getPrevPricesFromSupabase(ids) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    const { data } = await supabase
      .from('asset_prices')
      .select('asset_id, price')
      .in('asset_id', ids);
    if (data) {
      for (const row of data) prevPrices[row.asset_id] = row.price;
    }
  } catch { /* ignore */ }
}

function calcChange(id, newPrice) {
  const prev = prevPrices[id];
  if (!prev || prev === 0) return 0;
  const pct = ((newPrice - prev) / prev) * 100;
  return parseFloat(pct.toFixed(4));
}

// USD bazlı TRY ve EUR kurları
async function fetchForexPrices() {
  try {
    // Önceki fiyatları yükle
    await getPrevPricesFromSupabase(['USDTRY', 'EURTRY', 'EURUSD', 'GBPTRY']);

    const [usdResp, eurResp] = await Promise.all([
      axios.get(`${BASE}/latest`, {
        params: { from: 'USD', to: 'TRY,EUR,GBP,CHF' },
        timeout: 8000,
      }),
      axios.get(`${BASE}/latest`, {
        params: { from: 'EUR', to: 'TRY,USD,GBP' },
        timeout: 8000,
      }),
    ]);

    const usdRates = usdResp.data;
    const eurRates = eurResp.data;
    const results  = [];

    // USD/TRY
    if (usdRates?.rates?.TRY) {
      const price = parseFloat(usdRates.rates.TRY.toFixed(4));
      results.push(makeForexAsset('USDTRY', 'USD/TRY', 'Dolar/TL',   price, '#E53935'));
    }

    // EUR/TRY
    if (eurRates?.rates?.TRY) {
      const price = parseFloat(eurRates.rates.TRY.toFixed(4));
      results.push(makeForexAsset('EURTRY', 'EUR/TRY', 'Euro/TL',    price, '#1565C0'));
    }

    // EUR/USD
    if (eurRates?.rates?.USD) {
      const price = parseFloat(eurRates.rates.USD.toFixed(6));
      results.push(makeForexAsset('EURUSD', 'EUR/USD', 'Euro/Dolar', price, '#1A73E8'));
    }

    // GBP/TRY = (1/USDGBP) * USDTRY
    if (usdRates?.rates?.GBP && usdRates?.rates?.TRY) {
      const gbpUsd = 1 / usdRates.rates.GBP;
      const price  = parseFloat((gbpUsd * usdRates.rates.TRY).toFixed(4));
      results.push(makeForexAsset('GBPTRY', 'GBP/TRY', 'Sterlin/TL', price, '#6A1B9A'));
    }

    // Önceki fiyatları güncelle
    for (const r of results) prevPrices[r.id] = r.price;

    console.log(`[ForexService] ${results.length} kur alındı (Frankfurter/ECB) ` +
      results.map(r => `${r.symbol}=${r.price}(${r.change_percent > 0 ? '+' : ''}${r.change_percent}%)`).join(' '));
    return results;
  } catch (err) {
    console.error('[ForexService] Hata:', err.message);
    return [];
  }
}

function makeForexAsset(id, symbol, name, price, color) {
  return {
    id,
    symbol,
    name,
    price,
    change_percent: calcChange(id, price),
    volume:         '-',
    market_cap:     '-',
    spark:          buildSparkline(price),
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
