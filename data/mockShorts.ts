export interface ShortItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  assetTags: string[];
  changePercent?: number;
  currentPrice?: string;
  priceChange24h?: string;
  signal?: {
    direction: 'BUY' | 'SELL' | 'HOLD';
    entry: string;
    target: string;
    confidence: number;
  };
  creator: {
    id: string;
    name: string;
    avatar: string;
    followers: string;
    verified: boolean;
    successRate?: number;
  };
  stats: { likes: number; comments: number; shares: number; views: number };
  duration: string;
  audio: string;
  category: string;
  spark?: number[];
}
