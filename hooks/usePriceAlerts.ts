import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface PriceAlert {
  id:         string;
  asset_id:   string;
  symbol:     string;
  condition:  'above' | 'below';
  target:     number;
  triggered:  boolean;
  created_at: string;
}

// Supabase satırını normalize et — eski ve yeni şema uyumlu
function normalize(row: any): PriceAlert {
  return {
    id:         row.id,
    asset_id:   row.asset_id ?? '',
    symbol:     row.symbol   ?? row.asset_id ?? '',
    // condition → direction → 'above' fallback
    condition:  (row.condition ?? row.direction ?? 'above') as 'above' | 'below',
    // target_price veya eski "target" sütunu
    target:     row.target_price ?? row.target ?? 0,
    // triggered: eski boolean VEYA yeni is_active tersinden
    triggered:  row.triggered ?? !(row.is_active ?? true),
    created_at: row.created_at,
  };
}

export function usePriceAlerts(assetId?: string) {
  const { user } = useAuth();
  const [alerts,  setAlerts]  = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user?.id) { setAlerts([]); return; }
    setLoading(true);
    try {
      let q = supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assetId) q = q.eq('asset_id', assetId.toUpperCase());

      const { data } = await q;
      setAlerts((data ?? []).map(normalize));
    } finally {
      setLoading(false);
    }
  }, [user?.id, assetId]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const addAlert = useCallback(async (
    asset: string,
    condition: 'above' | 'below',
    target: number,
  ): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      // Önce yeni şema ile dene (target_price)
      const { error } = await supabase
        .from('price_alerts')
        .insert({
          user_id:      user.id,
          asset_id:     asset.toUpperCase(),
          symbol:       asset.toUpperCase(),
          condition,
          direction:    condition,
          target_price: target,
          is_active:    true,
          triggered:    false,
        });

      if (error?.message?.includes('target_price') || error?.message?.includes('column')) {
        // Eski şema (target sütunu)
        const { error: err2 } = await supabase
          .from('price_alerts')
          .insert({
            user_id:   user.id,
            asset_id:  asset.toUpperCase(),
            symbol:    asset.toUpperCase(),
            condition,
            direction: condition,
            target,
            is_active: true,
            triggered: false,
          });
        if (err2) throw err2;
      } else if (error) {
        throw error;
      }

      await fetchAlerts();
      return true;
    } catch { return false; }
  }, [user?.id, fetchAlerts]);

  const removeAlert = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== id));
      return true;
    } catch { return false; }
  }, []);

  return { alerts, loading, addAlert, removeAlert, refetch: fetchAlerts };
}
