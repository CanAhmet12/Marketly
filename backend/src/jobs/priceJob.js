const cron = require('node-cron');
const { fetchCryptoPrices }    = require('../services/coinGecko');
const { fetchForexPrices }     = require('../services/forexService');
const { fetchStockPrices: fetchStocksFinnhub, fetchCommodityPrices: fetchCommoditiesFinnhub } = require('../services/finnhubService');
const { fetchStockPrices: fetchStocksYahoo,  fetchCommodityPrices: fetchCommoditiesYahoo  } = require('../services/yahooFinance');
const { updatePrices, upsertAssets, saveHistoricalSnapshot } = require('../services/supabase');

let updateCount    = 0;
let lastUpdateTime = null;
let isRunning      = false;
let isNonCryptoRunning = false;

// ─── Kripto: her 30 saniye (CoinGecko) ───────────────────────────────────────
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

// ─── Forex: Frankfurter/ECB ───────────────────────────────────────────────────
async function fetchForex() {
  try {
    const data = await fetchForexPrices();
    return data;
  } catch { return []; }
}

// ─── Hisse: Finnhub (birincil) → Yahoo Finance (yedek) ──────────────────────
async function fetchStocks() {
  // Finnhub key varsa onu dene
  if (process.env.FINNHUB_KEY) {
    const data = await fetchStocksFinnhub();
    if (data.length > 0) return data;
  }
  // Yedek: Yahoo Finance
  try {
    const data = await fetchStocksYahoo();
    if (data.length > 0) return data;
  } catch { /* ignore */ }
  return [];
}

// ─── Emtia: Finnhub (birincil) → Yahoo Finance (yedek) ──────────────────────
async function fetchCommodities() {
  if (process.env.FINNHUB_KEY) {
    const data = await fetchCommoditiesFinnhub();
    if (data.length > 0) return data;
  }
  try {
    const data = await fetchCommoditiesYahoo();
    if (data.length > 0) return data;
  } catch { /* ignore */ }
  return [];
}

// ─── Hisse + Emtia + Forex: her 5 dakika ────────────────────────────────────
async function runNonCryptoUpdate() {
  if (isNonCryptoRunning) return;
  isNonCryptoRunning = true;
  const start = Date.now();
  try {
    const [forex, stocks, commodities] = await Promise.all([
      fetchForex(),
      fetchStocks(),
      fetchCommodities(),
    ]);

    const assets = [...forex, ...stocks, ...commodities];

    if (assets.length > 0) {
      await upsertAssets(assets);
      await updatePrices(assets);

      // Günde 1 kez (00:00 UTC) tarihsel snapshot
      const now = new Date();
      if (now.getUTCHours() === 0 && now.getUTCMinutes() < 5) {
        for (const a of assets) await saveHistoricalSnapshot(a.id, a.price);
      }

      console.log(
        `[PriceJob] 🌍 Döviz: ${forex.length}` +
        ` | Hisse: ${stocks.length}` +
        ` | Emtia: ${commodities.length}` +
        ` | ${Date.now() - start}ms`
      );
    } else {
      console.warn('[PriceJob] ⚠️ NonCrypto: Hiç veri alınamadı — Supabase cache kullanılıyor');
    }
  } catch (err) {
    console.error('[PriceJob/NonCrypto] Hata:', err.message);
  } finally {
    isNonCryptoRunning = false;
  }
}

function startPriceJob() {
  const stockSrc = process.env.FINNHUB_KEY ? 'Finnhub' : 'Yahoo Finance';
  console.log(`[PriceJob] Başlatıldı → Kripto: 30s (CoinGecko) | Diğer: 5dk (Forex:ECB, Hisse:${stockSrc})`);

  // İlk çalıştırma
  setTimeout(runCryptoUpdate, 1000);
  setTimeout(runNonCryptoUpdate, 4000);

  // Kripto her 30 saniye
  cron.schedule('*/30 * * * * *', runCryptoUpdate);

  // Döviz + Hisse + Emtia her 5 dakika
  cron.schedule('*/5 * * * *', runNonCryptoUpdate);
}

function getJobStatus() {
  return {
    updateCount,
    lastUpdateTime,
    isRunning,
    isNonCryptoRunning,
    stockSource: process.env.FINNHUB_KEY ? 'finnhub' : 'yahoo',
    hasCoinGeckoKey: !!process.env.COINGECKO_API_KEY,
  };
}

module.exports = { startPriceJob, getJobStatus };
