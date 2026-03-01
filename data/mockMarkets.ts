export type AssetCategory = 'crypto' | 'stocks' | 'commodities' | 'forex';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: string;
  priceNum: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  category: AssetCategory;
  // 10-point sparkline (relative 0-100 values)
  spark: number[];
  logoColor: string;
  logoLetter: string;
}

// Legacy compat
export type { MarketAsset as default };

export const mockMarketAssets: MarketAsset[] = [
  // ── Crypto ──────────────────────────────────────
  {
    id: 'btc', symbol: 'BTC', name: 'Bitcoin',
    price: '$66,482', priceNum: 66482, changePercent: 3.18,
    volume: '$42.1B', marketCap: '$1.31T',
    category: 'crypto',
    spark: [40, 38, 45, 50, 47, 55, 60, 58, 65, 72],
    logoColor: '#F7931A', logoLetter: '₿',
  },
  {
    id: 'eth', symbol: 'ETH', name: 'Ethereum',
    price: '$3,521', priceNum: 3521, changePercent: 2.45,
    volume: '$18.4B', marketCap: '$423B',
    category: 'crypto',
    spark: [50, 48, 52, 55, 53, 58, 56, 60, 63, 68],
    logoColor: '#627EEA', logoLetter: 'Ξ',
  },
  {
    id: 'bnb', symbol: 'BNB', name: 'BNB',
    price: '$412', priceNum: 412, changePercent: -1.2,
    volume: '$2.8B', marketCap: '$63B',
    category: 'crypto',
    spark: [60, 62, 58, 55, 57, 53, 50, 52, 49, 47],
    logoColor: '#F3BA2F', logoLetter: 'B',
  },
  {
    id: 'sol', symbol: 'SOL', name: 'Solana',
    price: '$189', priceNum: 189, changePercent: 5.67,
    volume: '$4.1B', marketCap: '$82B',
    category: 'crypto',
    spark: [30, 35, 38, 42, 40, 48, 52, 58, 62, 70],
    logoColor: '#9945FF', logoLetter: 'S',
  },
  {
    id: 'xrp', symbol: 'XRP', name: 'XRP',
    price: '$0.625', priceNum: 0.625, changePercent: -0.85,
    volume: '$1.9B', marketCap: '$34B',
    category: 'crypto',
    spark: [55, 58, 54, 52, 56, 53, 51, 54, 50, 48],
    logoColor: '#00AAE4', logoLetter: 'X',
  },

  // ── Stocks ──────────────────────────────────────
  {
    id: 'aapl', symbol: 'AAPL', name: 'Apple',
    price: '$189.30', priceNum: 189.30, changePercent: 1.24,
    volume: '$3.2B', marketCap: '$2.95T',
    category: 'stocks',
    spark: [60, 62, 61, 64, 63, 65, 67, 66, 68, 70],
    logoColor: '#555', logoLetter: '',
  },
  {
    id: 'nvda', symbol: 'NVDA', name: 'NVIDIA',
    price: '$875.40', priceNum: 875.40, changePercent: 4.12,
    volume: '$8.7B', marketCap: '$2.16T',
    category: 'stocks',
    spark: [45, 50, 55, 52, 58, 62, 65, 70, 74, 80],
    logoColor: '#76B900', logoLetter: 'N',
  },
  {
    id: 'tsla', symbol: 'TSLA', name: 'Tesla',
    price: '$244.80', priceNum: 244.80, changePercent: -2.34,
    volume: '$5.4B', marketCap: '$779B',
    category: 'stocks',
    spark: [65, 62, 60, 63, 58, 55, 57, 53, 50, 48],
    logoColor: '#CC0000', logoLetter: 'T',
  },
  {
    id: 'msft', symbol: 'MSFT', name: 'Microsoft',
    price: '$412.50', priceNum: 412.50, changePercent: 0.78,
    volume: '$2.1B', marketCap: '$3.07T',
    category: 'stocks',
    spark: [55, 57, 56, 58, 60, 59, 61, 62, 63, 65],
    logoColor: '#00A4EF', logoLetter: 'M',
  },

  // ── Commodities ──────────────────────────────────
  {
    id: 'gold', symbol: 'XAU', name: 'Altın',
    price: '$2,345', priceNum: 2345, changePercent: 0.42,
    volume: '$142B',
    category: 'commodities',
    spark: [50, 52, 51, 54, 53, 55, 54, 56, 57, 58],
    logoColor: '#D4AF37', logoLetter: 'Au',
  },
  {
    id: 'silver', symbol: 'XAG', name: 'Gümüş',
    price: '$27.85', priceNum: 27.85, changePercent: -0.61,
    volume: '$12B',
    category: 'commodities',
    spark: [60, 58, 57, 59, 56, 54, 55, 53, 52, 50],
    logoColor: '#AAA', logoLetter: 'Ag',
  },
  {
    id: 'oil', symbol: 'WTI', name: 'Ham Petrol',
    price: '$83.20', priceNum: 83.20, changePercent: 1.85,
    volume: '$28B',
    category: 'commodities',
    spark: [40, 42, 45, 44, 48, 50, 52, 54, 55, 58],
    logoColor: '#222', logoLetter: 'WTI',
  },

  // ── Forex ────────────────────────────────────────
  {
    id: 'usdtry', symbol: 'USD/TRY', name: 'Dolar/TL',
    price: '₺32.45', priceNum: 32.45, changePercent: 0.31,
    volume: '$2.8B',
    category: 'forex',
    spark: [45, 47, 48, 50, 52, 51, 53, 55, 56, 58],
    logoColor: '#E53935', logoLetter: '$',
  },
  {
    id: 'eurtry', symbol: 'EUR/TRY', name: 'Euro/TL',
    price: '₺35.20', priceNum: 35.20, changePercent: 0.18,
    volume: '$1.4B',
    category: 'forex',
    spark: [50, 51, 52, 53, 52, 54, 55, 56, 57, 58],
    logoColor: '#1A73E8', logoLetter: '€',
  },
  {
    id: 'eurusd', symbol: 'EUR/USD', name: 'Euro/Dolar',
    price: '$1.0845', priceNum: 1.0845, changePercent: -0.22,
    volume: '$45B',
    category: 'forex',
    spark: [58, 57, 55, 56, 54, 53, 55, 52, 51, 50],
    logoColor: '#1A73E8', logoLetter: '€',
  },
];

export const trendingAssets = mockMarketAssets
  .filter((a) => Math.abs(a.changePercent) > 1)
  .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
  .slice(0, 5);
