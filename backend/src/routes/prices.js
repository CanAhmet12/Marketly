const express    = require('express');
const { createClient } = require('@supabase/supabase-js');
const { getJobStatus } = require('../jobs/priceJob');

const router   = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /api/prices — Tüm güncel fiyatlar
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('asset_prices')
      .select(`
        asset_id,
        price,
        change_percent,
        volume,
        market_cap,
        spark,
        updated_at,
        assets (
          id, symbol, name, category, logo_url, logo_letter, logo_color
        )
      `)
      .order('updated_at', { ascending: false });

    if (category) {
      query = query.eq('assets.category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // asset_prices + assets birleşik obje
    const result = (data || [])
      .filter((row) => row.assets)
      .map((row) => ({
        id: row.asset_id,
        symbol: row.assets.symbol,
        name: row.assets.name,
        category: row.assets.category,
        logo_url: row.assets.logo_url,
        logo_letter: row.assets.logo_letter,
        logo_color: row.assets.logo_color,
        price: row.price,
        change_percent: row.change_percent,
        volume: row.volume,
        market_cap: row.market_cap,
        spark: row.spark,
        updated_at: row.updated_at,
      }));

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error('[API/prices] Hata:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/prices/:assetId — Tek varlık
router.get('/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;

    const { data, error } = await supabase
      .from('asset_prices')
      .select(`
        asset_id, price, change_percent, volume, market_cap, spark, updated_at,
        assets ( id, symbol, name, category, logo_url, logo_letter, logo_color )
      `)
      .eq('asset_id', assetId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Varlık bulunamadı' });
    }

    res.json({
      success: true,
      data: {
        id: data.asset_id,
        ...data.assets,
        price: data.price,
        change_percent: data.change_percent,
        volume: data.volume,
        market_cap: data.market_cap,
        spark: data.spark,
        updated_at: data.updated_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/prices/:assetId/history — 7 günlük tarihsel veri
router.get('/:assetId/history', async (req, res) => {
  try {
    const { assetId } = req.params;
    const { days = 7 } = req.query;

    const from = new Date();
    from.setDate(from.getDate() - parseInt(days, 10));

    const { data, error } = await supabase
      .from('price_history')
      .select('date, close_price')
      .eq('asset_id', assetId)
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/prices/status — Job durumu
router.get('/system/status', (_req, res) => {
  res.json({ success: true, job: getJobStatus() });
});

module.exports = router;
