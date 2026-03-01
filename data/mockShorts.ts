export interface ShortItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;          // Supabase Storage public URL
  assetTags: string[];
  changePercent?: number;
  currentPrice?: string;       // live price shown on card
  priceChange24h?: string;     // 24h price change
  signal?: {                   // embedded trade signal
    direction: 'BUY' | 'SELL' | 'HOLD';
    entry: string;
    target: string;
    confidence: number; // 1-5
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
  spark?: number[]; // mini sparkline data
}

export const mockShorts: ShortItem[] = [
  {
    id: 's1',
    title: "Bitcoin 70K'a koşuyor mu? 🚀",
    description: 'BTC teknik analizde kilit destek kırıldı! İşte hedef fiyatlar ve dikkat edilmesi gereken seviyeler.',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1400&fit=crop',
    assetTags: ['$BTC', '$ETH'],
    changePercent: 3.18,
    currentPrice: '$64,280',
    priceChange24h: '+$1,980',
    signal: { direction: 'BUY', entry: '$63,500', target: '$72,000', confidence: 5 },
    creator: { id: 'c1', name: 'Crypto Guru', avatar: 'https://i.pravatar.cc/80?u=cg1', followers: '124K', verified: true, successRate: 82 },
    stats: { likes: 48200, comments: 1840, shares: 3200, views: 428000 },
    duration: '0:45', audio: 'Trading Bell – Market Sounds', category: 'Kripto',
    spark: [58, 60, 57, 63, 65, 62, 68, 67, 70, 69, 72],
  },
  {
    id: 's2',
    title: "BIST100'de bu hisseler uçuyor! 📈",
    description: "Günün en çok yükselen 3 hissesi ve teknik analizi. THYAO ve GARAN'da neler oluyor?",
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=1400&fit=crop',
    assetTags: ['BIST100', 'THYAO'],
    changePercent: 5.2,
    currentPrice: '₺248',
    priceChange24h: '+₺12.3',
    signal: { direction: 'BUY', entry: '₺245', target: '₺285', confidence: 4 },
    creator: { id: 'c2', name: 'Borsa Master', avatar: 'https://i.pravatar.cc/80?u=bm2', followers: '89K', verified: true, successRate: 74 },
    stats: { likes: 32100, comments: 920, shares: 1800, views: 218000 },
    duration: '0:58', audio: 'Bulls & Bears – Finance Mix', category: 'Hisseler',
    spark: [62, 64, 63, 65, 67, 66, 68, 70, 69, 72, 74],
  },
  {
    id: 's3',
    title: "Altın 3000$'a çıkar mı? 🥇",
    description: 'Fed faiz kararı sonrası altın fiyatları için kritik analiz. XAU/USD teknik görünüm.',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=1400&fit=crop',
    assetTags: ['XAU/USD'],
    changePercent: 0.42,
    currentPrice: '$2,356',
    priceChange24h: '+$9.8',
    signal: { direction: 'BUY', entry: '$2,340', target: '$2,480', confidence: 5 },
    creator: { id: 'c3', name: 'Emtia Pro', avatar: 'https://i.pravatar.cc/80?u=ep3', followers: '67K', verified: false, successRate: 68 },
    stats: { likes: 19800, comments: 640, shares: 980, views: 142000 },
    duration: '0:52', audio: 'Gold Rush – Instrumental', category: 'Emtia',
    spark: [70, 71, 70, 72, 73, 72, 74, 74, 75, 76, 76],
  },
  {
    id: 's4',
    title: 'Nasdaq 20000 direnç kırdı! 🔥',
    description: "Nasdaq tarihi zirveyi aştı, teknoloji hisseleri için ne anlama geliyor? NVDA ve AAPL'ye bakış.",
    thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=1400&fit=crop',
    assetTags: ['NASDAQ', 'NVDA'],
    changePercent: 2.1,
    currentPrice: '$875',
    priceChange24h: '+$35.5',
    signal: { direction: 'HOLD', entry: '$860', target: '$920', confidence: 3 },
    creator: { id: 'c4', name: 'Market Day', avatar: 'https://i.pravatar.cc/80?u=md4', followers: '45K', verified: true, successRate: 71 },
    stats: { likes: 27500, comments: 1120, shares: 2100, views: 305000 },
    duration: '0:41', audio: 'Nasdaq Opening Bell', category: 'Hisseler',
    spark: [55, 57, 59, 61, 60, 63, 65, 64, 67, 69, 70],
  },
  {
    id: 's5',
    title: 'Dolar/TL için kritik seviye! 💱',
    description: '38 seviyesi kırılabilir mi? Destek ve direnç noktaları ile ne yapılmalı sorusuna yanıt.',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=1400&fit=crop',
    assetTags: ['USD/TRY'],
    changePercent: -0.28,
    currentPrice: '₺32.44',
    priceChange24h: '-₺0.09',
    signal: { direction: 'SELL', entry: '₺32.50', target: '₺31.80', confidence: 3 },
    creator: { id: 'c5', name: 'FX Master', avatar: 'https://i.pravatar.cc/80?u=fx5', followers: '38K', verified: true, successRate: 77 },
    stats: { likes: 14600, comments: 780, shares: 1340, views: 98000 },
    duration: '0:55', audio: 'Forex Trading – Lo-fi', category: 'Döviz',
    spark: [80, 79, 81, 78, 77, 76, 75, 74, 73, 72, 71],
  },
  {
    id: 's6',
    title: 'Ethereum 4000$ yolunda mı? ⚡',
    description: 'ETH staking getirileri ve DeFi ekosistemi güncel durum. EIP güncellemesi etkisi.',
    thumbnail: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=1400&fit=crop',
    assetTags: ['$ETH', 'DeFi'],
    changePercent: 4.8,
    currentPrice: '$3,185',
    priceChange24h: '+$145',
    signal: { direction: 'BUY', entry: '$3,100', target: '$3,800', confidence: 4 },
    creator: { id: 'c1', name: 'Crypto Guru', avatar: 'https://i.pravatar.cc/80?u=cg1', followers: '124K', verified: true, successRate: 82 },
    stats: { likes: 38900, comments: 1560, shares: 2800, views: 384000 },
    duration: '0:48', audio: 'Ethereum – Digital Beats', category: 'Kripto',
    spark: [60, 62, 61, 64, 63, 67, 66, 70, 69, 73, 75],
  },
  {
    id: 's7',
    title: 'Solana ekosistemi patlamada! 💎',
    description: "SOL tabanlı yeni DeFi projeleri ve meme coin'ler. 2025 için SOL hedef fiyat analizi.",
    thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=1400&fit=crop',
    assetTags: ['$SOL'],
    changePercent: 6.3,
    currentPrice: '$142',
    priceChange24h: '+$8.4',
    signal: { direction: 'BUY', entry: '$138', target: '$165', confidence: 4 },
    creator: { id: 'c6', name: 'DeFi Hunter', avatar: 'https://i.pravatar.cc/80?u=dh6', followers: '56K', verified: true, successRate: 71 },
    stats: { likes: 52100, comments: 2340, shares: 4100, views: 512000 },
    duration: '0:37', audio: 'Solana Vibes – Electronic', category: 'Kripto',
    spark: [50, 53, 56, 55, 59, 62, 61, 65, 68, 70, 73],
  },
  {
    id: 's8',
    title: 'Apple hissesi fırsatı mı? 🍎',
    description: "AAPL'de %15 düzeltme geldi. Warren Buffett satıyor mu? Uzun vadeli yatırımcı ne yapmalı?",
    thumbnail: 'https://images.unsplash.com/photo-1579225663317-c0251b4369bc?w=800&h=1400&fit=crop',
    assetTags: ['AAPL'],
    changePercent: -2.1,
    currentPrice: '$189.5',
    priceChange24h: '-$4.1',
    signal: { direction: 'HOLD', entry: '$185', target: '$210', confidence: 3 },
    creator: { id: 'c7', name: 'Wall St. Insider', avatar: 'https://i.pravatar.cc/80?u=wsi7', followers: '183K', verified: true, successRate: 79 },
    stats: { likes: 41200, comments: 1890, shares: 3500, views: 421000 },
    duration: '0:59', audio: 'Wall Street – Jazz Mix', category: 'Hisseler',
    spark: [75, 73, 71, 69, 68, 66, 64, 63, 62, 60, 59],
  },
];
