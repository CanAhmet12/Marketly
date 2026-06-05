import type { RecommendedCreatorCard } from "@/features/home/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";

export type LiveRecommendationItem = {
  id: string;
  label: string;
  sub: string;
  href: string;
  kind: "creator" | "signal" | "discover" | "asset";
};

export type LiveRecommendationBundle = {
  headline: string;
  subline: string;
  forYou: LiveRecommendationItem[];
  community: LiveRecommendationItem[];
};

function symSet(symbols: readonly string[]): Set<string> {
  return new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean));
}

function inferSavedThemes(assetTags: readonly string[]): string[] {
  const themes = new Set<string>();
  for (const tag of assetTags) {
    const t = tag.trim().toUpperCase();
    if (!t) continue;
    if (["BTC", "ETH", "SOL", "XRP", "BNB"].some((c) => t.includes(c))) themes.add("Kripto");
    if (["XU100", "BIST", "THYAO", "ASELS"].some((c) => t.includes(c))) themes.add("Borsa");
    if (["USD", "EUR", "TRY", "ALTIN", "XAU"].some((c) => t.includes(c))) themes.add("Döviz & emtia");
    themes.add(t);
  }
  return [...themes].slice(0, 4);
}

/** Mevcut takip / izleme / kayıt verisinden türetilmiş öneriler (yeni engine yok). */
export function buildLiveRecommendations(input: {
  creators: readonly RecommendedCreatorCard[];
  signals: readonly DiscoverSignalCardRow[];
  watchSymbols: readonly string[];
  savedAssetTags: readonly string[];
  followingCount: number;
}): LiveRecommendationBundle {
  const watch = symSet(input.watchSymbols);
  const savedThemes = inferSavedThemes(input.savedAssetTags);
  const union = new Set([...watch, ...input.savedAssetTags.map((t) => t.trim().toUpperCase()).filter(Boolean)]);

  const signalMatches = input.signals
    .filter((s) => union.size === 0 || union.has(s.symbol.trim().toUpperCase()))
    .slice(0, 0 === union.size ? 4 : 6)
    .map(
      (s): LiveRecommendationItem => ({
        id: `sig-${s.id}`,
        label: s.symbol,
        sub: union.has(s.symbol.trim().toUpperCase()) ? `${s.direction} · izleme listende` : `${s.direction} · haftalık trend`,
        href: `/signals/${s.id}`,
        kind: "signal",
      }),
    );

  if (signalMatches.length < 3 && union.size > 0) {
    const extra = input.signals
      .filter((s) => !signalMatches.some((m) => m.id === `sig-${s.id}`))
      .slice(0, 3 - signalMatches.length)
      .map(
        (s): LiveRecommendationItem => ({
          id: `sig-x-${s.id}`,
          label: s.symbol,
          sub: `${s.direction} · topluluk sinyali`,
          href: `/signals/${s.id}`,
          kind: "signal",
        }),
      );
    signalMatches.push(...extra);
  }

  const creatorPicks = input.creators.slice(0, 4).map(
    (c): LiveRecommendationItem => ({
      id: `cr-${c.id}`,
      label: c.name,
      sub: c.expertise?.trim() || "Aktif analist",
      href: `/channel/${c.id}`,
      kind: "creator",
    }),
  );

  const forYou: LiveRecommendationItem[] = [...signalMatches.slice(0, 4), ...creatorPicks.slice(0, 2)].slice(0, 5);

  const community: LiveRecommendationItem[] = input.signals.slice(0, 3).map((s) => ({
    id: `com-sig-${s.id}`,
    label: s.symbol,
    sub: `${s.direction} · topluluk`,
    href: `/signals/${s.id}`,
    kind: "signal",
  }));

  if (input.creators[0]) {
    community.push({
      id: `com-cr-${input.creators[0].id}`,
      label: input.creators[0].name,
      sub: "Öne çıkan üretici",
      href: `/channel/${input.creators[0].id}`,
      kind: "creator",
    });
  }

  community.push({
    id: "com-discover",
    label: "Keşfet",
    sub: "Yeni içerik ve üreticiler",
    href: "/discover",
    kind: "discover",
  });

  let headline = "Sana özel öneriler";
  let subline = "İzleme listesi ve kayıtlarına göre türetildi.";
  if (union.size === 0 && input.followingCount === 0) {
    headline = "Akışını şekillendir";
    subline = "Sembol ekle, üretici takip et veya içerik kaydet — öneriler buna göre güncellenir.";
  } else if (savedThemes.length > 0) {
    subline = `${savedThemes.slice(0, 2).join(" · ")} temalarında yoğunlaşma var.`;
  } else if (watch.size > 0) {
    subline = `${watch.size} izlenen sembol için sinyal ve içerik eşleşmeleri.`;
  }

  return {
    headline,
    subline,
    forYou: forYou.length > 0 ? forYou : [
      {
        id: "fy-discover",
        label: "Keşfet",
        sub: "Trend içerik ve üreticiler",
        href: "/discover",
        kind: "discover",
      },
    ],
    community: community.slice(0, 4),
  };
}
