import type { InterestIntelligenceSnapshot } from "@/features/personalization/domain/personalization-types";

import { getHomeRepository } from "@/features/home/repository";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { isMockDataEnabled } from "@/mock/config";
import {
  EDITORIAL_MOCK_INTERESTS_FALLBACK,
  EDITORIAL_MOCK_TODAY,
  EDITORIAL_MOCK_TRENDING,
} from "@/mock/fixtures/editorial-rail-extras";

import { buildEditorialMarketStripItems } from "./build-market-strip-items";
import type { HomeVisualRailLink } from "../visual/mock-data";

function strengthFromScoreLabel(scoreLabel?: string): "high" | "mid" | "low" {
  const s = (scoreLabel ?? "").toLowerCase();
  if (s.includes("güçl") || s.includes("yüksek") || s.includes("high")) return "high";
  if (s.includes("düşük") || s.includes("low") || s.includes("hafif")) return "low";
  return "mid";
}

export function buildInterestsFromIntel(intel: InterestIntelligenceSnapshot): HomeVisualRailLink[] {
  const rows: HomeVisualRailLink[] = [];
  for (const chip of intel.strongest.slice(0, 6)) {
    rows.push({
      label: chip.label,
      chipStrength: strengthFromScoreLabel(),
    });
  }
  if (rows.length === 0) {
    for (const th of intel.marketThemes.slice(0, 4)) {
      rows.push({
        label: th.label,
        meta: th.scoreLabel,
        chipStrength: strengthFromScoreLabel(th.scoreLabel),
      });
    }
  }
  return rows;
}

export type EditorialRailBundle = {
  shortcuts: HomeVisualRailLink[];
  today: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  trending: HomeVisualRailLink[];
  creators: HomeVisualRailLink[];
};

export function buildEditorialRailBundle(
  intel: InterestIntelligenceSnapshot,
  recommendedCreators?: RecommendedCreatorCard[],
  liveChips?: { today: HomeVisualRailLink[]; trending: HomeVisualRailLink[] },
): EditorialRailBundle {
  const repo = getHomeRepository();
  const strip = buildMarketStripShortcuts();
  const creatorSource = recommendedCreators ?? repo.getRecommendedCreators();
  const creators = creatorSource.slice(0, 12).map(
    (c): HomeVisualRailLink => ({
      label: c.name,
      meta: c.tier,
      handle: c.handle,
      avatarUrl: c.avatar_url ?? undefined,
      creatorUserId: c.id,
    }),
  );

  let interests = buildInterestsFromIntel(intel);
  if (isMockDataEnabled() && interests.length < 5) {
    const merged = [...interests];
    for (const row of EDITORIAL_MOCK_INTERESTS_FALLBACK) {
      if (merged.some((m) => m.label === row.label)) continue;
      merged.push(row);
      if (merged.length >= 7) break;
    }
    interests = merged;
  }

  const today = isMockDataEnabled() ? [...EDITORIAL_MOCK_TODAY] : (liveChips?.today ?? []);
  const trending = isMockDataEnabled() ? [...EDITORIAL_MOCK_TRENDING] : (liveChips?.trending ?? []);

  return {
    shortcuts: strip,
    today,
    interests,
    trending,
    creators,
  };
}

function buildMarketStripShortcuts(): HomeVisualRailLink[] {
  return buildEditorialMarketStripItems().slice(0, 10).map((m) => {
    const sign = m.changePct > 0.04 ? "up" : m.changePct < -0.04 ? "down" : "neutral";
    const pct =
      Math.abs(m.changePct) < 0.0001
        ? "0,00%"
        : `${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2).replace(".", ",")}%`;
    return {
      label: m.symbol,
      meta: pct,
      accent: sign === "neutral" ? undefined : sign,
    };
  });
}
