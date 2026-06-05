import { hashToUnit } from "@/features/signals/domain/signal-meta";
import type { ChannelSignal } from "@/features/channel/types";
import type { SignalAccessTier } from "@/features/signals/repository/types";

export const SIGNAL_STRATEGY_PACKAGES = [
  "Swing strateji paketi",
  "BTC momentum",
  "Makro FX",
  "Intraday alarmlar",
  "AI destekli kurulum",
  "Uzun vade portföy",
] as const;

/** Mock erişim katmanı — üretimde `subscription_entitlements` RPC ile değişir */
export function deriveSignalAccessTier(s: Pick<ChannelSignal, "id" | "is_active" | "result">): SignalAccessTier {
  const h = hashToUnit(`${s.id}-acc`);
  if (!s.is_active) {
    if (s.result === "TP" || s.result === "SL") return h > 0.52 ? "archived_premium" : "public";
    return h > 0.68 ? "archived_premium" : "public";
  }
  if (h < 0.26) return "public";
  if (h < 0.46) return "premium";
  if (h < 0.66) return "subscriber_only";
  return "preview_only";
}

export function deriveSignalPackageLabel(id: string): string | null {
  const h = hashToUnit(`${id}-pkg`);
  if (h < 0.18) return null;
  const idx = Math.floor(h * SIGNAL_STRATEGY_PACKAGES.length) % SIGNAL_STRATEGY_PACKAGES.length;
  return SIGNAL_STRATEGY_PACKAGES[idx] ?? null;
}

export function premiumPreviewSnippet(rationale: string | null, id: string): string {
  const t = rationale?.trim();
  if (t && t.length > 12) {
    const cut = t.slice(0, Math.min(96, t.length));
    return cut.length < t.length ? `${cut}…` : cut;
  }
  const h = hashToUnit(`${id}-snip`);
  const fallbacks = [
    "Yapılandırılmış senaryo — seviyeler ve tam tez abonelik akışında.",
    "Volatiliteye duyarlı plan; hedef bantları üyeler için açık.",
    "Makro ile hizalı kurulum; risk çerçevesi detayları kilitli önizleme.",
  ];
  return fallbacks[Math.floor(h * fallbacks.length) % fallbacks.length]!;
}

export function deriveSubscriberCopies24h(community24: number, id: string): number {
  if (community24 <= 0) return 0;
  const frac = 0.32 + hashToUnit(`${id}-subc`) * 0.38;
  return Math.max(0, Math.round(community24 * frac));
}

/** Abonelik yokken hassas alanlar kilitli mi */
export function isSignalEconomyLocked(access: SignalAccessTier, isSubscriber: boolean): boolean {
  if (isSubscriber) return false;
  if (access === "public") return false;
  return true;
}

export function signalAccessLabel(access: SignalAccessTier): string {
  const m: Record<SignalAccessTier, string> = {
    public: "Herkese açık",
    premium: "Premium",
    subscriber_only: "Abonelik",
    archived_premium: "Arşiv · premium",
    preview_only: "Önizleme",
  };
  return m[access];
}
