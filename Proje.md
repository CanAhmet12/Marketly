# MARKETLY – Proje Dokümanı

> Finans odaklı kısa video ve canlı yayın sosyal medya platformu

---

## 1. Proje Özeti

**Marketly**, sadece finans içeriklerine odaklanan bir sosyal medya uygulamasıdır.

| Benzer Platformlar      | Marketly              |
|-------------------------|----------------------|
| YouTube, TikTok, Instagram Reels | **Finans versiyonu** |

**Temel fikir:** Finans bilgisini kısa (30–60 saniye), hızlı ve anlaşılır sosyal medya formatında sunmak.

---

## 2. Platform Kapsamı

### ✅ Neler Yer Alır?
- Hisse senetleri
- Endeksler (BIST, S&P 500, Nasdaq vb.)
- Emtialar (Altın, Gümüş, Petrol)
- Döviz
- Makroekonomi
- Finansal okuryazarlık
- Piyasa psikolojisi
- Kripto (bir kategori olarak)

### ❌ Kesinlikle Olmayanlar
- Eğlence, vlog, lifestyle, mizah, oyun
- Kişisel / genel içerik
- **Not:** Kripto ana odak değildir, kategorilerden biridir.

---

## 3. Hukuki Kurallar (Zorunlu)

| Yasak                          | Açıklama                |
|--------------------------------|-------------------------|
| "Al", "Sat", "Kesin kazanç"    | Bu tür ifadeler yasak   |
| Yatırım tavsiyesi              | Hiç verilmez            |
| Garanti getiri                 | İma edilemez            |

### Zorunlu Uyarı Metni

> *"Bu platformda paylaşılan içerikler yatırım tavsiyesi değildir. Eğitim ve bilgilendirme amaçlıdır."*

**Gösterim yerleri:** İlk açılış, video yükleme ekranı, içerik üretici profilleri, her video kartında (küçük etiket).

---

## 4. Kullanıcı Tipleri

| Tip              | Yapabilecekleri                                            |
|------------------|-------------------------------------------------------------|
| **Standart**     | İzleme, beğeni, yorum, kaydetme, paylaşım                   |
| **İçerik Üretici** | Video yükleme, canlı yayın, istatistikleri görüntüleme    |

**Üretici gereksinimleri:** Kuralları kabul etmek; finans dışı içerik otomatik reddedilir.

---

## 5. Alt Menü (6 Sekme)

| Sekme          | Açıklama                           |
|----------------|-------------------------------------|
| **Akış**       | Ana video feed                      |
| **Keşfet**     | Yeni finans içerikleri bulma        |
| **Üret (+)**   | Video yükleme (ortadaki büyük yeşil buton) |
| **Piyasalar**  | Piyasa bilgi ekranı                 |
| **Profil**     | Kullanıcı hesabı                    |
| **Canlı Yayın**| Tüm canlı yayınlar (ekstra sekme)   |

**Tasarım:** Ortadaki Üret butonu diğerlerinden daha büyük, yeşil daire içinde beyaz + ikonu.

---

## 6. Ana Sayfa (Akış) – Görsele Göre Detaylı Yerleşim

### 6.1 Üst Bar

| Konum | Öğe                | Açıklama                          |
|-------|--------------------|-----------------------------------|
| Sol   | Profil avatarı     | Yuvarlak, tıklanınca profil sayfasına gider |
| Orta  | Marketly logosu    | Yükselen yeşil çubuklar + "marketly" yazısı |
| Sağ   | Arama ikonu        | Arama ekranına gider              |
| Sağ   | Bildirim ikonu     | Okunmamış varsa kırmızı nokta     |

### 6.2 Kategori Chip’leri (Yatay Scroll)

For You | Hisseler | Kripto | Emtialar | LIVE

- Seçili chip: yeşil alt çizgi ile vurgulanır.
- Tıklanınca feed filtrelenir.
- **LIVE** seçildiğinde sadece canlı yayınlar gösterilir.

### 6.3 Hızlı Erişim İkonları (Yuvarlak)

| İkon      | Etiket    | İşlev                          |
|-----------|-----------|--------------------------------|
| Chart     | Trending  | Trend videolara filtre         |
| Bayrak    | BIST100   | BIST100 içeriklerine filtre    |
| Symbol    | Bitcoin   | Bitcoin içeriklerine filtre    |
| Bar       | Altın     | Altın içeriklerine filtre      |
| Logo      | Nasdaq   | Nasdaq içeriklerine filtre     |
| LIVE      | LIVE     | Canlı yayınlara filtre         |

Bu ikonlar tek tıkla ilgili varlık/kategoriye göre feed filtreler.

### 6.4 Video Kartları (Grid Düzeni)

**Layout:** Pinterest benzeri, farklı boyutlarda kartlar. 2 sütunlu grid, bazı kartlar daha geniş.

**Kart bileşenleri:**

| Öğe                 | Açıklama                                      |
|---------------------|-----------------------------------------------|
| Video / Thumbnail   | İçerik görseli                                |
| LIVE etiketi        | Canlı yayınsa sol üstte kırmızı LIVE          |
| Varlık etiketleri   | $BTC, $ETH vb. yeşil arka planlı chip’ler     |
| Video başlığı       | Başlık metni                                  |
| Fiyat bilgisi       | Sağda: güncel fiyat (örn. $66.482,12)        |
| Yüzde değişim       | Yeşil ^3,18% (yükseliş) / Kırmızı (düşüş)    |
| Etkileşim ikonları  | Beğeni (kalp), Yorum, Paylaş + sayıları       |
| Disclaimer etiketi  | "Yatırım tavsiyesi değildir" (küçük)         |

**Etkileşim sayıları:** Her kartta beğeni (2,49K), yorum (376), paylaşım (248) gösterilir.

### 6.5 Feed Davranışı

- Canlı yayın kartları ana feed’de normal videolarla birlikte yer alır.
- LIVE chip veya LIVE ikonuna tıklanınca sadece canlı yayınlar filtrelenir.
- Sıralama: izleme süresi, beğeni, yorum, kaydetme, ilgi alanları, takip edilen üreticiler.

---

## 7. Diğer Sayfalar

### 7.1 Keşfet
- Bölümler: Trend Videolar, Bugün Piyasalarda, Eğitim İçerikleri, Analist Videoları, Canlı Yayınlar.
- İçerik tipleri: Kısa analiz, grafik anlatımı, günlük özet, eğitim klipleri.

### 7.2 Üret (+) – Video Yükleme
- Adımlar: Video çek/yükle → Başlık (zorunlu) → Kategori (zorunlu) → Etiket (opsiyonel) → Disclaimer otomatik → Paylaş.
- Kurallar: 9:16 dikey format, 10–60 saniye, finans dışı içerik reddedilir.

### 7.3 Piyasalar
- Amaç: Bilgi ekranı (işlem yok). Sekmeler: Endeksler, Hisseler, Emtialar, Döviz, Makro.
- Varlık satırı: Ad, güncel fiyat, günlük değişim, mini grafik.
- Tıklanınca: O varlıkla ilgili videolar listelenir.

### 7.4 Profil
- Standart: Fotoğraf, kullanıcı adı, takipçi/takip, bio.
- Sekmeler: Videolarım, Kaydettiklerim, Beğendiklerim.
- Üretici için ek: Toplam izlenme, video sayısı, uzmanlık alanları, canlı yayın geçmişi.

### 7.5 Canlı Yayın (Alt Menü – Ekstra Sekme)
- Tüm aktif canlı yayınlar tek ekranda.
- Kategori/varlık bazlı filtre.
- Yayıncı bilgisi, izleyici sayısı.
- Kart tıklanınca yayına girilir.
- Canlı yayınlar ayrıca ana sayfa feed’inde ve LIVE chip/ikon ile de erişilebilir.

---

## 8. Tasarım Özellikleri (Görsele Göre)

- **Tema:** Koyu mod (dark mode), beyaz metin.
- **Renk paleti:** Yeşil vurgu rengi (chip seçimi, logo, butonlar, yükseliş göstergeleri).
- **Yükseliş/Düşüş:** Yeşil (^) yükseliş, kırmızı düşüş.
- **Kartlar:** Yuvarlatılmış köşeler, grid layout.
- **Alt menü:** Koyu arka plan, seçili sekme yeşil vurgulu.

---

## 9. Yorum ve Moderasyon

- Yorumlar açık.
- Spam filtresi, finans dışı yorum raporlanabilir.
- Küfür ve manipülasyon engellenir.

---

## 10. MVP (İlk Sürüm) Kapsamı

### ✅ Olacaklar
Kayıt/giriş, video izleme, video yükleme, beğeni, yorum, profil, keşfet.

### ❌ Olmayacaklar
Para transferi, abonelik, reklam, yatırım işlemi.

---

## 11. Teknik Beklentiler

- Mobil öncelikli mimari
- API tabanlı backend
- Video depolama optimizasyonu
- Ölçeklenebilir yapı

---

## 12. Proje Hedefi

Marketly; finans bilgisini sosyal formatta sunar, kısa sürede değer sağlar ve güvenli, regülasyona uygun çalışır.
