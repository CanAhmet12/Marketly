/**
 * Uygulama içi bildirim oluşturma yardımcısı.
 * Hata olursa sessizce devam eder (bildirim ikincil bir özellik).
 */
import { supabase } from './supabase';
import { sendLocalNotification } from '../services/notificationService';

export async function createNotification(params: {
  recipientId: string;   // bildirimi alacak kullanıcı
  senderId:    string;   // gönderen kullanıcı
  type:        'like' | 'comment' | 'follow' | 'signal' | 'price_alert' | 'system';
  title:       string;
  body:        string;
  relatedId?:  string;   // post/video/sinyal id
  imageUrl?:   string;
}) {
  if (params.recipientId === params.senderId) return; // kendi kendine bildirim gönderme

  try {
    await supabase.from('notifications').insert({
      user_id:    params.recipientId,
      sender_id:  params.senderId,
      type:       params.type,
      title:      params.title,
      body:       params.body,
      related_id: params.relatedId ?? null,
      image_url:  params.imageUrl  ?? null,
      is_read:    false,
    });

    // Cihaz bildirimi gönder (uygulama arka plandayken görünür)
    await sendLocalNotification({
      title:   params.title,
      body:    params.body,
      data:    { type: params.type, relatedId: params.relatedId },
      channel: params.type === 'price_alert' ? 'price_alerts' : 'default',
    });
  } catch (e) {
    console.warn('[notifications] createNotification hatası:', e);
  }
}
