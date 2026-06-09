import { buildSignalThreadPackFromRow } from "@/features/signals/lib/build-signal-thread-pack";
import { signalCreatorQualityScore, signalMarketplaceTrendScore } from "@/features/signals/lib/signals-ranking";
import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import { personalizedTrendScore } from "@/features/personalization/domain/personalization-engine";
import type { SignalsFeedRow, SignalsMarketplaceRail } from "@/features/signals/repository/types";

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

function strategyCollectionRows(rows: SignalsFeedRow[]): SignalsFeedRow[] {
  const pool = rows.filter((r) => r.signal_package_label != null && r.signal_package_label.length > 0 && r.signal_access !== "public");
  const byPkg = new Map<string, SignalsFeedRow>();
  for (const r of [...pool].sort((a, b) => b.confidence - a.confidence)) {
    const k = r.signal_package_label!;
    if (!byPkg.has(k)) byPkg.set(k, r);
  }
  return [...byPkg.values()].sort((a, b) => b.confidence - a.confidence);
}

const nonPublic = (r: SignalsFeedRow) => r.signal_access !== "public";

export function buildSignalsMarketplaceRails(rows: SignalsFeedRow[], affinity: AffinityContext | null = null): SignalsMarketplaceRail[] {
  if (!rows.length) return [];

  const enriched = rows.map((row) => ({ row, pack: buildSignalThreadPackFromRow(row) }));
  const threadHeat = (x: (typeof enriched)[number]) =>
    x.pack.entries.length * 2 + x.pack.replyCount + x.pack.reactions.tracking;
  const debateScore = (x: (typeof enriched)[number]) =>
    x.pack.reactions.disagreed * 2 + x.pack.reactions.bearish + x.pack.quoteCount * 3;
  const creatorRecency = (x: (typeof enriched)[number]) =>
    x.pack.lastCreatorUpdateAt ? new Date(x.pack.lastCreatorUpdateAt).getTime() : 0;
  const sentimentSpread = (x: (typeof enriched)[number]) =>
    Math.abs(x.pack.sentimentSplit.bullPct - x.pack.sentimentSplit.bearPct);

  const activeDiscussions = cap(
    enriched
      .filter((x) => x.row.is_active && (x.row.discussion_active || x.pack.replyCount >= 8))
      .sort((a, b) => threadHeat(b) - threadHeat(a))
      .map((x) => x.row),
    10,
  );
  const mostDebatedSignals = cap(
    [...enriched].sort((a, b) => debateScore(b) - debateScore(a)).map((x) => x.row),
    10,
  );
  const creatorThreadUpdates = cap(
    enriched
      .filter((x) => x.pack.lastCreatorUpdateAt != null)
      .sort((a, b) => creatorRecency(b) - creatorRecency(a))
      .map((x) => x.row),
    10,
  );
  const communitySentimentSplit = cap(
    enriched
      .filter((x) => x.row.is_active)
      .sort((a, b) => sentimentSpread(b) - sentimentSpread(a))
      .map((x) => x.row),
    10,
  );

  const premiumConviction = cap(
    rows.filter((r) => r.is_active && nonPublic(r) && r.confidence >= 70).sort((a, b) => b.confidence - a.confidence),
    10,
  );
  const topPremiumAnalysts = cap(
    dedupeByAnalyst([...rows].filter(nonPublic).sort((a, b) => signalCreatorQualityScore(b) - signalCreatorQualityScore(a))),
    10,
  );
  const subscriberFavorites = cap(
    [...rows].filter((r) => r.subscriber_copies_24h >= 2).sort((a, b) => b.subscriber_copies_24h - a.subscriber_copies_24h),
    10,
  );
  const institutionalStyle = cap(
    rows
      .filter((r) => r.analyst.verified && (r.assetCategory === "forex" || r.assetCategory === "index") && r.confidence >= 66 && r.is_active)
      .sort((a, b) => b.confidence - a.confidence),
    10,
  );
  const strategyCollections = cap(strategyCollectionRows(rows), 10);
  const mostFollowedAnalysts = cap(
    dedupeByAnalyst([...rows].sort((a, b) => b.analyst.follower_count - a.analyst.follower_count)),
    10,
  );
  const highWinPremium = cap(
    rows
      .filter((r) => nonPublic(r) && (r.analyst.accuracy ?? 0) >= 66)
      .sort((a, b) => (b.analyst.accuracy ?? 0) - (a.analyst.accuracy ?? 0)),
    10,
  );
  const emergingPremium = cap(
    rows
      .filter((r) => r.analyst.follower_count < 85_000 && nonPublic(r) && r.confidence >= 62)
      .sort((a, b) => b.confidence - a.confidence),
    10,
  );

  const trending = cap(
    [...rows].sort(
      (a, b) =>
        personalizedTrendScore(b, signalMarketplaceTrendScore(b), affinity) -
        personalizedTrendScore(a, signalMarketplaceTrendScore(a), affinity),
    ),
    10,
  );
  const highConviction = cap(
    rows.filter((r) => r.is_active && r.confidence >= 72).sort((a, b) => b.confidence - a.confidence),
    10,
  );
  const fastMovers = cap(
    rows
      .filter((r) => r.is_active && (r.timeframe === "1S" || r.timeframe === "4S"))
      .sort((a, b) => b.community_copies_24h - a.community_copies_24h),
    10,
  );
  const mostCopied = cap([...rows].sort((a, b) => b.copies_count - a.copies_count), 10);
  const topAnalysts = cap([...rows].sort((a, b) => signalCreatorQualityScore(b) - signalCreatorQualityScore(a)), 10);
  const newAnalysts = cap(
    rows
      .filter((r) => r.analyst.follower_count < 80_000 && r.confidence >= 62)
      .sort((a, b) => b.confidence - a.confidence),
    10,
  );
  const risingCreators = cap(
    rows
      .filter((r) => r.is_active && r.copies_count >= 200 && r.analyst.follower_count < 200_000)
      .sort((a, b) => b.copies_count - a.copies_count),
    10,
  );
  const recentlyClosed = cap(
    rows.filter((r) => !r.is_active).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    10,
  );
  const highAccuracy = cap(
    rows
      .filter((r) => (r.analyst.accuracy ?? 0) >= 66)
      .sort((a, b) => (b.analyst.accuracy ?? 0) - (a.analyst.accuracy ?? 0)),
    10,
  );
  const macroSignals = cap(
    rows.filter((r) => r.assetCategory === "forex" || r.assetCategory === "index").sort((a, b) => b.confidence - a.confidence),
    10,
  );
  const cryptoMomentum = cap(
    rows
      .filter((r) => r.assetCategory === "crypto" && r.direction === "BUY" && r.is_active)
      .sort(
        (a, b) =>
          personalizedTrendScore(b, signalMarketplaceTrendScore(b), affinity) -
          personalizedTrendScore(a, signalMarketplaceTrendScore(a), affinity),
      ),
    10,
  );
  const equityBreakouts = cap(
    rows
      .filter((r) => r.assetCategory === "stocks" && r.direction === "BUY" && r.is_active)
      .sort((a, b) => b.confidence - a.confidence),
    10,
  );

  const rails: SignalsMarketplaceRail[] = [
    { id: "active_discussions", title: "Aktif tartışmalar", subtitle: "Thread ısısı + yanıt hacmi (mock)", rows: activeDiscussions },
    { id: "most_debated_signals", title: "Tartışmalı çağrılar", subtitle: "Ayırsı + alıntı + anlaşmazlık sinyali", rows: mostDebatedSignals },
    { id: "creator_thread_updates", title: "Üretici güncellemeleri", subtitle: "Kronolojik thread — aktif yönetim", rows: creatorThreadUpdates },
    { id: "community_sentiment_split", title: "Duygu ayrışması", subtitle: "Boğa / ayı katılımı geniş çağrılar", rows: communitySentimentSplit },
    { id: "premium_conviction", title: "Premium tez gücü", subtitle: "Yüksek güven · abonelik ekonomisi", rows: premiumConviction },
    { id: "top_premium_analysts", title: "Öne çıkan premium analistler", subtitle: "Ücretli akış + doğrulanmış üreticiler", rows: topPremiumAnalysts },
    { id: "subscriber_favorites", title: "Abone favorileri", subtitle: "Abone kopyası 24s — mock tahmin", rows: subscriberFavorites },
    { id: "institutional_style", title: "Kurumsal üslup", subtitle: "FX / endeks · doğrulanmış", rows: institutionalStyle },
    { id: "strategy_collections", title: "Strateji koleksiyonları", subtitle: "Paketlenmiş ürün hatları", rows: strategyCollections },
    { id: "most_followed_analysts", title: "En çok takip edilen", subtitle: "Analist başına tek vitrin çağrısı", rows: mostFollowedAnalysts },
    { id: "high_win_premium", title: "Yüksek isabet · premium", subtitle: "Geçmiş güçlü + ücretli katman", rows: highWinPremium },
    { id: "emerging_premium", title: "Yükselen premium", subtitle: "Büyüyen kanal + ücretli erişim", rows: emergingPremium },
    { id: "trending", title: "Trend sinyaller", subtitle: "Çok katmanlı skor — etkileşim + güven + tazelik", rows: trending },
    { id: "high_conviction", title: "Yüksek tez gücü", subtitle: "%72+ güven, açık çağrılar", rows: highConviction },
    { id: "fast_movers", title: "Hızlı hareket", subtitle: "Scalp / kısa vade, 24s kopya yoğunluğu", rows: fastMovers },
    { id: "most_copied", title: "En çok kopyalanan", subtitle: "Topluluk katılımı", rows: mostCopied },
    { id: "top_analysts", title: "Öne çıkan analistler", subtitle: "Takipçi + isabet + doğrulanmışlık", rows: topAnalysts },
    { id: "new_analysts", title: "Yeni analistler", subtitle: "Daha küçük kitle, yüksek güven çağrıları", rows: newAnalysts },
    { id: "rising_creators", title: "Yükselen üreticiler", subtitle: "Kopya momentumu + büyüyen kanal", rows: risingCreators },
    { id: "recently_closed", title: "Son kapananlar", subtitle: "Arşiv ve sonuç takibi", rows: recentlyClosed },
    { id: "high_accuracy", title: "Yüksek isabet", subtitle: "Analist geçmişi güçlü", rows: highAccuracy },
    { id: "macro_signals", title: "Makro & endeks", subtitle: "FX ve endeks teması", rows: macroSignals },
    { id: "crypto_momentum", title: "Kripto momentum", subtitle: "Alış baskısı + kripto", rows: cryptoMomentum },
    { id: "equity_breakouts", title: "Hisse kırılımları", subtitle: "BIST / hisse tarafı alış", rows: equityBreakouts },
  ];

  return rails.filter((r) => r.rows.length > 0);
}
