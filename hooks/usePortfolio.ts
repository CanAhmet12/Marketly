import { useState, useEffect, useCallback } from 'react';
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

export function usePortfolio() {
  const { user } = useAuth();
  const { assets } = useMarketPrices();
  const [holdings,  setHoldings]  = useState<Holding[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchHoldings = useCallback(async () => {
    if (!user?.id) { setHoldings([]); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Enrich with live prices
      const enriched: Holding[] = (data ?? []).map(row => {
        const aid = (row.asset_id ?? '').toUpperCase();
        const live = assets.find(a =>
          a.id?.toUpperCase() === aid ||
          a.symbol?.toUpperCase() === aid
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

      // Compute allocation %
      const totalValue = enriched.reduce((s, h) => s + h.current_value, 0);
      enriched.forEach(h => {
        h.allocation = totalValue > 0 ? (h.current_value / totalValue) * 100 : 0;
      });

      setHoldings(enriched);
    } catch (e: any) {
      setError(e?.message ?? 'Portföy yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [user?.id, assets]);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  const addHolding = useCallback(async (
    assetId: string,
    quantity: number,
    avgCost: number,
  ): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const found = (assets as any[]).find((a: any) =>
        a.id === assetId.toUpperCase() || a.symbol === assetId.toUpperCase()
      );
      const { error: err } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id:  user.id,
          asset_id: assetId.toUpperCase(),
          symbol:   found?.symbol  ?? assetId.toUpperCase(),
          name:     found?.name    ?? assetId.toUpperCase(),
          quantity,
          avg_cost: avgCost,
        });
      if (err) throw err;
      await fetchHoldings();
      return true;
    } catch { return false; }
  }, [user?.id, fetchHoldings]);

  const removeHolding = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const { error: err } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (err) throw err;
      setHoldings(prev => prev.filter(h => h.id !== id));
      return true;
    } catch { return false; }
  }, [user?.id]);

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
    } catch { return false; }
  }, [user?.id, fetchHoldings]);

  // Assets değişince holdings'i yeniden hesapla (live fiyat güncellemesi)
  useEffect(() => {
    if (holdings.length === 0 || assets.length === 0) return;
    setHoldings((prev) => {
      const totalVal = prev.reduce((s, h) => {
        const aid  = h.asset_id?.toUpperCase() ?? '';
        const live = assets.find((a) => a.id?.toUpperCase() === aid || a.symbol?.toUpperCase() === aid);
        return s + (live?.price ?? h.current_price) * h.quantity;
      }, 0);
      return prev.map((h) => {
        const aid          = h.asset_id?.toUpperCase() ?? '';
        const live         = assets.find((a) => a.id?.toUpperCase() === aid || a.symbol?.toUpperCase() === aid);
        const currentPrice = live?.price ?? h.current_price;
        const currentValue = currentPrice * h.quantity;
        const pnl          = currentValue - h.cost_basis;
        const pnlPct       = h.cost_basis > 0 ? (pnl / h.cost_basis) * 100 : 0;
        return {
          ...h,
          current_price: currentPrice,
          current_value: currentValue,
          pnl,
          pnl_pct:    pnlPct,
          allocation: totalVal > 0 ? (currentValue / totalVal) * 100 : 0,
        };
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  const totalValue   = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalCost    = holdings.reduce((s, h) => s + h.cost_basis,    0);
  const totalPnL     = totalValue - totalCost;
  const totalPnLPct  = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return {
    holdings, loading, error,
    totalValue, totalCost, totalPnL, totalPnLPct,
    addHolding, removeHolding, updateHolding, refetch: fetchHoldings,
  };
}
