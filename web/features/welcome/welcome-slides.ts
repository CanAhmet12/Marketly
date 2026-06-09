import { resolveWelcomeBg } from "./welcome-bg";

export type WelcomeInterest = {
  id: string;
  label: string;
  icon: string;
  tone: "teal" | "blue" | "violet" | "amber" | "rose" | "slate";
};

/** Görselin sol/sağ bölgesindeki dominant tona göre yazı paleti */
export type WelcomeTextPalette = {
  mode: "on-dark" | "on-light";
  title: string;
  body: string;
  muted: string;
  kicker: string;
  shadow: string;
  gradientShadow: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  stageText: string;
  stageMuted: string;
  photoFilter: string;
};

export type WelcomeSlide = {
  id: string;
  kicker: string;
  titleLine1: string;
  titleGradient: string;
  subtitle: string;
  dreamLine: string;
  highlights: string[];
  scene: "markets" | "social" | "signals" | "personal";
  accent: string;
  accent2: string;
  palette: WelcomeTextPalette;
  tags: string[];
  bgImage: string;
  bgSrcSet: string;
  bgFocal: string;
};

function slideBg(pexelsId: number, focal: string) {
  return resolveWelcomeBg({ pexelsId, focal });
}

/* Görsel analizi:
   markets  — sol koyu el/gölge, sağ parlak ekran yeşili → açık nane yazı
   social   — açık ofis/bej ışık, sol duvar açık → koyu indigo yazı
   signals  — koyu zemin, altın BTC parıltısı → sıcak krem yazı
   personal — gün ışığı, açık mavi-gri ton → koyu lacivert yazı */
const marketsBg = slideBg(32396586, "78% center");
const socialBg = slideBg(3183197, "68% center");
const signalsBg = slideBg(7948051, "62% center");
const personalBg = slideBg(6801874, "65% center");

export const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: "markets",
    kicker: "Canlı Piyasa Terminali",
    titleLine1: "Gerçek fiyatlar.",
    titleGradient: "Tek komuta merkezi.",
    subtitle: "Kripto, BIST, döviz ve emtia — canlı ticker ve sparkline tek ekranda.",
    dreamLine: "Piyasayı izleme değil, hissetme zamanı.",
    highlights: ["29+ sembol canlı akış", "Sparkline & haber bağlamı", "Watchlist tek tık"],
    scene: "markets",
    accent: "#00e676",
    accent2: "#00e5ff",
    palette: {
      mode: "on-dark",
      title: "#ecfdf5",
      body: "#d1fae5",
      muted: "rgba(209, 250, 229, 0.82)",
      kicker: "#34d399",
      shadow: "0 1px 2px rgba(0, 32, 20, 0.55), 0 4px 18px rgba(0, 48, 32, 0.35)",
      gradientShadow: "drop-shadow(0 1px 2px rgba(0, 40, 24, 0.7)) drop-shadow(0 4px 14px rgba(0, 80, 48, 0.4))",
      tagBg: "rgba(0, 48, 32, 0.38)",
      tagBorder: "rgba(52, 211, 153, 0.55)",
      tagText: "#ecfdf5",
      stageText: "#f0fdf4",
      stageMuted: "rgba(167, 243, 208, 0.78)",
      photoFilter: "saturate(1.12) contrast(1.06) brightness(0.96)",
    },
    tags: ["BTC", "ETH", "XU100", "Forex"],
    bgImage: marketsBg.url,
    bgSrcSet: marketsBg.srcSet,
    bgFocal: marketsBg.focal,
  },
  {
    id: "social",
    kicker: "Sosyal Finans Akışı",
    titleLine1: "Analistler konuşuyor.",
    titleGradient: "Sen de tartışmaya katıl.",
    subtitle: "Gerçek gönderiler, thread'ler, alıntılı yayınlar ve kanal vitrinleri.",
    dreamLine: "Finans artık yalnız değil — toplulukla büyüyor.",
    highlights: ["Gerçek profil & avatar", "Varlık etiketli tartışma", "Canlı kanal vitrinleri"],
    scene: "social",
    accent: "#7c3aed",
    accent2: "#4f46e5",
    palette: {
      mode: "on-light",
      title: "#1e1b4b",
      body: "#312e81",
      muted: "rgba(49, 46, 129, 0.72)",
      kicker: "#6d28d9",
      shadow: "0 1px 0 rgba(255, 255, 255, 0.65), 0 2px 12px rgba(255, 248, 235, 0.45)",
      gradientShadow: "drop-shadow(0 1px 1px rgba(255, 255, 255, 0.85)) drop-shadow(0 2px 8px rgba(124, 58, 237, 0.25))",
      tagBg: "rgba(255, 255, 255, 0.52)",
      tagBorder: "rgba(109, 40, 217, 0.38)",
      tagText: "#3730a3",
      stageText: "#1e1b4b",
      stageMuted: "rgba(55, 48, 163, 0.68)",
      photoFilter: "saturate(1.05) contrast(1.02) brightness(1.06)",
    },
    tags: ["Feed", "Tartışma", "Kanal", "Canlı"],
    bgImage: socialBg.url,
    bgSrcSet: socialBg.srcSet,
    bgFocal: socialBg.focal,
  },
  {
    id: "signals",
    kicker: "Topluluk Sinyalleri",
    titleLine1: "Şeffaf trade fikirleri.",
    titleGradient: "Kopyala, takip et.",
    subtitle: "Analist çağrıları — yön, güven, giriş/hedef ve topluluk kopya sayısı.",
    dreamLine: "Her çağrı şeffaf. Her analist hesap verir.",
    highlights: ["BUY / SELL / HOLD", "Güven skoru 1–5", "Topluluk kopya & sıralama"],
    scene: "signals",
    accent: "#fb7185",
    accent2: "#fbbf24",
    palette: {
      mode: "on-dark",
      title: "#fffbeb",
      body: "#fde68a",
      muted: "rgba(253, 230, 138, 0.78)",
      kicker: "#fb923c",
      shadow: "0 1px 2px rgba(60, 20, 0, 0.6), 0 4px 18px rgba(88, 32, 8, 0.38)",
      gradientShadow: "drop-shadow(0 1px 2px rgba(68, 24, 0, 0.75)) drop-shadow(0 4px 14px rgba(180, 80, 20, 0.35))",
      tagBg: "rgba(68, 24, 0, 0.35)",
      tagBorder: "rgba(251, 146, 60, 0.5)",
      tagText: "#fffbeb",
      stageText: "#fffbeb",
      stageMuted: "rgba(253, 230, 138, 0.75)",
      photoFilter: "saturate(1.14) contrast(1.08) brightness(0.94) sepia(0.12)",
    },
    tags: ["Sinyal", "Kopya", "Analist", "Hedef"],
    bgImage: signalsBg.url,
    bgSrcSet: signalsBg.srcSet,
    bgFocal: signalsBg.focal,
  },
  {
    id: "personal",
    kicker: "Kişisel Zeka",
    titleLine1: "Senin piyasan.",
    titleGradient: "Sana özel akış.",
    subtitle: "İlgi alanı, watchlist ve takip ettiğin analistlerle kişiselleştirilmiş deneyim.",
    dreamLine: "Marketly seni tanır — akış seninle nefes alır.",
    highlights: ["For You sıralaması", "İlgi alanı seçimi", "Analist takip & keşfet"],
    scene: "personal",
    accent: "#0284c7",
    accent2: "#059669",
    palette: {
      mode: "on-light",
      title: "#0c2340",
      body: "#1e4976",
      muted: "rgba(30, 73, 118, 0.72)",
      kicker: "#0369a1",
      shadow: "0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 14px rgba(186, 230, 253, 0.5)",
      gradientShadow: "drop-shadow(0 1px 1px rgba(255, 255, 255, 0.9)) drop-shadow(0 2px 10px rgba(2, 132, 199, 0.22))",
      tagBg: "rgba(255, 255, 255, 0.48)",
      tagBorder: "rgba(2, 132, 199, 0.35)",
      tagText: "#0c4a6e",
      stageText: "#0c2340",
      stageMuted: "rgba(12, 74, 110, 0.68)",
      photoFilter: "saturate(1.02) contrast(1.04) brightness(1.08)",
    },
    tags: ["For You", "Keşfet", "Watchlist", "Takip"],
    bgImage: personalBg.url,
    bgSrcSet: personalBg.srcSet,
    bgFocal: personalBg.focal,
  },
];

export const WELCOME_INTERESTS: WelcomeInterest[] = [
  { id: "crypto", label: "Kripto", icon: "₿", tone: "amber" },
  { id: "bist", label: "BIST", icon: "◎", tone: "blue" },
  { id: "forex", label: "Döviz", icon: "¤", tone: "violet" },
  { id: "commodities", label: "Emtia", icon: "◆", tone: "amber" },
  { id: "signals", label: "Sinyaller", icon: "⚡", tone: "rose" },
  { id: "news", label: "Haberler", icon: "▣", tone: "slate" },
];
