"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { PortfolioAddHoldingSheet } from "@/features/markets/components/portfolio-add-holding-sheet";
import {
  PortfolioPageView,
  type PortfolioHoldingRowEnrichment,
} from "@/features/markets/components/portfolio-page-view";
import { PortfolioPageSkeleton } from "@/features/markets/components/markets-states";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { usePortfolioHoldings } from "@/features/markets/hooks/use-portfolio-holdings";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import {
  fetchCorrelatedAssets,
  mapCorrelationsToPortfolioPairs,
} from "@/features/markets/fetch-correlated-assets";
import { buildPortfolioIntelContext } from "@/features/markets/lib/build-portfolio-intel-context";
import { buildMockPortfolioPerfChart } from "@/features/markets/lib/build-portfolio-perf-series";
import { fetchEconomicCalendarBundle } from "@/features/markets/fetch-economic-calendar";
import { fetchMarketNewsroomBundle } from "@/features/markets/fetch-market-news";
import { emptyPortfolioIntelContext } from "@/features/markets/types/portfolio-intel-context";
import {
  buildPortfolioIntelligenceFromLive,
  type PortfolioLiveStats,
} from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { fmtPortfolioMoney, portfolioCurrencyForSymbol } from "@/features/markets/lib/portfolio-format";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { buildPersonalizedSignalRelevance } from "@/features/signals/lib/build-personalized-signal-relevance";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { getSignalsRepository } from "@/features/signals/repository";
import { AlgoFlags } from "@/lib/algo-flags";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

const PORTFOLIO_LOGIN_NEXT = "/hub/portfolio";

const MOCK_PERF = buildMockPortfolioPerfChart([
  33800, 35200, 36100, 34900, 37200, 38800, 39400, 40100, 39600, 41200, 42100, 42847,
]);

const MOCK_STATS: PortfolioLiveStats = {
  totalValue: 42_847.5,
  investedCost: 36_000,
  todayPnL: 324.18,
  todayPnLPct: 0.76,
  totalPnL: 6_847.5,
  totalPnLPct: 19.03,
  riskScore: 62,
  riskLabel: "Orta",
  perfSeries: MOCK_PERF.series,
  perfMode: MOCK_PERF.mode,
  perfCaption: MOCK_PERF.caption,
  primaryCurrency: "USD",
};

const MOCK_HOLDING_ENRICHMENT: Record<string, PortfolioHoldingRowEnrichment> = {
  BTC: { pnlPct: 18.4, priceLabel: "$103,840", categoryKey: "crypto" },
  ETH: { pnlPct: 12.8, priceLabel: "$3,812", categoryKey: "crypto" },
  THYAO: { pnlPct: 28.4, priceLabel: "291 TL", categoryKey: "stocks" },
  XU100: { pnlPct: 11.2, priceLabel: "9,663", categoryKey: "index" },
  AAPL: { pnlPct: -3.2, priceLabel: "$188", categoryKey: "stocks" },
  SOL: { pnlPct: 44.2, priceLabel: "$198", categoryKey: "crypto" },
};

export function PortfolioPageClient() {
  const mockOn = isMockDataEnabled();
  const { user, isInitialized } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const mRepo = useMemo(() => getMarketsRepository(), []);
  const sRepo = useMemo(() => getSignalsRepository(), []);
  const { watchlist, hydrated } = useMarketsWatchlist(mockOn ? mRepo.getWatchlistSeed() : undefined);

  const { assets: liveAssets } = useMarketAssetsLive();
  const {
    holdings: liveHoldings,
    isLoading: holdingsLoading,
    upsertHolding,
    upsertPending,
    writeEnabled,
  } = usePortfolioHoldings(user?.id);

  const liveSignalsQuery = useQuery({
    queryKey: queryKeys.signalsFeed(),
    queryFn: () => fetchSignalsFeed(getSupabaseBrowserClient()),
    enabled: !mockOn && isSupabaseConfigured(),
    staleTime: 60_000,
  });

  const mockPortfolio = useMemo(() => mRepo.getPortfolioIntelligenceBundle(), [mRepo]);
  const mockPersonalized = useMemo(
    () => sRepo.getPersonalizedSignalRelevance(Array.from(watchlist), mockPortfolio.portfolioSymbols),
    [sRepo, watchlist, mockPortfolio.portfolioSymbols],
  );

  const mockIntel = useMemo(() => {
    if (!mockOn) return emptyPortfolioIntelContext();
    const news = mRepo.getMarketNewsroomBundle([], mockPortfolio.portfolioSymbols);
    const cal = mRepo.getEconomicCalendarIntelligenceBundle([], mockPortfolio.portfolioSymbols);
    return buildPortfolioIntelContext(news.items, cal.events, mockPortfolio.portfolioSymbols);
  }, [mRepo, mockOn, mockPortfolio.portfolioSymbols]);

  const anchorSymbol = useMemo(() => {
    if (mockOn || liveHoldings.length === 0) return null;
    const top = [...liveHoldings].sort((a, b) => b.total_value - a.total_value)[0];
    return top?.symbol ?? top?.asset_id ?? null;
  }, [mockOn, liveHoldings]);

  const corrQuery = useQuery({
    queryKey: queryKeys.correlatedAssets(anchorSymbol ?? ""),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const rows = await fetchCorrelatedAssets(client, anchorSymbol!, 8);
      const portSyms = liveHoldings.map((h) => h.symbol ?? h.asset_id);
      return mapCorrelationsToPortfolioPairs(anchorSymbol!, rows, portSyms);
    },
    enabled:
      !mockOn &&
      isSupabaseConfigured() &&
      AlgoFlags.marketDataAlgorithms &&
      Boolean(anchorSymbol) &&
      liveHoldings.length >= 2,
    staleTime: 300_000,
  });

  const liveDerived = useMemo(() => {
    if (mockOn || liveHoldings.length === 0) return null;
    return buildPortfolioIntelligenceFromLive(
      liveHoldings,
      liveAssets,
      liveSignalsQuery.data ?? [],
      corrQuery.data ?? [],
    );
  }, [mockOn, liveHoldings, liveAssets, liveSignalsQuery.data, corrQuery.data]);

  const livePersonalized = useMemo(() => {
    if (mockOn || !liveDerived) return null;
    return buildPersonalizedSignalRelevance(
      liveSignalsQuery.data ?? [],
      [],
      liveDerived.bundle.portfolioSymbols,
      null,
    );
  }, [mockOn, liveDerived, liveSignalsQuery.data]);

  const livePortfolioSymbolsKey = useMemo(() => {
    if (!liveDerived) return "";
    return [...liveDerived.bundle.portfolioSymbols].sort().join(",");
  }, [liveDerived]);

  const liveIntelQuery = useQuery({
    queryKey: queryKeys.portfolioIntel(livePortfolioSymbolsKey),
    queryFn: async () => {
      const syms = liveDerived!.bundle.portfolioSymbols;
      const client = getSupabaseBrowserClient();
      const [news, cal] = await Promise.all([
        fetchMarketNewsroomBundle(client, [], syms),
        fetchEconomicCalendarBundle(client, [], syms),
      ]);
      return buildPortfolioIntelContext(news.items, cal.events, syms);
    },
    enabled: !mockOn && isSupabaseConfigured() && livePortfolioSymbolsKey.length > 0,
    staleTime: 90_000,
  });

  const liveHoldingEnrichment = useMemo(() => {
    const out: Record<string, PortfolioHoldingRowEnrichment> = {};
    if (!liveDerived) return out;
    for (const h of liveDerived.bundle.holdings) {
      const liveH = liveHoldings.find((x) => x.asset_id.toUpperCase() === h.symbol.toUpperCase());
      const rowCur = portfolioCurrencyForSymbol(h.symbol, h.category);
      out[h.symbol] = {
        priceLabel: liveH ? fmtPortfolioMoney(liveH.total_value, rowCur) : "—",
        pnlPct: liveH?.pnl_percent ?? 0,
        categoryKey: h.category,
      };
    }
    return out;
  }, [liveDerived, liveHoldings]);

  const handleAddHolding = async ({
    asset,
    quantity,
    avgCost,
  }: {
    asset: { id: string; symbol: string; name: string };
    quantity: number;
    avgCost: number;
  }) => {
    await upsertHolding({
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity,
      avgCost,
    });
  };

  if (!mockOn) {
    if (!isInitialized) return <PortfolioPageSkeleton />;
    if (!isSupabaseConfigured()) {
      return (
        <HubPageShell zone="finance" className="pf-canvas" mainClassName="py-16">
          <EmptyState
            title="Portföy kullanılamıyor"
            description="Supabase yapılandırması eksik."
            actionLabel="Piyasalar"
            actionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </HubPageShell>
      );
    }
    if (!user) {
      return (
        <HubPageShell zone="finance" className="pf-canvas" mainClassName="py-16">
          <EmptyState
            title="Giriş gerekli"
            description="Canlı portföyünü görüntülemek ve pozisyon eklemek için giriş yap."
            actionLabel="Giriş yap"
            actionHref={`/auth/login?next=${encodeURIComponent(PORTFOLIO_LOGIN_NEXT)}`}
            secondaryActionLabel="Piyasalar"
            secondaryActionHref={MARKETS_HUB_PATH}
            tone="market"
            compact
          />
        </HubPageShell>
      );
    }
    if (holdingsLoading || (liveHoldings.length > 0 && !liveDerived)) {
      return <PortfolioPageSkeleton />;
    }
    if (liveHoldings.length === 0) {
      return (
        <>
          <HubPageShell zone="finance" className="pf-canvas" mainClassName="py-16">
            <EmptyState
              title="Portföy boş"
              description="Henüz pozisyon eklenmemiş. İlk varlığını ekleyerek canlı P&L takibine başla."
              actionLabel={writeEnabled ? "Pozisyon ekle" : undefined}
              onAction={writeEnabled ? () => setAddOpen(true) : undefined}
              secondaryActionLabel="Piyasalar"
              secondaryActionHref={MARKETS_HUB_PATH}
              tone="market"
              compact
            />
          </HubPageShell>
          <PortfolioAddHoldingSheet
            open={addOpen}
            onClose={() => setAddOpen(false)}
            assets={liveAssets}
            writeEnabled={writeEnabled}
            pending={upsertPending}
            onSubmit={handleAddHolding}
          />
        </>
      );
    }

    return (
      <>
        <PortfolioPageView
          pageTitle="Canlı Portföy"
          stats={liveDerived!.stats}
          portfolio={liveDerived!.bundle}
          personalized={livePersonalized ?? { headline: "Portföy sinyalleri", rows: [] }}
          holdingEnrichment={liveHoldingEnrichment}
          intel={liveIntelQuery.data ?? emptyPortfolioIntelContext()}
          valueColumnLabel="Değer"
          canAddHolding={writeEnabled}
          onAddHolding={() => setAddOpen(true)}
        />
        <PortfolioAddHoldingSheet
          open={addOpen}
          onClose={() => setAddOpen(false)}
          assets={liveAssets}
          writeEnabled={writeEnabled}
          pending={upsertPending}
          onSubmit={handleAddHolding}
        />
      </>
    );
  }

  if (!hydrated) return <PortfolioPageSkeleton />;

  if (mockPortfolio.holdings.length === 0) {
    return (
      <HubPageShell zone="finance" className="pf-canvas" mainClassName="py-16">
        <EmptyState
          title="Portföy boş"
          description="Henüz pozisyon eklenmemiş."
          actionLabel="Piyasalar"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
        />
      </HubPageShell>
    );
  }

  return (
    <PortfolioPageView
      pageTitle="Kağıt Portföy"
      stats={MOCK_STATS}
      portfolio={mockPortfolio}
      personalized={mockPersonalized}
      holdingEnrichment={MOCK_HOLDING_ENRICHMENT}
      intel={mockIntel}
      valueColumnLabel="Fiyat"
    />
  );
}
