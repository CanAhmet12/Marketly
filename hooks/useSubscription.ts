import { useAuth } from '../contexts/AuthContext';

export type Tier = 'free' | 'pro' | 'elite';

// Pro ile gelen özellikler
const PRO_FEATURES = [
  'unlimited_signals',
  'unlimited_alerts',
  'candlestick_chart',
  'portfolio_pdf',
  'market_ai',
  'creator_packages',
  'ad_free',
] as const;

// Elite ile gelen ek özellikler
const ELITE_FEATURES = [
  'api_access',
  'priority_support',
  'broker_integration',
  'elite_badge',
] as const;

type ProFeature   = typeof PRO_FEATURES[number];
type EliteFeature = typeof ELITE_FEATURES[number];
export type Feature = ProFeature | EliteFeature;

export function useSubscription() {
  const { user, profile } = useAuth();
  const tier: Tier = (profile?.tier as Tier) ?? (user?.tier as Tier) ?? 'free';

  const isPro    = tier === 'pro'   || tier === 'elite';
  const isElite  = tier === 'elite';
  const isFree   = tier === 'free';

  function hasFeature(feature: Feature): boolean {
    if (isElite) return true;
    if (isPro && (PRO_FEATURES as readonly string[]).includes(feature)) return true;
    return false;
  }

  const tierLabel: Record<Tier, string> = {
    free:  'Ücretsiz',
    pro:   'Pro ⚡',
    elite: 'Elite 💎',
  };

  const tierColor: Record<Tier, string> = {
    free:  '#9AA0AF',
    pro:   '#007AFF',
    elite: '#FFD700',
  };

  return {
    tier,
    isPro,
    isElite,
    isFree,
    hasFeature,
    tierLabel: tierLabel[tier],
    tierColor: tierColor[tier],
  };
}
