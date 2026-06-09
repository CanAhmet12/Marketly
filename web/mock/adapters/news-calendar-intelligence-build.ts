import type { EconomicCalendarRow, MarketNewsRow } from "@/features/markets/repository/markets-repository";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type {
  EconomicCalendarIntelEvent,
  EconomicCalendarIntelligenceBundle,
  MarketNewsDetailItem,
  MarketNewsIntelligenceItem,
  MarketNewsroomBundle,
} from "@/features/markets/types/news-calendar-intelligence";
import { MOCK_PROFILES } from "@/mock/fixtures/profiles";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function normalizeSymbols(symbols: readonly string[]): string[] {
  return symbols.map((s) => s.trim().toUpperCase()).filter(Boolean);
}

function intersects(a: readonly string[], b: readonly string[]): boolean {
  const setB = new Set(b.map((x) => x.toUpperCase()));
  return a.some((x) => setB.has(x.toUpperCase()));
}

function countSignalsForSymbol(feed: readonly SignalsFeedRow[], sym: string): number {
  const u = sym.toUpperCase();
  return feed.filter((r) => r.symbol.toUpperCase() === u).length;
}

function creatorNotesForSeed(
  seed: number,
  max: number,
): { display: string; href: string; note: string }[] {
  const profiles = MOCK_PROFILES.slice(0, Math.min(MOCK_PROFILES.length, 6));
  const out: { display: string; href: string; note: string }[] = [];
  for (let i = 0; i < max; i += 1) {
    const p = pick(profiles, seed + i);
    out.push({
      display: p.full_name ?? p.username,
      href: `/channel/${p.id}`,
      note: pick(
        [
          "Kısa vadede volatilite artışı bekliyorum.",
          "Akışta risk yönetimi vurgusu var.",
          "Makro bağlamda dikkatli kalın mesajı.",
          "Takip listesindeki sembollerle örtüşüyor.",
        ],
        seed + i * 7,
      ),
    });
  }
  return out;
}

function mockPublishedAt(row: MarketNewsRow): string {
  if (row.publishedAt) return row.publishedAt;
  return new Date(Date.now() - row.minutesAgo * 60_000).toISOString();
}

function mockSourceUrl(row: MarketNewsRow): string {
  if (row.sourceUrl) return row.sourceUrl;
  const host = row.source.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const slug = row.headline
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `https://news.example.com/${host}/${row.id}/${slug || "haber"}`;
}

function mockSummary(row: MarketNewsRow, seed: number): string {
  if (row.summary?.trim()) return row.summary.trim();
  return pick(
    [
      `${row.headline} — piyasa katılımcıları kısa vadeli volatilite artışına hazırlanıyor.`,
      `${row.headline} — analistler haberin ${row.symbol} ve ilişkili varlıklara etkisini izliyor.`,
      `${row.headline} — likidite ve spread dinamikleri haber sonrası yeniden fiyatlanabilir.`,
    ],
    seed + 11,
  );
}

function mockSentiment(row: MarketNewsRow, seed: number): string {
  if (row.sentiment?.trim()) return row.sentiment.trim();
  const tier = row.impactTier ?? pick([1, 2, 3] as const, seed);
  if (tier >= 3) return pick(["negative", "bearish"], seed + 12);
  if (tier === 2) return "neutral";
  return pick(["positive", "bullish"], seed + 13);
}

function inferNewsCategory(row: MarketNewsRow): MarketNewsIntelligenceItem["newsCategory"] {
  const sym = row.symbol.toUpperCase();
  const h = row.headline.toLowerCase();
  if (sym === "BTC" || sym === "ETH" || sym === "SOL") return "crypto";
  if (h.includes("bilanço") || h.includes("earnings") || h.includes("kâr")) return "earnings";
  if (h.includes("etf") || h.includes("giriş") || h.includes("flow")) return "flows";
  if (sym === "USDTRY" || sym === "XU100") return "local";
  return "macro";
}

function enrichNewsRow(row: MarketNewsRow, feed: readonly SignalsFeedRow[]): MarketNewsDetailItem {
  const seed = hashString(row.id + row.headline);
  const aff = row.affectedSymbols?.length ? row.affectedSymbols : [row.symbol];
  const sigCount = countSignalsForSymbol(feed, row.symbol);
  const tier = row.impactTier ?? pick([1, 2, 3] as const, seed);
  const cat = inferNewsCategory(row);

  return {
    id: row.id,
    symbol: row.symbol,
    headline: row.headline,
    source: row.source,
    minutesAgo: row.minutesAgo,
    impactTier: tier,
    affectedSymbols: aff,
    sectorImpact: pick(
      ["Bankacılık", "Teknoloji", "Enerji", "Kripto", "Döviz", "Endeks"],
      seed,
    ),
    volatilityExpectation:
      row.volatilityHint ??
      pick(["Düşük", "Orta", "Yüksek", "Kısa süreli spike riski"], seed + 1),
    signalActivityLabel:
      sigCount > 0 ? `${sigCount} sinyal bu sembolde aktif` : "Sinyal aktivitesi sınırlı",
    creatorCommentary: creatorNotesForSeed(seed, tier >= 3 ? 2 : 1),
    discussionSnippet: pick(
      [
        "Topluluk: kısa vadeli hedge tartışması yoğun.",
        "Tartışma: volatilite sonrası giriş zamanlaması.",
        "Akış: risk iştahı bölünmüş.",
      ],
      seed + 2,
    ),
    marketReaction: pick(
      ["Fiyat tepkisi ölçülü", "Spread genişlemesi gözlendi", "Hacim artışı", "Range içi"],
      seed + 3,
    ),
    momentumShift: pick(
      ["Momentum nötr", "Kısa momentum pozitif", "Kısa momentum negatif", "Yön belirsiz"],
      seed + 4,
    ),
    relatedMacroThemes: pick(
      [
        ["Faiz beklentisi", "Likidite"],
        ["Kur koridoru", "Enflasyon"],
        ["Risk iştahı", "Korelasyon"],
        ["ETF akışları", "Regülasyon"],
      ],
      seed + 5,
    ),
    chainReactionHint: pick(
      [
        "Kripto → risk varlıkları spillover",
        "Döviz → yerel endeks beta",
        "Endeks → vadeli açık pozisyonlar",
        "Makro → tahvil eğrisi",
      ],
      seed + 6,
    ),
    historicalEcho: pick(
      [
        "Benzer başlıklarda: ilk 60dk orta vol.",
        "Geçmiş örneklerde: kısa squeeze sonrası geri çekilme.",
        "Önceki baskılarda: haber sonrası spread normale döndü.",
      ],
      seed + 8,
    ),
    hitsWatchlist: false,
    hitsPortfolio: false,
    newsCategory: cat,
    imageUrl: row.imageUrl ?? null,
    sourceUrl: mockSourceUrl(row),
    summary: mockSummary(row, seed),
    publishedAt: mockPublishedAt(row),
    sentimentLabel: mockSentiment(row, seed),
  };
}

function enrichCalendarRow(row: EconomicCalendarRow, feed: readonly SignalsFeedRow[]): EconomicCalendarIntelEvent {
  const seed = hashString(row.id + row.title);
  const aff = row.affectedSymbols?.length ? row.affectedSymbols : ["SPX", "NDX"];
  const sym0 = aff[0] ?? "SPX";
  const sigCount = countSignalsForSymbol(feed, sym0);

  return {
    id: row.id,
    at: row.at,
    country: row.country,
    title: row.title,
    impact: row.impact,
    affectedSymbols: aff,
    volatilityExpectation:
      row.volatilityHint ?? pick(["Düşük", "Orta", "Yüksek", "Veri anında spike"], seed),
    consensusExpectation: pick(
      [
        "Konsensüs: beklenti içi",
        "Konsensüs: hafif aşağı sürpriz riski",
        "Konsensüs: yukarı sürpriz ihtimali",
      ],
      seed + 1,
    ),
    historicalMemory: pick(
      [
        "Önceki baskılarda: veri sonrası 30dk içinde ortalama vol artışı.",
        "Benzer tarihlerde: risk-off eğilimi gözlendi.",
        "Geçmiş tepkiler: kısa süreli mean-reversion.",
      ],
      seed + 2,
    ),
    positioningLabel: pick(
      ["Pozisyonlama: nötr", "Pozisyonlama: kısa ağırlık artışı", "Pozisyonlama: hedge yoğun"],
      seed + 3,
    ),
    creatorCommentary: creatorNotesForSeed(seed + 9, row.impact >= 3 ? 2 : 1),
    relatedSignalsLabel: sigCount > 0 ? `${sigCount} ilgili sinyal` : "İlgili sinyal az",
    relatedSignalsHref: `/signals?asset=${encodeURIComponent(sym0)}`,
    sentimentBefore: pick(["Beklenti: temkinli", "Beklenti: dengeli", "Beklenti: agresif"], seed + 4),
    sentimentAfter: pick(["Sonrası: volatilite", "Sonrası: sakinleşme", "Sonrası: yön arayışı"], seed + 5),
    macroTheme: pick(["Enflasyon", "Büyüme", "Para politikası", "İstihdam", "Ticaret"], seed + 6),
    discussionRows: [
      {
        id: `${row.id}-d1`,
        label: "Makro tartışma",
        stance: pick(["Boğa", "Ayı", "Kararsız"], seed),
        href: "/discover",
      },
      {
        id: `${row.id}-d2`,
        label: "Pozisyonlama",
        stance: pick(["Hedge artışı", "Risk-on", "Nötr"], seed + 11),
        href: "/signals",
      },
    ],
    networkHint: pick(
      [
        "Sektör yayılımı: finans → endeks beta",
        "Korelasyon: tahvil–hisse ayrışması riski",
        "Sentiment spillover: gelişmiş piyasalar",
      ],
      seed + 7,
    ),
    hitsWatchlist: false,
    hitsPortfolio: false,
  };
}

export function buildMarketNewsroomBundle(
  newsRows: readonly MarketNewsRow[],
  feed: readonly SignalsFeedRow[],
  watchlistSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): MarketNewsroomBundle {
  const base = newsRows;
  const wl = normalizeSymbols(watchlistSymbols);
  const pf = normalizeSymbols(portfolioSymbols);
  const items = base.map((r) => {
    const it = enrichNewsRow(r, feed);
    const affU = it.affectedSymbols.map((s) => s.toUpperCase());
    return {
      ...it,
      hitsWatchlist: intersects(affU, wl),
      hitsPortfolio: intersects(affU, pf),
    };
  });

  const counts: MarketNewsroomBundle["categoryCounts"] = {
    all: items.length,
    macro: 0,
    earnings: 0,
    flows: 0,
    crypto: 0,
    local: 0,
  };
  for (const it of items) {
    counts[it.newsCategory] += 1;
  }

  const hits = items.filter((i) => i.hitsWatchlist || i.hitsPortfolio);
  const personalizedHeadline =
    hits.length > 0
      ? `${hits.length} haber izleme listen veya portföyünle kesişiyor`
      : "Kişisel kesişim yok — sembol ekleyerek bağlamı güçlendirin";

  return { items, personalizedHeadline, categoryCounts: counts };
}

export function buildEconomicCalendarIntelligenceBundle(
  calendarRows: readonly EconomicCalendarRow[],
  feed: readonly SignalsFeedRow[],
  watchlistSymbols: readonly string[],
  portfolioSymbols: readonly string[],
): EconomicCalendarIntelligenceBundle {
  const base = calendarRows;
  const wl = normalizeSymbols(watchlistSymbols);
  const pf = normalizeSymbols(portfolioSymbols);
  const events = base.map((r) => {
    const ev = enrichCalendarRow(r, feed);
    const affU = ev.affectedSymbols.map((s) => s.toUpperCase());
    return {
      ...ev,
      hitsWatchlist: intersects(affU, wl),
      hitsPortfolio: intersects(affU, pf),
    };
  });

  const hits = events.filter((e) => e.hitsWatchlist || e.hitsPortfolio);
  const personalizedHeadline =
    hits.length > 0
      ? `${hits.length} etkinlik izleme listen veya portföyünle ilişkili`
      : "Takvimde kişisel kesişim yok — sembol ekleyin";

  const narrativeShift = pick(
    [
      "Makro anlatı: faiz beklentisi baskın",
      "Makro anlatı: büyüme endişesi artıyor",
      "Makro anlatı: likidite desteği sınırlı",
    ],
    hashString(events.map((e) => e.id).join("|")),
  );

  return { events, personalizedHeadline, narrativeShift };
}
