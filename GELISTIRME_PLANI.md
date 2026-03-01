# Marketly – Geliştirme Planı

## Mimari Karar

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Framework | **Expo (React Native)** | iOS + Android tek kod, hızlı geliştirme |
| Durum | Önce mock data | Backend bağımsız çalışan tam UI |
| Sonra | Supabase veya API | Auth, veritabanı, video storage |

---

## Fazlar

### Faz 1: İskelet (✓ Başlangıç)
- Expo projesi kurulumu
- 6 sekmeli bottom tab navigation
- Tema: koyu mod, yeşil vurgular
- Tüm ekranların boş shell’leri

### Faz 2: Ana Sayfa (Akış)
- Üst bar: profil, logo, arama, bildirim
- Kategori chip’leri (For You, Hisseler, Kripto, Emtialar, LIVE)
- Hızlı erişim ikonları (Trending, BIST100, Bitcoin, Altın, Nasdaq, LIVE)
- Video kartları grid (mock data)
- Kart içeriği: thumbnail, LIVE etiketi, varlık tag’leri, fiyat, % değişim, etkileşim ikonları

### Faz 3: Auth + Profil
- Kayıt / giriş ekranları
- Profil sayfası (avatar, takipçi, Videolarım, Kaydettiklerim, Beğendiklerim)
- Basit local auth (AsyncStorage) – sonra Supabase ile değiştirilebilir

### Faz 4: Etkileşimler
- Video detay / player ekranı
- Beğeni, yorum, kaydet, paylaş
- Sayıların güncellenmesi

### Faz 5: Diğer Ekranlar
- Keşfet (Trend, Bugün Piyasalarda, Eğitim, vb.)
- Piyasalar (Endeksler, Hisseler, Emtialar – mock fiyatlar)
- Canlı Yayın (placeholder – MVP’de canlı stream olmayabilir)

### Faz 6: Üret (+)
- Video yükleme / kayıt akışı
- Başlık, kategori, etiket
- Disclaimer otomatik

### Faz 7: Backend Entegrasyonu (Opsiyonel)
- Supabase: Auth, PostgreSQL, Storage
- Gerçek video stream, gerçek veri

---

## Klasör Yapısı

```
Marketly/
├── app/
│   ├── (tabs)/           # Tab ekranları
│   ├── (auth)/           # Auth ekranları
│   └── _layout.tsx
├── components/
├── constants/
├── hooks/
├── data/                 # Mock data
└── package.json
```

---

## Renk Paleti (Görsele Uygun – Açık Tema)

- `#F5F5F5` – Arka plan
- `#FFFFFF` – Kart / üst bar arka plan
- `#00C853` – Yeşil vurgu (primary)
- `#E53935` – Kırmızı (düşüş, LIVE)
- `#FFFFFF` – Beyaz metin
- `#9E9E9E` – Gri (secondary)
