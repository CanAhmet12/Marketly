import type { CreatorsDirectoryParams } from "@/features/creators/hooks/use-creators-directory-params";
import type { CreatorSpecialtyId, CreatorsSortId } from "@/features/creators/lib/creators-directory-config";
import type { CreatorDirectoryRow } from "@/features/creators/types";

const SPECIALTY_MATCH: Record<CreatorSpecialtyId, (c: CreatorDirectoryRow) => boolean> = {
  crypto: (c) =>
    c.specialties.some((s) => /kripto|crypto|btc|eth|on-chain/i.test(s)) ||
    c.assetTags.some((t) => /BTC|ETH|SOL|CRYPTO/i.test(t)),
  stocks: (c) =>
    c.specialties.some((s) => /bist|hisse|teknik|xu100/i.test(s)) ||
    c.assetTags.some((t) => /BIST|XU100|THYAO|GARAN|NASDAQ/i.test(t)),
  forex: (c) =>
    c.specialties.some((s) => /döviz|doviz|forex|eur|usd/i.test(s)) ||
    c.assetTags.some((t) => /USD|TRY|EUR|FOREX/i.test(t)),
  macro: (c) =>
    c.specialties.some((s) => /makro|fed|faiz|tcmb/i.test(s)) ||
    c.assetTags.some((t) => /TCMB|FED|SPX|MAKRO/i.test(t)),
  commodity: (c) =>
    c.specialties.some((s) => /emtia|altın|altin|gümüş|gumus/i.test(s)) ||
    c.assetTags.some((t) => /XAU|XAG|ALTIN|GOLD/i.test(t)),
  deriv: (c) =>
    c.specialties.some((s) => /viop|opsiyon|opisyon|türev|turev|deriv/i.test(s)) ||
    c.assetTags.some((t) => /VIOP|DERIV/i.test(t)),
};

function matchesQuery(c: CreatorDirectoryRow, q: string): boolean {
  const needle = q.toLowerCase();
  const hay = [
    c.displayName,
    c.handle,
    c.username,
    c.bio ?? "",
    ...c.specialties,
    ...c.assetTags,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function matchesAsset(c: CreatorDirectoryRow, asset: string): boolean {
  const u = asset.toUpperCase();
  return c.assetTags.some((t) => t.toUpperCase() === u || t.toUpperCase().includes(u));
}

function sortCreators(rows: CreatorDirectoryRow[], sort: CreatorsSortId): CreatorDirectoryRow[] {
  const copy = [...rows];
  switch (sort) {
    case "live":
      return copy.sort((a, b) => Number(b.isLive) - Number(a.isLive) || b.followerCount - a.followerCount);
    case "rising":
      return copy.sort(
        (a, b) =>
          (b.risingVelocity ?? 0) - (a.risingVelocity ?? 0) ||
          Number(b.rising) - Number(a.rising) ||
          b.followerCount - a.followerCount,
      );
    case "followers":
      return copy.sort((a, b) => b.followerCount - a.followerCount);
    case "accuracy":
      return copy.sort((a, b) => (b.signalAccuracy ?? 0) - (a.signalAccuracy ?? 0));
    case "recommended":
    default:
      return copy.sort((a, b) => {
        const sa =
          (a.compositeScore ?? 0) +
          (a.isLive ? 3 : 0) +
          (a.signalAccuracy ?? 0) * 0.04 +
          Math.log1p(a.followerCount) * 0.5;
        const sb =
          (b.compositeScore ?? 0) +
          (b.isLive ? 3 : 0) +
          (b.signalAccuracy ?? 0) * 0.04 +
          Math.log1p(b.followerCount) * 0.5;
        return sb - sa;
      });
  }
}

export function filterCreatorsDirectory(
  creators: CreatorDirectoryRow[],
  params: CreatorsDirectoryParams,
): CreatorDirectoryRow[] {
  let rows = creators;

  if (params.tab === "live") rows = rows.filter((c) => c.isLive);
  if (params.tab === "rising") rows = rows.filter((c) => c.rising);

  if (params.q) rows = rows.filter((c) => matchesQuery(c, params.q));
  if (params.asset) rows = rows.filter((c) => matchesAsset(c, params.asset!));
  if (params.specialty) {
    const pred = SPECIALTY_MATCH[params.specialty];
    rows = rows.filter(pred);
  }

  return sortCreators(rows, params.sort);
}

export function hasActiveCreatorFilters(params: CreatorsDirectoryParams, activeFilterCount: number): boolean {
  return activeFilterCount > 0 || Boolean(params.q);
}
