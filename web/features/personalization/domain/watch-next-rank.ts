import type { AffinityContext, WatchNextCandidate, WatchNextRankInput } from "./personalization-types";
import type { FeedFeedbackState } from "./feed-feedback-store";
import type { WatchFeedbackState } from "./watch-feedback-store";

export type WatchNextRankOptions = {
  input: WatchNextRankInput;
  affinity: AffinityContext | null;
  feedFeedback: FeedFeedbackState;
  watchFeedback: WatchFeedbackState;
  watchedSymbols: ReadonlySet<string>;
  portfolioSymbols: ReadonlySet<string>;
  pulseSymbols: ReadonlySet<string>;
  discussionBoostPostIds: ReadonlySet<string>;
  hotSignalSymbols: ReadonlySet<string>;
  /** Son 45 dk içinde üretici tekrar sayısı */
  bingeByCreatorId: Readonly<Record<string, number>>;
  coldStart: boolean;
  adaptiveWatch?: (c: WatchNextCandidate) => number;
};

export function playlistContinuation(
  memberOrder: string[] | null,
  excludeId: string,
): { after: string[]; set: Set<string> } {
  const order = memberOrder ?? [];
  const ix = order.indexOf(excludeId);
  const after = ix >= 0 ? order.slice(ix + 1).filter((id) => id !== excludeId) : order.filter((id) => id !== excludeId);
  return { after, set: new Set(order) };
}

function videoish(type: string | null | undefined): boolean {
  const t = (type ?? "").toLowerCase();
  return t === "video" || t === "short" || t === "pulse" || t === "live";
}

function assetUpper(tag: string | null | undefined): string | null {
  const t = tag?.replace(/^#/, "").trim();
  if (!t) return null;
  return t.toUpperCase();
}

function contentTokens(c: WatchNextCandidate): string[] {
  const raw = `${c.title ?? ""} ${c.content ?? ""}`.toLowerCase();
  const out = new Set<string>();
  const m = raw.match(/#[\p{L}\d_]+/gu);
  if (m) for (const x of m) out.add(x.replace(/^#/, "").slice(0, 24));
  const ast = assetUpper(c.asset_tag);
  if (ast) out.add(ast.toLowerCase());
  return [...out].slice(0, 12);
}

function baseTier(
  c: WatchNextCandidate,
  after: string[],
  set: Set<string>,
  input: WatchNextRankInput,
): number {
  if (after.includes(c.id)) return 0;
  if (set.has(c.id)) return 1;
  if (input.preferUserId && c.user_id === input.preferUserId) return 2;
  const curAst = assetUpper(input.currentAssetTag);
  const pAst = assetUpper(c.asset_tag);
  if (curAst && pAst && curAst === pAst) return 3;
  const cur = (input.currentType ?? "").toLowerCase();
  if (cur && (c.type ?? "").toLowerCase() === cur) return 4;
  return 5;
}

function isFiltered(c: WatchNextCandidate, opts: WatchNextRankOptions): boolean {
  if (c.id === opts.input.excludeId) return true;
  if (!videoish(c.type)) return true;
  if (opts.watchFeedback.hideCreators.includes(c.user_id)) return true;
  if (opts.feedFeedback.muteCreators.includes(c.user_id)) return true;
  const ast = assetUpper(c.asset_tag);
  if (ast && opts.feedFeedback.muteAssets.includes(ast)) return true;
  for (const tok of contentTokens(c)) {
    if (opts.watchFeedback.hideTopics.includes(tok)) return true;
  }
  return false;
}

function scoreCandidate(
  c: WatchNextCandidate,
  opts: WatchNextRankOptions,
  after: string[],
  set: Set<string>,
): number {
  const { input, affinity, watchFeedback, watchedSymbols, portfolioSymbols, pulseSymbols } = opts;
  const tier = baseTier(c, after, set, input);
  let s = (6 - tier) * 180;

  const pAst = assetUpper(c.asset_tag);
  if (pAst && watchedSymbols.has(pAst)) s += 42;
  if (pAst && portfolioSymbols.has(pAst)) s += 32;
  if (pAst && pulseSymbols.has(pAst)) s += 18;
  if (pAst && opts.hotSignalSymbols.has(pAst)) s += 26;

  if (affinity) {
    s += (affinity.creators[c.user_id] ?? 0) * 0.45;
    if (pAst) s += (affinity.assets[pAst] ?? 0) * 0.35;
    for (const tok of contentTokens(c)) {
      s += (affinity.topics[tok] ?? 0) * 0.28;
    }
    const fmt = (c.type ?? "video").toLowerCase();
    s += (affinity.formats[fmt] ?? 0) * 0.22;
    if (c.discussion_anchor_post_id && opts.discussionBoostPostIds.has(c.discussion_anchor_post_id)) {
      s += 24;
    }
  }

  const binge = opts.bingeByCreatorId[c.user_id] ?? 0;
  if (binge >= 2 && input.preferUserId && c.user_id === input.preferUserId) s += 22 + binge * 6;

  if (watchFeedback.morePostIds.includes(c.id)) s += 80;
  if (watchFeedback.lessPostIds.includes(c.id)) s *= 0.22;

  const fmt = (c.type ?? "").toLowerCase();
  if (watchFeedback.interestedFormats.includes(fmt)) s += 16;
  for (const tok of contentTokens(c)) {
    if (watchFeedback.interestedThemes.includes(tok)) s += 12;
  }

  if (opts.coldStart) {
    s += Math.min(28, Math.log1p((c.views_count ?? 0) + (c.comments ?? 0) * 2) * 4);
  }

  const va = c.views_count ?? 0;
  s += Math.log1p(va) * 1.1;

  if (opts.adaptiveWatch) {
    s *= opts.adaptiveWatch(c);
  }

  return s;
}

function diversityReorderWatch(scored: { c: WatchNextCandidate; score: number }[]): WatchNextCandidate[] {
  const pool = [...scored].sort((a, b) => b.score - a.score);
  const out: WatchNextCandidate[] = [];
  const window = 4;

  while (pool.length) {
    let pickedIdx = -1;
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i]!.c;
      const tail = out.slice(-window);
      const nSameCreator = tail.filter((x) => x.user_id === cand.user_id).length;
      if (nSameCreator >= 2) continue;
      const a = assetUpper(cand.asset_tag);
      const tailAssets = tail.map((x) => assetUpper(x.asset_tag)).filter(Boolean) as string[];
      if (a && tailAssets.filter((x) => x === a).length >= 2) continue;
      pickedIdx = i;
      break;
    }
    if (pickedIdx === -1) {
      out.push(pool.shift()!.c);
    } else {
      const [row] = pool.splice(pickedIdx, 1);
      out.push(row!.c);
    }
  }
  return out;
}

export type WatchContinuityReason = "playlist" | "creator" | "asset" | "type" | "session" | "market" | "trending";

export function watchContinuityReason(
  c: WatchNextCandidate,
  after: string[],
  set: Set<string>,
  input: WatchNextRankInput,
  binge: number,
): WatchContinuityReason {
  if (after.includes(c.id) || set.has(c.id)) return "playlist";
  if (input.preferUserId && c.user_id === input.preferUserId && binge >= 2) return "session";
  if (input.preferUserId && c.user_id === input.preferUserId) return "creator";
  const curAst = assetUpper(input.currentAssetTag);
  const pAst = assetUpper(c.asset_tag);
  if (curAst && pAst && curAst === pAst) return "asset";
  const cur = (input.currentType ?? "").toLowerCase();
  if (cur && (c.type ?? "").toLowerCase() === cur) return "type";
  if (curAst && pAst) return "market";
  return "trending";
}

export function watchContinuityLabel(r: WatchContinuityReason): string {
  const labels: Record<WatchContinuityReason, string> = {
    playlist: "Liste",
    creator: "Üretici",
    asset: "Varlık",
    type: "Format",
    session: "Oturum",
    market: "Piyasa",
    trending: "Öneri",
  };
  return labels[r];
}

export function computeWatchNextRanking(
  candidates: readonly WatchNextCandidate[],
  opts: WatchNextRankOptions,
): WatchNextCandidate[] {
  const { input } = opts;
  const { after, set } = playlistContinuation(input.playlistMemberOrder, input.excludeId);
  let filtered = candidates.filter((c) => !isFiltered(c, opts));
  // İzleme sırası boş kalmasın: konu/üretici gizleri tüm havuzu kestiğinde yalnızca format + exclude uygula
  if (!filtered.length && candidates.length) {
    filtered = candidates.filter(
      (c) => c.id !== opts.input.excludeId && videoish(c.type),
    );
  }
  if (!filtered.length) return [];

  const scored = filtered.map((c) => ({
    c,
    score: scoreCandidate(c, opts, after, set),
  }));

  return diversityReorderWatch(scored);
}
