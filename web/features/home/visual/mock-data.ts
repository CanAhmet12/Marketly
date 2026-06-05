/** Static presentation data — Home visual reference only (no repository). */

export type HomeVisualMarketItem = {
  symbol: string;
  name: string;
  price: string;
  changePct: number;
  /** Sembol satırı tıklanınca gidecek rota (üretim şeridi) */
  href?: string;
};

export type HomeVisualStoryItem = {
  id: string;
  label: string;
  avatarUrl: string;
  variant: "live" | "new" | "default";
  ring: "teal" | "amber" | "slate";
  /** İzlenmiş hikâye — ring soluk */
  isViewed?: boolean;
};

export type HomeVisualPost = {
  id: string;
  creatorName: string;
  handle: string;
  badge: string;
  avatarUrl: string;
  timeLabel: string;
  title: string;
  body: string;
  mediaUrl: string;
  mediaWidth: number;
  mediaHeight: number;
  topics: string[];
  likes: string;
  comments: string;
  reposts: string;
};

export const HOME_VISUAL_MARKETS: HomeVisualMarketItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: "98.420", changePct: 1.24 },
  { symbol: "ETH", name: "Ethereum", price: "3.842", changePct: -0.62 },
  { symbol: "XU100", name: "BIST 100", price: "10.124", changePct: 0.41 },
  { symbol: "SPX", name: "S&P 500", price: "6.010", changePct: -0.18 },
  { symbol: "USDTRY", name: "Dolar", price: "34,12", changePct: 0.09 },
  { symbol: "GLD", name: "Altın", price: "3.892", changePct: 0.55 },
  { symbol: "NVDA", name: "NVIDIA", price: "188,42", changePct: 2.1 },
];

export const HOME_VISUAL_STORIES: HomeVisualStoryItem[] = [
  { id: "s1", label: "Hikaye Ekle", avatarUrl: "", variant: "default", ring: "slate" },
  { id: "s2", label: "XU100", avatarUrl: "https://picsum.photos/seed/hv-story-xu/96/96", variant: "live", ring: "teal" },
  { id: "s3", label: "Makro", avatarUrl: "https://picsum.photos/seed/hv-story-macro/96/96", variant: "new", ring: "amber" },
  { id: "s4", label: "Ayşe", avatarUrl: "https://i.pravatar.cc/150?img=12", variant: "default", ring: "teal" },
  { id: "s5", label: "Kripto", avatarUrl: "https://picsum.photos/seed/hv-story-crypto/96/96", variant: "default", ring: "slate" },
  { id: "s6", label: "Canlı", avatarUrl: "https://i.pravatar.cc/150?img=33", variant: "live", ring: "amber" },
  { id: "s7", label: "Bülten", avatarUrl: "https://picsum.photos/seed/hv-story-news/96/96", variant: "new", ring: "teal" },
];

export const HOME_VISUAL_POSTS: HomeVisualPost[] = [
  {
    id: "p1",
    creatorName: "Ayşe Kaya",
    handle: "@ayse_analist",
    badge: "Pro",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    timeLabel: "2s",
    title: "XU100: haftalık kapanış öncesi seviye planı",
    body:
      "Endeks üst banda yaklaşırken hacim genişlemesi sınırlı. Bu hafta için iki senaryo: yumuşak geri çekilme ile destek testi veya kırılım ile devam. Aşağıda seviyeler ve risk notları.",
    mediaUrl: "https://picsum.photos/seed/hvref-post1/1200/675",
    mediaWidth: 1200,
    mediaHeight: 675,
    topics: ["XU100", "Teknik", "Haftalık"],
    likes: "1,2b",
    comments: "248",
    reposts: "86",
  },
  {
    id: "p2",
    creatorName: "Kerem Yılmaz",
    handle: "@kerem_macro",
    badge: "Elite",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    timeLabel: "1s",
    title: "Fed söylemi ve TRY bandı: kısa özet",
    body:
      "Piyasa fiyatlaması agresif; veri akışı yumuşarsa volatilite sıkışabilir. Döviz tarafında kısa vadeli aralık ve tetikleyiciler için notlarım aşağıda.",
    mediaUrl: "https://picsum.photos/seed/hvref-post2/1200/675",
    mediaWidth: 1200,
    mediaHeight: 675,
    topics: ["Makro", "USDTRY", "Fed"],
    likes: "892",
    comments: "112",
    reposts: "34",
  },
  {
    id: "p3",
    creatorName: "Selin Demir",
    handle: "@selin_trade",
    badge: "Pro",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    timeLabel: "6s",
    title: "BTC dominance ve alt sezon sinyalleri",
    body:
      "Dominance daralması ve ETH/BTC yapısı birlikte okununca tablo netleşiyor. Görselde günlük yapı ve kritik bölgeler işaretli.",
    mediaUrl: "https://picsum.photos/seed/hvref-post3/1200/675",
    mediaWidth: 1200,
    mediaHeight: 675,
    topics: ["BTC", "ETH", "Kripto"],
    likes: "2,4b",
    comments: "401",
    reposts: "120",
  },
];

export type HomeVisualRailLink = {
  label: string;
  meta?: string;
  accent?: "up" | "down" | "neutral";
  /** Önerilen creator satırı — takip / profil */
  creatorUserId?: string;
  /** İkinci satır (Bugün vb.) */
  detail?: string;
  /** Bugün konuşulanlar — sıra */
  rank?: number;
  /** Önerilen creator */
  avatarUrl?: string;
  handle?: string;
  chipStrength?: "high" | "mid" | "low";
  /** Trend — kısa delta metni */
  trendDelta?: string;
  trendDeltaAccent?: "up" | "down" | "neutral";
  /** Bugün satırı — küçük trend ikonu */
  tone?: "up" | "down" | "flat";
};

export const HOME_VISUAL_RAIL: {
  shortcuts: HomeVisualRailLink[];
  today: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  trending: HomeVisualRailLink[];
  creators: HomeVisualRailLink[];
} = {
  shortcuts: [
    { label: "BTC", meta: "+1,24%", accent: "up" },
    { label: "ETH", meta: "−0,62%", accent: "down" },
    { label: "XU100", meta: "+0,41%", accent: "up" },
    { label: "USDTRY", meta: "+0,09%", accent: "up" },
    { label: "SPX", meta: "−0,18%", accent: "down" },
    { label: "GLD", meta: "+0,55%", accent: "up" },
  ],
  today: [
    { label: "TCMB faiz kararı", meta: "14:00", detail: "Piyasa beklentisi: 250 bp", tone: "up" },
    { label: "ABD CPI önizleme", meta: "Yarın 15:30", detail: "Çekirdek öncü okuma", tone: "flat" },
  ],
  interests: [
    { label: "Teknik analiz", meta: "yüksek", chipStrength: "high" },
    { label: "Makro / döviz", meta: "yüksek", chipStrength: "high" },
    { label: "Kripto", meta: "orta", chipStrength: "mid" },
    { label: "Temettü", meta: "hafif", chipStrength: "low" },
  ],
  trending: [
    { label: "#XU100", meta: "4,2b görüntülenme", rank: 1, trendDelta: "+12%", trendDeltaAccent: "up" },
    { label: "#Fed", meta: "1,1b görüntülenme", rank: 2, trendDelta: "+4%", trendDeltaAccent: "up" },
    { label: "#BTCETF", meta: "890b görüntülenme", rank: 3, trendDelta: "−2%", trendDeltaAccent: "down" },
  ],
  creators: [
    {
      label: "Ayşe Kaya",
      meta: "Pro",
      handle: "@ayse_analist",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
    },
    {
      label: "Kerem Yılmaz",
      meta: "Elite",
      handle: "@kerem_macro",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
    },
    {
      label: "Selin Demir",
      meta: "Pro",
      handle: "@selin_trade",
      avatarUrl: "https://i.pravatar.cc/150?img=16",
    },
  ],
};
