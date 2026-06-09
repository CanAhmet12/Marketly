export type RecommendedCreatorCard = {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  tier: string;
  follower_count: number;
  expertise: string;
  /** `get_leaderboard_analysts` RPC */
  signal_count?: number;
  signal_accuracy?: number | null;
};
