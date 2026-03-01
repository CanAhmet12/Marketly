export type SignalDirection = 'BUY' | 'SELL' | 'HOLD';
export type SignalTimeframe = 'Kısa Vade' | 'Orta Vade' | 'Uzun Vade';
export type SignalConfidence = 1 | 2 | 3 | 4 | 5;

export interface TradeSignal {
  id: string;
  asset: string;
  assetName: string;
  direction: SignalDirection;
  confidence: SignalConfidence; // 1-5 stars
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  timeframe: SignalTimeframe;
  rationale: string;
  priceChange: number; // current change since signal
  isNew: boolean;
  postedAt: string;
  logoColor: string;
  logoLetter: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    successRate: number; // e.g. 78 = 78%
    totalSignals: number;
  };
  stats: {
    likes: number;
    comments: number;
    copies: number; // how many people "copied" this trade
  };
}

export const mockSignals: TradeSignal[] = [
  {
    id: 'sig1',
    asset: 'BTC/USDT',
    assetName: 'Bitcoin',
    direction: 'BUY',
    confidence: 5,
    entryPrice: '$63,800',
    targetPrice: '$72,000',
    stopLoss: '$60,500',
    timeframe: 'Orta Vade',
    rationale: 'Yükselen kanal içinde sağlam destek. RSI aşırı satım bölgesinden çıkıyor. 4h kapanış güçlü.',
    priceChange: 2.4,
    isNew: true,
    postedAt: '14 dk önce',
    logoColor: '#F7931A',
    logoLetter: '₿',
    creator: {
      id: 'cr1', name: 'Crypto Guru', avatar: 'https://i.pravatar.cc/80?u=cg1',
      verified: true, successRate: 82, totalSignals: 248,
    },
    stats: { likes: 1240, comments: 89, copies: 340 },
  },
  {
    id: 'sig2',
    asset: 'THYAO',
    assetName: 'Türk Hava Yolları',
    direction: 'BUY',
    confidence: 4,
    entryPrice: '₺248',
    targetPrice: '₺285',
    stopLoss: '₺235',
    timeframe: 'Kısa Vade',
    rationale: 'Kargo gelirlerinde güçlü artış beklentisi. Teknik olarak omuz-baş-omuz formasyonu tamamlanmak üzere.',
    priceChange: 1.8,
    isNew: false,
    postedAt: '2 sa önce',
    logoColor: '#E81F2A',
    logoLetter: 'TK',
    creator: {
      id: 'cr2', name: 'BIST Uzmanı', avatar: 'https://i.pravatar.cc/80?u=bu2',
      verified: true, successRate: 74, totalSignals: 183,
    },
    stats: { likes: 876, comments: 54, copies: 218 },
  },
  {
    id: 'sig3',
    asset: 'ETH/USDT',
    assetName: 'Ethereum',
    direction: 'SELL',
    confidence: 3,
    entryPrice: '$3,200',
    targetPrice: '$2,850',
    stopLoss: '$3,380',
    timeframe: 'Kısa Vade',
    rationale: 'Direnç bölgesinde momentum zayıflıyor. MACD negatif kesişim yaptı. Risk/ödül oranı favorable.',
    priceChange: -1.1,
    isNew: false,
    postedAt: '4 sa önce',
    logoColor: '#627EEA',
    logoLetter: 'Ξ',
    creator: {
      id: 'cr3', name: 'DeFi Trader', avatar: 'https://i.pravatar.cc/80?u=dt3',
      verified: false, successRate: 68, totalSignals: 97,
    },
    stats: { likes: 432, comments: 37, copies: 124 },
  },
  {
    id: 'sig4',
    asset: 'XAU/USD',
    assetName: 'Altın',
    direction: 'BUY',
    confidence: 5,
    entryPrice: '$2,340',
    targetPrice: '$2,480',
    stopLoss: '$2,290',
    timeframe: 'Uzun Vade',
    rationale: 'Enflasyon beklentileri ve merkez bankası alımları altını destekliyor. Fed pivot yaklaşıyor.',
    priceChange: 0.4,
    isNew: true,
    postedAt: '1 sa önce',
    logoColor: '#D4AF37',
    logoLetter: '⬡',
    creator: {
      id: 'cr4', name: 'Macro Maestro', avatar: 'https://i.pravatar.cc/80?u=mm4',
      verified: true, successRate: 79, totalSignals: 312,
    },
    stats: { likes: 2100, comments: 143, copies: 567 },
  },
  {
    id: 'sig5',
    asset: 'SOL/USDT',
    assetName: 'Solana',
    direction: 'BUY',
    confidence: 4,
    entryPrice: '$138',
    targetPrice: '$165',
    stopLoss: '$128',
    timeframe: 'Kısa Vade',
    rationale: 'DeFi hacmi rekor kırıyor. Teknik olarak sıkışma formasyonu yukarı kırıldı.',
    priceChange: 3.1,
    isNew: false,
    postedAt: '5 sa önce',
    logoColor: '#9945FF',
    logoLetter: 'S',
    creator: {
      id: 'cr5', name: 'DeFi Hunter', avatar: 'https://i.pravatar.cc/80?u=dh5',
      verified: true, successRate: 71, totalSignals: 156,
    },
    stats: { likes: 988, comments: 72, copies: 289 },
  },
];
