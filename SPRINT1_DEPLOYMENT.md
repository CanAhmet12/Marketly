# SPRINT 1 — KURULUM VE DEPLOY KILAVUZU

> Sunucu: `134.122.84.92` (DigitalOcean, Ubuntu, Frankfurt)  
> Bu kılavuzu **adım adım** takip et. Her adım tamamlanmadan sonrakine geçme.

---

## ADIM 1 — SUPABASE PROJESİ OLUŞTUR (10 dakika)

### 1.1 Proje Oluştur
1. https://supabase.com adresine git
2. "Start your project" → GitHub ile giriş yap
3. "New project" → Proje adı: `marketly`
4. Bölge: **Frankfurt (EU Central)** seç (sunucu ile aynı)
5. Güçlü bir DB şifresi belirle (kaydet!)(Ahmetcan65.65)
6. "Create new project" — 2-3 dakika bekle

### 1.2 API Anahtarlarını Al
1. Supabase Dashboard → **Project Settings** → **API**
2. Şunları kopyala ve not al:
   - `Project URL` → `https://xxxxx.supabase.co` (https://ufljsnqxvqzichwlpfgy.supabase.co)
   - `anon public` key (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGpzbnF4dnF6aWNod2xwZmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjM4OTgsImV4cCI6MjA4Nzc5OTg5OH0.OKGqidAABpQiTt3t03YKaCTjQrA42JUMggUfhZfEmjE)
   - `service_role` key (gizli, sadece backend için) (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGpzbnF4dnF6aWNod2xwZmd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMzg5OCwiZXhwIjoyMDg3Nzk5ODk4fQ.QjVMbipg7LPJVljgDx6QXkCuL0lTpkgcC8ia0cmK0Is)

### 1.3 Veritabanı Şemasını Çalıştır
1. Supabase Dashboard → **SQL Editor** → **New query**
2. `backend/schema.sql` dosyasının tüm içeriğini yapıştır
3. **Run** butonuna bas → Tüm tablolar oluşur
4. Hata varsa tekrar dene (genellikle ilk çalışmada tamam olur)

### 1.4 Realtime Aktif Et
1. Supabase Dashboard → **Database** → **Replication**
2. `asset_prices` tablosunu bul → **toggle** ile aktif et
3. Bu sayede fiyat güncellemeleri anlık telefona yansır

---

## ADIM 2 — REACT NATIVE AYARLARI (5 dakika)

### 2.1 .env Dosyası Oluştur
Marketly proje klasöründe `.env` dosyası oluştur:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON=your_anon_public_key_here
EXPO_PUBLIC_API_BASE=http://134.122.84.92:3001
```

> **DIKKAT:** `YOUR_PROJECT_ID` ve `your_anon_public_key_here` yerine  
> Adım 1.2'de aldığın gerçek değerleri yaz.

### 2.2 Paketleri Kur
Marketly proje klasöründe PowerShell'de çalıştır:
```powershell
cd "C:\Users\AHMET CAN\Desktop\Marketly"
npm install @supabase/supabase-js expo-secure-store @react-native-async-storage/async-storage react-native-url-polyfill --legacy-peer-deps
```

### 2.3 lib/supabase.ts Güncelle
`lib/supabase.ts` dosyasını aç, üst kısımdaki sabit değerleri düzelt:
```typescript
// BU SATIRI SİL:
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON || 'YOUR_ANON_KEY';

// ZATEN DOĞRU YAZILMIŞ — .env dosyası okunduktan sonra çalışır
```

### 2.4 hooks/useMarketPrices.ts Güncelle
`hooks/useMarketPrices.ts` dosyasında 7. satırı bul:
```typescript
const API_BASE = 'http://134.122.84.92:3001';
```
Bu zaten doğru sunucu IP'si — değiştirmene gerek yok.

---

## ADIM 3 — SUNUCUYA BAĞLAN (5 dakika)

### 3.1 SSH ile Bağlan
PowerShell'de:
```powershell
ssh root@134.122.84.92
```
DigitalOcean'ın sana e-posta ile gönderdiği root şifresini gir.
İlk bağlantıda şifre değiştirmen istenebilir — yeni güçlü şifre belirle.

### 3.2 Sistemi Güncelle
```bash
apt update && apt upgrade -y
```
2-3 dakika sürer, bekle.

---

## ADIM 4 — SUNUCUYA NODE.JS KUR (5 dakika)

```bash
# Node.js 20 LTS kur (NodeSource resmi repo)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Versiyon kontrolü
node --version    # v20.x.x olmalı
npm --version     # 10.x.x olmalı

# PM2 kur (process manager — sunucu yeniden başlayınca auto-start)
npm install -g pm2

# PM2 log klasörü
mkdir -p /var/log/pm2
```

---

## ADIM 5 — BACKEND KODU SUNUCUYA YÜKlE (10 dakika)

### Yöntem A: SCP ile (Önerilen)
Yerel makinende PowerShell'de:
```powershell
# Backend klasörünü sunucuya kopyala
scp -r "C:\Users\AHMET CAN\Desktop\Marketly\backend" root@134.122.84.92:/root/marketly-backend
```

### Yöntem B: Git ile (Gelecekte kullanım için)
```bash
# Sunucuda:
git clone https://github.com/YOUR_USERNAME/marketly.git
cd marketly/backend
```

---

## ADIM 6 — BACKEND YAPILANDIR (10 dakika)

```bash
# Sunucuda:
cd /root/marketly-backend

# Bağımlılıkları kur
npm install

# .env dosyası oluştur
cp .env.example .env
nano .env
```

`.env` dosyasına şunları yaz:
```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

COINGECKO_API_KEY=

PORT=3001
NODE_ENV=production
PRICE_UPDATE_INTERVAL=30
```

> `SUPABASE_SERVICE_KEY` = Adım 1.2'de aldığın **service_role** key  
> **ASLA** anon key kullanma — service key tam yetkili

Kaydet: `Ctrl+X` → `Y` → `Enter`

---

## ADIM 7 — BACKEND'İ BAŞLAT (5 dakika)

```bash
cd /root/marketly-backend

# Test olarak elle çalıştır (hata varsa görürsün)
node server.js
```

Beklenen çıktı:
```
🚀 Marketly API başlatıldı → http://0.0.0.0:3001
📡 Ortam: production
⏰ Fiyat güncelleme: her 30 saniye

[PriceJob] Başlatıldı (her 30 saniye)
[PriceJob] Fiyat güncellemesi başlatılıyor...
[PriceJob] ✅ #1 | 32 varlık güncellendi | 2847ms
```

Ctrl+C ile durdur, sonra PM2 ile başlat:

```bash
# PM2 ile başlat (arka planda çalışır)
pm2 start ecosystem.config.js

# Sunucu yeniden başlayınca otomatik başlaması için
pm2 startup
# → Çıkan komutu kopyala ve çalıştır (sudo ile başlar)

pm2 save

# Logları izle
pm2 logs marketly-api --lines 50
```

---

## ADIM 8 — GÜVENLIK DUVARI AYARLA (5 dakika)

```bash
# UFW güvenlik duvarı
ufw allow ssh
ufw allow 3001/tcp    # API portu (React Native bağlantısı)
ufw allow 80/tcp      # İleride Nginx için
ufw allow 443/tcp     # İleride HTTPS için
ufw --force enable

# Durum kontrol
ufw status
```

---

## ADIM 9 — API ÇALIŞIYOR MU? TEST ET (2 dakika)

Yerel makinende tarayıcıdan veya PowerShell'de:

```powershell
# Sağlık kontrolü
Invoke-WebRequest -Uri "http://134.122.84.92:3001/health" | Select-Object -ExpandProperty Content

# Beklenen:
# {"status":"ok","service":"Marketly API","version":"1.0.0",...}

# Tüm fiyatları al
Invoke-WebRequest -Uri "http://134.122.84.92:3001/api/prices" | Select-Object -ExpandProperty Content
```

---

## ADIM 10 — UYGULAMAYI TEST ET (5 dakika)

```powershell
# Yerel makinende Expo'yu yeniden başlat
cd "C:\Users\AHMET CAN\Desktop\Marketly"
npx expo start --clear
```

Telefonda uygulamayı aç:
- **Piyasalar** sekmesine git
- Fiyatlar gerçek olmalı (BTC ~$67K vs.)
- Sağ üstte `↻` yükleme işareti görünürse backend'den veri geliyor
- Varlığa tıkla → Detay sayfası gerçek fiyat göstermeli

---

## SORUN GİDERME

| Sorun | Çözüm |
|---|---|
| API bağlanamıyor | `ufw status` kontrol et, 3001 açık mı? |
| "Invalid API key" | Supabase service_role key doğru mu? |
| Fiyatlar gelmiyor | `pm2 logs marketly-api` — CoinGecko rate limit mi? |
| Uygulama crash | `expo start --clear` ile cache temizle |
| Supabase bağlanamıyor | `.env` EXPO_PUBLIC_ prefix'leri doğru mu? |

### Log Komutları
```bash
# Sunucuda canlı log izle
pm2 logs marketly-api --lines 100

# Son hataları gör
pm2 logs marketly-api --err --lines 50

# Job durumu
curl http://localhost:3001/api/prices/system/status
```

---

## SPRINT 1 TAMAMLANDI ✅

Tüm adımlar başarılıysa:
- ✅ Supabase veritabanı kurulu
- ✅ Gerçek fiyat verisi 30 saniyede bir güncelleniyor
- ✅ Supabase Realtime → telefona anlık yansıyor
- ✅ Gerçek auth (email/şifre + Google)
- ✅ Backend PM2 ile 7/24 çalışıyor
- ✅ Güvenlik duvarı aktif

**Sonraki adım:** Sprint 2 — RevenueCat + Pro Üyelik Sistemi

---

> Not: HTTPS (SSL) için Nginx + Certbot kurulumu Sprint 2'de yapılacak.  
> Şimdilik HTTP ile çalışıyor, App Store/Play Store'a göndermeden önce zorunlu.
