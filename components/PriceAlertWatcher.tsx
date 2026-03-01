/**
 * Arka planda fiyat alarmlarını kontrol eden görünmez bileşen.
 * App.tsx içine render edilir, UI olmadan sadece logic çalışır.
 */
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { supabase } from '../lib/supabase';
import { sendLocalNotification } from '../services/notificationService';

const CHECK_INTERVAL_MS = 60_000; // 60 saniyede bir kontrol

export function PriceAlertWatcher() {
  const { user } = useAuth();
  const { assets } = useMarketPrices();
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!user?.id || assets.length === 0) return;

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
    lastCheckRef.current = now;

    const run = async () => {
      try {
        // Kullanıcının aktif alarmlarını çek
        const { data: alerts, error } = await supabase
          .from('price_alerts')
          .select('id, asset_id, symbol, condition, target_price, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .is('triggered_at', null);

        if (error || !alerts || alerts.length === 0) return;

        // Canlı fiyat map'i: symbol/id → fiyat
        const livePrices: Record<string, number> = {};
        for (const a of assets) {
          livePrices[a.symbol.toLowerCase()] = a.price;
          livePrices[a.id.toLowerCase()]     = a.price;
        }

        const triggered: string[] = [];

        for (const alert of alerts) {
          const key   = (alert.symbol ?? alert.asset_id ?? '').toLowerCase();
          const price = livePrices[key];
          if (!price) continue;

          const target = alert.target_price;
          const hit    =
            alert.condition === 'above' ? price >= target :
            alert.condition === 'below' ? price <= target :
            false;

          if (hit) {
            triggered.push(alert.id);
            const sym     = (alert.symbol ?? alert.asset_id ?? '').toUpperCase();
            const dir     = alert.condition === 'above' ? 'üzerine çıktı' : 'altına düştü';
            const fmtTarget = target >= 1000
              ? `$${target.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : `$${target.toFixed(target < 1 ? 4 : 2)}`;

            await sendLocalNotification({
              title: `🔔 ${sym} Fiyat Alarmı`,
              body:  `${sym} ${fmtTarget} seviyesinin ${dir}! Şu an: $${price.toFixed(price < 1 ? 4 : 2)}`,
              data:  { type: 'price_alert', asset_id: alert.asset_id, alertId: alert.id },
            });
          }
        }

        // Tetiklenen alarmları Supabase'de işaretle
        if (triggered.length > 0) {
          await supabase
            .from('price_alerts')
            .update({ is_active: false, triggered_at: new Date().toISOString() })
            .in('id', triggered);

          // Bildirim tablosuna da yaz
          await supabase.from('notifications').insert(
            triggered.map((id) => {
              const alert = alerts.find((a) => a.id === id)!;
              const sym   = (alert.symbol ?? alert.asset_id ?? '').toUpperCase();
              return {
                user_id: user.id,
                type:    'price_alert',
                title:   `${sym} Fiyat Alarmı`,
                body:    `${sym} hedef fiyata ulaştı.`,
                meta:    { alertId: id, asset_id: alert.asset_id },
              };
            })
          );
        }
      } catch {
        // Sessizce geç — arka plan işlemi
      }
    };

    run();
  }, [assets, user?.id]);

  return null;
}
