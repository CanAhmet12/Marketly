/**
 * Kripto piyasalar sayfasi -- statik mock veri
 *
 * Tum zone'lar bu dosyadaki sabit verilerle calisir.
 * Ileride useCryptoData() hook ile gercek data adapter'ina baglanabilir.
 */

import type {
  CryptoDashboardPhase1,
  CryptoMoversPayload,
  CryptoSegmentsPayload,
  CryptoSignalStripPayload,
  CryptoScreenerPayload,
} from "@/features/markets/crypto/types";

/* Phase 1 -- Pulse + Regime + BTC/ETH */

export const CRYPTO_MOCK_PHASE1: CryptoDashboardPhase1 = {
  pulse: {
    btc: { price: 103840, change24h: 2.14, marketCapLabel: "$2.06T" },
    eth: { price: 3812, change24h: -0.87, marketCapLabel: "$458B" },
    btcDominance: "54.3%",
    ethDominance: "12.1%",
    ethBtcRatio: "0.0367",
    totalMarketCap: "$3.82T",
    totalMarketCapChange24h: 1.38,
    volume24h: "$142.6B",
    fearGreed: { value: 72, label: "Acgozluluk" },
    altcoinSeasonIndex: 41,
  },
  regime: {
    regime: "bull",
    summary: "BTC tarihi zirveye yakin seyrediyor; spot ETF akislari guclu. Altcoin dongusu icin BTC dominance'in 52%'nin altina gerilemesi bekleniyor.",
    volatilityBand: "medium",
    volatilityLabel: "Orta volatilite",
    riskBias: 68,
    riskBiasLabel: "Risk-on egilim",
    stablecoinFlowLabel: "Stablecoin girisi devam ediyor",
    btcDominanceNumeric: 54.3,
    ethDominanceNumeric: 12.1,
  },
  btc: {
    symbol: "BTC",
    name: "Bitcoin",
    price: 103840,
    change24h: 2.14,
    change7d: 8.72,
    marketCap: "$2.06T",
    volume24h: "$48.3B",
    sparkline7d: [92400, 95100, 97800, 96200, 99500, 101200, 103840],
    trend: "up",
  },
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    price: 3812,
    change24h: -0.87,
    change7d: 4.31,
    marketCap: "$458B",
    volume24h: "$21.7B",
    sparkline7d: [3540, 3620, 3710, 3680, 3750, 3840, 3812],
    trend: "up",
  },
};

/* Movers -- Zone 2 */

export const CRYPTO_MOCK_MOVERS: CryptoMoversPayload = {
  gainers: [
    { symbol: "SOL",  change: 9.42,  price: "$198.7" },
    { symbol: "AVAX", change: 7.81,  price: "$43.2" },
    { symbol: "INJ",  change: 6.55,  price: "$28.9" },
    { symbol: "SUI",  change: 5.93,  price: "$4.71" },
    { symbol: "TIA",  change: 5.17,  price: "$12.3" },
  ],
  losers: [
    { symbol: "DOGE", change: -4.28, price: "$0.192" },
    { symbol: "SHIB", change: -3.74, price: "$0.0000261" },
    { symbol: "PEPE", change: -3.12, price: "$0.0000178" },
    { symbol: "WLD",  change: -2.88, price: "$3.47" },
    { symbol: "NEAR", change: -2.41, price: "$6.84" },
  ],
  volume: [
    { symbol: "BTC",  volume: "$48.3B", change: 2.14 },
    { symbol: "ETH",  volume: "$21.7B", change: -0.87 },
    { symbol: "SOL",  volume: "$9.4B",  change: 9.42 },
    { symbol: "USDT", volume: "$74.1B", change: 0 },
    { symbol: "BNB",  volume: "$3.2B",  change: 1.23 },
  ],
  volatile: [
    { symbol: "SOL",  volatility: "+-9.4%", change: 9.42 },
    { symbol: "AVAX", volatility: "+-7.8%", change: 7.81 },
    { symbol: "INJ",  volatility: "+-6.6%", change: 6.55 },
    { symbol: "DOGE", volatility: "+-4.3%", change: -4.28 },
    { symbol: "TIA",  volatility: "+-5.2%", change: 5.17 },
  ],
};

/* Segments -- Zone 3 */

export const CRYPTO_MOCK_SEGMENTS: CryptoSegmentsPayload = {
  segments: [
    { id: "l1",     name: "Layer 1",   change24h: 5.84,  leader: "SOL +9.4%",  heatLevel: "hot-strong",  barPct: 82 },
    { id: "defi",   name: "DeFi",      change24h: 3.21,  leader: "UNI +4.7%",  heatLevel: "hot-mild",    barPct: 64 },
    { id: "l2",     name: "Layer 2",   change24h: 1.47,  leader: "ARB +2.1%",  heatLevel: "hot-mild",    barPct: 42 },
    { id: "ai",     name: "AI Tokens", change24h: 0.88,  leader: "FET +1.4%",  heatLevel: "neutral",     barPct: 35 },
    { id: "meme",   name: "Meme",      change24h: -3.61, leader: "DOGE -4.3%", heatLevel: "cold-strong", barPct: 15 },
    { id: "gaming", name: "Gaming",    change24h: -1.22, leader: "AXS -2.0%",  heatLevel: "cold-mild",   barPct: 28 },
  ],
};

/* Signal Strip -- Zone 4 */

export const CRYPTO_MOCK_SIGNALS: CryptoSignalStripPayload = {
  totalActiveSignals: 284,
  bullPct: 67,
  bearPct: 33,
  marketBiasLabel: "Alici bias",
  topAssets: [
    { symbol: "BTC",  activeSignals: 48, bullPct: 79, biasLabel: "Guclu alim" },
    { symbol: "SOL",  activeSignals: 37, bullPct: 73, biasLabel: "Momentum" },
    { symbol: "ETH",  activeSignals: 41, bullPct: 58, biasLabel: "Notr-pozitif" },
    { symbol: "AVAX", activeSignals: 19, bullPct: 68, biasLabel: "Alim agirligi" },
    { symbol: "INJ",  activeSignals: 14, bullPct: 71, biasLabel: "Momentum" },
  ],
};

/* Screener -- Zone 5 */

export const CRYPTO_MOCK_SCREENER: CryptoScreenerPayload = {
  assets: [
    { rank: 1,  symbol: "BTC",  name: "Bitcoin",       price: 103840,      change24h: 2.14,  change7d: 8.72,  marketCap: "$2.06T", volume24h: "$48.3B", sparkline: [92400,95100,97800,96200,99500,101200,103840], trend: "up" },
    { rank: 2,  symbol: "ETH",  name: "Ethereum",      price: 3812,        change24h: -0.87, change7d: 4.31,  marketCap: "$458B",  volume24h: "$21.7B", sparkline: [3540,3620,3710,3680,3750,3840,3812],           trend: "up" },
    { rank: 3,  symbol: "BNB",  name: "BNB",           price: 712,         change24h: 1.23,  change7d: 3.88,  marketCap: "$104B",  volume24h: "$3.2B",  sparkline: [681,690,701,695,705,708,712],                  trend: "up" },
    { rank: 4,  symbol: "SOL",  name: "Solana",        price: 198.7,       change24h: 9.42,  change7d: 14.6,  marketCap: "$93.8B", volume24h: "$9.4B",  sparkline: [167,172,180,185,188,192,198.7],                trend: "up" },
    { rank: 5,  symbol: "XRP",  name: "XRP",           price: 0.6312,      change24h: 0.44,  change7d: -1.22, marketCap: "$72.1B", volume24h: "$4.8B",  sparkline: [0.641,0.635,0.628,0.630,0.627,0.633,0.631],   trend: "flat" },
    { rank: 6,  symbol: "USDC", name: "USD Coin",      price: 1.0,         change24h: 0.01,  change7d: 0.0,   marketCap: "$44.2B", volume24h: "$9.1B",  sparkline: [1,1,1,1,1,1,1],                               trend: "flat" },
    { rank: 7,  symbol: "DOGE", name: "Dogecoin",      price: 0.1924,      change24h: -4.28, change7d: -7.31, marketCap: "$28.4B", volume24h: "$2.7B",  sparkline: [0.213,0.208,0.204,0.199,0.196,0.194,0.1924],  trend: "down" },
    { rank: 8,  symbol: "ADA",  name: "Cardano",       price: 0.4847,      change24h: 0.82,  change7d: 2.14,  marketCap: "$17.2B", volume24h: "$0.9B",  sparkline: [0.466,0.471,0.476,0.473,0.479,0.482,0.485],   trend: "up" },
    { rank: 9,  symbol: "AVAX", name: "Avalanche",     price: 43.2,        change24h: 7.81,  change7d: 11.4,  marketCap: "$17.8B", volume24h: "$2.1B",  sparkline: [37.4,38.9,40.1,40.8,41.5,42.3,43.2],          trend: "up" },
    { rank: 10, symbol: "SHIB", name: "Shiba Inu",     price: 0.0000261,   change24h: -3.74, change7d: -5.88, marketCap: "$15.4B", volume24h: "$1.3B",  sparkline: [0.0000282,0.0000278,0.0000273,0.0000268,0.0000265,0.0000263,0.0000261], trend: "down" },
    { rank: 11, symbol: "DOT",  name: "Polkadot",      price: 8.74,        change24h: 1.56,  change7d: 3.21,  marketCap: "$12.8B", volume24h: "$0.7B",  sparkline: [8.31,8.42,8.55,8.61,8.68,8.71,8.74],          trend: "up" },
    { rank: 12, symbol: "LINK", name: "Chainlink",     price: 17.84,       change24h: 2.33,  change7d: 6.14,  marketCap: "$11.1B", volume24h: "$0.9B",  sparkline: [16.42,16.78,17.01,17.15,17.38,17.62,17.84],   trend: "up" },
    { rank: 13, symbol: "NEAR", name: "NEAR Protocol", price: 6.84,        change24h: -2.41, change7d: -1.88, marketCap: "$8.1B",  volume24h: "$0.5B",  sparkline: [7.22,7.14,7.08,6.99,6.95,6.88,6.84],          trend: "down" },
    { rank: 14, symbol: "INJ",  name: "Injective",     price: 28.9,        change24h: 6.55,  change7d: 13.2,  marketCap: "$7.4B",  volume24h: "$0.8B",  sparkline: [24.8,25.9,26.8,27.3,27.9,28.4,28.9],          trend: "up" },
    { rank: 15, symbol: "UNI",  name: "Uniswap",       price: 11.42,       change24h: 4.71,  change7d: 7.83,  marketCap: "$6.8B",  volume24h: "$0.6B",  sparkline: [10.22,10.51,10.74,10.88,11.02,11.24,11.42],   trend: "up" },
    { rank: 16, symbol: "SUI",  name: "Sui",           price: 4.71,        change24h: 5.93,  change7d: 9.44,  marketCap: "$5.9B",  volume24h: "$0.7B",  sparkline: [4.18,4.27,4.38,4.45,4.55,4.64,4.71],          trend: "up" },
    { rank: 17, symbol: "ARB",  name: "Arbitrum",      price: 1.24,        change24h: 2.14,  change7d: 3.77,  marketCap: "$5.2B",  volume24h: "$0.5B",  sparkline: [1.17,1.19,1.21,1.20,1.22,1.23,1.24],          trend: "up" },
    { rank: 18, symbol: "OP",   name: "Optimism",      price: 2.87,        change24h: 1.06,  change7d: 2.44,  marketCap: "$3.8B",  volume24h: "$0.3B",  sparkline: [2.74,2.77,2.81,2.79,2.83,2.85,2.87],          trend: "up" },
    { rank: 19, symbol: "PEPE", name: "Pepe",          price: 0.0000178,   change24h: -3.12, change7d: -6.41, marketCap: "$3.4B",  volume24h: "$0.9B",  sparkline: [0.0000196,0.0000191,0.0000187,0.0000184,0.0000181,0.0000179,0.0000178], trend: "down" },
    { rank: 20, symbol: "TIA",  name: "Celestia",      price: 12.3,        change24h: 5.17,  change7d: 8.92,  marketCap: "$3.1B",  volume24h: "$0.4B",  sparkline: [11.1,11.4,11.7,11.9,12.0,12.2,12.3],          trend: "up" },
  ],
};

/* Bottom Strip -- Zone 6 */

import type { CryptoBottomStripPayload } from "@/features/markets/crypto/types";

export const CRYPTO_MOCK_BOTTOM_STRIP: CryptoBottomStripPayload = {
  watchlist: [
    { symbol: "BTC",  name: "Bitcoin",   price: 103840, change24h: 2.14,  sparkline: [92400,95100,97800,96200,99500,101200,103840], trend: "up"   },
    { symbol: "ETH",  name: "Ethereum",  price: 3812,   change24h: -0.87, sparkline: [3540,3620,3710,3680,3750,3840,3812],           trend: "up"   },
    { symbol: "SOL",  name: "Solana",    price: 198.7,  change24h: 9.42,  sparkline: [167,172,180,185,188,192,198.7],                trend: "up"   },
    { symbol: "AVAX", name: "Avalanche", price: 43.2,   change24h: 7.81,  sparkline: [37.4,38.9,40.1,40.8,41.5,42.3,43.2],          trend: "up"   },
    { symbol: "LINK", name: "Chainlink", price: 17.84,  change24h: 2.33,  sparkline: [16.42,16.78,17.01,17.15,17.38,17.62,17.84],   trend: "up"   },
  ],
  news: [
    { id: "n1", title: "BlackRock BTC ETF 10. Gununde 500M$ Net Giris Kirdi", timeAgo: "2 saat once",  tag: "ETF" },
    { id: "n2", title: "Ethereum Pectra Guncellemesi Testnet'te Basarili Oldu", timeAgo: "4 saat once",  tag: "ETH" },
    { id: "n3", title: "SEC Spot ETH ETF Kararini Mayis Ayina Erteledi",       timeAgo: "6 saat once",  tag: "Duzenleme" },
  ],
  calendar: [
    { id: "c1", title: "ARB Token Unlock", date: "18 Nisan 2025", type: "unlock"  },
    { id: "c2", title: "ETH ETF Karari",   date: "23 Mayis 2025", type: "etf"     },
    { id: "c3", title: "FOMC Toplantisi",  date: "7 Mayis 2025",  type: "macro"   },
  ],
};
