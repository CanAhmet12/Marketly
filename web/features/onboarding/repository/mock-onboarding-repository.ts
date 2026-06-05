import { getHomeRepository } from "@/features/home/repository";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { isMockDataEnabled } from "@/mock/config";

import type {
  OnboardingCatalog,
  OnboardingDraft,
  OnboardingIntelPartial,
} from "../domain/types";
import type { OnboardingRepository } from "./onboarding-repository";

const LS_DRAFT = "marketly-onboarding-draft-v1";
const LS_DONE = "marketly-onboarding-complete-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* */
  }
}

function bumpPersonalization() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("marketly-personalization-updated"));
}

export class MockOnboardingRepository implements OnboardingRepository {
  getCatalog(): OnboardingCatalog {
    const creators = getHomeRepository()
      .getRecommendedCreators()
      .slice(0, 12)
      .map((c) => ({
        id: c.id,
        label: c.name,
        handle: c.handle.startsWith("@") ? c.handle : `@${c.handle}`,
      }));

    return {
      identities: [
        { id: "investor", label: "Yatırımcı", sub: "Uzun vade, temettü, temel analiz" },
        { id: "trader", label: "Trader", sub: "Kısa vade, risk yönetimi, disiplin" },
        { id: "macro_follower", label: "Makro takipçi", sub: "Faiz, politika, para politikası" },
        { id: "creator", label: "Üretici", sub: "İçerik + ekonomi vitrininizi büyütün" },
        { id: "educator", label: "Eğitmen", sub: "Anlatım ve topluluk odaklı" },
        { id: "analyst", label: "Analist", sub: "Sinyal ve model odaklı" },
        { id: "explorer", label: "Keşifçi", sub: "Hafif tempo, çeşitli akış" },
      ],
      topics: [
        { id: "makro", label: "Makro" },
        { id: "bist", label: "BIST" },
        { id: "kripto", label: "Kripto" },
        { id: "temettu", label: "Temettü" },
        { id: "fx", label: "FX" },
        { id: "viop", label: "Viop" },
        { id: "etf", label: "ETF" },
        { id: "enerji", label: "Enerji" },
        { id: "bankacilik", label: "Bankacılık" },
        { id: "teknoloji", label: "Teknoloji" },
      ],
      market_themes: [
        { id: "risk_on", label: "Risk-on" },
        { id: "risk_off", label: "Risk-off" },
        { id: "carry", label: "Carry" },
        { id: "vol", label: "Volatilite" },
        { id: "earnings", label: "Kazanç sezonu" },
      ],
      signal_styles: [
        { id: "swing", label: "Swing / pozisyon" },
        { id: "scalp", label: "Kısa vade / tepki" },
        { id: "balanced", label: "Dengeli" },
      ],
      strategies: [
        { id: "value", label: "Değer" },
        { id: "momentum", label: "Momentum" },
        { id: "macro", label: "Makro temalı" },
        { id: "mixed", label: "Karma" },
      ],
      creators,
      personas: [
        {
          id: "p-macro",
          label: "Makro izleyici",
          subline: "Fed + tahvil eğrisi",
          preset: {
            identity: "macro_follower",
            interest_topic_ids: ["makro", "fx"],
            market_theme_ids: ["risk_off"],
            signal_style: "swing",
            strategy: "macro",
            macro_vs_momentum: -0.6,
            watchlist_symbols: ["GLD", "TLT"],
          },
        },
        {
          id: "p-bist",
          label: "BIST aktif",
          subline: "Endeks + bankacılık",
          preset: {
            identity: "trader",
            interest_topic_ids: ["bist", "bankacilik"],
            market_theme_ids: ["vol"],
            signal_style: "balanced",
            strategy: "momentum",
            macro_vs_momentum: 0.2,
            watchlist_symbols: ["XU100", "THYAO"],
          },
        },
        {
          id: "p-crypto",
          label: "Kripto keşif",
          subline: "Likidite + volatilite",
          preset: {
            identity: "explorer",
            interest_topic_ids: ["kripto"],
            market_theme_ids: ["risk_on"],
            signal_style: "scalp",
            strategy: "mixed",
            macro_vs_momentum: 0.4,
            watchlist_symbols: ["BTC", "ETH"],
          },
        },
      ],
      creator_hints: [
        "Premium vitrin: abonelik katmanlarını Studio → Ekonomi’den düzenleyin.",
        "Oda ritmi: haftalık canlı yayın + tartışma kuyruğu ile başlayın.",
        "Sinyal önizlemesi: kilitli çağrılarda risk bandı gösterin.",
      ],
      nav_after: [
        { href: "/", label: "Ana" },
        { href: "/discover", label: "Keşfet" },
        { href: "/watchlist", label: "Watchlist" },
        { href: "/subscriptions", label: "Abonelikler" },
        { href: "/live", label: "Canlı" },
        { href: "/notifications", label: "Bildirimler" },
      ],
      watchlist_starter_symbols: ["BTC", "ETH", "XU100", "THYAO", "GLD", "TSLA", "AAPL", "NVDA"],
    };
  }

  getIntelPartial(draft: Partial<OnboardingDraft>): OnboardingIntelPartial {
    const p = getPersonalizationRepository();
    const snap = p.getRecommendationAdaptationSnapshot(null);
    let score = 0;
    const max = 9;
    if (draft.identity) score += 1;
    score += Math.min(2, (draft.interest_topic_ids?.length ?? 0) / 3);
    score += Math.min(2, (draft.creator_ids?.length ?? 0) / 2);
    score += Math.min(1, (draft.market_theme_ids?.length ?? 0) / 2);
    if (draft.signal_style) score += 1;
    if (draft.strategy) score += 1;
    if (draft.watchlist_symbols?.length) score += 1;
    const progress_pct = Math.min(100, Math.round((score / max) * 100));
    const confidence_hint = snap.coldData ? "Soğuk başlangıç — seçimler güven skorunu yükseltir." : `Güven bandı: ${Math.round(snap.overallConfidence * 100)}% · keşif payı %${Math.round(snap.explorationShare * 100)}`;
    const adaptive_hint = snap.hints[0] ?? snap.subline;
    const exploration_line = `Önerilen keşif payı: %${Math.round(snap.explorationShare * 100)} — onboarding tamamlanınca akışlar güncellenir.`;
    const strategy_summary =
      draft.strategy === "macro"
        ? "Makro ağırlıklı profil"
        : draft.strategy === "momentum"
          ? "Momentum ağırlıklı profil"
          : draft.strategy === "value"
            ? "Değer odaklı profil"
            : "Dengeli strateji profili";
    return { progress_pct, confidence_hint, adaptive_hint, exploration_line, strategy_summary };
  }

  saveDraft(draft: Partial<OnboardingDraft>): void {
    writeJson(LS_DRAFT, draft);
  }

  loadDraft(): Partial<OnboardingDraft> | null {
    const d = readJson<Partial<OnboardingDraft> | null>(LS_DRAFT, null);
    return d && typeof d === "object" ? d : null;
  }

  markComplete(): void {
    if (typeof window !== "undefined") localStorage.setItem(LS_DONE, "1");
    try {
      localStorage.removeItem(LS_DRAFT);
    } catch {
      /* */
    }
    bumpPersonalization();
  }

  needsOnboarding(): boolean {
    if (typeof window === "undefined") return false;
    if (!isMockDataEnabled()) return false;
    return localStorage.getItem(LS_DONE) !== "1";
  }

  skipWithMinimalSeed(viewerId: string | null): void {
    const p = getPersonalizationRepository();
    p.recordAdaptiveLearning({ type: "discover_tab_view", tab: "trending" });
    if (viewerId) p.recordAdaptiveLearning({ type: "positive_creator", creatorId: viewerId });
    this.markComplete();
  }

  applyBootstrap(viewerId: string | null, draft: OnboardingDraft): void {
    const p = getPersonalizationRepository();
    if (draft.skipped) {
      this.skipWithMinimalSeed(viewerId);
      return;
    }

    for (const token of draft.interest_topic_ids.slice(0, 10)) {
      p.applyFeedFeedback({ type: "interested_topic", token });
      p.applyExplorationFeedback({ type: "interested_exploration_theme", themeId: token });
      p.recordInteraction({ kind: "content_view", topicToken: token, quality: 0.45, surface: "onboarding" });
    }

    for (const cid of draft.creator_ids.slice(0, 8)) {
      p.applyExplorationFeedback({ type: "interested_exploration_creator", creatorId: cid });
      p.applyRecommendationFeedback({ type: "rec_follow_interest", creatorId: cid });
      p.recordAdaptiveLearning({ type: "positive_creator", creatorId: cid });
    }

    for (const th of draft.market_theme_ids.slice(0, 6)) {
      p.applyRecommendationFeedback({ type: "rec_interested_market_theme", themeId: th });
    }

    if (draft.strategy) {
      p.applyRecommendationFeedback({ type: "rec_interested_strategy", strategyId: draft.strategy });
    }

    if (draft.signal_style) {
      p.recordAdaptiveLearning({ type: "recommendation_rail_view", surface: `onboarding_signal_${draft.signal_style}` });
    }

    const tab =
      draft.macro_vs_momentum < -0.25 ? "trending" : draft.macro_vs_momentum > 0.25 ? "signals" : "creators";
    p.recordAdaptiveLearning({ type: "discover_tab_view", tab });

    for (const sym of draft.watchlist_symbols.slice(0, 8)) {
      p.recordInteraction({
        kind: "asset_view",
        assetSymbol: sym,
        quality: 0.55,
        surface: "onboarding_watchlist_seed",
      });
    }

    if (draft.identity === "creator" && viewerId) {
      p.recordInteraction({ kind: "creator_view", creatorId: viewerId, quality: 0.7, surface: "onboarding_creator_identity" });
    }

    if (draft.identity === "trader" || draft.identity === "analyst") {
      p.recordAdaptiveLearning({ type: "recommendation_rail_view", surface: `onboarding_identity_${draft.identity}` });
    }

    this.markComplete();
  }
}