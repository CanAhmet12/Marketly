import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMarketPrices } from './useMarketPrices';

export interface Holding {
  id:          string;
  asset_id:    string;
  symbol:      string;
  name:        string;
  quantity:    number;
  avg_cost:    number;
  logo_color?: string;
  logo_letter?: string;
  // Computed from live prices
  current_price: number;
  current_value: number;
  cost_basis:    number;
  pnl:           number;
  pnl_pct:       number;
  allocation:    number; // 0-100
}

// Ham DB satırı tipi
type RawHolding = {
  id: string; asset_id: string; symbol: string | null;
  name: string | null; quantity: number; avg_cost: number;
};

export function usePortfolio() {
  const { user } = useAuth();
  const { assets } = useMarketPrices();
  // rawHoldings: sadece DB verisi, live fiyat içermez
  const [rawHoldings, setRawHoldings] = useState<RawHolding[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // DB sorgusu: assets bağımlılığı YOK — fiyat tick'inde yeniden çalışmaz
  const fetchHoldings = useCallback(async () => {
    if (!user?.id) { setRawHoldings([]); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('portfolio_holdings')
        .select('id, asset_id, symbol, name, quantity, avg_cost')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setRawHoldings(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Portföy yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // assets YOKTUR — sadece user değişince yeniden çek

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  // Live fiyat zenginleştirmesi: useMemo ile, DB sorgusu YÖKTÜR
  const holdings = useMemo<Holding[]>(() => {
    const enriched = rawHoldings.map(row => {
      const aid  = (row.asset_id ?? '').toUpperCase();
      const live = assets.find(a =>
        a.id?.toUpperCase() === aid || a.symbol?.toUpperCase() === aid
      );
      const currentPrice = live?.price ?? row.avg_cost;
      const currentValue = currentPrice * row.quantity;
      const costBasis    = row.avg_cost  * row.quantity;
      const pnl          = currentValue - costBasis;
      const pnlPct       = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      return {
        id:            row.id,
        asset_id:      row.asset_id,
        symbol:        live?.symbol ?? row.symbol ?? row.asset_id,
        name:          live?.name   ?? row.name   ?? row.asset_id,
        quantity:      row.quantity,
        avg_cost:      row.avg_cost,
        logo_color:    live?.logo_color  ?? '#9AA0AF',
        logo_letter:   live?.logo_letter ?? (row.asset_id?.charAt(0) ?? '?'),
        current_price: currentPrice,
        current_value: currentValue,
        cost_basis:    costBasis,
        pnl,
        pnl_pct:       pnlPct,
        allocation:    0,
      };
    });
    const totalVal = enriched.reduce((s, h) => s + h.current_value, 0);
    enriched.forEach(h => {
      h.allocation = totalVal > 0 ? (h.current_value / totalVal) * 100 : 0;
    });
    return enriched;
  }, [rawHoldings, assets]); // assets değişince sadece useMemo yeniden çalışır, DB sorgusu olmaz

  const addHolding = useCallback(async (
    assetId: string,
    quantity: number,
    avgCost: number,
  ): Promise<boolean> => {
    if (!user?.id) return false;
    if (quantity <= 0 || avgCost < 0) return false; // input validation
    try {
      const found = assets.find((a: any) =>
        a.id?.toUpperCase() === assetId.toUpperCase() || a.symbol?.toUpperCase() === assetId.toUpperCase()
      );
      // Upsert: aynı varlık iki kez eklenmesini önler
      const { error: err } = await supabase
        .from('portfolio_holdings')
        .upsert({
          user_id:  user.id,
          asset_id: assetId.toUpperCase(),
          symbol:   found?.symbol  ?? assetId.toUpperCase(),
          name:     found?.name    ?? assetId.toUpperCase(),
          quantity,
          avg_cost: avgCost,
        }, { onConflict: 'user_id,asset_id' });
      if (err) throw err;
      await fetchHoldings();
      return true;
    } catch (e) {
      console.warn('[usePortfolio] addHolding:', e);
      return false;
    }
  }, [user?.id, assets, fetchHoldings]);

  const removeHolding = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) return false;
    setRawHoldings(prev => prev.filter(h => h.id !== id)); // optimistic
    try {
      const { error: err } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (err) { await fetchHoldings(); return false; } // rollback
      return true;
    } catch (e) {
      console.warn('[usePortfolio] removeHolding:', e);
      await fetchHoldings();
      return false;
    }
  }, [user?.id, fetchHoldings]);

  const updateHolding = useCallback(async (
    id: string,
    quantity: number,
    avgCost: number,
  ): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const { error: err } = await supabase
        .from('portfolio_holdings')
        .update({ quantity, avg_cost: avgCost })
        .eq('id', id)
        .eq('user_id', user.id);
      if (err) throw err;
      await fetchHoldings();
      return true;
    } catch (e) {
      console.warn('[usePortfolio] updateHolding:', e);
      return false;
    }
  }, [user?.id, fetchHoldings]);

  // Toplamlar useMemo ile — her render'da yeniden hesaplanmaz
  const { totalValue, totalCost, totalPnL, totalPnLPct } = useMemo(() => {
    const tv = holdings.reduce((s, h) => s + h.current_value, 0);
    const tc = holdings.reduce((s, h) => s + h.cost_basis,    0);
    const tp = tv - tc;
    return { totalValue: tv, totalCost: tc, totalPnL: tp, totalPnLPct: tc > 0 ? (tp / tc) * 100 : 0 };
  }, [holdings]);

  return {
    holdings, loading, error,
    totalValue, totalCost, totalPnL, totalPnLPct,
    addHolding, removeHolding, updateHolding, refetch: fetchHoldings,
  };
}
