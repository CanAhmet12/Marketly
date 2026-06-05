import type { PostCommentRow } from "@/features/post/types";
import { getSignalsRepository } from "@/features/signals/repository";
import type {
  AssetDiscussionTeaser,
  ChannelDiscussionTeaser,
  DiscoverDiscussionRail,
  DiscussionSearchHit,
  DiscussionTimelineRow,
  PostDiscussionContext,
  PostDiscussionSidecar,
  SignalLinkedDiscussionTeaser,
} from "@/features/social/repository/discussion-types";

import { MOCK_POST_BY_ID, MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_PROFILE_BY_ID, MOCK_PROFILES } from "@/mock/fixtures/profiles";

function av(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=1e293b&color=94a3b8`;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]!;
}

const replyBodies = [
  "Aynı çerçevede; kademeli giriş daha temiz.",
  "Veri setiyle uyumlu, teşekkürler.",
  "Stop seviyesini bir tık yukarı alırdım.",
  "Makro takvimde çakışma var — dikkat.",
  "Kısa vadede nötrüm, orta vade pozitif.",
  "Üretici notuyla uyumlu — risk kontrollü.",
  "Bu senaryoda hedge şart gibi.",
  "Likidite tarafında onay gördüm.",
];

/** Derin thread — üretici yanıtları, alıntılı yanıtlar, çok seviye. */
export function buildMockPostCommentsList(postId: string): PostCommentRow[] {
  const post = MOCK_POST_BY_ID[postId] ?? MOCK_POST_SOURCES.find((p) => p.id === postId);
  if (!post || post.type !== "post") return [];

  const authorId = post.user_id;
  const seed = hashSeed(postId);
  const out: PostCommentRow[] = [];
  let n = seed % 9000;

  const roots = 2 + (seed % 3);
  const rootIds: string[] = [];

  for (let i = 0; i < roots; i++) {
    const prof = pick(MOCK_PROFILES, seed, i + 2);
    const rootId = `mock-pc-${postId.slice(0, 6)}-${n++}`;
    rootIds.push(rootId);
    const body = pick(replyBodies, seed, i);
    const isCreator = prof.id === authorId;
    const useProf = isCreator ? MOCK_PROFILE_BY_ID[authorId] ?? prof : prof;
    out.push({
      id: rootId,
      post_id: postId,
      user_id: useProf.id,
      content: isCreator ? `Üretici notu: ${body}` : body,
      created_at: new Date(Date.now() - (i + 3) * 7200_000 - seed * 1000).toISOString(),
      likes: (seed + i * 7) % 84,
      parent_comment_id: null,
      depth: 0,
      is_pinned: i === 0 && seed % 5 === 1,
      author_name: useProf.full_name ?? useProf.username,
      author_handle: `@${useProf.username}`,
      author_avatar: av(useProf.full_name ?? useProf.username),
      author_tier: useProf.tier,
      is_liked: false,
      quoted_snippet: null,
      is_creator_reply: isCreator,
      signal_ref: post.asset_tag ? `${post.asset_tag} · sinyal` : null,
      market_tags: post.asset_tag ? [String(post.asset_tag)] : [],
      discussion_intent: i === 0 ? "thesis" : pick(["question", "data", "risk", "thesis"] as const, seed, i),
      thesis_stance: pick(["agree", "disagree", "neutral"] as const, seed, i + 1),
      is_hidden: false,
    });
  }

  // İkinci seviye — bazıları alıntılı
  for (let i = 0; i < rootIds.length; i++) {
    if ((seed + i) % 3 === 2) continue;
    const parentId = rootIds[i]!;
    const parentRow = out.find((x) => x.id === parentId);
    const prof2 = pick(MOCK_PROFILES, seed, i + 9);
    const rid = `mock-pc-${postId.slice(0, 6)}-${n++}`;
    const qSnippet = parentRow?.content ? `${parentRow.content.slice(0, 72)}${parentRow.content.length > 72 ? "…" : ""}` : null;
    out.push({
      id: rid,
      post_id: postId,
      user_id: prof2.id,
      content: "Bu noktada korelasyonu XU100 ile karşılaştırdım — uyumlu.",
      created_at: new Date(Date.now() - (i + 1) * 4100_000).toISOString(),
      likes: 3 + ((seed + i) % 18),
      parent_comment_id: parentId,
      depth: 1,
      is_pinned: false,
      author_name: prof2.full_name ?? prof2.username,
      author_handle: `@${prof2.username}`,
      author_avatar: av(prof2.full_name ?? prof2.username),
      author_tier: prof2.tier,
      is_liked: false,
      quoted_snippet: qSnippet,
      is_creator_reply: prof2.id === authorId,
      signal_ref: null,
      market_tags: post.asset_tag ? [String(post.asset_tag)] : [],
      discussion_intent: "data",
      thesis_stance: "neutral",
      is_hidden: false,
    });

    // Üçüncü seviye (thread devamı)
    if (i === 0 && seed % 2 === 0) {
      const prof3 = pick(MOCK_PROFILES, seed, 14);
      const r2 = `mock-pc-${postId.slice(0, 6)}-${n++}`;
      out.push({
        id: r2,
        post_id: postId,
        user_id: prof3.id,
        content: "Katılıyorum; özellikle hacim onayı sonrası.",
        created_at: new Date(Date.now() - 800_000).toISOString(),
        likes: 1,
        parent_comment_id: rid,
        depth: 2,
        is_pinned: false,
        author_name: prof3.full_name ?? prof3.username,
        author_handle: `@${prof3.username}`,
        author_avatar: av(prof3.full_name ?? prof3.username),
        author_tier: prof3.tier,
        is_liked: false,
        quoted_snippet: null,
        is_creator_reply: false,
        signal_ref: null,
        market_tags: [],
        discussion_intent: "risk",
        thesis_stance: "agree",
        is_hidden: false,
      });
    }
  }

  return out.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

/** Tartışma keşfi / öneri mock’ları için gönderi havuzu */
export function getMockDiscussionPostPool() {
  return MOCK_POST_SOURCES.filter((p) => p.type === "post");
}

export function buildPostDiscussionSidecar(postId: string, ctx: PostDiscussionContext): PostDiscussionSidecar {
  const post = MOCK_POST_BY_ID[postId];
  const seed = hashSeed(postId);
  const tag = ctx.assetTag?.trim() ?? "";
  const pool = getMockDiscussionPostPool().filter((p) => p.id !== postId);
  const sameAsset = tag
    ? pool.filter((p) => (p.asset_tag ?? "").toUpperCase() === tag.toUpperCase())
    : pool.slice(0, 0);
  const relatedPosts = (sameAsset.length ? sameAsset : pool)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      href: `/post/${p.id}`,
      title: (p.title?.trim() || p.content.slice(0, 56)) + (p.content.length > 56 ? "…" : ""),
      comments: p.comments,
      asset_tag: p.asset_tag,
    }));

  const cont = pool[(seed + 2) % Math.max(1, pool.length)];
  const continuationHref = cont ? `/post/${cont.id}` : null;

  const cards = getSignalsRepository().getDiscoverSignalCards(40);
  const sym = tag.toUpperCase();
  const relatedSignals = cards
    .filter((c) => !sym || c.symbol.toUpperCase().includes(sym) || sym.includes(c.symbol.toUpperCase()))
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      href: `/signals?symbol=${encodeURIComponent(c.symbol)}`,
      symbol: c.symbol,
      label: `${c.direction} · %${c.confidence}`,
    }));

  const comments = buildMockPostCommentsList(postId);
  const counts = new Map<string, { n: number; name: string; handle: string; avatar: string | null }>();
  for (const c of comments) {
    const cur = counts.get(c.user_id) ?? { n: 0, name: c.author_name, handle: c.author_handle, avatar: c.author_avatar };
    cur.n += 1;
    counts.set(c.user_id, cur);
  }
  const activeParticipants = [...counts.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 6)
    .map(([user_id, v]) => ({
      user_id,
      name: v.name,
      handle: v.handle,
      avatar: v.avatar,
      contributor_score: v.n * 3 + (seed % 5),
      creator_responded: user_id === ctx.postAuthorId,
    }));

  const summary =
    post?.content?.trim().slice(0, 140) != null
      ? `Özet akış: tartışma ${post.comments} katılımcı çevresinde yoğunlaşıyor; odak ${tag || "makro"} etiketi.`
      : null;

  const timelineRows: DiscussionTimelineRow[] = relatedPosts.slice(0, 3).map((rp, i) => ({
    id: `tl-${postId}-${i}`,
    label: rp.title.slice(0, 48),
    sub: `${rp.comments} yanıt · bağlantılı başlık`,
    href: rp.href,
    heat: rp.comments + (seed % 7),
    tag: i === 0 ? "active" : i === 1 ? "trending" : "asset",
  }));

  const networkHints: PostDiscussionSidecar["networkHints"] = [];
  if (tag) {
    networkHints.push({
      id: "nh-1",
      text: `${tag} ile korelasyonlu diğer başlıklar`,
      href: `/discover`,
    });
    networkHints.push({
      id: "nh-2",
      text: "Sinyal tartışması ile çapraz referans",
      href: `/signals?asset=${encodeURIComponent(tag)}`,
    });
  } else {
    networkHints.push({ id: "nh-3", text: "Makro tartışma zinciri", href: `/markets` });
  }

  return {
    summary,
    continuationHref,
    timelineRows,
    relatedPosts,
    relatedSignals,
    activeParticipants,
    networkHints,
  };
}

export function buildDiscoverDiscussionRail(): DiscoverDiscussionRail {
  const pool = getMockDiscussionPostPool().sort((a, b) => b.comments + b.likes - (a.comments + a.likes));
  const activeThreads: DiscussionTimelineRow[] = pool.slice(0, 5).map((p, i) => ({
    id: `d-act-${p.id}`,
    label: (p.title?.trim() || p.content.slice(0, 44)) + (p.content.length > 44 ? "…" : ""),
    sub: `${p.comments} yanıt · ${p.asset_tag ? `#${p.asset_tag}` : "genel"}`,
    href: `/post/${p.id}`,
    heat: p.comments * 2 + p.likes,
    tag: i === 0 ? "active" : "trending",
  }));

  const trendingTopics = ["Fed", "VIOP", "BTC.D", "BIST", "Altın"].map((label, i) => ({
    id: `topic-${i}`,
    label: `${label} tartışması`,
    href: `/results?q=${encodeURIComponent(label)}`,
    score: `${60 + i * 7}%`,
  }));

  const creatorActive: DiscussionTimelineRow[] = pool
    .filter((_, idx) => idx % 2 === 0)
    .slice(0, 4)
    .map((p, i) => {
      const prof = MOCK_PROFILE_BY_ID[p.user_id];
      return {
        id: `d-cr-${p.id}`,
        label: `${prof?.full_name ?? prof?.username ?? "Üretici"} güncelledi`,
        sub: p.content.slice(0, 52) + (p.content.length > 52 ? "…" : ""),
        href: `/post/${p.id}`,
        heat: 80 - i * 5,
        tag: "creator",
      };
    });

  return { activeThreads, trendingTopics, creatorActive };
}

export function searchMockDiscussionHits(query: string, limit: number): DiscussionSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = getMockDiscussionPostPool();
  const scored = pool
    .map((p) => {
      const hay = `${p.title ?? ""} ${p.content} ${p.asset_tag ?? ""}`.toLowerCase();
      const hit = hay.includes(q) ? 3 : q.split(/\s+/).some((t) => t && hay.includes(t)) ? 1 : 0;
      return { p, hit };
    })
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.p.comments - a.p.comments);
  const prof = (uid: string) => MOCK_PROFILE_BY_ID[uid];
  return scored.slice(0, limit).map(({ p }, i) => {
    const pr = prof(p.user_id);
    return {
      id: `disc-hit-${p.id}`,
      post_id: p.id,
      title: p.title?.trim() || "Tartışma gönderisi",
      snippet: p.content.slice(0, 96) + (p.content.length > 96 ? "…" : ""),
      heat_label: `${p.comments} yanıt`,
      reply_count: p.comments,
      href: `/post/${p.id}`,
      asset_tag: p.asset_tag,
      author_name: pr?.full_name ?? pr?.username ?? "Kullanıcı",
      updated_at: new Date(Date.now() - i * 3600_000).toISOString(),
    };
  });
}

export function mockSignalLinkedDiscussions(signalId: string): SignalLinkedDiscussionTeaser[] {
  const row = getSignalsRepository().getFeedRows().find((r) => r.id === signalId);
  const sym = row?.symbol?.toUpperCase() ?? "";
  const pool = getMockDiscussionPostPool().filter(
    (p) => !sym || (p.asset_tag ?? "").toUpperCase() === sym || p.content.toUpperCase().includes(sym.slice(0, 3)),
  );
  const pickPool = pool.length ? pool : getMockDiscussionPostPool();
  return pickPool.slice(0, 4).map((p, i) => ({
    post_id: p.id,
    href: `/post/${p.id}`,
    title: (p.title?.trim() || p.content.slice(0, 48)) + (p.content.length > 48 ? "…" : ""),
    heat: `${Math.max(3, (p.comments % 35) + i)} tartışma`,
  }));
}

export function mockAssetDiscussionTeasers(tag: string): AssetDiscussionTeaser[] {
  const u = tag.trim().toUpperCase();
  return getMockDiscussionPostPool()
    .filter((p) => (p.asset_tag ?? "").toUpperCase() === u)
    .slice(0, 4)
    .map((p) => ({
      post_id: p.id,
      href: `/post/${p.id}`,
      label: (p.title?.trim() || p.content.slice(0, 40)) + (p.content.length > 40 ? "…" : ""),
      momentum: `${p.comments} yanıt`,
    }));
}

export function mockChannelDiscussionTeasers(channelUserId: string): ChannelDiscussionTeaser[] {
  return getMockDiscussionPostPool()
    .filter((p) => p.user_id === channelUserId)
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 12)
    .map((p) => ({
      post_id: p.id,
      href: `/post/${p.id}`,
      excerpt: p.content.slice(0, 120) + (p.content.length > 120 ? "…" : ""),
      comments: p.comments,
      asset_tag: p.asset_tag,
      updated_at: p.created_at,
    }));
}
