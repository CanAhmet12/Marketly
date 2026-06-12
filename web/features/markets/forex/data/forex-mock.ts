/**
 * Forex piyasa sayfasi -- statik mock veri
 */

import type {
  ForexPulseMetrics,
  ForexMarketRegimePayload,
  ForexCurrencyHeatmapPayload,
  ForexPairPanel,
  ForexMoversPayload,
  ForexBottomStripPayload,
  ForexScreenerPayload,
} from "@/features/markets/forex/types";

/* Pulse Bar */

export const FOREX_MOCK_PULSE: ForexPulseMetrics = {
  eurusd: { pair: "EUR/USD", rate: 1.0847, changePct:  0.23, sparkline: [1.0801,1.0812,1.0819,1.0828,1.0835,1.0841,1.0847] },
  gbpusd: { pair: "GBP/USD", rate: 1.2741, changePct:  0.18, sparkline: [1.2710,1.2718,1.2724,1.2731,1.2736,1.2739,1.2741] },
  usdtry: { pair: "USD/TRY", rate: 32.19,  changePct:  0.44, sparkline: [31.98,32.03,32.07,32.11,32.14,32.17,32.19] },
  usdjpy: { pair: "USD/JPY", rate: 149.82, changePct: -0.31, sparkline: [150.42,150.28,150.15,150.02,149.94,149.87,149.82] },
  dxy: { value: 104.28, changePct: -0.15, sparkline: [104.62,104.54,104.48,104.42,104.36,104.31,104.28] },
  sessions: [
    { name: "Tokyo",   label: "Tokyo",   status: "closed", time: "00:00-09:00 UTC" },
    { name: "London",  label: "Londra",  status: "active", time: "08:00-17:00 UTC" },
    { name: "NewYork", label: "New York",status: "soon",   time: "13:00-22:00 UTC" },
  ],
  volatility: { value: 42, label: "Orta" },
};

/* Market Regime */

export const FOREX_MOCK_REGIME: ForexMarketRegimePayload = {
  regime: "usd-dominant",
  headline: "USD BASKIN",
  summary: "Fed'in yuksek faiz politikasi USD'yi destekliyor; risk istahinın azalmasiyla guvenli liman paralarinda talep artiyor. EUR/USD kritik 1.0800 destegini test ediyor.",
  dxyValue: 104.28,
  dxyChange: -0.15,
  stats: {
    fedTutumu: "Sikistirici",
    riskIstahi: "Dusuk",
    carryTrade: "USD Favori",
    trendGucu: "Guclu",
  },
  distribution: { safe: 52, risky: 31, em: 17 },
};

/* Currency Heatmap */

export const FOREX_MOCK_CURRENCIES: ForexCurrencyHeatmapPayload = {
  currencies: [
    { code: "USD", name: "ABD Dolari",    changePct:  0.42, heatLevel: "strong",    sparkline: [0.18,0.22,0.28,0.33,0.38,0.41,0.42] },
    { code: "GBP", name: "Ingiliz Sterlini", changePct:  0.18, heatLevel: "mild-up", sparkline: [0.05,0.08,0.11,0.14,0.16,0.17,0.18] },
    { code: "CHF", name: "Isvicre Frangi",changePct:  0.11, heatLevel: "mild-up",  sparkline: [0.03,0.05,0.07,0.09,0.10,0.11,0.11] },
    { code: "CAD", name: "Kanada Dolari", changePct:  0.08, heatLevel: "neutral",   sparkline: [-0.02,0.01,0.03,0.05,0.07,0.08,0.08] },
    { code: "EUR", name: "Euro",          changePct: -0.23, heatLevel: "mild-down", sparkline: [-0.04,-0.08,-0.12,-0.16,-0.19,-0.21,-0.23] },
    { code: "JPY", name: "Japon Yeni",    changePct: -0.31, heatLevel: "mild-down", sparkline: [-0.07,-0.11,-0.16,-0.20,-0.24,-0.28,-0.31] },
    { code: "NZD", name: "Yeni Zelanda",  changePct: -0.28, heatLevel: "mild-down", sparkline: [-0.05,-0.09,-0.13,-0.18,-0.22,-0.25,-0.28] },
    { code: "AUD", name: "Avustralya",    changePct: -0.44, heatLevel: "weak",      sparkline: [-0.10,-0.15,-0.22,-0.28,-0.34,-0.40,-0.44] },
  ],
};

/* Pair Panels */

export const FOREX_MOCK_PANELS: { eurusd: ForexPairPanel; gbpusd: ForexPairPanel; usdjpy: ForexPairPanel } = {
  eurusd: {
    symbol: "EURUSD",
    pair: "EUR/USD", base: "EUR", quote: "USD",
    rate: 1.0847, changePct: 0.23,
    bid: 1.0846, ask: 1.0848, spread: 1.9,
    sparkline: [1.0801,1.0808,1.0815,1.0820,1.0828,1.0836,1.0841,1.0844,1.0846,1.0847,1.0847,1.0847],
    trend: "up",
    stats: { dayHigh: "1.0861", dayLow: "1.0798", pipRange: "63", weeklyChange: "+0.48%" },
  },
  gbpusd: {
    symbol: "GBPUSD",
    pair: "GBP/USD", base: "GBP", quote: "USD",
    rate: 1.2741, changePct: 0.18,
    bid: 1.2740, ask: 1.2742, spread: 2.1,
    sparkline: [1.2710,1.2715,1.2720,1.2724,1.2729,1.2734,1.2737,1.2739,1.2740,1.2741,1.2741,1.2741],
    trend: "up",
    stats: { dayHigh: "1.2758", dayLow: "1.2703", pipRange: "55", weeklyChange: "+0.31%" },
  },
  usdjpy: {
    symbol: "USDJPY",
    pair: "USD/JPY", base: "USD", quote: "JPY",
    rate: 149.82, changePct: 0.44,
    bid: 149.810, ask: 149.830, spread: 2.0,
    sparkline: [149.20,149.40,149.58,149.68,149.74,149.80,149.82,149.82,149.82,149.82,149.82,149.82],
    trend: "up",
    stats: { dayHigh: "150.44", dayLow: "149.60", pipRange: "84", weeklyChange: "+0.62%" },
  },
};

/* Movers */

export const FOREX_MOCK_MOVERS = {
  gainers: [
    { pair: "USD/JPY", changePct:  0.44, pip:  66 },
    { pair: "USD/TRY", changePct:  0.44, pip: 141 },
    { pair: "GBP/JPY", changePct:  0.31, pip:  47 },
    { pair: "EUR/USD", changePct:  0.23, pip:  25 },
    { pair: "GBP/USD", changePct:  0.18, pip:  23 },
  ],
  losers: [
    { pair: "AUD/USD", changePct: -0.44, pip: -31 },
    { pair: "NZD/USD", changePct: -0.28, pip: -19 },
    { pair: "EUR/JPY", changePct: -0.28, pip: -41 },
    { pair: "AUD/JPY", changePct: -0.22, pip: -32 },
    { pair: "EUR/GBP", changePct: -0.18, pip: -13 },
  ],
  active: [
    { pair: "EUR/USD", volume: "8.4B",  changePct:  0.23 },
    { pair: "GBP/USD", volume: "5.1B",  changePct:  0.18 },
    { pair: "USD/JPY", volume: "4.8B",  changePct:  0.44 },
    { pair: "USD/TRY", volume: "2.9B",  changePct:  0.44 },
    { pair: "USD/CHF", volume: "2.2B",  changePct: -0.11 },
  ],
};

/* Bottom Strip */

export const FOREX_MOCK_BOTTOM: ForexBottomStripPayload = {
  watchlist: [
    { pair: "EUR/USD", rate: 1.0847, changePct:  0.23, sparkline: [1.0801,1.0815,1.0828,1.0836,1.0841,1.0847,1.0847], trend: "up"   },
    { pair: "GBP/USD", rate: 1.2741, changePct:  0.18, sparkline: [1.2710,1.2718,1.2726,1.2733,1.2738,1.2741,1.2741], trend: "up"   },
    { pair: "USD/TRY", rate: 32.19,  changePct:  0.44, sparkline: [31.98,32.04,32.08,32.12,32.16,32.18,32.19],        trend: "up"   },
    { pair: "USD/JPY", rate: 149.82, changePct: -0.31, sparkline: [150.42,150.28,150.14,150.00,149.92,149.85,149.82], trend: "down" },
    { pair: "EUR/TRY", rate: 34.91,  changePct:  0.22, sparkline: [34.74,34.78,34.82,34.86,34.89,34.91,34.91],        trend: "up"   },
  ],
  centralBanks: [
    { id: "cb1", time: "17:00", bank: "Fed",  title: "FOMC Toplantisi Tutanaklari",        impact: "high",   country: "US" },
    { id: "cb2", time: "13:45", bank: "ECB",  title: "ECB Baskani Lagarde Konusmasi",      impact: "high",   country: "EU" },
    { id: "cb3", time: "11:00", bank: "TCMB", title: "Turkiye Enflasyon Verisi",           impact: "medium", country: "TR" },
  ],
  commodities: [
    { symbol: "ALTIN/USD",   price: 2348.40, changePct:  0.31, trend: "up",   unit: "$/oz"  },
    { symbol: "PETROL/USD",  price: 82.44,   changePct: -0.88, trend: "down", unit: "$/bbl" },
    { symbol: "VIX",         price: 14.82,   changePct: -2.14, trend: "down", unit: ""      },
    { symbol: "GUMUS/USD",   price: 27.84,   changePct:  0.44, trend: "up",   unit: "$/oz"  },
  ],
};

/* FX Screener */

export const FOREX_MOCK_SCREENER: ForexScreenerPayload = {
  assets: [
    { rank: 1, symbol: "EURUSD", pair: "EUR/USD", category: "major",  bid: 1.08460, ask: 1.08480, spread: 1.9, pipChange:  25, changePct:  0.23, dayHigh: 1.0861, dayLow: 1.0798, session: "LDN", sparkline: [1.0801,1.0815,1.0828,1.0836,1.0841,1.0847,1.0847], trend: "up"   },
    { rank: 2, symbol: "GBPUSD", pair: "GBP/USD", category: "major",  bid: 1.27400, ask: 1.27420, spread: 2.1, pipChange:  23, changePct:  0.18, dayHigh: 1.2758, dayLow: 1.2703, session: "LDN", sparkline: [1.2710,1.2720,1.2730,1.2736,1.2740,1.2741,1.2741], trend: "up"   },
    { rank: 3, symbol: "USDJPY", pair: "USD/JPY", category: "major",  bid: 149.810, ask: 149.830, spread: 2.0, pipChange:  66, changePct:  0.44, dayHigh: 150.44, dayLow: 149.60, session: "LDN", sparkline: [149.20,149.40,149.58,149.68,149.74,149.80,149.82], trend: "up"   },
    { rank: 4, symbol: "USDCHF", pair: "USD/CHF", category: "major",  bid: 0.90320, ask: 0.90340, spread: 2.2, pipChange: -10, changePct: -0.11, dayHigh: 0.9052, dayLow: 0.9028, session: "LDN", sparkline: [0.9044,0.9042,0.9040,0.9038,0.9036,0.9033,0.9032], trend: "down" },
    { rank: 5, symbol: "AUDUSD", pair: "AUD/USD", category: "major",  bid: 0.64880, ask: 0.64900, spread: 2.0, pipChange: -29, changePct: -0.44, dayHigh: 0.6528, dayLow: 0.6483, session: "LDN", sparkline: [0.6528,0.6518,0.6508,0.6500,0.6494,0.6489,0.6488], trend: "down" },
    { rank: 6, symbol: "NZDUSD", pair: "NZD/USD", category: "major",  bid: 0.59640, ask: 0.59660, spread: 2.3, pipChange: -17, changePct: -0.28, dayHigh: 0.5992, dayLow: 0.5960, session: "LDN", sparkline: [0.5990,0.5984,0.5978,0.5972,0.5967,0.5964,0.5964], trend: "down" },
    { rank: 7, symbol: "USDCAD", pair: "USD/CAD", category: "major",  bid: 1.36480, ask: 1.36510, spread: 2.8, pipChange:  -5, changePct: -0.04, dayHigh: 1.3662, dayLow: 1.3638, session: "LDN", sparkline: [1.3650,1.3648,1.3646,1.3647,1.3648,1.3648,1.3648], trend: "flat" },
    { rank: 8, symbol: "EURGBP", pair: "EUR/GBP", category: "minor",  bid: 0.85100, ask: 0.85120, spread: 2.1, pipChange: -15, changePct: -0.18, dayHigh: 0.8538, dayLow: 0.8506, session: "LDN", sparkline: [0.8528,0.8524,0.8520,0.8515,0.8511,0.8510,0.8510], trend: "down" },
    { rank: 9, symbol: "EURJPY", pair: "EUR/JPY", category: "minor",  bid: 162.540, ask: 162.570, spread: 3.0, pipChange: -41, changePct: -0.25, dayHigh: 163.26, dayLow: 162.44, session: "LDN", sparkline: [163.26,163.08,162.90,162.74,162.60,162.54,162.54], trend: "down" },
    { rank: 10, symbol: "GBPJPY", pair: "GBP/JPY", category: "minor",  bid: 190.940, ask: 190.980, spread: 3.8, pipChange:  47, changePct:  0.25, dayHigh: 191.24, dayLow: 190.20, session: "LDN", sparkline: [190.20,190.44,190.62,190.76,190.86,190.94,190.94], trend: "up"   },
    { rank: 11, symbol: "AUDJPY", pair: "AUD/JPY", category: "minor",  bid: 97.160,  ask: 97.200,  spread: 3.5, pipChange: -33, changePct: -0.34, dayHigh: 97.82,  dayLow: 97.10,  session: "LDN", sparkline: [97.82,97.66,97.52,97.38,97.26,97.16,97.16],   trend: "down" },
    { rank: 12, symbol: "CHFJPY", pair: "CHF/JPY", category: "minor",  bid: 165.800, ask: 165.840, spread: 3.9, pipChange:  28, changePct:  0.17, dayHigh: 165.98, dayLow: 165.44, session: "LDN", sparkline: [165.44,165.56,165.66,165.74,165.80,165.80,165.80], trend: "up"   },
    { rank: 13, symbol: "EURAUD", pair: "EUR/AUD", category: "minor",  bid: 1.67180, ask: 1.67230, spread: 5.0, pipChange:  68, changePct:  0.41, dayHigh: 1.6740, dayLow: 1.6634, session: "LDN", sparkline: [1.6634,1.6660,1.6686,1.6704,1.6714,1.6718,1.6718], trend: "up"   },
    { rank: 14, symbol: "GBPAUD", pair: "GBP/AUD", category: "minor",  bid: 1.96480, ask: 1.96540, spread: 5.8, pipChange:  62, changePct:  0.32, dayHigh: 1.9668, dayLow: 1.9572, session: "LDN", sparkline: [1.9572,1.9596,1.9616,1.9632,1.9644,1.9648,1.9648], trend: "up"   },
    { rank: 15, symbol: "USDTRY", pair: "USD/TRY", category: "exotic", bid: 32.1800, ask: 32.2100, spread: 30.0,pipChange: 141, changePct:  0.44, dayHigh: 32.24,  dayLow: 31.98,  session: "LDN", sparkline: [31.98,32.04,32.08,32.12,32.16,32.19,32.19],  trend: "up"   },
    { rank: 16, symbol: "EURTRY", pair: "EUR/TRY", category: "exotic", bid: 34.8900, ask: 34.9300, spread: 40.0,pipChange: 152, changePct:  0.44, dayHigh: 34.96,  dayLow: 34.72,  session: "LDN", sparkline: [34.72,34.78,34.83,34.87,34.90,34.91,34.91],  trend: "up"   },
    { rank: 17, symbol: "GBPTRY", pair: "GBP/TRY", category: "exotic", bid: 40.9600, ask: 41.0200, spread: 60.0,pipChange: 180, changePct:  0.44, dayHigh: 41.08,  dayLow: 40.76,  session: "LDN", sparkline: [40.76,40.84,40.90,40.95,40.98,40.96,40.96],  trend: "up"   },
    { rank: 18, symbol: "USDMXN", pair: "USD/MXN", category: "exotic", bid: 17.0800, ask: 17.0950, spread: 15.0,pipChange: -44, changePct: -0.26, dayHigh: 17.14,  dayLow: 17.06,  session: "NY",  sparkline: [17.14,17.12,17.10,17.09,17.08,17.08,17.08],  trend: "down" },
    { rank: 19, symbol: "USDZAR", pair: "USD/ZAR", category: "exotic", bid: 18.8400, ask: 18.8700, spread: 30.0,pipChange: 122, changePct:  0.65, dayHigh: 18.88,  dayLow: 18.68,  session: "LDN", sparkline: [18.68,18.74,18.78,18.82,18.84,18.84,18.84],  trend: "up"   },
    { rank: 20, symbol: "EURCHF", pair: "EUR/CHF", category: "minor",  bid: 0.96640, ask: 0.96670, spread: 2.8, pipChange: -18, changePct: -0.19, dayHigh: 0.9692, dayLow: 0.9660, session: "LDN", sparkline: [0.9692,0.9686,0.9680,0.9674,0.9667,0.9664,0.9664], trend: "down" },
  ],
};
