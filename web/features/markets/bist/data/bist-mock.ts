/**
 * BIST piyasa sayfasi -- statik mock veri
 */

import type {
  BistPulseMetrics,
  BistMarketStatePayload,
  BistSectorPayload,
  BistMoversPayload,
  BistBottomStripPayload,
  BistScreenerPayload,
  BistIndexPanel,
} from "@/features/markets/bist/types";

/* Pulse Bar */

export const BIST_MOCK_PULSE: BistPulseMetrics = {
  bist100:   { label: "BIST 100",  value: 9663.58,   changePercent: 1.33,  sparkline: [9480,9510,9530,9555,9580,9620,9663.58] },
  bist30:    { label: "BIST 30",   value: 10607.42,  changePercent: 1.38,  sparkline: [10440,10470,10510,10540,10570,10590,10607.42] },
  bistBanka: { label: "BIST Banka",value: 13672.31,  changePercent: 1.39,  sparkline: [13420,13480,13530,13570,13610,13650,13672.31] },
  bistSinai: { label: "BIST Sinai",value: 12997.65,  changePercent: 1.38,  sparkline: [12820,12860,12900,12930,12960,12985,12997.65] },
  toplamHacim: "124.7 MLRD TL",
  yabancıOran: { value: 36.42, change: 0.78, label: "Gunluk" },
  piyasaDurumu: { value: 68, label: "Yukselis" },
};

/* Market State */

export const BIST_MOCK_MARKET_STATE: BistMarketStatePayload = {
  trend: "bull",
  headline: "YUKSELIS PIYASASI",
  summary: "Bankaci hisseleri one cikiyor; yabanci yatirimci alimi devam ediyor. BIST 100 teknik duvari asarak yeni zirveye yoneldi.",
  bist100Value: 9663.58,
  bist100Change: 1.33,
  stats: {
    volatilite: "Orta",
    yabancıNetAlım: "+1.2 MLRD TL",
    teknikGorunum: "Pozitif",
    momentum: "Yukselis",
  },
  sectorDistribution: { mali: 42, sanayi: 31, diger: 27 },
};

/* Sectors */

export const BIST_MOCK_SECTORS: BistSectorPayload = {
  sectors: [
    { id: "bankacilik",  name: "Bankacilik",  changePercent: 2.14,  leader: "GARAN +2.8%", heatLevel: "hot-strong",  sparkline: [1.1,1.4,1.8,1.9,2.0,2.1,2.14] },
    { id: "holding",     name: "Holding",     changePercent: 1.42,  leader: "KCHOL +1.8%", heatLevel: "hot-mild",    sparkline: [0.6,0.8,1.0,1.1,1.2,1.4,1.42] },
    { id: "sanayi",      name: "Sanayi",      changePercent: 0.88,  leader: "TUPRS +1.2%", heatLevel: "hot-mild",    sparkline: [0.3,0.4,0.6,0.7,0.8,0.9,0.88] },
    { id: "ulasim",      name: "Ulasim",      changePercent: 1.73,  leader: "THYAO +2.1%", heatLevel: "hot-strong",  sparkline: [0.8,1.0,1.2,1.4,1.5,1.7,1.73] },
    { id: "enerji",      name: "Enerji",      changePercent: -0.54, leader: "AYEN -0.8%",  heatLevel: "cold-mild",   sparkline: [0.2,0.1,-0.1,-0.2,-0.4,-0.5,-0.54] },
    { id: "perakende",   name: "Perakende",   changePercent: 0.32,  leader: "BIMAS +0.5%", heatLevel: "neutral",     sparkline: [0.1,0.1,0.2,0.3,0.3,0.3,0.32] },
    { id: "insaat",      name: "Insaat",      changePercent: -1.22, leader: "EMLAK -1.5%", heatLevel: "cold-strong", sparkline: [-0.4,-0.6,-0.8,-0.9,-1.0,-1.2,-1.22] },
    { id: "teknoloji",   name: "Teknoloji",   changePercent: 0.61,  leader: "LOGO +1.0%",  heatLevel: "hot-mild",    sparkline: [0.2,0.3,0.4,0.5,0.5,0.6,0.61] },
  ],
};

/* Index Panels */

export const BIST_MOCK_PANELS: { bist100: BistIndexPanel; bist30: BistIndexPanel } = {
  bist100: {
    symbol: "BIST100",
    name: "BIST 100",
    value: 9663.58,
    changePercent: 1.33,
    changeDay: 127.14,
    sparkline: [9480,9490,9510,9520,9535,9550,9570,9590,9610,9630,9645,9663.58],
    trend: "up",
    stats: { marketCap: "8.94 TRL TL", volume: "124.7 MLRD", highDay: "9.671,42", lowDay: "9.534,66" },
  },
  bist30: {
    symbol: "BIST30",
    name: "BIST 30",
    value: 10607.42,
    changePercent: 1.38,
    changeDay: 144.38,
    sparkline: [10440,10450,10470,10485,10500,10520,10545,10565,10580,10595,10603,10607.42],
    trend: "up",
    stats: { marketCap: "6.12 TRL TL", volume: "89.3 MLRD", highDay: "10.614,80", lowDay: "10.476,34" },
  },
};

/* Movers */

export const BIST_MOCK_MOVERS: BistMoversPayload = {
  gainers: [
    { symbol: "SASA",  name: "SASA Polyester",       change: 9.85,  price: "47.18 TL" },
    { symbol: "ASELS", name: "Aselsan",               change: 5.42,  price: "83.60 TL" },
    { symbol: "TUPRS", name: "Tupras",                change: 4.18,  price: "290.50 TL" },
    { symbol: "AKIM",  name: "Akim Tekstil",          change: 3.91,  price: "12.44 TL" },
    { symbol: "KCHOL", name: "Koc Holding",           change: 3.24,  price: "196.50 TL" },
  ],
  losers: [
    { symbol: "DOHOL", name: "Dogan Holding",         change: -3.47, price: "18.62 TL" },
    { symbol: "BRISA", name: "Brisa",                 change: -2.88, price: "56.30 TL" },
    { symbol: "SMART", name: "Smart Gunes",           change: -2.41, price: "9.88 TL" },
    { symbol: "TABGD", name: "Turk AB Gida",          change: -1.96, price: "14.72 TL" },
    { symbol: "ERISA", name: "Erciyas Insaat",        change: -1.55, price: "7.14 TL" },
  ],
  volume: [
    { symbol: "THYAO", name: "Turk Hava Yollari",     change: 2.14,  volume: "8.4 MLRD TL" },
    { symbol: "GARAN", name: "Garanti BBVA",          change: 2.81,  volume: "6.2 MLRD TL" },
    { symbol: "ISCTR", name: "Is Bankasi",            change: 1.44,  volume: "4.8 MLRD TL" },
    { symbol: "KCHOL", name: "Koc Holding",           change: 3.24,  volume: "4.1 MLRD TL" },
    { symbol: "YKBNK", name: "Yapi Kredi",            change: 1.88,  volume: "3.7 MLRD TL" },
  ],
};

/* Bottom Strip */

export const BIST_MOCK_BOTTOM: BistBottomStripPayload = {
  watchlist: [
    { symbol: "THYAO", name: "THY",     price: 291.25, changePercent: 2.14,  sparkline: [273,276,280,283,287,289,291.25], trend: "up"   },
    { symbol: "ASELS", name: "Aselsan", price: 83.60,  changePercent: 5.42,  sparkline: [76,77.5,79,80,81.5,82.8,83.60],  trend: "up"   },
    { symbol: "GARAN", name: "Garanti", price: 114.40, changePercent: 2.81,  sparkline: [106,108,110,111,112,113.5,114.40], trend: "up" },
    { symbol: "TUPRS", name: "Tupras",  price: 290.50, changePercent: 4.18,  sparkline: [270,274,278,281,285,288,290.50], trend: "up"   },
    { symbol: "EREGL", name: "Eregli",  price: 56.85,  changePercent: -0.44, sparkline: [57.8,57.5,57.2,57.0,56.8,56.85,56.85], trend: "flat" },
  ],
  gundem: [
    { id: "g1", time: "11:30", title: "ABD - Perakende Satislar (Aylik)", impact: "high",   country: "US" },
    { id: "g2", time: "14:00", title: "Turkiye - Kapasite Kullanimi",     impact: "medium", country: "TR" },
    { id: "g3", time: "16:00", title: "TCMB - Faiz Karari Aciklamasi",   impact: "high",   country: "TR" },
  ],
  fx: [
    { symbol: "USD/TRY", price: 32.19,    changePercent: 0.18,  trend: "up"   },
    { symbol: "EUR/TRY", price: 35.06,    changePercent: 0.22,  trend: "up"   },
    { symbol: "ALTIN",   price: 4916.45,  changePercent: 0.48,  trend: "up"   },
    { symbol: "BRENT",   price: 63.28,    changePercent: -0.49, trend: "down" },
  ],
};

/* Screener */

export const BIST_MOCK_SCREENER: BistScreenerPayload = {
  assets: [
    { rank:  1, symbol: "THYAO", name: "Turk Hava Yollari A.S.",      sector: "Ulasim",     price: 291.25, changeDay: 2.14,  changeWeek: 5.88,  volume: "8.4 MLRD",  marketCap: "398 MLRD", sparkline: [272,276,280,283,287,289,291.25], trend: "up"   },
    { rank:  2, symbol: "KCHOL", name: "Koc Holding A.S.",            sector: "Holding",    price: 196.50, changeDay: 3.24,  changeWeek: 6.12,  volume: "4.1 MLRD",  marketCap: "312 MLRD", sparkline: [183,186,189,192,194,195,196.50], trend: "up"   },
    { rank:  3, symbol: "ASELS", name: "Aselsan A.S.",                sector: "Savunma",    price: 83.60,  changeDay: 5.42,  changeWeek: 9.14,  volume: "2.8 MLRD",  marketCap: "185 MLRD", sparkline: [76,78,79,80,82,83,83.60],        trend: "up"   },
    { rank:  4, symbol: "ARCLK", name: "Arcelik A.S.",                sector: "Tuketici",   price: 168.40, changeDay: 1.56,  changeWeek: 3.22,  volume: "1.4 MLRD",  marketCap: "142 MLRD", sparkline: [161,163,165,166,167,168,168.40], trend: "up"   },
    { rank:  5, symbol: "GARAN", name: "Garanti BBVA",                sector: "Bankacilik", price: 114.40, changeDay: 2.81,  changeWeek: 4.55,  volume: "6.2 MLRD",  marketCap: "480 MLRD", sparkline: [106,108,110,111,113,114,114.40], trend: "up"   },
    { rank:  6, symbol: "ISCTR", name: "Is Bankasi C",                sector: "Bankacilik", price: 22.66,  changeDay: 1.44,  changeWeek: 3.88,  volume: "4.8 MLRD",  marketCap: "217 MLRD", sparkline: [21.6,21.9,22.1,22.3,22.5,22.6,22.66], trend: "up" },
    { rank:  7, symbol: "AKBNK", name: "Akbank T.A.S.",               sector: "Bankacilik", price: 58.25,  changeDay: 1.92,  changeWeek: 4.11,  volume: "3.2 MLRD",  marketCap: "468 MLRD", sparkline: [55.2,56.0,56.8,57.2,57.8,58.0,58.25], trend: "up" },
    { rank:  8, symbol: "YKBNK", name: "Yapi ve Kredi Bankasi",       sector: "Bankacilik", price: 31.88,  changeDay: 1.88,  changeWeek: 3.74,  volume: "3.7 MLRD",  marketCap: "184 MLRD", sparkline: [30.2,30.6,31.0,31.3,31.6,31.8,31.88], trend: "up" },
    { rank:  9, symbol: "TUPRS", name: "Tupras Turkiye Petrol",       sector: "Enerji",     price: 290.50, changeDay: 4.18,  changeWeek: 7.44,  volume: "2.1 MLRD",  marketCap: "259 MLRD", sparkline: [270,274,278,282,286,289,290.50], trend: "up"   },
    { rank: 10, symbol: "SASA",  name: "SASA Polyester Sanayi",       sector: "Kimya",      price: 47.18,  changeDay: 9.85,  changeWeek: 14.22, volume: "1.9 MLRD",  marketCap: "78 MLRD",  sparkline: [40,41.5,43,44.5,46,47,47.18],   trend: "up"   },
    { rank: 11, symbol: "EREGL", name: "Eregli Demir Celik",          sector: "Sanayi",     price: 56.85,  changeDay: -0.44, changeWeek: -1.12, volume: "1.6 MLRD",  marketCap: "189 MLRD", sparkline: [57.8,57.5,57.3,57.0,56.9,56.85,56.85], trend: "flat" },
    { rank: 12, symbol: "BIMAS", name: "BIM Magazalari A.S.",         sector: "Perakende",  price: 492.25, changeDay: 0.72,  changeWeek: 1.44,  volume: "0.9 MLRD",  marketCap: "312 MLRD", sparkline: [486,487,489,490,491,492,492.25], trend: "up"   },
    { rank: 13, symbol: "TCELL", name: "Turkcell Iletisim Hizmetleri",sector: "Iletisim",   price: 98.50,  changeDay: 0.51,  changeWeek: 1.23,  volume: "1.1 MLRD",  marketCap: "218 MLRD", sparkline: [96.8,97.2,97.6,98.0,98.2,98.4,98.50], trend: "up" },
    { rank: 14, symbol: "TTKOM", name: "Turk Telekomunikasyon",       sector: "Iletisim",   price: 24.36,  changeDay: 0.33,  changeWeek: 0.87,  volume: "0.8 MLRD",  marketCap: "86 MLRD",  sparkline: [24.0,24.1,24.2,24.2,24.3,24.3,24.36], trend: "up" },
    { rank: 15, symbol: "VESTL", name: "Vestel Elektronik",           sector: "Teknoloji",  price: 62.40,  changeDay: -0.96, changeWeek: -2.18, volume: "0.7 MLRD",  marketCap: "72 MLRD",  sparkline: [64.2,63.8,63.4,63.0,62.8,62.5,62.40], trend: "down" },
    { rank: 16, symbol: "DOHOL", name: "Dogan Sirketler Grubu",       sector: "Holding",    price: 18.62,  changeDay: -3.47, changeWeek: -5.88, volume: "0.9 MLRD",  marketCap: "49 MLRD",  sparkline: [20.1,19.8,19.4,19.1,18.9,18.7,18.62], trend: "down" },
    { rank: 17, symbol: "SAHOL", name: "Sabanci Holding",             sector: "Holding",    price: 81.45,  changeDay: 1.12,  changeWeek: 2.34,  volume: "1.3 MLRD",  marketCap: "215 MLRD", sparkline: [79.2,79.8,80.3,80.7,81.0,81.3,81.45], trend: "up" },
    { rank: 18, symbol: "TOASO", name: "Tofas Turk Otomobil",        sector: "Otomotiv",   price: 298.75, changeDay: 1.44,  changeWeek: 3.12,  volume: "0.6 MLRD",  marketCap: "188 MLRD", sparkline: [289,291,293,295,297,298,298.75], trend: "up"   },
    { rank: 19, symbol: "FROTO", name: "Ford Otosan",                 sector: "Otomotiv",   price: 1284.0, changeDay: 0.88,  changeWeek: 1.99,  volume: "0.5 MLRD",  marketCap: "447 MLRD", sparkline: [1256,1262,1268,1272,1276,1281,1284], trend: "up"   },
    { rank: 20, symbol: "ODAS",  name: "Odas Elektrik Uretimi",       sector: "Enerji",     price: 14.84,  changeDay: -1.46, changeWeek: -3.22, volume: "0.4 MLRD",  marketCap: "18 MLRD",  sparkline: [15.6,15.4,15.2,15.0,14.9,14.85,14.84], trend: "down" },
  ],
};
