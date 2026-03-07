# Backend Modernizasyon Planı — Marketly Price API

> **Hedef:** DigitalOcean'da çalışan backend'i production-ready seviyeye çıkarmak.
> **Sunucu:** 134.122.84.92:3001
> **Mevcut Durum:** Çalışıyor ama hisse senedi API'leri sorunlu, güvenlik ve monitoring eksik.

---

## 📋 Mevcut Durum Analizi

### ✅ Çalışan Servisler
- **Kripto:** Her 30 saniyede 15 varlık güncelleniyor (CoinGecko — rate limit yok)
- **Döviz:** Her 10 dakikada 4 kur güncelleniyor (Frankfurter/ECB — stabil)
- **Emtia:** Her 15 dakikada 3 emtia güncelleniyor (gold-api.com — stabil)

### ⚠️ Sorunlar
1. **Hisse Senedi API'leri:**
   - Finnhub: 502 Bad Gateway hataları (API sunucusu geçici down)
   - Yahoo Finance: 429 Rate Limit aşımı (çok fazla istek)
   - Son 5 günde düzensiz güncellemeler

2. **Güvenlik:**
   - HTTPS yok (şu anda HTTP)
   - Firewall yok (bot saldırıları logda görünüyor)
   - Rate limiting yok (DDoS'a açık)

3. **Monitoring:**
   - Log dosyaları sınırsız büyüyor
   - Hata bildirimi yok (Sentry vs.)
   - Performance metrikleri yok

4. **Altyapı:**
   - Redis/caching yok
   - WebSocket yok (realtime için)
   - API versioning yok
   - Health check eksik (sadece /health var ama detaysız)

---

## 🎯 Modernizasyon Hedefleri

| # | Hedef | Kritiklik | Tahmini Süre |
|---|-------|-----------|-------------|
| 1 | Hisse senedi API'lerini düzelt | 🔴 ACİL | 2-3 saat |
| 2 | HTTPS + SSL kurulumu | 🔴 ACİL | 1-2 saat |
| 3 | Firewall + fail2ban | 🟡 ÖNEMLI | 1 saat |
| 4 | Redis caching sistemi | 🟡 ÖNEMLI | 2-3 saat |
| 5 | Monitoring + alerting | 🟡 ÖNEMLI | 2-3 saat |
| 6 | API rate limiting | 🟡 ÖNEMLI | 1-2 saat |
| 7 | WebSocket realtime | 🟢 İYİLEŞTİRME | 3-4 saat |
| 8 | API versioning (v2) | 🟢 İYİLEŞTİRME | 2-3 saat |
| 9 | Error tracking (Sentry) | 🟢 İYİLEŞTİRME | 1-2 saat |
| 10 | Load testing + optimization | 🟢 İYİLEŞTİRME | 2-3 saat |

**Toplam Tahmini Süre:** 18-28 saat (2-4 gün)

---

## 📝 Detaylı Görevler

---

### 🔴 FAZE 1: ACİL DÜZELTMELER (4-5 saat)

#### Görev 1.1: Hisse Senedi API İyileştirmesi

**Sorun:** Finnhub ve Yahoo Finance rate limit ve 502 hataları veriyor.

**Çözüm A — Retry Logic Ekle:**
```javascript
// backend/src/services/retryHelper.js
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // 502/503 → 30 saniye bekle, tekrar dene
      if (response.status === 502 || response.status === 503) {
        console.log(`[Retry] ${response.status} hata, ${i+1}/${maxRetries} deneme...`);
        await sleep(30000);
        continue;
      }
      
      // 429 → 60 saniye bekle, tekrar dene
      if (response.status === 429) {
        console.log(`[Retry] Rate limit, 60s bekle, ${i+1}/${maxRetries} deneme...`);
        await sleep(60000);
        continue;
      }
      
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log(`[Retry] Network hata, ${i+1}/${maxRetries} deneme...`);
      await sleep(10000);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { fetchWithRetry };
```

**Çözüm B — Alternatif API Ekle:**
```javascript
// backend/src/services/stocksService.js
// Finnhub başarısız olursa Alpha Vantage'e düş
// Alpha Vantage başarısız olursa Polygon.io'ya düş
// Polygon.io başarısız olursa Yahoo Finance'e düş

const API_PRIORITY = [
  { name: 'Finnhub', fn: fetchFromFinnhub },
  { name: 'AlphaVantage', fn: fetchFromAlphaVantage },
  { name: 'Polygon', fn: fetchFromPolygon },
  { name: 'Yahoo', fn: fetchFromYahoo }
];

async function getStockPrice(symbol) {
  for (const api of API_PRIORITY) {
    try {
      const price = await api.fn(symbol);
      if (price) return price;
    } catch (err) {
      console.log(`[${api.name}] ${symbol} hata:`, err.message);
    }
  }
  throw new Error(`Tüm API'ler başarısız: ${symbol}`);
}
```

**Çözüm C — Cron Interval'i Ayarla:**
```javascript
// backend/src/jobs/priceJob.js
// Hisse senedi güncellemesini 5dk → 15dk'ya uzat (rate limit'i aşma)
cron.schedule('*/15 * * * *', () => updateStockPrices());
```

**Yapılacaklar:**
- [ ] `retryHelper.js` oluştur
- [ ] `stocksService.js`'e retry logic ekle
- [ ] Alpha Vantage API key al (https://www.alphavantage.co/support/#api-key)
- [ ] Polygon.io API key al (https://polygon.io/)
- [ ] `finnhubService.js`'i güncelle (retry logic)
- [ ] `yahooFinance.js`'i güncelle (retry logic)
- [ ] Cron interval'i 15 dakikaya uzat
- [ ] Test: `pm2 restart marketly-api && pm2 logs marketly-api`

---

#### Görev 1.2: HTTPS + SSL Kurulumu

**Sorun:** Şu anda HTTP, güvensiz.

**Gereksinimler:**
- Domain: `api.marketly.app` (veya subdomain)
- DNS A Record: `api.marketly.app` → `134.122.84.92`

**Adımlar:**

**1. Domain DNS Ayarları (Namecheap/GoDaddy/Cloudflare):**
```
Type: A
Host: api
Value: 134.122.84.92
TTL: 300 (otomatik)
```

**2. Nginx Kurulumu:**
```bash
ssh root@134.122.84.92

# Nginx + Certbot kur
apt update
apt install nginx certbot python3-certbot-nginx -y

# Nginx config oluştur
nano /etc/nginx/sites-available/marketly-api
```

**3. Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.marketly.app;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting (DDoS koruması)
        limit_req zone=api_limit burst=20 nodelay;
    }
}

# Rate limit zone tanımı (nginx.conf'a ekle)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

**4. Nginx Aktifleştir:**
```bash
ln -s /etc/nginx/sites-available/marketly-api /etc/nginx/sites-enabled/
nginx -t  # Config test
systemctl reload nginx
```

**5. SSL Sertifikası (Let's Encrypt):**
```bash
certbot --nginx -d api.marketly.app

# Otomatik yenileme test
certbot renew --dry-run
```

**6. Mobil App Güncelle:**
```typescript
// hooks/useMarketPrices.ts:14
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://api.marketly.app';
```

**Yapılacaklar:**
- [ ] Domain satın al veya subdomain oluştur
- [ ] DNS A record ekle (`api.marketly.app` → `134.122.84.92`)
- [ ] Nginx + Certbot kur
- [ ] Nginx config oluştur
- [ ] SSL sertifikası al
- [ ] Mobil app'te `useMarketPrices.ts` güncelle
- [ ] Test: `curl https://api.marketly.app/health`

---

#### Görev 1.3: Firewall + Güvenlik

**Sorun:** Bot saldırıları görülüyor (terraform.tfstate, /sdk, /HNAP1 gibi exploit denemeleri).

**Adımlar:**

**1. UFW Firewall:**
```bash
ssh root@134.122.84.92

apt install ufw -y

# Varsayılan kurallar
ufw default deny incoming
ufw default allow outgoing

# İzinli portlar
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (Nginx)
ufw allow 443/tcp   # HTTPS (Nginx)

ufw enable
ufw status
```

**2. Fail2Ban (Otomatik IP engelleme):**
```bash
apt install fail2ban -y

# Config oluştur
nano /etc/fail2ban/jail.local
```

**3. Fail2Ban Config:**
```ini
[DEFAULT]
bantime = 3600       # 1 saat ban
findtime = 600       # 10 dakikada
maxretry = 5         # 5 hatalı deneme

[sshd]
enabled = true
port = 22

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 3
bantime = 7200  # 2 saat ban
findtime = 300
filter = nginx-botsearch

[nginx-http-auth]
enabled = true
```

**4. Fail2Ban Filter:**
```bash
nano /etc/fail2ban/filter.d/nginx-botsearch.conf
```

```ini
[Definition]
failregex = ^<HOST> .*(GET|POST).*(terraform|\.env|sdk|HNAP|\.git|wp-admin|phpmyadmin).*
ignoreregex =
```

**5. Aktifleştir:**
```bash
systemctl enable fail2ban
systemctl start fail2ban
fail2ban-client status
```

**Yapılacaklar:**
- [ ] UFW firewall kur
- [ ] Port 22/80/443 aç
- [ ] fail2ban kur
- [ ] nginx-botsearch filter ekle
- [ ] Test: `fail2ban-client status nginx-botsearch`

---

### 🟡 FAZE 2: PERFORMANS İYİLEŞTİRMELERİ (5-7 saat)

#### Görev 2.1: Redis Caching Sistemi

**Sorun:** Her istekte Supabase'e yazılıyor, rate limit riski var.

**Çözüm:** Redis cache ekle, API sonuçlarını 2 dakika cache'le.

**Adımlar:**

**1. Redis Kurulumu:**
```bash
ssh root@134.122.84.92

apt install redis-server -y
systemctl enable redis-server
systemctl start redis-server

# Test
redis-cli ping  # PONG dönmeli
```

**2. Node.js Redis Client:**
```bash
cd /root/Marketly/backend
npm install redis@4 --save
```

**3. Redis Service Oluştur:**
```javascript
// backend/src/services/redisClient.js
const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: (options) => {
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('error', (err) => console.error('[Redis] Error:', err));
client.connect();

async function getCache(key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('[Redis] Get error:', err);
    return null;
  }
}

async function setCache(key, value, ttl = 120) {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error('[Redis] Set error:', err);
  }
}

module.exports = { getCache, setCache };
```

**4. Routes'e Cache Ekle:**
```javascript
// backend/src/routes/prices.js
const { getCache, setCache } = require('../services/redisClient');

router.get('/api/prices', async (req, res) => {
  const category = req.query.category;
  const cacheKey = `prices:${category || 'all'}`;
  
  // Cache kontrol
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, cached: true });
  }
  
  // Supabase'den çek
  const { data, error } = await supabase
    .from('asset_prices')
    .select('...')
    .order('updated_at', { ascending: false });
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  
  // Cache'e yaz (120 saniye TTL)
  await setCache(cacheKey, data, 120);
  
  res.json({ success: true, data, cached: false });
});
```

**Yapılacaklar:**
- [ ] Redis server kur
- [ ] `redis` npm package ekle
- [ ] `redisClient.js` oluştur
- [ ] `routes/prices.js`'e cache logic ekle
- [ ] Test: `curl http://localhost:3001/api/prices` (2. istek cached olmalı)
- [ ] `pm2 restart marketly-api`

---

#### Görev 2.2: Monitoring + Alerting

**Sorun:** Hata olunca haberimiz olmuyor, log dosyaları sınırsız büyüyor.

**Çözüm A — PM2 Log Rotation:**
```bash
ssh root@134.122.84.92

pm2 install pm2-logrotate

# Config
pm2 set pm2-logrotate:max_size 10M        # 10MB'dan büyük log rotate et
pm2 set pm2-logrotate:retain 7            # Son 7 dosyayı tut
pm2 set pm2-logrotate:compress true       # Eski logları gzip'le
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Her gece 00:00
```

**Çözüm B — PM2 Plus (Ücretsiz Monitoring):**
```bash
# PM2 Plus hesabı aç: https://app.pm2.io/
pm2 link <secret_key> <public_key>

# Otomatik monitoring, error tracking, alerting
```

**Çözüm C — Health Check Endpoint Geliştir:**
```javascript
// backend/src/routes/health.js
router.get('/health', async (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // Servis sağlık kontrolleri
  const checks = {
    redis: await checkRedis(),
    supabase: await checkSupabase(),
    finnhub: await checkFinnhub(),
    coingecko: await checkCoinGecko()
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    checks
  });
});

async function checkRedis() {
  try {
    await redisClient.ping();
    return { status: 'ok', message: 'Connected' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

async function checkSupabase() {
  try {
    const { error } = await supabase.from('assets').select('id').limit(1);
    if (error) throw error;
    return { status: 'ok', message: 'Connected' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}
```

**Yapılacaklar:**
- [ ] PM2 log rotation kur
- [ ] PM2 Plus hesabı aç (opsiyonel)
- [ ] `/health` endpoint'i geliştir (servis kontrolleri ekle)
- [ ] Test: `curl http://localhost:3001/health`

---

#### Görev 2.3: API Rate Limiting

**Sorun:** DDoS saldırısına açık.

**Çözüm:** Express rate limiter ekle.

**Adımlar:**

**1. Package Kur:**
```bash
cd /root/Marketly/backend
npm install express-rate-limit --save
```

**2. Rate Limiter Ekle:**
```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');

// Genel API rate limit (100 req/15dk per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar dene.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Prices endpoint için özel limit (300 req/15dk per IP)
const pricesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Rate limit aşıldı.' }
});

app.use('/api/', apiLimiter);
app.use('/api/prices', pricesLimiter);
```

**Yapılacaklar:**
- [ ] `express-rate-limit` kur
- [ ] `server.js`'e rate limiter ekle
- [ ] Test: 100+ istek gönder, rate limit kontrolü yap
- [ ] `pm2 restart marketly-api`

---

### 🟢 FAZE 3: İLERİ SEVİYE İYİLEŞTİRMELER (9-13 saat)

#### Görev 3.1: WebSocket Realtime

**Sorun:** Mobil app şu anda HTTP polling yapıyor (her 2dk bir istek).

**Çözüm:** WebSocket ekle, gerçek zamanlı fiyat güncellemeleri.

**Adımlar:**

**1. Socket.io Kur:**
```bash
cd /root/Marketly/backend
npm install socket.io --save
```

**2. WebSocket Server Ekle:**
```javascript
// backend/server.js
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('[WebSocket] Client connected:', socket.id);
  
  socket.on('subscribe', (category) => {
    socket.join(category);
    console.log(`[WebSocket] ${socket.id} subscribed to ${category}`);
  });
  
  socket.on('disconnect', () => {
    console.log('[WebSocket] Client disconnected:', socket.id);
  });
});

// Fiyat güncellenince WebSocket'e broadcast et
function broadcastPriceUpdate(category, data) {
  io.to(category).emit('price_update', data);
}

server.listen(3001, () => {
  console.log('Server listening on :3001');
});

module.exports = { io, broadcastPriceUpdate };
```

**3. Cron Job'dan Broadcast Et:**
```javascript
// backend/src/jobs/priceJob.js
const { broadcastPriceUpdate } = require('../server');

async function updateCryptoPrices() {
  const prices = await fetchCryptoPrices();
  
  // Supabase'e yaz
  await supabase.from('asset_prices').upsert(prices);
  
  // WebSocket'e broadcast et
  broadcastPriceUpdate('crypto', prices);
}
```

**4. Mobil App WebSocket Client:**
```typescript
// hooks/useMarketPricesWS.ts
import io from 'socket.io-client';

const socket = io('https://api.marketly.app');

socket.on('connect', () => {
  socket.emit('subscribe', 'crypto');
});

socket.on('price_update', (data) => {
  console.log('Realtime price update:', data);
  setAssets(data);
});
```

**Yapılacaklar:**
- [ ] `socket.io` kur
- [ ] `server.js`'e WebSocket ekle
- [ ] `priceJob.js`'den broadcast et
- [ ] Mobil app'e `socket.io-client` ekle
- [ ] `useMarketPricesWS.ts` hook'u oluştur
- [ ] Test: WebSocket connection + realtime updates

---

#### Görev 3.2: API Versioning (v2)

**Sorun:** API değişikliği yapınca mobil app bozulabilir.

**Çözüm:** API versioning ekle (`/api/v1`, `/api/v2`).

**Adımlar:**

**1. Routes Yeniden Yapılandır:**
```javascript
// backend/src/routes/v1/prices.js
router.get('/api/v1/prices', async (req, res) => {
  // Eski format
});

// backend/src/routes/v2/prices.js
router.get('/api/v2/prices', async (req, res) => {
  // Yeni format (Redis cache, WebSocket support, vs.)
});
```

**2. Versiyonları Birlikte Çalıştır:**
```javascript
// backend/server.js
const v1Routes = require('./src/routes/v1');
const v2Routes = require('./src/routes/v2');

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Varsayılan: v2
app.use('/api', v2Routes);
```

**3. Mobil App Güncelle:**
```typescript
// hooks/useMarketPrices.ts
const API_BASE = 'https://api.marketly.app/api/v2';
```

**Yapılacaklar:**
- [ ] `routes/v1/` ve `routes/v2/` klasörleri oluştur
- [ ] Mevcut route'ları `v1/` altına taşı
- [ ] `v2/` için yeni route'lar oluştur (Redis cache + WebSocket)
- [ ] `server.js`'de versiyonları birlikte çalıştır
- [ ] Mobil app'i v2'ye geçir
- [ ] Test: `/api/v1/prices` ve `/api/v2/prices` ayrı çalışmalı

---

#### Görev 3.3: Error Tracking (Sentry)

**Sorun:** Production'da hatalar console'da kalıyor, takip edemiyoruz.

**Çözüm:** Sentry entegrasyonu.

**Adımlar:**

**1. Sentry Hesabı Aç:**
- https://sentry.io/signup/
- Proje oluştur: "Marketly Backend"
- DSN kopyala

**2. Package Kur:**
```bash
cd /root/Marketly/backend
npm install @sentry/node @sentry/profiling-node --save
```

**3. Sentry Başlat:**
```javascript
// backend/server.js (en üstte)
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0.1
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

**4. .env Ekle:**
```bash
nano /root/Marketly/backend/.env
# SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx ekle
```

**5. Manuel Error Gönder:**
```javascript
// backend/src/jobs/priceJob.js
try {
  await updateStockPrices();
} catch (err) {
  console.error('[PriceJob] Hata:', err);
  Sentry.captureException(err);
}
```

**Yapılacaklar:**
- [ ] Sentry hesabı aç
- [ ] `@sentry/node` kur
- [ ] `server.js`'de Sentry başlat
- [ ] `.env`'ye SENTRY_DSN ekle
- [ ] Kritik yerlere `Sentry.captureException` ekle
- [ ] Test: Hata fırlat, Sentry dashboard'da görün

---

#### Görev 3.4: Load Testing + Optimization

**Sorun:** Production'da kaç kullanıcıyı kaldırır bilinmiyor.

**Çözüm:** Load test yap, darboğazları tespit et.

**Adımlar:**

**1. Artillery Kur (Load Test Tool):**
```bash
npm install -g artillery
```

**2. Test Senaryosu Oluştur:**
```yaml
# load-test.yml
config:
  target: "https://api.marketly.app"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 req/saniye
    - duration: 120
      arrivalRate: 50  # 50 req/saniye
    - duration: 60
      arrivalRate: 100 # 100 req/saniye

scenarios:
  - name: "Get Prices"
    flow:
      - get:
          url: "/api/prices"
      - get:
          url: "/api/prices?category=crypto"
```

**3. Test Çalıştır:**
```bash
artillery run load-test.yml
```

**4. Sonuçları Analiz Et:**
- Response time: <200ms → ✅ İyi
- Response time: 200-500ms → 🟡 Orta
- Response time: >500ms → 🔴 Kötü (optimize et)
- Error rate: <1% → ✅ İyi
- Error rate: >5% → 🔴 Sorun var

**5. Optimizasyon:**
- Redis cache TTL'i artır (120s → 300s)
- Node.js cluster mode aktifleştir (PM2 `cluster` mode)
- Database query'leri optimize et (index ekle)
- Supabase connection pool artır

**Yapılacaklar:**
- [ ] Artillery kur
- [ ] Load test senaryosu yaz
- [ ] Test çalıştır (10/50/100 req/s)
- [ ] Darboğazları tespit et
- [ ] Optimizasyon yap
- [ ] Test tekrarla, iyileşme kontrol et

---

## 📦 Deployment Checklist

Tüm görevler tamamlandıktan sonra:

### Pre-Production Kontroller
- [ ] Tüm testler başarılı
- [ ] Redis çalışıyor (`redis-cli ping`)
- [ ] Nginx çalışıyor (`systemctl status nginx`)
- [ ] SSL sertifikası geçerli (`curl https://api.marketly.app/health`)
- [ ] Firewall aktif (`ufw status`)
- [ ] fail2ban çalışıyor (`fail2ban-client status`)
- [ ] PM2 otomatik başlatma aktif (`pm2 startup`)
- [ ] Log rotation aktif (`pm2 list pm2-logrotate`)
- [ ] Sentry error tracking test edildi
- [ ] Load test başarılı (100 req/s altında <500ms response time)

### Production Deployment
```bash
ssh root@134.122.84.92

# Backend kod güncellemesi
cd /root/Marketly/backend
git pull origin main

# Dependencies güncelle
npm install

# PM2 restart (zero-downtime)
pm2 reload ecosystem.config.js

# Health check
curl https://api.marketly.app/health

# Log izle
pm2 logs marketly-api --lines 50
```

### Mobil App Güncelleme
```bash
cd /Users/.../Marketly

# .env güncelle
EXPO_PUBLIC_API_BASE=https://api.marketly.app

# Build
npm run build

# EAS build + deploy (iOS/Android)
eas build --platform all
eas submit --platform all
```

---

## 🔧 Bakım ve İzleme

### Günlük Kontroller
```bash
pm2 status                    # Process durumu
pm2 logs --lines 100          # Son 100 log satırı
curl https://api.marketly.app/health  # Health check
fail2ban-client status        # Engellenen IP'ler
```

### Haftalık Kontroller
```bash
df -h                         # Disk kullanımı
free -h                       # RAM kullanımı
systemctl status nginx        # Nginx durumu
systemctl status redis-server # Redis durumu
certbot renew --dry-run       # SSL yenileme test
```

### Aylık Güncellemeler
```bash
apt update && apt upgrade -y  # Sistem güncellemeleri
npm outdated                  # Backend package güncellemeleri
npm update                    # Package güncelle
pm2 update                    # PM2 güncelle
```

---

## 📊 Başarı Metrikleri

Modernizasyon tamamlandığında:

| Metrik | Öncesi | Sonrası | Hedef |
|--------|--------|---------|-------|
| **Uptime** | %95 | %99.9 | ✅ |
| **Response Time** | 500-1000ms | <200ms | ✅ |
| **Error Rate** | %10 (hisse API'leri) | <1% | ✅ |
| **Security** | HTTP, firewall yok | HTTPS, fail2ban | ✅ |
| **Monitoring** | Loglardan manuel | Sentry + PM2 Plus | ✅ |
| **Cache Hit Rate** | %0 | %80+ | ✅ |
| **Realtime Latency** | HTTP polling (30s) | WebSocket (<1s) | ✅ |

---

## 🎓 Faydalı Kaynaklar

- **Nginx:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/getting-started/
- **Redis:** https://redis.io/docs/
- **PM2:** https://pm2.keymetrics.io/docs/
- **Sentry:** https://docs.sentry.io/platforms/node/
- **Socket.io:** https://socket.io/docs/v4/
- **Artillery:** https://www.artillery.io/docs/
- **fail2ban:** https://www.fail2ban.org/wiki/index.php/Main_Page

---

## 🚨 Acil Durum Prosedürleri

### Backend Çöktüyse
```bash
ssh root@134.122.84.92
pm2 restart marketly-api
pm2 logs --err  # Hata logları
```

### Redis Çöktüyse
```bash
systemctl restart redis-server
redis-cli ping  # PONG dönmeli
```

### Nginx Çöktüyse
```bash
systemctl restart nginx
nginx -t  # Config test
```

### SSL Sertifikası Expire Olduysa
```bash
certbot renew
systemctl reload nginx
```

### Disk Doluysa
```bash
# Eski PM2 logları temizle
pm2 flush

# Sistem logları temizle
journalctl --vacuum-time=7d
```

---

*Plan Oluşturuldu: 7 Mart 2026*
*Güncellenecek: Modernizasyon tamamlandıkça*
