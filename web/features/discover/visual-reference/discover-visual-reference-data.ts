/**
 * Discover Visual Reference — static mock data.
 * Gerçek API / repo / Supabase bağlantısı yok.
 */

import {
  vrCreatorHref,
  vrLiveHref,
  vrPulseHref,
  vrSignalHref,
  vrVideoHref,
} from "./vr-static-hrefs";

/** Keşfet VR canlı kartları — Home/LiveCard ile aynı mantık: `thumb` URL + `onError` yedeği. */
export function vrLiveThumbUrl(seed: string, w = 960, h = 600): string {
  const s = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

/** Pulse kapakları — dikey kısa video; `object-cover` ile 9:16 alana sığar. */
export function vrPulseThumbUrl(seed: string, w = 720, h = 1040): string {
  const s = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

/** Uzun video kapakları — 16:9 thumbnail alanı. */
export function vrVideoThumbUrl(seed: string, w = 1280, h = 720): string {
  const s = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

export type VRLiveItem = {
  id: string;
  title: string;
  creator: string;
  handle: string;
  viewers: number;
  tag: string;
  /** Kapak görseli (public / picsum seed URL); yok veya hata olursa SVG sahne yedeği. */
  thumb: string | null;
  avatarColor: string;
  avatarInitial: string;
  href: string;
  /** Sohbet yoğunluğu — canlı “şu an oluyor” hissi */
  chatPerMin?: number;
  /** Yayın ısısı — görsel vurgu */
  heat?: "high" | "medium";
  /** Yayın / program satırı — lower-third */
  programLine?: string;
  /** Kanal markası */
  channelLine?: string;
  /** Sohbet ticker — kısa balon metinleri */
  chatBubbles?: [string, string];
  /** Yayın sunucusu mikro etiketi — “Yayında”, “Canlı masada” */
  hostKicker?: string;
};

export type VRPulseItem = {
  id: string;
  title: string;
  creator: string;
  durationLabel: string;
  views: number;
  tag: string;
  thumb: string | null;
  gradientFrom: string;
  gradientTo: string;
  href: string;
  /** Kısa yorum satırı — video hissi */
  hookLine?: string;
  avatarInitial?: string;
  avatarColor?: string;
  /** Kısa video formatı — üst etiket */
  formatLabel?: string;
};

export type VRVideoItem = {
  id: string;
  title: string;
  creator: string;
  handle: string;
  durationLabel: string;
  views: number;
  tag: string;
  /** 16:9 kapak; yok veya hata olursa SVG yedeği. */
  thumb: string | null;
  gradientFrom: string;
  gradientTo: string;
  avatarColor: string;
  avatarInitial: string;
  publishedAgo: string;
  href: string;
  /** Prestige / seri blok — program adı */
  seriesTitle?: string;
  /** Bölüm veya alt başlık */
  episodeLabel?: string;
};

export type VRSignalItem = {
  id: string;
  symbol: string;
  assetName: string;
  direction: "BUY" | "SELL" | "HOLD";
  entry: string;
  target: string;
  stop: string;
  timeframe: string;
  confidence: number;
  rationale: string;
  analyst: string;
  analystHandle: string;
  analystColor: string;
  rr: string;
  age: string;
  href: string;
};

export type VRMiniSignal = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "HOLD";
  change: string;
  positive: boolean;
  age: string;
  href: string;
};

export type VRMarketTicker = {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  href: string;
};

export type VRCreatorItem = {
  id: string;
  displayName: string;
  handle: string;
  specialty: string;
  tag: string;
  followers: string;
  contentFormats: string;
  isLive: boolean;
  avatarColor: string;
  avatarInitial: string;
  /** Yüz rail — foto portre (hata olursa initial fallback) */
  portraitUrl?: string;
  href: string;
};

/* ─── Live items ──────────────────────────────────────────────────────────── */
export const VR_LIVE_ITEMS: VRLiveItem[] = [
  {
    id: "live-1",
    title: "XU100 Direnci Kırıyor mu? Canlı Teknik Analiz",
    creator: "Mehmet Yıldız",
    handle: "@myildiz",
    viewers: 2841,
    tag: "XU100",
    thumb: vrLiveThumbUrl("marketly-vr-live-xu100-studio"),
    avatarColor: "#1a3a5c",
    avatarInitial: "M",
    href: vrLiveHref(0),
    chatPerMin: 142,
    heat: "high",
  },
  {
    id: "live-2",
    title: "BTC/USD Likidite Haritası — Sabah Seansı",
    creator: "Crypto Desk TR",
    handle: "@cryptodesk",
    viewers: 1640,
    tag: "BTC/USD",
    thumb: vrLiveThumbUrl("marketly-vr-live-btc-desk"),
    avatarColor: "#2d1b4e",
    avatarInitial: "C",
    href: vrLiveHref(1),
    chatPerMin: 98,
    heat: "high",
  },
  {
    id: "live-3",
    title: "Fed Toplantısı Sonrası Dolar / TL Senaryoları",
    creator: "Elif Koç",
    handle: "@elifkoc",
    viewers: 3205,
    tag: "USD/TRY",
    thumb: vrLiveThumbUrl("marketly-vr-live-macro-brief"),
    avatarColor: "#1e3a2f",
    avatarInitial: "E",
    href: vrLiveHref(2),
    chatPerMin: 216,
    heat: "high",
  },
  {
    id: "live-4",
    title: "THYAO Bilanço Reaksiyonu — Anlık Okuma",
    creator: "Borsa Radar",
    handle: "@borsaradar",
    viewers: 987,
    tag: "THYAO",
    thumb: vrLiveThumbUrl("marketly-vr-live-equity-room"),
    avatarColor: "#3a1a1a",
    avatarInitial: "B",
    href: vrLiveHref(3),
    chatPerMin: 64,
    heat: "medium",
  },
  {
    id: "live-5",
    title: "BİST Açılış — Kritik Seviyeler ve Gündem",
    creator: "Hisse Takip",
    handle: "@hissetakip",
    viewers: 1420,
    tag: "BIST100",
    thumb: vrLiveThumbUrl("marketly-vr-live-bist-open"),
    avatarColor: "#1c2a18",
    avatarInitial: "H",
    href: vrLiveHref(4),
    chatPerMin: 88,
    heat: "medium",
  },
  {
    id: "live-6",
    title: "Altın Ons/Gram — Korelasyon Analizi Canlı",
    creator: "Makro Atlas",
    handle: "@makroatlas",
    viewers: 2100,
    tag: "XAU/USD",
    thumb: vrLiveThumbUrl("marketly-vr-live-commodity-gold"),
    avatarColor: "#2a2008",
    avatarInitial: "A",
    href: vrLiveHref(5),
    chatPerMin: 52,
    heat: "medium",
  },
];

/* ─── Pulse items ─────────────────────────────────────────────────────────── */
export const VR_PULSE_ITEMS: VRPulseItem[] = [
  {
    id: "pulse-1",
    title: "BIST100 Seviyeleri — 45sn Özet",
    creator: "Finans Ekspresi",
    durationLabel: "0:45",
    views: 18400,
    tag: "BIST100",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-bist100"),
    gradientFrom: "#0d1f3c",
    gradientTo: "#050a14",
    href: vrPulseHref(0),
    hookLine: "Direnç bandı netleşti.",
    avatarInitial: "F",
    avatarColor: "#1a3a5c",
    formatLabel: "45 sn özet",
  },
  {
    id: "pulse-2",
    title: "ETH Pozisyon Notum",
    creator: "CryptoDesk TR",
    durationLabel: "0:38",
    views: 9200,
    tag: "ETH",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-eth-desk"),
    gradientFrom: "#1a0e30",
    gradientTo: "#06040f",
    href: vrPulseHref(1),
    hookLine: "Kısa not: risk iştahı.",
    avatarInitial: "C",
    avatarColor: "#2d1b4e",
    formatLabel: "Hızlı yorum",
  },
  {
    id: "pulse-3",
    title: "Altın / Gümüş Yayılımı Açılıyor",
    creator: "Makro Atlas",
    durationLabel: "0:52",
    views: 7100,
    tag: "XAUUSD",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-gold-silver"),
    gradientFrom: "#2a1800",
    gradientTo: "#0d0700",
    href: vrPulseHref(2),
    hookLine: "Ons–TL ayrışması izleniyor.",
    avatarInitial: "M",
    avatarColor: "#1e3a2f",
    formatLabel: "Piyasa reaksiyonu",
  },
  {
    id: "pulse-4",
    title: "GARAN Teknik — Destek mi Kırılım mı",
    creator: "Hisse Takip",
    durationLabel: "0:41",
    views: 5300,
    tag: "GARAN",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-garan-bank"),
    gradientFrom: "#0f2818",
    gradientTo: "#040e07",
    href: vrPulseHref(3),
    hookLine: "Banka çarpanı güncellendi.",
    avatarInitial: "H",
    avatarColor: "#0f2818",
    formatLabel: "Hızlı yorum",
  },
  {
    id: "pulse-5",
    title: "VIOP Straddle Maliyeti Yükseliyor",
    creator: "Deriv Masası",
    durationLabel: "0:58",
    views: 4800,
    tag: "VIOP",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-viop-desk"),
    gradientFrom: "#1a1400",
    gradientTo: "#080600",
    href: vrPulseHref(4),
    hookLine: "Opsiyon tarafında gerginlik.",
    avatarInitial: "D",
    avatarColor: "#1a1a10",
    formatLabel: "45 sn özet",
  },
  {
    id: "pulse-6",
    title: "Fed Faiz Kararı — Piyasa Öncesi Beklenti",
    creator: "Makro Atlas",
    durationLabel: "0:55",
    views: 12600,
    tag: "MACRO",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-fed-macro"),
    gradientFrom: "#001524",
    gradientTo: "#000508",
    href: vrPulseHref(5),
    hookLine: "Beklenti bandı daralıyor.",
    avatarInitial: "M",
    avatarColor: "#001524",
    formatLabel: "Piyasa reaksiyonu",
  },
  {
    id: "pulse-7",
    title: "Kripto Dominance Değişiyor",
    creator: "Crypto Desk TR",
    durationLabel: "0:49",
    views: 8800,
    tag: "BTC",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-btc-dominance"),
    gradientFrom: "#180d30",
    gradientTo: "#06030f",
    href: vrPulseHref(6),
    hookLine: "BTC payı hızlı değişiyor.",
    avatarInitial: "C",
    avatarColor: "#180d30",
    formatLabel: "Hızlı yorum",
  },
  {
    id: "pulse-8",
    title: "USDTRY Yatay Bant — Ne Zaman Kırılır?",
    creator: "Elif Koç",
    durationLabel: "0:43",
    views: 6400,
    tag: "USD/TRY",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-usdtry-band"),
    gradientFrom: "#1a1200",
    gradientTo: "#070500",
    href: vrPulseHref(7),
    hookLine: "Kur bandı için tetik seviyeler.",
    avatarInitial: "E",
    avatarColor: "#1a1200",
    formatLabel: "45 sn özet",
  },
  {
    id: "pulse-9",
    title: "SPX Haftalık — Global Risk Profili",
    creator: "Makro Atlas",
    durationLabel: "0:57",
    views: 9900,
    tag: "SPX",
    thumb: vrPulseThumbUrl("marketly-vr-pulse-spx-weekly"),
    gradientFrom: "#0a1828",
    gradientTo: "#030810",
    href: vrPulseHref(8),
    formatLabel: "Haftalık bakış",
  },
];

/* ─── Video items ─────────────────────────────────────────────────────────── */
export const VR_VIDEO_ITEMS: VRVideoItem[] = [
  {
    id: "vid-1",
    title: "2025'te Portföy Yönetimi: Dağılım, Hedge ve Risk Dengesi",
    creator: "Makro Atlas",
    handle: "@makroatlas",
    durationLabel: "28:14",
    views: 42100,
    tag: "MAKRO",
    thumb: vrVideoThumbUrl("marketly-vr-video-portfolio-macro"),
    gradientFrom: "#0a1828",
    gradientTo: "#03060f",
    avatarColor: "#1e3a2f",
    avatarInitial: "M",
    publishedAgo: "3 gün önce",
    href: vrVideoHref(0),
  },
  {
    id: "vid-2",
    title: "Bitcoin Uzun Vadeli: On-Chain Veriler Ne Söylüyor?",
    creator: "Crypto Desk TR",
    handle: "@cryptodesk",
    durationLabel: "41:52",
    views: 61800,
    tag: "BTC",
    thumb: vrVideoThumbUrl("marketly-vr-video-btc-onchain"),
    gradientFrom: "#120a28",
    gradientTo: "#050310",
    avatarColor: "#2d1b4e",
    avatarInitial: "C",
    publishedAgo: "1 gün önce",
    href: vrVideoHref(1),
  },
  {
    id: "vid-3",
    title: "BIST100 2025 Yıl Sonu Hedefleri — Detaylı Analiz",
    creator: "Mehmet Yıldız",
    handle: "@myildiz",
    durationLabel: "34:07",
    views: 38500,
    tag: "BIST100",
    thumb: vrVideoThumbUrl("marketly-vr-video-bist100-outlook"),
    gradientFrom: "#0d1f3c",
    gradientTo: "#050a14",
    avatarColor: "#1a3a5c",
    avatarInitial: "M",
    publishedAgo: "2 gün önce",
    href: vrVideoHref(2),
  },
  {
    id: "vid-4",
    title: "Faiz İndirimi Öncesi TCMB Senaryoları ve Piyasa Etkisi",
    creator: "Elif Koç",
    handle: "@elifkoc",
    durationLabel: "22:30",
    views: 29200,
    tag: "TCMB",
    thumb: vrVideoThumbUrl("marketly-vr-video-tcmb-policy"),
    gradientFrom: "#1a1000",
    gradientTo: "#080400",
    avatarColor: "#2a1200",
    avatarInitial: "E",
    publishedAgo: "5 gün önce",
    href: vrVideoHref(3),
    seriesTitle: "Piyasa derinliği",
    episodeLabel: "TCMB ve kur haftası",
  },
  {
    id: "vid-5",
    title: "Altın — Tarihsel Değerleme ve Güncel Senaryo",
    creator: "Borsa Radar",
    handle: "@borsaradar",
    durationLabel: "18:45",
    views: 21400,
    tag: "XAU",
    thumb: vrVideoThumbUrl("marketly-vr-video-gold-valuation"),
    gradientFrom: "#201400",
    gradientTo: "#0a0600",
    avatarColor: "#3a1a1a",
    avatarInitial: "B",
    publishedAgo: "1 hafta önce",
    href: vrVideoHref(4),
    seriesTitle: "Strateji notları",
    episodeLabel: "Emtia masası",
  },
  {
    id: "vid-6",
    title: "VIOP Opsiyon Stratejileri — Temel ve İleri Seviye",
    creator: "Deriv Masası",
    handle: "@derivmasasi",
    durationLabel: "52:18",
    views: 17600,
    tag: "VIOP",
    thumb: vrVideoThumbUrl("marketly-vr-video-viop-strategies"),
    gradientFrom: "#141414",
    gradientTo: "#060606",
    avatarColor: "#1a1a10",
    avatarInitial: "D",
    publishedAgo: "4 gün önce",
    href: vrVideoHref(5),
    seriesTitle: "Uzun vade",
    episodeLabel: "Türev strateji laboratuvarı",
  },
];

/* ─── Signal items ────────────────────────────────────────────────────────── */
export const VR_SIGNAL_ITEMS: VRSignalItem[] = [
  {
    id: "sig-1",
    symbol: "THYAO",
    assetName: "Türk Hava Yolları",
    direction: "BUY",
    entry: "₺355–360",
    target: "₺410",
    stop: "₺338",
    timeframe: "1–2H",
    confidence: 78,
    rationale: "Bilanço sonrası fiyatlama boşluğu; hacim onayı bekleniyor.",
    analyst: "Mehmet Yıldız",
    analystHandle: "@myildiz",
    analystColor: "#1a3a5c",
    rr: "2.8x",
    age: "14dk",
    href: vrSignalHref(0),
  },
  {
    id: "sig-2",
    symbol: "BTC/USD",
    assetName: "Bitcoin",
    direction: "SELL",
    entry: "$97.200",
    target: "$91.500",
    stop: "$99.800",
    timeframe: "4S",
    confidence: 65,
    rationale: "Direnç bölgesinde yüksek borç; likidite takviyesi yok.",
    analyst: "Crypto Desk TR",
    analystHandle: "@cryptodesk",
    analystColor: "#2d1b4e",
    rr: "2.2x",
    age: "32dk",
    href: vrSignalHref(1),
  },
  {
    id: "sig-3",
    symbol: "GARAN",
    assetName: "Garanti BBVA",
    direction: "BUY",
    entry: "₺129–132",
    target: "₺155",
    stop: "₺121",
    timeframe: "1H",
    confidence: 82,
    rationale: "TCMB faiz kararı öncesi bankacılık rotasyonu fırsatı.",
    analyst: "Borsa Radar",
    analystHandle: "@borsaradar",
    analystColor: "#3a1a1a",
    rr: "3.1x",
    age: "1sa",
    href: vrSignalHref(2),
  },
  {
    id: "sig-4",
    symbol: "XAU/USD",
    assetName: "Altın",
    direction: "HOLD",
    entry: "$2.380",
    target: "$2.450",
    stop: "$2.340",
    timeframe: "1G",
    confidence: 70,
    rationale: "Dolar güçleniyor; ons/gram ayrışması kapanana kadar bekleme.",
    analyst: "Makro Atlas",
    analystHandle: "@makroatlas",
    analystColor: "#1e3a2f",
    rr: "1.8x",
    age: "3sa",
    href: vrSignalHref(3),
  },
  {
    id: "sig-5",
    symbol: "ETH/USD",
    assetName: "Ethereum",
    direction: "BUY",
    entry: "$3.850",
    target: "$4.200",
    stop: "$3.680",
    timeframe: "4S",
    confidence: 72,
    rationale: "Spot ETF akışları ivme kazanıyor; on-chain aktiflik artıyor.",
    analyst: "Crypto Desk TR",
    analystHandle: "@cryptodesk",
    analystColor: "#2d1b4e",
    rr: "2.1x",
    age: "2sa",
    href: vrSignalHref(4),
  },
  {
    id: "sig-6",
    symbol: "USD/TRY",
    assetName: "Dolar / TL",
    direction: "SELL",
    entry: "₺33.80",
    target: "₺32.50",
    stop: "₺34.20",
    timeframe: "1H",
    confidence: 60,
    rationale: "TCMB müdahale bandı yakınında; aşağı yönlü baskı artıyor.",
    analyst: "Elif Koç",
    analystHandle: "@elifkoc",
    analystColor: "#1e3a2f",
    rr: "3.3x",
    age: "45dk",
    href: vrSignalHref(5),
  },
];

/* ─── Mini signals (for stream strip) ────────────────────────────────────── */
export const VR_MINI_SIGNALS: VRMiniSignal[] = [
  { id: "ms-1", symbol: "THYAO", direction: "BUY",  change: "+2.4%", positive: true,  age: "14dk", href: vrSignalHref(0) },
  { id: "ms-2", symbol: "BTC",   direction: "SELL", change: "-1.8%", positive: false, age: "32dk", href: vrSignalHref(1) },
  { id: "ms-3", symbol: "GARAN", direction: "BUY",  change: "+1.1%", positive: true,  age: "1sa",  href: vrSignalHref(2) },
  { id: "ms-4", symbol: "XAUUSD",direction: "HOLD", change: "+0.3%", positive: true,  age: "2sa",  href: vrSignalHref(3) },
  { id: "ms-5", symbol: "ETH",   direction: "BUY",  change: "+3.2%", positive: true,  age: "1sa",  href: vrSignalHref(4) },
  { id: "ms-6", symbol: "USDTRY",direction: "SELL", change: "-0.6%", positive: false, age: "45dk", href: vrSignalHref(5) },
];

/* ─── Market tickers ──────────────────────────────────────────────────────── */
export const VR_MARKET_TICKERS: VRMarketTicker[] = [
  { id: "t-1",  symbol: "BTC",    name: "Bitcoin",       price: "$97.4K",  change: "+2.4%",  positive: true,  href: "/markets/BTC" },
  { id: "t-2",  symbol: "ETH",    name: "Ethereum",      price: "$3.86K",  change: "+3.1%",  positive: true,  href: "/markets/ETH" },
  { id: "t-3",  symbol: "XU100",  name: "BIST 100",      price: "9.840",   change: "+1.2%",  positive: true,  href: "/markets/XU100" },
  { id: "t-4",  symbol: "USDTRY", name: "Dolar/TL",      price: "₺33.82",  change: "-0.4%",  positive: false, href: "/markets/USDTRY" },
  { id: "t-5",  symbol: "XAUUSD", name: "Altın",         price: "$2.398",  change: "+0.8%",  positive: true,  href: "/markets/XAUUSD" },
  { id: "t-6",  symbol: "SPX",    name: "S&P 500",       price: "5.640",   change: "+0.5%",  positive: true,  href: "/markets/SPX" },
  { id: "t-7",  symbol: "GARAN",  name: "Garanti BBVA",  price: "₺131.4",  change: "+1.8%",  positive: true,  href: "/markets/GARAN" },
  { id: "t-8",  symbol: "THYAO",  name: "THY",           price: "₺357.2",  change: "-0.9%",  positive: false, href: "/markets/THYAO" },
  { id: "t-9",  symbol: "EURUSD", name: "Euro/Dolar",    price: "1.0841",  change: "+0.2%",  positive: true,  href: "/markets/EURUSD" },
  { id: "t-10", symbol: "SOL",    name: "Solana",        price: "$182.4",  change: "+4.6%",  positive: true,  href: "/markets/SOL" },
];

/* ─── Creator items ───────────────────────────────────────────────────────── */
export const VR_CREATOR_ITEMS: VRCreatorItem[] = [
  {
    id: "cr-1",
    displayName: "Mehmet Yıldız",
    handle: "@myildiz",
    specialty: "BIST teknik analiz & opsiyon",
    tag: "Öne Çıkan Analist",
    followers: "28.4K",
    contentFormats: "Canlı · Sinyal · Pulse",
    isLive: true,
    avatarColor: "#1a3a5c",
    avatarInitial: "M",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr1/240/240",
    href: vrCreatorHref(0),
  },
  {
    id: "cr-2",
    displayName: "Crypto Desk TR",
    handle: "@cryptodesk",
    specialty: "BTC / ETH on-chain analiz",
    tag: "Kripto Uzmanı",
    followers: "41.2K",
    contentFormats: "Pulse · Canlı",
    isLive: true,
    avatarColor: "#2d1b4e",
    avatarInitial: "C",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr2/240/240",
    href: vrCreatorHref(1),
  },
  {
    id: "cr-3",
    displayName: "Makro Atlas",
    handle: "@makroatlas",
    specialty: "Küresel makro & döviz",
    tag: "Yükselen",
    followers: "19.8K",
    contentFormats: "Video · Sinyal",
    isLive: false,
    avatarColor: "#1e3a2f",
    avatarInitial: "M",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr3/240/240",
    href: vrCreatorHref(2),
  },
  {
    id: "cr-4",
    displayName: "Borsa Radar",
    handle: "@borsaradar",
    specialty: "Hisse seçimi & portföy",
    tag: "Topluluk Favorisi",
    followers: "35.1K",
    contentFormats: "Canlı · Pulse",
    isLive: false,
    avatarColor: "#3a1a1a",
    avatarInitial: "B",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr4/240/240",
    href: vrCreatorHref(3),
  },
  {
    id: "cr-5",
    displayName: "Elif Koç",
    handle: "@elifkoc",
    specialty: "Kur & faiz analizi",
    tag: "Yeni Keşif",
    followers: "12.7K",
    contentFormats: "Video · Sinyal",
    isLive: false,
    avatarColor: "#2a1200",
    avatarInitial: "E",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr5/240/240",
    href: vrCreatorHref(4),
  },
  {
    id: "cr-6",
    displayName: "Deriv Masası",
    handle: "@derivmasasi",
    specialty: "VIOP & türev stratejileri",
    tag: "Derin Analiz",
    followers: "9.4K",
    contentFormats: "Pulse · Video",
    isLive: false,
    avatarColor: "#1a1a10",
    avatarInitial: "D",
    portraitUrl: "https://picsum.photos/seed/marketly-face-cr6/240/240",
    href: vrCreatorHref(5),
  },
];

export type { VRTabId } from "./discover-visual-reference-tabs";
export { VR_TABS } from "./discover-visual-reference-tabs";

/* ─── Topic ecosystems (visual reference — mock graph) ───────────────────── */
export type VRTopicMood = "fed" | "btc" | "bist" | "gold" | "crypto" | "macro";

export type VRTopicEcosystem = {
  id: string;
  title: string;
  tagline: string;
  /** Aynı konuda içeriklerin birlikte okunması için tek cümle */
  contextLine: string;
  mood: VRTopicMood;
  liveIds: string[];
  pulseIds: string[];
  videoIds: string[];
  signalIds: string[];
  creatorIds: string[];
  /** Kompakt etiket şeridi */
  marketTags: string[];
};

export const VR_TOPIC_ECOSYSTEMS: VRTopicEcosystem[] = [
  {
    id: "topic-fed",
    title: "Fed ve kur haftası",
    tagline: "Faiz, TCMB ve kur aynı akışta.",
    contextLine: "Bu başlıkta 2 canlı yayın açık; kur sinyalleri bu hafta öne çıkıyor.",
    mood: "fed",
    liveIds: ["live-3", "live-1"],
    pulseIds: ["pulse-6", "pulse-8"],
    videoIds: ["vid-4", "vid-1"],
    signalIds: ["sig-6", "sig-3"],
    creatorIds: ["cr-5", "cr-3", "cr-1"],
    marketTags: ["USD/TRY", "TCMB", "SPX", "Faiz"],
  },
  {
    id: "topic-btc",
    title: "Bitcoin ekosistemi",
    tagline: "Spot, dominance ve kısa yorumlar bir arada.",
    contextLine: "Kripto masasında sıcak tartışma; dominance ve ETF akışı izleniyor.",
    mood: "btc",
    liveIds: ["live-2"],
    pulseIds: ["pulse-1", "pulse-7", "pulse-2"],
    videoIds: ["vid-2", "vid-3"],
    signalIds: ["sig-2", "sig-5"],
    creatorIds: ["cr-2", "cr-6"],
    marketTags: ["BTC", "ETH", "Dominance", "ETF"],
  },
  {
    id: "topic-gold",
    title: "Altın hareketi",
    tagline: "Ons, gram ve dolar baskısı.",
    contextLine: "Emtia ve makro birlikte; altın tarafında yeni görüşler toplanıyor.",
    mood: "gold",
    liveIds: ["live-6"],
    pulseIds: ["pulse-3", "pulse-4", "pulse-5"],
    videoIds: ["vid-5", "vid-6"],
    signalIds: ["sig-4"],
    creatorIds: ["cr-3", "cr-4"],
    marketTags: ["XAU", "USD", "Korelasyon", "BIST"],
  },
];

/** Tümü akışı — Piyasayı Konuşanlar (aktör tile verisi) */
export type VRCreatorActivityBadge = "live" | "trend" | "new" | "hot";

/** Kart atmosferi — ring / wash accent */
export type VRCreatorActivityTileTone = "live" | "crypto" | "macro" | "bist";

export type VRCreatorActivityLine = {
  creatorId: string;
  badge: VRCreatorActivityBadge;
  headline: string;
  /** Yüz rail altı — tek kısa satır */
  railContext: string;
  topicChipA: string;
  topicChipB: string;
  tileTone: VRCreatorActivityTileTone;
  cta: "İzle" | "Profil" | "Takip";
};

export const VR_CREATOR_ACTIVITY_FEED: VRCreatorActivityLine[] = [
  {
    creatorId: "cr-1",
    badge: "live",
    headline: "BIST açılışını canlı yorumluyor",
    railContext: "BIST açılışında canlı",
    topicChipA: "XU100",
    topicChipB: "Teknik tur",
    tileTone: "bist",
    cta: "İzle",
  },
  {
    creatorId: "cr-2",
    badge: "trend",
    headline: "BTC ekosisteminde bugün trend",
    railContext: "BTC ekosisteminde trend",
    topicChipA: "BTC",
    topicChipB: "ETF akışı",
    tileTone: "crypto",
    cta: "Takip",
  },
  {
    creatorId: "cr-3",
    badge: "new",
    headline: "Fed haftasında yeni analiz yayınladı",
    railContext: "Fed haftası · yeni analiz",
    topicChipA: "TCMB",
    topicChipB: "Kur bandı",
    tileTone: "macro",
    cta: "Profil",
  },
  {
    creatorId: "cr-4",
    badge: "hot",
    headline: "Bankacılık rotasyonunu izliyor",
    railContext: "Banka rotasyonu masasında",
    topicChipA: "GARAN",
    topicChipB: "THYAO hacim",
    tileTone: "bist",
    cta: "Profil",
  },
  {
    creatorId: "cr-5",
    badge: "trend",
    headline: "Kur bandı ve faiz telaffuzu",
    railContext: "Kur & faiz · odakta",
    topicChipA: "USDTRY",
    topicChipB: "SWAP",
    tileTone: "macro",
    cta: "Profil",
  },
  {
    creatorId: "cr-6",
    badge: "trend",
    headline: "VIOP açılış stratejileri",
    railContext: "VIOP · açılış strateji",
    topicChipA: "VIOP",
    topicChipB: "Baz",
    tileTone: "bist",
    cta: "İzle",
  },
  {
    creatorId: "cr-2",
    badge: "live",
    headline: "ETH akışı canlı",
    railContext: "ETH · canlı akış",
    topicChipA: "ETH",
    topicChipB: "Spot",
    tileTone: "crypto",
    cta: "İzle",
  },
  {
    creatorId: "cr-1",
    badge: "trend",
    headline: "XU100 teknik tur",
    railContext: "XU100 · teknik tur",
    topicChipA: "XU100",
    topicChipB: "Opsiyon",
    tileTone: "bist",
    cta: "Takip",
  },
];

/* ─── Masadaki konular — topic chip board (kart değil) ─────────────────────── */
export type VRDeskTopicAccent = "macro" | "crypto" | "bist" | "commodity" | "equity" | "deriv";

export type VRDeskHeat = "hot" | "rising" | "watch" | "risk" | "new";

export type VRMarketTopicChipSize = "sm" | "md" | "lg";

export type VRMarketTopicChip = {
  id: string;
  title: string;
  tickers: string[];
  heat: VRDeskHeat;
  href: string;
  accent: VRDeskTopicAccent;
  size: VRMarketTopicChipSize;
};

export const VR_MARKET_TOPIC_CHIPS: VRMarketTopicChip[] = [
  { id: "chip-1", title: "Bankacılık rotasyonu", tickers: ["GARAN", "AKBNK"], heat: "hot", href: "/markets/XU100", accent: "bist", size: "lg" },
  { id: "chip-2", title: "TCMB sonrası kur bandı", tickers: ["USDTRY"], heat: "watch", href: "/markets/USDTRY", accent: "macro", size: "md" },
  { id: "chip-3", title: "BTC dominance", tickers: ["BTC", "ETF"], heat: "rising", href: "/markets/BTC", accent: "crypto", size: "md" },
  { id: "chip-4", title: "Altın / ons ayrışması", tickers: ["XAU", "Gram"], heat: "risk", href: "/markets/XAUUSD", accent: "commodity", size: "md" },
  { id: "chip-5", title: "THYAO bilanço okuması", tickers: ["THYAO", "HAVACILIK"], heat: "new", href: "/markets/THYAO", accent: "equity", size: "lg" },
  { id: "chip-6", title: "VIOP strateji görünümü", tickers: ["VIOP", "Baz"], heat: "watch", href: vrPulseHref(0), accent: "deriv", size: "md" },
  { id: "chip-7", title: "Fed haftası", tickers: ["FOMC", "Faiz"], heat: "hot", href: vrPulseHref(1), accent: "macro", size: "sm" },
  { id: "chip-8", title: "AI hisseleri", tickers: ["NVDA", "MSFT"], heat: "rising", href: "/markets/SPX", accent: "crypto", size: "sm" },
  { id: "chip-9", title: "BIST açılışı", tickers: ["XU100", "Hacim"], heat: "watch", href: "/markets/XU100", accent: "bist", size: "sm" },
  { id: "chip-10", title: "Dolar baskısı", tickers: ["USD", "EM"], heat: "risk", href: "/markets/USDTRY", accent: "macro", size: "md" },
];

/** Mock creator graph satırları — topic cluster içi */
export const VR_CREATOR_GRAPH_BLURBS: Record<string, string> = {
  "cr-1": "XU100 · canlı",
  "cr-2": "BTC dominance",
  "cr-3": "Makro telaffuz",
  "cr-4": "Banka rotasyonu",
  "cr-5": "Kur masası",
  "cr-6": "Türev akışı",
};

export function vrPickByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const map = new Map(items.map((x) => [x.id, x]));
  return ids.map((id) => map.get(id)).filter((x): x is T => x != null);
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
export function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}B`;
  return String(n);
}
