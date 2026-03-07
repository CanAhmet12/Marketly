/**
 * Supabase Edge Function: check-price-alerts
 * ─────────────────────────────────────────────────────────────────────────────
 * Bu fonksiyon periyodik olarak (Supabase Cron ile her 5 dakikada) çalışır,
 * aktif fiyat alarmlarını kontrol eder ve tetiklenenlere push bildirimi gönderir.
 *
 * Supabase Dashboard → Cron Jobs → New Job:
 *   Schedule: */5 * * * *
 *   Function: check-price-alerts
 *   HTTP Method: POST
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COINGECKO_IDS: Record<string, string> = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', bnb: 'binancecoin',
  xrp: 'ripple', ada: 'cardano', doge: 'dogecoin', avax: 'avalanche-2',
  dot: 'polkadot', link: 'chainlink', uni: 'uniswap', ltc: 'litecoin',
  atom: 'cosmos', matic: 'matic-network', near: 'near', shib: 'shiba-inu',
};

async function fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
  const priceMap: Record<string, number> = {};

  // CoinGecko'dan kripto fiyatları çek
  const cryptoSyms = symbols.filter(s => COINGECKO_IDS[s.toLowerCase()]);
  if (cryptoSyms.length > 0) {
    const ids = cryptoSyms.map(s => COINGECKO_IDS[s.toLowerCase()]).join(',');
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        for (const sym of cryptoSyms) {
          const cgId = COINGECKO_IDS[sym.toLowerCase()];
          if (data[cgId]?.usd) priceMap[sym.toLowerCase()] = data[cgId].usd;
        }
      }
    } catch { /* CoinGecko başarısız — Supabase'den çek */ }
  }

  return priceMap;
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase       = createClient(supabaseUrl, supabaseKey);

    // Aktif tetiklenmemiş alarmları çek
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('id, user_id, asset_id, symbol, condition, target_price, target')
      .or('is_active.eq.true,is_active.is.null')
      .or('triggered.eq.false,triggered.is.null')
      .limit(500);

    if (error || !alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ checked: 0, triggered: 0 }), { status: 200 });
    }

    // Benzersiz semboller topla
    const symbols = [...new Set(alerts.map((a: any) => (a.symbol ?? a.asset_id ?? '').toLowerCase()))];

    // Supabase'den canlı fiyatları çek
    const { data: livePriceRows } = await supabase
      .from('asset_prices')
      .select('asset_id, price')
      .in('asset_id', symbols.map(s => s.toUpperCase()));

    const livePrices: Record<string, number> = {};
    for (const row of livePriceRows ?? []) {
      livePrices[row.asset_id.toLowerCase()] = row.price;
    }

    // Eksik semboller için CoinGecko dene
    const missing = symbols.filter(s => !livePrices[s]);
    if (missing.length > 0) {
      const cgPrices = await fetchLivePrices(missing);
      Object.assign(livePrices, cgPrices);
    }

    // Tetiklenen alarmları bul
    const triggeredIds: string[] = [];
    const notifications: any[]   = [];

    for (const alert of alerts as any[]) {
      const sym    = (alert.symbol ?? alert.asset_id ?? '').toLowerCase();
      const price  = livePrices[sym];
      if (!price) continue;

      const target  = alert.target_price ?? alert.target ?? 0;
      if (!target) continue;

      const hit =
        alert.condition === 'above' ? price >= target :
        alert.condition === 'below' ? price <= target :
        false;

      if (!hit) continue;

      triggeredIds.push(alert.id);

      const symUpper  = sym.toUpperCase();
      const fmtTarget = target >= 1000
        ? `$${Number(target).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        : `$${Number(target).toFixed(target < 1 ? 4 : 2)}`;
      const fmtPrice  = `$${Number(price).toFixed(price < 1 ? 4 : 2)}`;
      const dir       = alert.condition === 'above' ? 'üzerine çıktı' : 'altına düştü';

      notifications.push({
        user_id: alert.user_id,
        type:    'price_alert',
        title:   `🔔 ${symUpper} Fiyat Alarmı`,
        body:    `${symUpper} ${fmtTarget} seviyesinin ${dir}! Şu an: ${fmtPrice}`,
        meta:    { alertId: alert.id, asset_id: alert.asset_id, price, target },
        read:    false,
      });
    }

    if (triggeredIds.length > 0) {
      // Alarmları tetiklenmiş olarak işaretle
      await supabase
        .from('price_alerts')
        .update({ is_active: false, triggered: true, triggered_at: new Date().toISOString() })
        .in('id', triggeredIds);

      // Bildirim tablosuna yaz
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      // Push token'larını çek ve FCM/APNs bildirimi gönder
      const userIds = [...new Set(notifications.map((n: any) => n.user_id))];
      const { data: tokenRows } = await supabase
        .from('push_tokens')
        .select('user_id, token')
        .in('user_id', userIds);

      const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
      const pushMessages = [];

      for (const notif of notifications) {
        const tokens = (tokenRows ?? []).filter((t: any) => t.user_id === notif.user_id);
        for (const t of tokens) {
          pushMessages.push({
            to:    t.token,
            title: notif.title,
            body:  notif.body,
            data:  notif.meta,
            sound: 'default',
            priority: 'high',
          });
        }
      }

      if (pushMessages.length > 0) {
        // Expo Push API (50'şer chunk)
        for (let i = 0; i < pushMessages.length; i += 50) {
          const chunk = pushMessages.slice(i, i + 50);
          await fetch(expoPushUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify(chunk),
          }).catch(() => {});
        }
      }
    }

    return new Response(
      JSON.stringify({ checked: alerts.length, triggered: triggeredIds.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
