import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Bildirim görüntüleme ayarı — uygulama ön plandayken de göster
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ─── Push Token Al ────────────────────────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Emülatörde push token alınamaz, local notification çalışır
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:       'Genel Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00C853',
    });
    await Notifications.setNotificationChannelAsync('price_alerts', {
      name:       'Fiyat Alarmları',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: '#FF9500',
    });
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) return null;

    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData;
  } catch {
    return null;
  }
}

// ─── Token'ı Supabase'e Kaydet ────────────────────────────────────────────────
export async function savePushToken(userId: string, token: string) {
  try {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
  } catch {}
}

// ─── Yerel Bildirim Gönder ────────────────────────────────────────────────────
export async function sendLocalNotification(opts: {
  title:    string;
  body:     string;
  data?:    Record<string, unknown>;
  channel?: string;
  delay?:   number; // saniye
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title:   opts.title,
      body:    opts.body,
      data:    opts.data ?? {},
      sound:   true,
    },
    trigger: opts.delay
      ? { seconds: opts.delay, channelId: opts.channel ?? 'default' }
      : null,
  });
}

// ─── Fiyat Alarmı Kontrol Et ─────────────────────────────────────────────────
// Çağrı: useMarketPrices her güncellendiğinde bu fonksiyon tetiklenir
export async function checkPriceAlerts(
  alerts: { id: string; asset_id: string; condition: 'above' | 'below'; target: number }[],
  livePrices: Record<string, number>
) {
  for (const alert of alerts) {
    const currentPrice = livePrices[alert.asset_id.toLowerCase()];
    if (currentPrice === undefined) continue;

    const triggered =
      (alert.condition === 'above' && currentPrice >= alert.target) ||
      (alert.condition === 'below' && currentPrice <= alert.target);

    if (triggered) {
      const symbol  = alert.asset_id.toUpperCase();
      const condTxt = alert.condition === 'above' ? 'üzerine çıktı' : 'altına düştü';
      const price   = currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      await sendLocalNotification({
        title:   `🔔 Fiyat Alarmı: ${symbol}`,
        body:    `${symbol} ₺${price} seviyesi ${condTxt}! Hedef: ₺${alert.target.toLocaleString('tr-TR')}`,
        data:    { asset_id: alert.asset_id, type: 'price_alert' },
        channel: 'price_alerts',
      });

      // Tetiklenen alarmı Supabase'den sil (tekrar tetiklenmesin)
      await supabase.from('price_alerts').delete().eq('id', alert.id);
    }
  }
}

// ─── Sosyal Bildirim Gönder ───────────────────────────────────────────────────
export async function notifyFollower(opts: {
  type:       'new_follower' | 'post_like' | 'new_signal';
  actorName:  string;
  extra?:     string;
}) {
  const messages: Record<string, { title: string; body: string }> = {
    new_follower: {
      title: '👤 Yeni Takipçi',
      body:  `${opts.actorName} seni takip etmeye başladı!`,
    },
    post_like: {
      title: '❤️ Beğeni',
      body:  `${opts.actorName} gönderini beğendi`,
    },
    new_signal: {
      title: '⚡ Yeni Sinyal',
      body:  `${opts.actorName} yeni bir sinyal paylaştı${opts.extra ? `: ${opts.extra}` : ''}`,
    },
  };

  const msg = messages[opts.type];
  if (!msg) return;

  await sendLocalNotification({
    title:   msg.title,
    body:    msg.body,
    channel: 'default',
  });
}
