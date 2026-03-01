export type SignalDirection = 'BUY' | 'SELL' | 'HOLD';
export type SignalTimeframe = 'Kısa Vade' | 'Orta Vade' | 'Uzun Vade';
export type SignalConfidence = 1 | 2 | 3 | 4 | 5;

export interface TradeSignal {
  id: string;
  asset: string;
  assetName: string;
  direction: SignalDirection;
  confidence: SignalConfidence;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  timeframe: SignalTimeframe;
  rationale: string;
  priceChange: number;
  isNew: boolean;
  postedAt: string;
  logoColor: string;
  logoLetter: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    successRate: number;
    totalSignals: number;
  };
  stats: {
    likes: number;
    comments: number;
    copies: number;
  };
}
