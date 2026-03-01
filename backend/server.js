require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const pricesRouter  = require('./src/routes/prices');
const { startPriceJob } = require('./src/jobs/priceJob');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Marketly API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.use('/api/prices', pricesRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Marketly API başlatıldı → http://0.0.0.0:${PORT}`);
  console.log(`📡 Ortam: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Fiyat güncelleme: her ${process.env.PRICE_UPDATE_INTERVAL || 30} saniye\n`);

  // Background fiyat güncelleme jobı
  startPriceJob();
});
