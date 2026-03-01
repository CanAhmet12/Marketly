export type VideoCategory = 'for_you' | 'hisseler' | 'kripto' | 'emtialar' | 'live';

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  category: VideoCategory;
  assetTags: string[];
  price?: string;
  changePercent?: number;
  isLive?: boolean;
  timeAgo?: string;
  progress?: number;
  type?: 'video' | 'savings';
  subtitle?: string;
  duration?: string;
  channelName?: string;
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
