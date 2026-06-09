import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import type { SignalsFeedRow, SignalsMarketplaceRail } from "@/features/signals/repository/types";
import { signalCreatorQualityScore, signalMarketplaceTrendScore } from "@/features/signals/lib/signals-ranking";

const cap = (rows: SignalsFeedRow[], n: number) => rows.slice(0, n);

function dedupeByAnalyst(rows: SignalsFeedRow[]): SignalsFeedRow[] {
  const seen = new Set<string>();
  const out: SignalsFeedRow[] = [];
  for (const r of rows) {
    if (seen.has(r.analyst.id)) continue;
    seen.add(r.analyst.id);
    out.push(r);
  }
  return out;
}

/** Mock thread-pack olmadan gerçek feed verisiyle marketplace rayları */
export function buildLiveSignalsMarketplaceRails(
  rows: SignalsFeedRow[],
  recommendations?: PersonalizedSignalRelevance | null,
): SignalsMarketplaceRail[] {
  if (!rows.length) return [];

  const active = rows.filter((r) => r.is_active);
  const rails: SignalsMarketplaceRail[] = [];
  const byId = new Map(rows.map((r) => [r.id, r]));

  if (recommendations?.rows.length) {
    const recRows = recommendations.rows
      .map((rec) => byId.get(rec.id))
      .filter((r): r is SignalsFeedRow => Boolean(r));
    if (recRows.length) {
      rails.push({
        id: "for_you_signals",
        title: "Senin için öneriler",
        subtitle: recommendations.headline,
        rows: cap(recRows, 10),
      });
    }
  }

  const trending = cap(
    [...active].sort((a, b) => signalMarketplaceTrendScore(b) - signalMarketplaceTrendScore(a)),
    10,
  );
  if (trending.length) {
    rails.push({
      id: "trending_signals",
      title: "Trend sinyaller",
      subtitle: "Son etkileşim ve güven skoru",
      rows: trending,
    });
  }

  const highConfidence = cap(
    active.filter((r) => r.confidence >= 70).sort((a, b) => b.confidence - a.confidence),
    10,
  );
  if (highConfidence.length) {
    rails.push({
      id: "high_confidence",
      title: "Yüksek güven",
      subtitle: "Güven ≥ 70",
      rows: highConfidence,
    });
  }

  const recent = cap(
    [...active].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    10,
  );
  if (recent.length) {
    rails.push({
      id: "recently_active",
      title: "Son aktif çağrılar",
      subtitle: "Yeni yayınlanan sinyaller",
      rows: recent,
    });
  }

  const topAnalysts = cap(
    dedupeByAnalyst([...rows].sort((a, b) => signalCreatorQualityScore(b) - signalCreatorQualityScore(a))),
    10,
  );
  if (topAnalysts.length) {
    rails.push({
      id: "popular_analysts",
      title: "Öne çıkan analistler",
      subtitle: "Kalite skoru",
      rows: topAnalysts,
    });
  }

  const byAsset = new Map<string, SignalsFeedRow>();
  for (const r of [...active].sort((a, b) => b.copies_count - a.copies_count)) {
    const sym = r.symbol?.trim().toUpperCase();
    if (!sym || byAsset.has(sym)) continue;
    byAsset.set(sym, r);
    if (byAsset.size >= 10) break;
  }
  const assetGroups = [...byAsset.values()];
  if (assetGroups.length) {
    rails.push({
      id: "asset_groups",
      title: "Varlık bazlı",
      subtitle: "En çok kopyalanan semboller",
      rows: assetGroups,
    });
  }

  return rails;
}
