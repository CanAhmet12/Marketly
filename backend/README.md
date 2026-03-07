# Backend README - Marketly Price API

> Bu dosya backend'i gelistirirken AI'nin hizlica anlamasi icin yazilmistir.
> DigitalOcean sunucuda SSH ile baglanip gelistirme yaparken oku.

---

## Ne?

**Marketly Price API** - Kripto/hisse/doviz/emtia fiyatlarini periyodik olarak ceker ve Supabase'e yazar.

**Port:** 3001
**Dil:** JavaScript (Node.js 18+)
**Framework:** Express.js
**Process Manager:** PM2 (production)
**Cron:** node-cron ile zamanlanmis gorevler

---

## Klasor Yapisi

backend/
â”œâ”€â”€ server.js                # Express app giris noktasi (port 3001)
â”œâ”€â”€ ecosystem.config.js      # PM2 konfigurasyonu
â”œâ”€â”€ package.json             # Dependencies
â”œâ”€â”€ .env                     # Ortam degiskenleri (GIT'E ATMA!)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â””â”€â”€ prices.js        # GET /api/prices, GET /api/prices/status
â”‚   â”œâ”€â”€ jobs/
â”‚   â”‚   â””â”€â”€ priceJob.js      # node-cron - periyodik fiyat guncelleme
â”‚   â””â”€â”€ services/
â”‚       â”œâ”€â”€ supabase.js      # Supabase admin client (service_role key)
â”‚       â”œâ”€â”€ coinGecko.js     # CoinGecko API entegrasyonu
â”‚       â”œâ”€â”€ yahooFinance.js  # Yahoo Finance entegrasyonu
â”‚       â”œâ”€â”€ finnhubService.js# Finnhub entegrasyonu
â”‚       â”œâ”€â”€ forexService.js  # Doviz kuru servisi
â”‚       â””â”€â”€ stocksService.js # Hisse senedi servisi

---

## Ortam Degiskenleri (.env)

PORT=3001
NODE_ENV=production
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # service_role key - admin yetkisi
FINNHUB_API_KEY=xxxx

**Kritik:** SUPABASE_SERVICE_KEY kullan, SUPABASE_ANON degil. Bu key RLS bypass eder.

---

## Kurulum (DigitalOcean Sunucu)

### Ilk Kurulum
# SSH ile baglan
ssh root@<sunucu-ip>

# Node.js 18+ kur
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# PM2 kur (global)
npm install -g pm2

# Proje klasorune git
cd /root/Marketly/backend

# Dependencies kur
npm install

# .env dosyasini olustur
nano .env

# Test
npm start
# -> http://<sunucu-ip>:3001/health calisir

# PM2 ile baslat (production)
pm2 start ecosystem.config.js
pm2 save
pm2 startup

---

## Komutlar

npm start                      # Dev modda baslat
npm run dev                    # nodemon ile hot reload
pm2 start ecosystem.config.js # Production baslat
pm2 restart marketly-api       # Yeniden baslat
pm2 stop marketly-api          # Durdur
pm2 logs marketly-api          # Canli log izle
pm2 status                     # Durum kontrol

---

## API Endpoint'leri

GET /health                     # Durum kontrolu
GET /api/prices                 # Tum guncel fiyatlar
GET /api/prices?category=crypto # Sadece kripto
GET /api/prices/status          # Cron job durumu

---

## Cron Job Zamanlamasi (src/jobs/priceJob.js)

Kripto  - her 2 dakika   (*/2 * * * *)
Hisse   - her 5 dakika   (*/5 * * * *)
Doviz   - her 10 dakika  (*/10 * * * *)
Emtia   - her 15 dakika  (*/15 * * * *)

---

## Supabase Baglantisi

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service_role key - RLS bypass
);

// Fiyat guncelleme
await supabase.from('asset_prices').upsert({
  asset_id: 'bitcoin',
  price: 65000.50,
  change_percent: 2.35,
  updated_at: new Date().toISOString()
}, { onConflict: 'asset_id' });

---

## Dis API'ler ve Rate Limitler

CoinGecko     50 req/min   Ucretsiz   Kripto fiyat + OHLC
Yahoo Finance Sinirsiz     Ucretsiz   Hisse fiyatlari
Finnhub       60 req/min   API key    Borsa verileri

**Not:** CoinGecko rate limit asarsan 429 hatasi alirsin. Cron interval'i uzat (2dk -> 3dk).

---

## Hata Ayiklama

# Port 3001 zaten kullaniliyor
lsof -i :3001              # Linux/Mac
netstat -ano | findstr :3001  # Windows
kill -9 <PID>

# PM2 loglari
pm2 logs marketly-api --lines 100
pm2 logs marketly-api --err

# Supabase baglanti hatasi
- .env'de SUPABASE_SERVICE_KEY dogru mu kontrol et
- Supabase Dashboard -> Settings -> API -> service_role key kopyala

# CoinGecko 429 hatasi
- Rate limit asildi -> priceJob.js'de cron interval'i uzat

---

## Guvenlik

- .env dosyasini GIT'E ATMA (.gitignore'da olmali)
- SUPABASE_SERVICE_KEY hassas - RLS bypass eder
- Sunucuya sadece SSH ile eris (port 22)
- Production'da HTTPS reverse proxy kullan (Nginx/Caddy)

---

## Mobil Uygulama ile Entegrasyon

Mobil app useMarketPrices hook'u su endpoint'i kullanir:
const API_URL = 'http://<sunucu-ip>:3001/api/prices';
// veya production'da: https://api.marketly.app/api/prices

Sunucu IP degisirse mobil app'te bu URL'i guncelle.

---

## Bakim

# Gunluk log kontrolu
pm2 logs marketly-api --lines 50

# Haftalik durum kontrolu
pm2 status
curl http://localhost:3001/health
curl http://localhost:3001/api/prices/status

# Aylik guncelleme
cd /root/Marketly/backend
git pull origin master
npm install
pm2 restart marketly-api

---

*Oturum 11 - Mart 2026*
*Mobil app dokumantasyonu: ../PROJECT_CONTEXT.md*
