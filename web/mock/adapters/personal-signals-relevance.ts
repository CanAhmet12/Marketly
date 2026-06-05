import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import type { PersonalizedSignalRelevance, PersonalizedSignalRelevanceRow } from "@/features/signals/repository/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

function symSet(symbols: readonly string[]): Set<string> {
  return new Set(symbols.map((x) => x.trim().toUpperCase()).filter(Boolean));
}

function rowAffinityScore(row: SignalsFeedRow, ctx: AffinityContext | null): number {
  if (!ctx || ctx.meta.eventCount < 2) return 0;
  const sym = row.symbol.trim().toUpperCase();
  const a = ctx.assets[sym] ?? 0;
  const c = ctx.creators[row.analyst.id] ?? 0;
  const s = ctx.signals[row.id] ?? 0;
  const t = row.analyst.specialties?.reduce((acc, sp) => acc + (ctx.topics[String(sp).toLowerCase()] ?? 0), 0) ?? 0;
  return a * 1.1 + c * 0.95 + s * 1.25 + t * 0.08;
}

export function buildPersonalizedSignalRelevance(
  feed: SignalsFeedRow[],
  watchedSymbols: readonly string[],
  portfolioSymbols: readonly string[],
  affinity: AffinityContext | null,
): PersonalizedSignalRelevance {
  const watch = symSet(watchedSymbols);
  const port = symSet(portfolioSymbols);
  const union = new Set([...watch, ...port]);

  const scored = feed.map((r) => {
    const sym = r.symbol.toUpperCase();
    const inList = union.has(sym);
    const aff = rowAffinityScore(r, affinity);
    const base = (r.discussion_active ? 4 : 0) + r.confidence * 0.35 + (inList ? 18 : 0) + aff;
    return { r, score: base, aff, sym };
  });

  const warmGraph = Boolean(affinity && affinity.meta.eventCount >= 4);

  const poolCandidates = scored.filter(({ sym, aff }) => {
    if (union.size > 0) return union.has(sym) || aff >= 6;
    return warmGraph && aff >= 5;
  });

  const pool = [...poolCandidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const idCmp = a.r.id.localeCompare(b.r.id);
    if (idCmp !== 0) return idCmp;
    return a.sym.localeCompare(b.sym);
  });

  if (!pool.length) {
    if (union.size === 0 && !warmGraph) {
      return { headline: "İzleme veya portföy sembolü ekleyin", rows: [] };
    }
    return {
      headline: warmGraph ? "İlgi grafiğine uygun aktif çağrı bulunamadı" : "Kesişen aktif sinyal yok",
      rows: [],
    };
  }

  const rows: PersonalizedSignalRelevanceRow[] = pool.slice(0, 10).map(({ r, aff }) => {
    const sym = r.symbol.toUpperCase();
    const inWatch = watch.has(sym);
    const inPort = port.has(sym);
    let reason = "Davranış grafiği";
    if (inWatch) reason = "İzlenen sembol";
    else if (inPort) reason = "Portföy teması";
    else if (aff >= 12) reason = "Güçlü ilgi grafiği eşleşmesi";
    else if (aff >= 6) reason = "İlgi grafiği örtüşmesi";

    return {
      id: r.id,
      symbol: r.symbol,
      direction: r.direction,
      confidence: r.confidence,
      analystDisplay: r.analyst.display,
      href: `/signals?asset=${encodeURIComponent(r.symbol)}`,
      reason,
    };
  });

  const headline = rows.length ? `Sizin için ${rows.length} bağlamsal çağrı` : "Kesişen aktif sinyal yok";
  return { headline, rows };
}
