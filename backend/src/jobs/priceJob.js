const cron    = require('node-cron');
const { fetchCryptoPrices }                      = require('../services/coinGecko');
const { fetchForexPrices }                       = require('../services/forexService');
const { fetchStockPrices, fetchCommodityPrices } = require('../services/stocksService');
const { updatePrices, upsertAssets, saveHistoricalSnapshot } = require('../services/supabase');

let updateCount    = 0;
let lastUpdateTime = null;
let isRunning      = false;

// ──────────────────────────────────────────────────────────
// Kripto: her 30 saniye (CoinGecko ücretsiz, rate limit geniş)
// Forex + Hisse + Emtia: her 5 dakika (Twelve Data 800/gün koruması)
// ──────────────────────────────────────────────────────────

async function runCryptoUpdate() {
  if (isRunning) return;
  isRunning = true;
  const start = Date.now();
  try {
    const crypto = await fetchCryptoPrices();
    if (crypto.length > 0) {
      await upsertAssets(crypto);
      await updatePrices(crypto);
      updateCount++;
      lastUpdateTime = new Date().toISOString();
      console.log(`[PriceJob] ✅ #${updateCount} | Kripto: ${crypto.length} | ${Date.now() - start}ms`);
    }
  } catch (err) {
    console.error('[PriceJob/Kripto] Hata:', err.message);
  } finally {
    isRunning = false;
  }
}

async function runNonCryptoUpdate() {
  const start = Date.now();
  try {
    const [forex, stocks, commodities] = await Promise.allSettled([
      fetchForexPrices(),
      fetchStockPrices(),
      fetchCommodityPrices(),
    ]);

    const assets = [
      ...(forex.status       === 'fulfilled' ? forex.value       : []),
      ...(stocks.status      === 'fulfilled' ? stocks.value      : []),
      ...(commodities.status === 'fulfilled' ? commodities.value : []),
    ];

    if (assets.length > 0) {
      await upsertAssets(assets);
      await updatePrices(assets);

      // Günde 1 kez tarihsel snapshot
      const now = new Date();
      if (now.getUTCHours() === 0 && now.getUTCMinutes() < 5) {
        for (const a of assets) await saveHistoricalSnapshot(a.id, a.price);
      }

      console.log(
        `[PriceJob] 💱 Döviz: ${forex.status === 'fulfilled' ? forex.value.length : 0}` +
        ` | Hisse: ${stocks.status === 'fulfilled' ? stocks.value.length : 0}` +
        ` | Emtia: ${commodities.status === 'fulfilled' ? commodities.value.length : 0}` +
        ` | ${Date.now() - start}ms`
      );
    }
  } catch (err) {
    console.error('[PriceJob/NonCrypto] Hata:', err.message);
  }
}

function startPriceJob() {
  console.log('[PriceJob] Başlatıldı → Kripto: 30s, Diğer: 5dk');

  // İlk çalıştırma
  runCryptoUpdate();
  runNonCryptoUpdate();

  // Kripto her 30 saniye
  cron.schedule('*/30 * * * * *', runCryptoUpdate);

  // Döviz+Hisse+Emtia her 5 dakika
  cron.schedule('*/5 * * * *', runNonCryptoUpdate);
}

function getJobStatus() {
  return { updateCount, lastUpdateTime, isRunning };
}

module.exports = { startPriceJob, getJobStatus };
