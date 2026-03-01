export type VideoCategory = 'for_you' | 'hisseler' | 'kripto' | 'emtialar' | 'live';

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;          // Supabase Storage public URL
  category: VideoCategory;
  assetTags: string[];
  price?: string;
  changePercent?: number;
  isLive?: boolean;
  timeAgo?: string;
  progress?: number;          // used as gain% for trader cards
  type?: 'video' | 'savings'; // 'savings' = trader profile card
  subtitle?: string;
  duration?: string;          // e.g. "12:34"
  creator: {
    id: string;
    name: string;
    avatar: string;
    followers?: string;
    verified?: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

export const mockVideos: VideoItem[] = [
  // ─── Featured / Live ────────────────────────────────────────────────────────
  {
    id: '1',
    title: 'Bitcoin & Ethereum canlı analiz! Kritik seviyeler ve sonraki hamle 🔴',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    category: 'kripto',
    assetTags: ['$BTC', '$ETH'],
    price: '$64,280',
    changePercent: 2.4,
    isLive: true,
    timeAgo: 'Şu an canlı',
    duration: 'CANLI',
    creator: {
      id: 'u1', name: 'Crypto Analyst',
      avatar: 'https://i.pravatar.cc/100?u=1',
      followers: '248K', verified: true,
    },
    stats: { likes: 2490, comments: 376, shares: 248, views: 47600 },
  },

  // ─── Sol sütun videos ────────────────────────────────────────────────────────
  {
    id: '2',
    title: 'BIST100 kritik direnç kırıldı! Ne bekliyoruz? 📈',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
    category: 'hisseler',
    assetTags: ['BIST100'],
    price: '11.240',
    changePercent: 0.8,
    timeAgo: '2 sa önce',
    duration: '8:42',
    creator: {
      id: 'u2', name: 'BIST Uzmanı',
      avatar: 'https://i.pravatar.cc/100?u=2',
      followers: '89K', verified: true,
    },
    stats: { likes: 5100, comments: 234, shares: 189, views: 51000 },
  },
  {
    id: '3',
    title: 'Nasdaq rekor kırıyor mu? Teknik analiz 🚀',
    thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600',
    category: 'for_you',
    assetTags: ['NASDAQ'],
    changePercent: 1.1,
    timeAgo: '5 sa önce',
    duration: '14:20',
    creator: {
      id: 'u3', name: 'Market Day',
      avatar: 'https://i.pravatar.cc/100?u=3',
      followers: '67K', verified: false,
    },
    stats: { likes: 2800, comments: 156, shares: 98, views: 28000 },
  },
  {
    id: '5',
    title: 'Altın breakout geliyor! XAU/USD teknik analiz 🥇',
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600',
    category: 'emtialar',
    assetTags: ['XAU/USD'],
    price: '$2,356',
    changePercent: 0.4,
    timeAgo: '1 gün önce',
    duration: '11:05',
    creator: {
      id: 'u4', name: 'Emtia Uzmanı',
      avatar: 'https://i.pravatar.cc/100?u=4',
      followers: '45K', verified: false,
    },
    stats: { likes: 1890, comments: 89, shares: 67, views: 11200 },
  },
  {
    id: '6',
    title: 'THYAO, ASELS, SASA — 3 hissede fırsat var mı?',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600',
    category: 'hisseler',
    assetTags: ['THYAO', 'ASELS'],
    price: '₺248',
    changePercent: 1.8,
    isLive: true,
    timeAgo: 'Şu an canlı',
    duration: 'CANLI',
    creator: {
      id: 'u5', name: 'Hisse Takip',
      avatar: 'https://i.pravatar.cc/100?u=5',
      followers: '124K', verified: true,
    },
    stats: { likes: 3420, comments: 201, shares: 134, views: 25600 },
  },
  {
    id: '7',
    title: 'Solana neden yükseliyor? $SOL analizim 📊',
    thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600',
    category: 'kripto',
    assetTags: ['$SOL'],
    price: '$142.50',
    changePercent: 3.1,
    timeAgo: '3 sa önce',
    duration: '9:18',
    creator: {
      id: 'u6', name: 'DeFi Master',
      avatar: 'https://i.pravatar.cc/100?u=6',
      followers: '78K', verified: true,
    },
    stats: { likes: 4200, comments: 312, shares: 198, views: 42000 },
  },
  {
    id: '8',
    title: 'Fed kararı sonrası piyasalar — yatırımcı ne yapmalı?',
    thumbnail: 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=600',
    category: 'for_you',
    assetTags: ['S&P500', 'DXY'],
    changePercent: -0.3,
    timeAgo: '6 sa önce',
    duration: '17:44',
    creator: {
      id: 'u7', name: 'Macro Analyst',
      avatar: 'https://i.pravatar.cc/100?u=7',
      followers: '156K', verified: true,
    },
    stats: { likes: 6700, comments: 445, shares: 320, views: 67000 },
  },
  {
    id: '9',
    title: 'Apple hissesi $200\'a gider mi? AAPL teknik görünüm 🍎',
    thumbnail: 'https://images.unsplash.com/photo-1579225663317-c0251b4369bc?w=600',
    category: 'hisseler',
    assetTags: ['AAPL'],
    price: '$189.5',
    changePercent: 1.8,
    timeAgo: '8 sa önce',
    duration: '13:55',
    creator: {
      id: 'u8', name: 'Tech Stocks',
      avatar: 'https://i.pravatar.cc/100?u=8',
      followers: '93K', verified: false,
    },
    stats: { likes: 3100, comments: 178, shares: 145, views: 31000 },
  },
  {
    id: '10',
    title: 'Dolar/TL 40\'ı görür mü? Kritik makro analiz 💱',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600',
    category: 'for_you',
    assetTags: ['USD/TRY'],
    price: '₺32.44',
    changePercent: -0.3,
    timeAgo: '12 sa önce',
    duration: '20:12',
    creator: {
      id: 'u9', name: 'FX Uzmanı',
      avatar: 'https://i.pravatar.cc/100?u=9',
      followers: '210K', verified: true,
    },
    stats: { likes: 8900, comments: 621, shares: 480, views: 89000 },
  },
  {
    id: '11',
    title: 'NVDA $1000\'ı görür mü? Yapay zeka rüzgarı devam ediyor',
    thumbnail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600',
    category: 'hisseler',
    assetTags: ['NVDA'],
    price: '$875',
    changePercent: 4.2,
    timeAgo: '1 sa önce',
    duration: '16:30',
    creator: {
      id: 'u10', name: 'AI Investor',
      avatar: 'https://i.pravatar.cc/100?u=10',
      followers: '315K', verified: true,
    },
    stats: { likes: 12300, comments: 890, shares: 640, views: 123000 },
  },
  {
    id: '12',
    title: 'Kripto portföy stratejisi: 2024\'te ne tutmalısın?',
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600',
    category: 'kripto',
    assetTags: ['$BTC', '$ETH', '$SOL'],
    timeAgo: '2 gün önce',
    duration: '24:08',
    creator: {
      id: 'u11', name: 'Portfolio Pro',
      avatar: 'https://i.pravatar.cc/100?u=11',
      followers: '167K', verified: true,
    },
    stats: { likes: 7400, comments: 530, shares: 380, views: 74000 },
  },

  // ─── Trader profile cards (formerly "savings") ────────────────────────────
  {
    id: 'tr1',
    title: 'Kripto Trader',
    subtitle: 'BTC maximalist. %82 sinyal başarısı.',
    thumbnail: 'https://i.pravatar.cc/300?u=emily99',
    category: 'kripto',
    assetTags: [],
    type: 'savings',
    timeAgo: '3 sa önce',
    progress: 82.4,
    creator: {
      id: 'u-emily', name: 'Crypto Guru',
      avatar: 'https://i.pravatar.cc/100?u=emily99',
      followers: '248K', verified: true,
    },
    stats: { likes: 298, comments: 12, shares: 5, views: 1200 },
  },
  {
    id: 'tr2',
    title: 'FX & Emtia',
    subtitle: 'Döviz ve altın uzmanı. 12 yıl deneyim.',
    thumbnail: 'https://i.pravatar.cc/300?u=woman77',
    category: 'emtialar',
    assetTags: [],
    type: 'savings',
    progress: 74.1,
    creator: {
      id: 'u-woman2', name: 'FX Master',
      avatar: 'https://i.pravatar.cc/100?u=woman77',
      followers: '89K', verified: true,
    },
    stats: { likes: 156, comments: 8, shares: 3, views: 890 },
  },
  {
    id: 'tr3',
    title: 'BIST Uzmanı',
    subtitle: 'Türk hisse senedi stratejisti.',
    thumbnail: 'https://i.pravatar.cc/300?u=man123',
    category: 'hisseler',
    assetTags: [],
    type: 'savings',
    progress: 68.5,
    creator: {
      id: 'u-man3', name: 'BIST King',
      avatar: 'https://i.pravatar.cc/100?u=man123',
      followers: '124K', verified: false,
    },
    stats: { likes: 213, comments: 17, shares: 8, views: 2100 },
  },
];
