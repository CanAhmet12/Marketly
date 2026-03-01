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
  spark: number[];
  logoColor: string;
  logoLetter: string;
}

export type { MarketAsset as default };
