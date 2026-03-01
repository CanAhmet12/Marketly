import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface MCTransaction {
  id:         string;
  amount:     number;
  type:       'earn' | 'spend' | 'purchase';
  reason:     string;
  created_at: string;
}

export function useMarketCoin() {
  const { user } = useAuth();
  const [balance,      setBalance]      = useState(0);
  const [transactions, setTransactions] = useState<MCTransaction[]>([]);
  const [loading,      setLoading]      = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!user?.id) { setBalance(0); return; }
    setLoading(true);
    try {
      // Cüzdan
      const { data: wallet } = await supabase
        .from('marketcoin_wallet')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (wallet) {
        setBalance(wallet.balance);
      } else {
        // İlk giriş: cüzdan yok → oluştur
        await supabase.from('marketcoin_wallet').upsert({
          user_id: user.id,
          balance: 0,
        });
        setBalance(0);
      }

      // Son işlemler
      const { data: txns } = await supabase
        .from('marketcoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions(txns ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  /** MC kazan */
  const earn = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!user?.id || amount <= 0) return false;
    try {
      const newBalance = balance + amount;
      await supabase.from('marketcoin_wallet')
        .upsert({ user_id: user.id, balance: newBalance });
      await supabase.from('marketcoin_transactions').insert({
        user_id: user.id, amount, type: 'earn', reason,
      });
      setBalance(newBalance);
      setTransactions(prev => [{
        id:         Date.now().toString(),
        amount, type: 'earn', reason,
        created_at: new Date().toISOString(),
      }, ...prev]);
      return true;
    } catch { return false; }
  }, [user?.id, balance]);

  /** MC harca */
  const spend = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!user?.id || amount > balance) return false;
    try {
      const newBalance = balance - amount;
      await supabase.from('marketcoin_wallet')
        .upsert({ user_id: user.id, balance: newBalance });
      await supabase.from('marketcoin_transactions').insert({
        user_id: user.id, amount: -amount, type: 'spend', reason,
      });
      setBalance(newBalance);
      return true;
    } catch { return false; }
  }, [user?.id, balance]);

  return { balance, transactions, loading, earn, spend, refetch: fetchWallet };
}
