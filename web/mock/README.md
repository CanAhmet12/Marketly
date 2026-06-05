# Marketly web — mock veri katmanı

## Neden `fixtures/` klasörü?

Repo kökündeki `.cursorignore` kuralı `data/` dizinini hariç tutuyor; `web/mock/data/` bu yüzden araçlar tarafından engellenebiliyor. İçerik aynı: örnek profil, gönderi, yorum ve piyasa verileri `web/mock/fixtures/` altında toplanır.

## Aç / kapat

Dosya **`web/.env.local`** (Next uygulaması kökü = `web/`, proje kökü değil):

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Kabul edilen değerler (büyük/küçük harf duyarsız): `true`, `1`, `yes`, `on`.

- Varsayılan: kapalı (tanımsız veya boş).
- **`NODE_ENV=production`**: env ne olursa olsun mock **kapalı** (`config.ts`).
- `.env.local` değiştirdikten sonra **`npm run dev` sürecini yeniden başlatın** (Next env’i derlemede gömer).

## Mimari

| Bölüm | Açıklama |
|--------|----------|
| `config.ts` | `isMockDataEnabled()`, prod kilidi |
| `fixtures/*` | Salt veri (Supabase’e gömülmez) |
| `adapters/*` | UI tiplerine (`FeedPost`, `WatchPostDetail`, …) dönüşüm |
| `mock-mode-badge.tsx` | Topbar’da küçük uyarı |

Gerçek `fetch*.ts` dosyalarının **en başında** `isMockDataEnabled()` kontrolü ile adapter’a dallanır; Supabase sorgu gövdeleri değiştirilmez.

## Kaldırma

1. `NEXT_PUBLIC_USE_MOCK_DATA` kaldır veya `false` yap.
2. İstersen tüm `web/mock/` klasörünü ve fetch dosyalarındaki `if (isMockDataEnabled())` bloklarını sil.

## Test

```bash
cd web
npm run lint
npm run build
```

Mock açıkken yerel önizleme: `NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev` (production build’de mock zaten kapalı).
