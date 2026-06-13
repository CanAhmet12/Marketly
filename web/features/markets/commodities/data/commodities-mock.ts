/**
 * Emtia piyasa sayfasi -- statik mock veri
 */

import type {
  CommodityPulseMetrics,
  CommodityRegimePayload,
  CommodityClassPayload,
  CommodityAssetPanel,
  CommodityMoversPayload,
  CommodityBottomStripPayload,
  CommodityScreenerPayload,
} from "@/features/markets/commodities/types";

/* Pulse Bar */

export const COMMODITY_MOCK_PULSE: CommodityPulseMetrics = {
  altin:    { symbol: "XAUUSD",    price: 2348.40, unit: "$/oz",   changePct:  0.31, sparkline: [2288,2298,2312,2324,2334,2342,2348.40] },
  gumus:    { symbol: "XAGUSD",    price: 27.84,   unit: "$/oz",   changePct:  0.44, sparkline: [27.14,27.28,27.42,27.56,27.68,27.78,27.84] },
  petrol:   { symbol: "WTI",      price: 82.44,   unit: "$/bbl",  changePct: -0.88, sparkline: [84.12,83.88,83.62,83.28,82.94,82.62,82.44] },
  dogalgaz: { symbol: "NGAS", price: 2.18,    unit: "$/mmbtu",changePct: -1.24, sparkline: [2.26,2.24,2.22,2.21,2.20,2.19,2.18] },
  bakir:    { symbol: "COPPER",    price: 4.481,   unit: "$/lb",   changePct:  0.66, sparkline: [4.402,4.418,4.434,4.449,4.462,4.474,4.481] },
  bugday:   { symbol: "WHEAT",   price: 524,     unit: "c/bu",   changePct: -0.44, sparkline: [528,527,526,526,525,524,524] },
  endeks: {
    value: 98.4, changePct: 0.22, label: "Bloomberg CCI",
    sparkline: [97.2,97.5,97.8,98.0,98.1,98.3,98.4],
  },
  trendScore: { value: 62, label: "Olumlu" },
  volatility: { value: 48, label: "Orta" },
};

/* Market Regime */

export const COMMODITY_MOCK_REGIME: CommodityRegimePayload = {
  regime: "altin-sezonu",
  headline: "ALTIN SEZONU",
  summary: "Fed faiz indirim beklentileri altin talebi canlandiriyor; jeopolitik riskler guvenli liman akisini surduruyor. WTI petrol OPEC+ kesintilerine ragmen zayif seyrediyor.",
  altinValue: 2348.40,
  altinChange: 0.31,
  stats: {
    usdKorelasyon: "Ters (-0.72)",
    talepGorunumu: "Guclu",
    enflasyonBekl: "Yukselis",
    trendGucu: "Cok Guclu",
  },
  distribution: { metal: 48, enerji: 31, tarim: 21 },
};

/* Class Heatmap */

export const COMMODITY_MOCK_CLASSES: CommodityClassPayload = {
  classes: [
    { id: "degerli-metal", name: "Degerli Metaller", changePct:  0.38, leader: "ALTIN +0.31%",   heatLevel: "hot-mild",    sparkline: [0.10,0.15,0.20,0.25,0.30,0.35,0.38] },
    { id: "enerji",        name: "Enerji",           changePct: -0.72, leader: "WTI -0.88%",      heatLevel: "cold-strong", sparkline: [-0.15,-0.28,-0.40,-0.52,-0.60,-0.68,-0.72] },
    { id: "tarim",         name: "Tarim",            changePct:  1.14, leader: "BUGDAY +1.14%",   heatLevel: "hot-strong",  sparkline: [0.30,0.48,0.64,0.80,0.94,1.06,1.14] },
    { id: "endustri",      name: "Endustri Metal.",  changePct:  0.58, leader: "BAKIR +0.66%",    heatLevel: "hot-mild",    sparkline: [0.12,0.20,0.30,0.38,0.46,0.54,0.58] },
    { id: "yumusak",       name: "Yumusak Emtia",   changePct: -0.22, leader: "KAHVE -0.22%",    heatLevel: "cold-mild",   sparkline: [-0.04,-0.08,-0.11,-0.14,-0.17,-0.20,-0.22] },
    { id: "tahil",         name: "Tahil",            changePct:  0.88, leader: "MISIR +0.88%",    heatLevel: "hot-mild",    sparkline: [0.20,0.34,0.46,0.58,0.68,0.80,0.88] },
  ],
};

/* Asset Panels */

export const COMMODITY_MOCK_PANELS: { altin: CommodityAssetPanel; petrol: CommodityAssetPanel } = {
  altin: {
    symbol: "XAUUSD", name: "Altin", price: 2348.40, unit: "$/oz",
    changePct: 0.31,
    sparkline: [2288,2295,2305,2312,2320,2330,2338,2342,2345,2347,2348,2348.40],
    trend: "up",
    stats: { haftalik: "+1.24%", aylik: "+3.82%", destek: "2.310", direnc: "2.368" },
  },
  petrol: {
    symbol: "WTI", name: "Ham Petrol", price: 82.44, unit: "$/bbl",
    changePct: -0.88,
    sparkline: [84.12,83.92,83.72,83.52,83.28,83.02,82.78,82.62,82.52,82.47,82.44,82.44],
    trend: "down",
    stats: { haftalik: "-2.14%", aylik: "-4.48%", destek: "81.20", direnc: "84.50" },
  },
};

/* Movers */

export const COMMODITY_MOCK_MOVERS: CommodityMoversPayload = {
  gainers: [
    { symbol: "CORN",    name: "Misir",       changePct:  2.44, price: "464 c/bu" },
    { symbol: "SOYBEAN",     name: "Soya Fasul.", changePct:  1.88, price: "1142 c/bu" },
    { symbol: "XAGUSD",    name: "Gumus",       changePct:  0.44, price: "$27.84/oz" },
    { symbol: "COPPER",    name: "Bakir",       changePct:  0.66, price: "$4.48/lb" },
    { symbol: "XAUUSD",    name: "Altin",       changePct:  0.31, price: "$2348/oz" },
  ],
  losers: [
    { symbol: "NGAS", name: "Dogalgaz",    changePct: -1.24, price: "$2.18" },
    { symbol: "WTI",   name: "WTI Petrol",  changePct: -0.88, price: "$82.44" },
    { symbol: "COTTON",    name: "Pamuk",       changePct: -0.72, price: "81.4 c/lb" },
    { symbol: "SUGAR",    name: "Seker",       changePct: -0.44, price: "22.8 c/lb" },
    { symbol: "WHEAT",   name: "Bugday",      changePct: -0.44, price: "524 c/bu" },
  ],
  volume: [
    { symbol: "WTI",      name: "Ham Petrol",  changePct: -0.88, volume: "482K lot" },
    { symbol: "XAUUSD",    name: "Altin",       changePct:  0.31, volume: "312K lot" },
    { symbol: "NGAS", name: "Dogalgaz",    changePct: -1.24, volume: "264K lot" },
    { symbol: "XAGUSD",    name: "Gumus",       changePct:  0.44, volume: "198K lot" },
    { symbol: "COPPER",    name: "Bakir",       changePct:  0.66, volume: "142K lot" },
  ],
};

/* Bottom Strip */

export const COMMODITY_MOCK_BOTTOM: CommodityBottomStripPayload = {
  watchlist: [
    { symbol: "XAUUSD",    price: 2348.40, unit: "$/oz",    changePct:  0.31, sparkline: [2288,2305,2320,2334,2342,2347,2348.40], trend: "up"   },
    { symbol: "WTI",      price: 82.44,   unit: "$/bbl",   changePct: -0.88, sparkline: [84.12,83.72,83.28,82.94,82.62,82.47,82.44], trend: "down" },
    { symbol: "XAGUSD",    price: 27.84,   unit: "$/oz",    changePct:  0.44, sparkline: [27.14,27.32,27.50,27.64,27.75,27.81,27.84], trend: "up"   },
    { symbol: "COPPER",    price: 4.481,   unit: "$/lb",    changePct:  0.66, sparkline: [4.402,4.428,4.448,4.462,4.474,4.480,4.481], trend: "up"   },
    { symbol: "WHEAT",   price: 524,     unit: "c/bu",    changePct: -0.44, sparkline: [528,527,526,526,525,524,524], trend: "down" },
  ],
  calendar: [
    { id: "ev1", date: "22 May",   title: "OPEC+ Uretim Karari Aciklamasi",         impact: "high",   type: "opec"    },
    { id: "ev2", date: "28 May",   title: "ABD Ham Petrol Stok Verileri (EIA)",      impact: "medium", type: "report"  },
    { id: "ev3", date: "3 Haz",    title: "ABD Tahil Ekim Alani Raporu (USDA)",      impact: "medium", type: "harvest" },
  ],
  correlation: [
    { symbol: "ALTIN/USD",  correlation: -0.72, label: "Ters",   changePct:  0.31 },
    { symbol: "PETROL/USD", correlation: -0.48, label: "Zayif",  changePct: -0.88 },
    { symbol: "GUMUS/USD",  correlation: -0.68, label: "Ters",   changePct:  0.44 },
    { symbol: "BAKIR/USD",  correlation: -0.34, label: "Zayif",  changePct:  0.66 },
  ],
};

/* Screener */

export const COMMODITY_MOCK_SCREENER: CommodityScreenerPayload = {
  assets: [
    { rank:  1, symbol: "XAUUSD",    name: "Altin",                  category: "degerli-metal", price: 2348.40, unit: "$/oz",    changeDay:  0.31, changeWeek:  1.24, changeMonth:  3.82, volume: "312K",  sparkline: [2288,2305,2320,2334,2342,2347,2348.40],  trend: "up"   },
    { rank:  2, symbol: "WTI",      name: "Ham Petrol (WTI)",        category: "enerji",        price: 82.44,   unit: "$/bbl",   changeDay: -0.88, changeWeek: -2.14, changeMonth: -4.48, volume: "482K",  sparkline: [84.12,83.72,83.28,82.94,82.62,82.47,82.44], trend: "down" },
    { rank:  3, symbol: "XAGUSD",    name: "Gumus",                   category: "degerli-metal", price: 27.84,   unit: "$/oz",    changeDay:  0.44, changeWeek:  2.18, changeMonth:  5.44, volume: "198K",  sparkline: [27.14,27.32,27.50,27.64,27.75,27.81,27.84], trend: "up"   },
    { rank:  4, symbol: "BRENT",    name: "Brent Ham Petrol",        category: "enerji",        price: 86.88,   unit: "$/bbl",   changeDay: -0.72, changeWeek: -1.88, changeMonth: -3.94, volume: "368K",  sparkline: [88.42,88.04,87.62,87.22,86.96,86.92,86.88],  trend: "down" },
    { rank:  5, symbol: "COPPER",    name: "Bakir",                   category: "endustri",      price: 4.481,   unit: "$/lb",    changeDay:  0.66, changeWeek:  2.44, changeMonth:  6.12, volume: "142K",  sparkline: [4.402,4.428,4.448,4.462,4.474,4.480,4.481],  trend: "up"   },
    { rank:  6, symbol: "ALUMINUM",     name: "Aluminyum",               category: "endustri",      price: 2.414,   unit: "$/lb",    changeDay:  0.48, changeWeek:  1.88, changeMonth:  4.22, volume: "98K",   sparkline: [2.364,2.376,2.388,2.398,2.406,2.412,2.414],  trend: "up"   },
    { rank:  7, symbol: "NGAS", name: "Dogal Gaz",               category: "enerji",        price: 2.18,    unit: "$/mmbtu", changeDay: -1.24, changeWeek: -4.82, changeMonth: -8.44, volume: "264K",  sparkline: [2.26,2.24,2.22,2.21,2.20,2.19,2.18],         trend: "down" },
    { rank:  8, symbol: "XPTUSD",   name: "Platin",                  category: "degerli-metal", price: 986.40,  unit: "$/oz",    changeDay:  0.28, changeWeek:  0.84, changeMonth:  1.44, volume: "48K",   sparkline: [978.2,980.4,982.6,983.8,985.0,986.0,986.40],  trend: "up"   },
    { rank:  9, symbol: "NICKEL",    name: "Nikel",                   category: "endustri",      price: 18440,   unit: "$/t",     changeDay: -0.34, changeWeek: -1.22, changeMonth: -2.88, volume: "78K",   sparkline: [18780,18720,18660,18600,18540,18480,18440],    trend: "down" },
    { rank: 10, symbol: "WHEAT",   name: "Bugday",                  category: "tarim",         price: 524,     unit: "c/bu",    changeDay: -0.44, changeWeek: -1.88, changeMonth: -3.44, volume: "168K",  sparkline: [528,527,526,526,525,524,524],                  trend: "down" },
    { rank: 11, symbol: "CORN",    name: "Misir",                   category: "tarim",         price: 464,     unit: "c/bu",    changeDay:  2.44, changeWeek:  3.88, changeMonth:  5.14, volume: "212K",  sparkline: [440,445,450,455,459,462,464],                  trend: "up"   },
    { rank: 12, symbol: "SOYBEAN",     name: "Soya Fasulyesi",          category: "tarim",         price: 1142,    unit: "c/bu",    changeDay:  1.88, changeWeek:  2.44, changeMonth:  3.12, volume: "184K",  sparkline: [1118,1122,1128,1132,1136,1140,1142],           trend: "up"   },
    { rank: 13, symbol: "ZINC",    name: "Cinko",                   category: "endustri",      price: 2840,    unit: "$/t",     changeDay:  0.22, changeWeek:  0.88, changeMonth:  2.14, volume: "62K",   sparkline: [2782,2796,2808,2818,2828,2836,2840],           trend: "up"   },
    { rank: 14, symbol: "XPDUSD", name: "Paladyum",                category: "degerli-metal", price: 1024,    unit: "$/oz",    changeDay: -0.18, changeWeek: -0.88, changeMonth: -2.44, volume: "28K",   sparkline: [1044,1040,1036,1032,1028,1024,1024],           trend: "down" },
    { rank: 15, symbol: "COFFEE",    name: "Kahve (Arabika)",         category: "tarim",         price: 214.8,   unit: "c/lb",    changeDay: -0.22, changeWeek: -1.44, changeMonth: -2.88, volume: "88K",   sparkline: [218.4,217.6,216.8,216.0,215.4,215.0,214.8],   trend: "down" },
    { rank: 16, symbol: "SUGAR",    name: "Seker",                   category: "tarim",         price: 22.8,    unit: "c/lb",    changeDay: -0.44, changeWeek: -2.14, changeMonth: -4.28, volume: "142K",  sparkline: [23.4,23.2,23.1,23.0,22.9,22.8,22.8],          trend: "down" },
    { rank: 17, symbol: "COTTON",    name: "Pamuk",                   category: "tarim",         price: 81.4,    unit: "c/lb",    changeDay: -0.72, changeWeek: -1.88, changeMonth: -3.44, volume: "68K",   sparkline: [83.2,82.8,82.4,82.0,81.8,81.5,81.4],          trend: "down" },
    { rank: 18, symbol: "COCOA",    name: "Kakao",                   category: "tarim",         price: 9840,    unit: "$/t",     changeDay:  0.88, changeWeek:  2.44, changeMonth:  4.88, volume: "42K",   sparkline: [9640,9688,9728,9768,9800,9824,9840],           trend: "up"   },
    { rank: 19, symbol: "FUEL",     name: "Fuel Oil",                category: "enerji",        price: 2.684,   unit: "$/gal",   changeDay: -0.44, changeWeek: -1.44, changeMonth: -3.12, volume: "48K",   sparkline: [2.730,2.720,2.710,2.700,2.694,2.688,2.684],   trend: "down" },
    { rank: 20, symbol: "LEAD",   name: "Kursun",                  category: "endustri",      price: 2180,    unit: "$/t",     changeDay:  0.14, changeWeek:  0.44, changeMonth:  1.22, volume: "38K",   sparkline: [2164,2168,2172,2174,2177,2179,2180],           trend: "up"   },
  ],
};
