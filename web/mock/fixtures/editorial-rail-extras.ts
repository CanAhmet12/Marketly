import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";

/** Ekonomi takvimi — rail “Bugün” (yalnızca mock editorial yoğunluğu). */
export const EDITORIAL_MOCK_TODAY: HomeVisualRailLink[] = [
  {
    label: "TCMB — faiz kararı",
    meta: "14:00",
    detail: "Piyasa: 250 bp indirim fiyatlı; TL volatilitesi haber öncesi sıkışık.",
    tone: "flat",
  },
  {
    label: "ABD — perakende satışlar",
    meta: "16:30",
    detail: "Tüketim momentumu ve dolar endeksi için ikincil okuma.",
    tone: "up",
  },
  {
    label: "Euro Bölgesi — PMI hizmet",
    meta: "17:00",
    detail: "Hizmet sektörü genişleme hızı; EUR çaprazlarında haber öncesi dar bant.",
    tone: "down",
  },
  {
    label: "BIST — açılış seansı özeti",
    meta: "10:10",
    detail: "Yabancı takas ve bankacılık ağırlıklı hacim dağılımı.",
    tone: "up",
  },
  {
    label: "OPEC+ — arz yönlendirmesi",
    meta: "Yarın",
    detail: "Ham petrol eğrisi; enerji hisseleri ve TRY enflasyon kanalı.",
    tone: "flat",
  },
];

/** Trend / tartışma yoğunluğu — “Bugün konuşulanlar”. */
export const EDITORIAL_MOCK_TRENDING: HomeVisualRailLink[] = [
  { label: "#XU100", meta: "3,8b görüntülenme", rank: 1, trendDelta: "+9%", trendDeltaAccent: "up" },
  { label: "#FedBejKitap", meta: "1,4b görüntülenme", rank: 2, trendDelta: "+6%", trendDeltaAccent: "up" },
  { label: "#BTCETF", meta: "982b görüntülenme", rank: 3, trendDelta: "−3%", trendDeltaAccent: "down" },
  { label: "#THYAO", meta: "740b görüntülenme", rank: 4, trendDelta: "+4%", trendDeltaAccent: "up" },
  { label: "#VIOP", meta: "510b görüntülenme", rank: 5, trendDelta: "+1%", trendDeltaAccent: "up" },
  { label: "#NVDA", meta: "480b görüntülenme", rank: 6, trendDelta: "−2%", trendDeltaAccent: "down" },
  { label: "#GRAMALTIN", meta: "395b görüntülenme", rank: 7, trendDelta: "+2%", trendDeltaAccent: "up" },
  { label: "#TSLA", meta: "360b görüntülenme", rank: 8, trendDelta: "+5%", trendDeltaAccent: "up" },
];

/** Soğuk başlangıçta intel boşsa rail ilgisini dolduran yedek küme (çakışma yok). */
export const EDITORIAL_MOCK_INTERESTS_FALLBACK: HomeVisualRailLink[] = [
  { label: "Makro faiz & eğri", meta: "yüksek", chipStrength: "high" },
  { label: "BIST bankacılık akışı", meta: "yüksek", chipStrength: "high" },
  { label: "Kripto likidite", meta: "orta", chipStrength: "mid" },
  { label: "Emtia & enerji", meta: "orta", chipStrength: "mid" },
  { label: "Opsiyon volatilitesi", meta: "hafif", chipStrength: "low" },
  { label: "ETF akışları", meta: "hafif", chipStrength: "low" },
];
