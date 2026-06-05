/**
 * NASDAQ piyasa sayfasi -- statik mock veri
 */

import type {
  NasdaqPulseMetrics,
  NasdaqRegimePayload,
  NasdaqSectorPayload,
  NasdaqIndexPanel,
  NasdaqMoversPayload,
  NasdaqBottomStripPayload,
  NasdaqScreenerPayload,
} from "@/features/markets/nasdaq/types";

/* Pulse Bar */

export const NASDAQ_MOCK_PULSE: NasdaqPulseMetrics = {
  ndx:       { label: "NASDAQ 100",    value: 17847, changePct:  0.82, sparkline: [17422,17510,17588,17644,17702,17782,17847] },
  composite: { label: "NASDAQ Comp.",  value: 16742, changePct:  0.74, sparkline: [16318,16388,16452,16508,16574,16672,16742] },
  sp500:     { label: "S&P 500",       value: 5264,  changePct:  0.44, sparkline: [5188,5204,5218,5234,5246,5258,5264] },
  vix: { value: 14.82, changePct: -2.14 },
  totalVolume: "$284B",
  marketMood: { value: 71, label: "Risk-On" },
  fedPivot:   { value: 64, label: "Yaklasan" },
};

/* Regime */

export const NASDAQ_MOCK_REGIME: NasdaqRegimePayload = {
  regime: "tech-rally",
  headline: "TECH RALLY",
  summary: "Nvidia onculugunde yapay zeka hisseleri rekor kiriyor; Fed faiz indirim beklentileri buyume hisselerini destekliyor. NDX tarihi zirve seviyelerini test ediyor.",
  ndxValue: 17847,
  ndxChange: 0.82,
  stats: {
    bigTechHareket: "+1.2% Ortalama",
    faizBeklentisi: "Indirim Var",
    buyumeMomentu:  "Guclu",
    teknik:         "Yukari",
  },
  distribution: { tech: 58, health: 12, other: 30 },
};

/* Sectors */

export const NASDAQ_MOCK_SECTORS: NasdaqSectorPayload = {
  sectors: [
    { id: "ai",       name: "AI & Makine",   changePct:  1.82, leader: "NVDA +2.44%", heatLevel: "hot-strong", sparkline: [0.44,0.72,1.00,1.28,1.52,1.70,1.82] },
    { id: "semi",     name: "Yariletken",    changePct:  1.44, leader: "SMCI +2.12%", heatLevel: "hot-strong", sparkline: [0.32,0.56,0.80,1.00,1.22,1.36,1.44] },
    { id: "ev",       name: "EV & Temiz",    changePct:  1.14, leader: "TSLA +1.88%", heatLevel: "hot-mild",   sparkline: [0.22,0.44,0.62,0.80,0.96,1.08,1.14] },
    { id: "cloud",    name: "Bulut Bilisim",  changePct:  0.88, leader: "AMZN +1.14%", heatLevel: "hot-mild",   sparkline: [0.14,0.28,0.44,0.58,0.72,0.82,0.88] },
    { id: "software", name: "Yazilim",        changePct:  0.62, leader: "MSFT +0.88%", heatLevel: "hot-mild",   sparkline: [0.08,0.18,0.28,0.40,0.50,0.58,0.62] },
    { id: "security", name: "Siber Guvenlik", changePct:  0.48, leader: "CRWD +0.72%", heatLevel: "neutral",    sparkline: [0.04,0.12,0.22,0.32,0.40,0.46,0.48] },
    { id: "biotech",  name: "Biyoteknoloji",  changePct: -0.34, leader: "BIIB -0.48%", heatLevel: "cold-mild",  sparkline: [-0.04,-0.10,-0.16,-0.22,-0.28,-0.32,-0.34] },
    { id: "media",    name: "Dijital Eglence", changePct: -0.22, leader: "NFLX -0.34%", heatLevel: "cold-mild",  sparkline: [-0.02,-0.06,-0.10,-0.14,-0.18,-0.20,-0.22] },
  ],
};

/* Index Panels */

export const NASDAQ_MOCK_PANELS: { ndx: NasdaqIndexPanel; sp500: NasdaqIndexPanel } = {
  ndx: {
    symbol: "NDX", name: "NASDAQ 100",
    value: 17847, changePct: 0.82, changePoint: 144.88,
    sparkline: [17422,17490,17552,17610,17668,17726,17782,17810,17826,17840,17846,17847],
    trend: "up",
    stats: { haftalik: "+2.44%", aylik: "+6.88%", destek: "17.420", direnc: "18.040" },
  },
  sp500: {
    symbol: "SPX", name: "S&P 500",
    value: 5264, changePct: 0.44, changePoint: 23.14,
    sparkline: [5188,5202,5214,5224,5234,5244,5252,5257,5261,5263,5264,5264],
    trend: "up",
    stats: { haftalik: "+1.22%", aylik: "+3.44%", destek: "5.180", direnc: "5.340" },
  },
};

/* Movers */

export const NASDAQ_MOCK_MOVERS: NasdaqMoversPayload = {
  gainers: [
    { symbol: "NVDA",  name: "Nvidia",           changePct:  4.82, price: "$874.15" },
    { symbol: "SMCI",  name: "Super Micro",       changePct:  3.44, price: "$942.80" },
    { symbol: "AMD",   name: "Advanced Micro",    changePct:  2.88, price: "$172.44" },
    { symbol: "TSLA",  name: "Tesla",             changePct:  1.88, price: "$178.62" },
    { symbol: "META",  name: "Meta Platforms",    changePct:  1.44, price: "$498.24" },
  ],
  losers: [
    { symbol: "INTC",  name: "Intel",             changePct: -2.14, price: "$31.84" },
    { symbol: "BIIB",  name: "Biogen",            changePct: -1.88, price: "$218.40" },
    { symbol: "NFLX",  name: "Netflix",           changePct: -0.88, price: "$628.14" },
    { symbol: "CSCO",  name: "Cisco",             changePct: -0.72, price: "$48.22" },
    { symbol: "MU",    name: "Micron",            changePct: -0.44, price: "$124.88" },
  ],
  volume: [
    { symbol: "NVDA",  name: "Nvidia",            changePct:  4.82, volume: "$24.2B" },
    { symbol: "AAPL",  name: "Apple",             changePct:  0.62, volume: "$18.8B" },
    { symbol: "TSLA",  name: "Tesla",             changePct:  1.88, volume: "$14.4B" },
    { symbol: "AMZN",  name: "Amazon",            changePct:  0.88, volume: "$12.2B" },
    { symbol: "MSFT",  name: "Microsoft",         changePct:  0.82, volume: "$10.8B" },
  ],
};

/* Bottom Strip */

export const NASDAQ_MOCK_BOTTOM: NasdaqBottomStripPayload = {
  watchlist: [
    { symbol: "NVDA",  price: 874.15,  changePct:  4.82, sparkline: [770,788,812,834,852,866,874.15],  trend: "up"   },
    { symbol: "AAPL",  price: 188.42,  changePct:  0.62, sparkline: [183.4,184.8,186.0,187.2,188.0,188.3,188.42], trend: "up" },
    { symbol: "MSFT",  price: 414.28,  changePct:  0.82, sparkline: [406.4,408.2,410.0,411.4,412.8,413.8,414.28], trend: "up" },
    { symbol: "GOOGL", price: 172.84,  changePct:  0.44, sparkline: [170.2,170.8,171.4,172.0,172.4,172.7,172.84], trend: "up" },
    { symbol: "TSLA",  price: 178.62,  changePct:  1.88, sparkline: [170.4,172.2,174.0,175.8,177.0,178.0,178.62], trend: "up" },
  ],
  earnings: [
    { id: "e1", ticker: "NVDA",  name: "Nvidia Corp.",       date: "22 May",  epsEst: "$5.52 est.", timing: "AMC" },
    { id: "e2", ticker: "AAPL",  name: "Apple Inc.",         date: "1 Haz",   epsEst: "$1.52 est.", timing: "AMC" },
    { id: "e3", ticker: "MSFT",  name: "Microsoft Corp.",    date: "24 May",  epsEst: "$2.94 est.", timing: "AMC" },
  ],
  macroFed: [
    { id: "m1", date: "22 May",  title: "FOMC Tutanaklari Aciklamasi",          impact: "high"   },
    { id: "m2", date: "31 May",  title: "ABD PCE Enflasyon Verisi",             impact: "high"   },
    { id: "m3", date: "7 Haz",   title: "ABD Tarim Disi Istihdam (NFP)",        impact: "medium" },
  ],
};

/* Screener */

export const NASDAQ_MOCK_SCREENER: NasdaqScreenerPayload = {
  assets: [
    { rank:  1, symbol: "AAPL",  name: "Apple Inc.",               sector: "ai-tech",    price: 188.42,  changeDay:  0.62, changeWeek:  1.44, marketCap: "$2.91T", pe:  28.4, sparkline: [183,185,186,187,188,188,188.42], trend: "up"   },
    { rank:  2, symbol: "MSFT",  name: "Microsoft Corp.",           sector: "cloud",      price: 414.28,  changeDay:  0.82, changeWeek:  2.14, marketCap: "$3.08T", pe:  35.2, sparkline: [406,408,410,412,413,414,414.28], trend: "up"   },
    { rank:  3, symbol: "NVDA",  name: "Nvidia Corp.",              sector: "yariletken", price: 874.15,  changeDay:  4.82, changeWeek:  8.44, marketCap: "$2.15T", pe:  68.8, sparkline: [770,800,824,844,858,868,874.15], trend: "up"   },
    { rank:  4, symbol: "GOOGL", name: "Alphabet Inc.",             sector: "ai-tech",    price: 172.84,  changeDay:  0.44, changeWeek:  1.22, marketCap: "$2.14T", pe:  24.8, sparkline: [170,171,171,172,172,173,172.84], trend: "up"   },
    { rank:  5, symbol: "AMZN",  name: "Amazon.com Inc.",           sector: "cloud",      price: 182.44,  changeDay:  0.88, changeWeek:  2.44, marketCap: "$1.91T", pe:  42.8, sparkline: [178,179,180,181,182,182,182.44], trend: "up"   },
    { rank:  6, symbol: "META",  name: "Meta Platforms Inc.",       sector: "ai-tech",    price: 498.24,  changeDay:  1.44, changeWeek:  3.88, marketCap: "$1.27T", pe:  25.4, sparkline: [484,488,492,495,497,498,498.24], trend: "up"   },
    { rank:  7, symbol: "TSLA",  name: "Tesla Inc.",                sector: "ai-tech",    price: 178.62,  changeDay:  1.88, changeWeek:  4.44, marketCap: "$570B",  pe:  48.2, sparkline: [170,172,174,176,177,178,178.62], trend: "up"   },
    { rank:  8, symbol: "AVGO",  name: "Broadcom Inc.",             sector: "yariletken", price: 1384.28, changeDay:  1.22, changeWeek:  3.44, marketCap: "$640B",  pe:  34.8, sparkline: [1344,1352,1362,1370,1378,1382,1384.28], trend: "up" },
    { rank:  9, symbol: "ORCL",  name: "Oracle Corp.",              sector: "cloud",      price: 128.44,  changeDay:  0.44, changeWeek:  1.88, marketCap: "$354B",  pe:  28.8, sparkline: [126,127,127,128,128,128,128.44], trend: "up"   },
    { rank: 10, symbol: "AMD",   name: "Advanced Micro Devices",    sector: "yariletken", price: 172.44,  changeDay:  2.88, changeWeek:  6.44, marketCap: "$279B",  pe:  244.0,sparkline: [160,162,166,168,170,172,172.44], trend: "up"   },
    { rank: 11, symbol: "CSCO",  name: "Cisco Systems Inc.",        sector: "ai-tech",    price: 48.22,   changeDay: -0.72, changeWeek: -1.44, marketCap: "$197B",  pe:  14.8, sparkline: [50,49.4,48.8,48.4,48.2,48.2,48.22], trend: "down" },
    { rank: 12, symbol: "QCOM",  name: "Qualcomm Inc.",             sector: "yariletken", price: 174.88,  changeDay:  0.62, changeWeek:  1.88, marketCap: "$196B",  pe:  22.4, sparkline: [172,173,174,174,175,175,174.88], trend: "up"   },
    { rank: 13, symbol: "ADBE",  name: "Adobe Inc.",                sector: "software",   price: 488.24,  changeDay:  0.44, changeWeek:  1.22, marketCap: "$217B",  pe:  28.2, sparkline: [484,485,486,487,488,488,488.24], trend: "up"   },
    { rank: 14, symbol: "NFLX",  name: "Netflix Inc.",              sector: "media",      price: 628.14,  changeDay: -0.88, changeWeek: -2.14, marketCap: "$270B",  pe:  42.4, sparkline: [638,636,634,632,630,628,628.14], trend: "down" },
    { rank: 15, symbol: "INTC",  name: "Intel Corp.",               sector: "yariletken", price: 31.84,   changeDay: -2.14, changeWeek: -4.88, marketCap: "$135B",  pe:  null, sparkline: [34,33.4,32.8,32.4,32.0,31.9,31.84], trend: "down" },
    { rank: 16, symbol: "MU",    name: "Micron Technology",         sector: "yariletken", price: 124.88,  changeDay: -0.44, changeWeek: -1.44, marketCap: "$139B",  pe:  144.8,sparkline: [128,127,126,125,125,125,124.88], trend: "down" },
    { rank: 17, symbol: "SMCI",  name: "Super Micro Computer",      sector: "ai-tech",    price: 942.80,  changeDay:  3.44, changeWeek:  8.88, marketCap: "$54B",   pe:  28.8, sparkline: [870,888,904,920,934,942,942.80], trend: "up"   },
    { rank: 18, symbol: "CRWD",  name: "CrowdStrike Holdings",      sector: "cloud",      price: 348.24,  changeDay:  0.72, changeWeek:  2.44, marketCap: "$85B",   pe:  null, sparkline: [342,344,345,346,347,348,348.24], trend: "up"   },
    { rank: 19, symbol: "ZS",    name: "Zscaler Inc.",              sector: "cloud",      price: 188.44,  changeDay:  0.44, changeWeek:  1.88, marketCap: "$29B",   pe:  null, sparkline: [184,185,186,187,188,188,188.44], trend: "up"   },
    { rank: 20, symbol: "PANW",  name: "Palo Alto Networks",        sector: "cloud",      price: 318.24,  changeDay:  0.28, changeWeek:  1.44, marketCap: "$102B",  pe:  null, sparkline: [314,315,316,317,318,318,318.24], trend: "up"   },
    { rank: 21, symbol: "SHOP",  name: "Shopify Inc.",              sector: "ai-tech",    price: 68.84,   changeDay:  1.14, changeWeek:  2.88, marketCap: "$88B",   pe:  88.4, sparkline: [66,66.8,67.4,68.0,68.4,68.7,68.84], trend: "up"  },
    { rank: 22, symbol: "SNOW",  name: "Snowflake Inc.",            sector: "cloud",      price: 168.24,  changeDay:  0.62, changeWeek:  1.88, marketCap: "$56B",   pe:  null, sparkline: [164,165,166,167,168,168,168.24], trend: "up"   },
    { rank: 23, symbol: "ABNB",  name: "Airbnb Inc.",               sector: "diger",      price: 148.84,  changeDay:  0.44, changeWeek:  1.22, marketCap: "$95B",   pe:  18.8, sparkline: [146,147,148,148,149,149,148.84], trend: "up"   },
    { rank: 24, symbol: "UBER",  name: "Uber Technologies",         sector: "diger",      price: 72.44,   changeDay:  0.88, changeWeek:  2.44, marketCap: "$154B",  pe:  null, sparkline: [70,71,71.4,71.8,72.2,72.4,72.44], trend: "up"   },
    { rank: 25, symbol: "LYFT",  name: "Lyft Inc.",                 sector: "diger",      price: 12.84,   changeDay: -0.44, changeWeek: -1.22, marketCap: "$5.4B",  pe:  null, sparkline: [13.2,13.1,13.0,12.9,12.9,12.84,12.84], trend: "down" },
  ],
};
