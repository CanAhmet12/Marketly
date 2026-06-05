import type { MediaItem } from "@/features/feed/types";
import { MOCK_THUMBMASTER_60 } from "@/mock/media/thumbnail-urls";

import { MOCK_PROFILE_IDS } from "./profiles";
import { MOCK_SIGNAL_ROWS } from "./signals";
import { MOCK_SHORT_MP4, MOCK_SAMPLE_MP4 } from "./videos";

export type MockPostSource = {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  content: string;
  asset_tag: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  media_urls: MediaItem[] | null;
  likes: number;
  comments: number;
  views_count: number;
  shares_count: number;
  created_at: string;
  quoted_post_id: string | null;
  /** Zincir üstü (mock / web) */
  reply_to_post_id?: string | null;
  composer_intent_id?: string | null;
  quoted_signal_id?: string | null;
  target_room_id?: string | null;
  target_topic_slug?: string | null;
  scheduled_publish_at?: string | null;
  discussion_anchor_post_id?: string | null;
  description: string | null;
  duration: number | null;
  mentioned_users: string[] | null;
  link_preview: null;
};

const SNIPPETS = [
  "Teknik analiz + temel faktörleri birleştirdim. Risk/ödül oranı çok iyi.",
  "Seviye testleri tamamlandı, hacim onayı geldi. Pozisyon küçük tutuyorum.",
  "Makro veri öncesi pozisyon küçülttüm, şu an %30 nakit.",
  "Momentum güçlü ama stop seviyesi kritik. Kırılırsa direkt çıkıyorum.",
  "VIOP tarafında teminat optimizasyonu yaptım, açıklıyorum.",
  "Kırılımı beklemek yerine erken girdim. RR iyi, hacim takipteyim.",
  "Portföy dengesi: %40 hisse, %30 kripto, %20 dolar, %10 nakit.",
  "Funding rate pozitif, long pozisyonları riskli. Dikkatli olun.",
  "Stüdyo yayınında tüm seviyeleri detaylı gösteriyorum, katılın.",
  "Bilanço açıklandı, marj beklentiyi karşıladı ama hisse tepki vermiyor.",
];

function pid(n: number): string {
  return `mock-profile-${String(n).padStart(2, "0")}`;
}

/** 60 içerik — creator çeşitliliği (uzmanlık/thumbnail dili profiles + media identity ile uyumlu) */
const CREATOR_ORDER: string[] = [
  ...[5, 2, 11, 7, 1, 16, 17, 9, 6, 10, 4, 11, 5, 2, 8, 1, 7, 16, 11, 3, 5, 14, 15, 2, 17].map(pid),
  ...[2, 10, 5, 7, 2, 16, 8, 12, 4, 2, 10, 5].map(pid),
  ...[8, 18, 3, 8, 1, 6, 13, 10, 18, 3].map(pid),
  ...[5, 2, 7, 16, 11, 17, 1, 14].map(pid),
  ...[12, 4, 13, 3, 6].map(pid),
];

const TITLES60: string[] = [
  "Bitcoin 68K: kırılım mı tuzak mı? (Seviye haritası)",
  "BIST bankaları — takas ve cari ayrışma",
  "Fed dot plot sonrası Dolar/TL senaryoları",
  "ASELSAN sipariş hattı: fiyatlama ne diyor?",
  "Yeni başlayanlar: stop avından korunma rehberi",
  "5 varlıkla portföy dengeleme (pratik şema)",
  "Altın 2300: ons-gram ayrışması trade fırsatı mı?",
  "THYAO — doluluk ve marj: çeyrek sonrası plan",
  "Ethereum L2: ücret + hacim kimin lehine?",
  "XU100’de hacim onayı olmadan işlem yok",
  "VIOP teminat güncellemesi — örnek hesap",
  "Gram altın: yerel talep vs küresel faiz",
  "BTC dominans düşerken altcoin seçimi",
  "GARAN bilanço: net faiz marjı ve hisse",
  "NASDAQ düzeltmesi: 3 risk işareti",
  "RSI aşırı alım: yanlış sinyal tuzakları",
  "Fed öncesi pozisyon küçültme checklist",
  "Likidite avcıları için intraday plan",
  "Funding pozitifken short squeeze riski",
  "XU030 dar panoda hisse seçimi (filtre)",
  "VIOP marj örneği: pratik tablo",
  "Stop taşıma: kural + örnek grafik",
  "Seans kapanışı: hacim patlaması okuması",
  "Günlük trade disiplin özeti (15 dk)",
  "Haftalık makro takvim — tek ekranda özet",
  "SHORT: BTC funding şoku — 60 sn plan",
  "SHORT: THYAO kırılım anı — tepki trade",
  "SHORT: ETH gas spike — ne yapmalı?",
  "SHORT: Dolar/TL haber öncesi volatilite",
  "SHORT: XU100 açılış ilk 5 dk",
  "SHORT: Altın korelasyon koptu mu?",
  "SHORT: SOL momentum — risk notu",
  "SHORT: VIOP hızlı scalping hatırlatması",
  "SHORT: Bankacılık sepeti — kısa vade",
  "SHORT: Kripto borsa derinliği 60 sn",
  "SHORT: RSI dip — teyit mumu",
  "SHORT: EURTRY — haber öncesi volatilite planı",
  "CANLI: ABD enflasyonu anlık yorum + seviyeler",
  "CANLI: Seans açılışı — bankacılık ve endeks",
  "CANLI: Kripto funding şoku — soru-cevap",
  "CANLI: Kapanış öncesi hacim patlaması",
  "CANLI: VIOP straddle maliyeti canlı hesap",
  "CANLI: Altın ve dolar birlikte hareket",
  "CANLI: NDX — teknoloji sepeti anlık",
  "CANLI: Fed konuşması öncesi pozisyon",
  "CANLI: BIST yabancı takas akışı",
  "CANLI: Ethereum güncellemesi sonrası piyasa",
  "[Sinyal] BTC — 4H yapı ve risk/ödül bölgesi",
  "[Sinyal] THYAO — bilanço sonrası teknik hedef",
  "[Sinyal] USDTRY — haftalık pivot senaryoları",
  "[Sinyal] XAUUSD — kırılım ve teyit seviyeleri",
  "[Sinyal] ETH — likidite haritası (kısa vade)",
  "[Sinyal] XU100 — endeks mi hisse mi ayrışması?",
  "[Sinyal] ASELS — sipariş beklentisi fiyatlaması",
  "[Sinyal] GARAN — marj ve temettü etkisi",
  "Topluluk: Bu hafta en çok sorulan 7 teknik soru",
  "KAP duyurusu sonrası fiyat davranışı — tartışma",
  "Yeni başlayanlar için kontrol listesi (PDF özet)",
  "Makro: faiz eğrisi ve risk iştahı — notlar",
  "Portföy hedge: dolar + altın dengesi (topluluk)",
];

/** Başlık havuzları — slot ile uyumlu (CANLI satırı “live” tipine SHORT başlığı gitmesin). */
const TITLE_LIVE = TITLES60.filter((x) => x.startsWith("CANLI:"));
const TITLE_PULSE = TITLES60.filter((x) => x.startsWith("SHORT:"));
const TITLE_SIGNAL = TITLES60.filter((x) => /^\[sinyal\]/i.test(x));
const TITLE_LONG_VIDEO = TITLES60.filter(
  (x) => !x.startsWith("SHORT:") && !x.startsWith("CANLI:") && !/^\[sinyal\]/i.test(x),
);
const TITLE_TEXT_POST = TITLES60.filter(
  (x) => !x.startsWith("SHORT:") && !x.startsWith("CANLI:") && !/^\[sinyal\]/i.test(x),
);

type Slot = "video" | "short" | "live" | "signal" | "post";

const SLOT_ORDER: Slot[] = [
  ...Array.from({ length: 11 }, () => "video" as const),
  ...Array.from({ length: 12 }, () => "short" as const),
  ...Array.from({ length: 8 }, () => "live" as const),
  ...Array.from({ length: 12 }, () => "signal" as const),
  ...Array.from({ length: 17 }, () => "post" as const),
];

function buildOne(i: number): MockPostSource {
  const slot = SLOT_ORDER[i]!;
  const signalBlockStart = SLOT_ORDER.findIndex((s) => s === "signal");
  const catalogForSignal = slot === "signal" ? MOCK_SIGNAL_ROWS[(i - signalBlockStart) % MOCK_SIGNAL_ROWS.length]! : null;

  let id = `mock-post-${String(i + 1).padStart(3, "0")}`;
  let user_id = CREATOR_ORDER[i] ?? MOCK_PROFILE_IDS[i % MOCK_PROFILE_IDS.length];
  if (catalogForSignal) {
    id = catalogForSignal.id;
    user_id = catalogForSignal.creator_id;
  }
  const likes = catalogForSignal != null ? catalogForSignal.likes_count : 420 + ((i * 97) % 22_000);
  const comments = catalogForSignal != null ? Math.max(0, Math.floor(catalogForSignal.copies_count / 80)) : 6 + ((i * 19) % 890);
  const views =
    catalogForSignal != null
      ? catalogForSignal.copies_count * 12 + 1000
      : slot === "live"
        ? 840 + ((i * 1_049) % 92_000)
        : 3_100 + ((i * 311) % 1_200_000);
  const created =
    catalogForSignal != null
      ? catalogForSignal.created_at
      : new Date(Date.UTC(2026, 4, 12 - (i % 52), 8 + (i % 10), (i * 11) % 60)).toISOString();

  const thumb = MOCK_THUMBMASTER_60[i]!;

  const assetsPool = [
    "BTC",
    "ETH",
    "XU100",
    "THYAO",
    "ASELS",
    "GARAN",
    "USDTRY",
    "XAUUSD",
    "NDX",
    "SPX",
    "SOL",
    "AVAX",
    "VIOP",
    "EURTRY",
    "GRAM",
    null,
  ];
  const asset_tag =
    slot === "signal" ? catalogForSignal!.symbol : assetsPool[i % assetsPool.length];

  let title: string;
  if (slot === "live") {
    title = TITLE_LIVE[i % Math.max(1, TITLE_LIVE.length)] ?? `CANLI: Yayın ${i + 1}`;
  } else if (slot === "short") {
    title = TITLE_PULSE[i % Math.max(1, TITLE_PULSE.length)] ?? `Pulse ${i + 1}`;
  } else if (slot === "video") {
    title = TITLE_LONG_VIDEO[i % Math.max(1, TITLE_LONG_VIDEO.length)] ?? `Video analizi ${i + 1}`;
  } else if (slot === "signal") {
    title =
      TITLE_SIGNAL[(i - signalBlockStart) % Math.max(1, TITLE_SIGNAL.length)] ?? `[Sinyal] ${String(asset_tag)}`;
  } else {
    title = TITLE_TEXT_POST[i % Math.max(1, TITLE_TEXT_POST.length)] ?? `Piyasa notu ${i + 1}`;
  }

  let type: string;
  let video_url: string | null = null;
  let thumbnail_url: string | null = thumb;
  let image_url: string | null = null;
  let media_urls: MediaItem[] | null = null;
  let duration: number | null = null;

  if (slot === "video") {
    type = "video";
    video_url = MOCK_SAMPLE_MP4;
    duration = 180 + ((i * 41) % 5400);
    media_urls = [
      {
        url: MOCK_SAMPLE_MP4,
        type: "video",
        thumbnail_url: thumb,
        duration: duration ?? 596,
        width: 1280,
        height: 720,
      },
    ];
  } else if (slot === "short") {
    type = "pulse";
    video_url = MOCK_SHORT_MP4;
    duration = 12 + (i % 40);
    media_urls = [
      {
        url: MOCK_SHORT_MP4,
        type: "video",
        thumbnail_url: thumb,
        duration: duration ?? 15,
        width: 720,
        height: 1280,
      },
    ];
  } else if (slot === "live") {
    type = "live";
    video_url = MOCK_SAMPLE_MP4;
    duration = null;
    media_urls = [
      {
        url: MOCK_SAMPLE_MP4,
        type: "video",
        thumbnail_url: thumb,
        width: 1280,
        height: 720,
      },
    ];
  } else if (slot === "signal") {
    type = "signal";
    video_url = null;
    duration = null;
    thumbnail_url = null;
    image_url = null;
    media_urls = null;
  } else {
    type = "post";
    video_url = null;
    duration = null;
    const withImage = i % 2 === 0;
    if (withImage) {
      image_url = thumb;
      media_urls = [{ url: thumb, type: "image", width: 1280, height: 720 }];
    } else {
      image_url = null;
      media_urls = null;
      thumbnail_url = thumb;
    }
  }

  const content =
    catalogForSignal != null
      ? `${catalogForSignal.rationale} — ${SNIPPETS[i % SNIPPETS.length]}`
      : `${title} — ${SNIPPETS[i % SNIPPETS.length]}`;

  return {
    id,
    user_id,
    type,
    title,
    content,
    asset_tag,
    video_url,
    thumbnail_url,
    image_url,
    media_urls,
    likes,
    comments,
    views_count: views,
    shares_count: Math.max(0, Math.floor(comments / 4)),
    created_at: created,
    quoted_post_id: null,
    description: type === "post" ? SNIPPETS[(i + 2) % SNIPPETS.length] : null,
    duration,
    mentioned_users: null,
    link_preview: null,
  };
}

export const MOCK_POST_SOURCES: MockPostSource[] = Array.from({ length: 60 }, (_, i) => buildOne(i)).sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
);

export const MOCK_POST_BY_ID: Record<string, MockPostSource> = Object.fromEntries(MOCK_POST_SOURCES.map((p) => [p.id, p]));
