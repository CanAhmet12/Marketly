/**
 * LiveBroadcastScreen — Yayıncının kamerasını yayınladığı ekran.
 * Agora RTC + Supabase ile gerçek zamanlı canlı yayın.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RtcSurfaceView } from 'react-native-agora';
import { useAgoraLive } from '../hooks/useAgoraLive';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, radius, shadow } from '../constants/theme';

const GIFTS = [
  { icon: '💎', name: 'Elmas', cost: 500 },
  { icon: '🚀', name: 'Roket', cost: 200 },
  { icon: '🏆', name: 'Kupa',  cost: 100 },
  { icon: '❤️', name: 'Kalp', cost: 50 },
  { icon: '🌟', name: 'Yıldız', cost: 20 },
  { icon: '👏', name: 'Alkış', cost: 10 },
];

interface GiftEvent { id: string; icon: string; name: string; sender: string }
interface ChatMsg   { id: string; user: string; text: string; isGift?: boolean }

export function LiveBroadcastScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const toast      = useToast();
  const { user, profile } = useAuth();

  const channelName: string = route.params?.channelName ?? `live_${user?.id}_${Date.now()}`;
  const title:       string = route.params?.title ?? 'Canlı Yayın';
  const postId:      string = route.params?.postId ?? '';

  const { state, leaveChannel, toggleMute, toggleCamera, switchCamera } =
    useAgoraLive(channelName, 'broadcaster');

  const [chatMsg,    setChatMsg]    = useState('');
  const [messages,   setMessages]   = useState<ChatMsg[]>([]);
  const [giftEvents, setGiftEvents] = useState<GiftEvent[]>([]);
  const [duration,   setDuration]   = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Yayın süresi sayacı
  useEffect(() => {
    if (!state.joined) return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [state.joined]);

  // Supabase realtime — gelen mesaj/hediyeler
  useEffect(() => {
    if (!postId) return;
    const sub = supabase
      .channel(`live_chat_${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_messages', filter: `post_id=eq.${postId}` },
        (payload) => {
          const msg = payload.new as any;
          setMessages(prev => [...prev, {
            id:     msg.id,
            user:   msg.username ?? 'İzleyici',
            text:   msg.content,
            isGift: msg.is_gift,
          }]);
          if (msg.is_gift) {
            setGiftEvents(prev => [...prev, {
              id:     msg.id,
              icon:   msg.gift_icon ?? '🎁',
              name:   msg.gift_name ?? 'Hediye',
              sender: msg.username ?? 'İzleyici',
            }]);
            setTimeout(() => {
              setGiftEvents(prev => prev.filter(g => g.id !== msg.id));
            }, 3000);
          }
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [postId]);

  const fmtDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const sendMessage = async () => {
    if (!chatMsg.trim() || !postId) return;
    try {
      await supabase.from('live_messages').insert({
        post_id:  postId,
        user_id:  user?.id,
        username: profile?.username ?? 'Yayıncı',
        content:  chatMsg.trim(),
        is_gift:  false,
      });
    } catch { /* ignore */ }
    setChatMsg('');
  };

  const endStream = async () => {
    Alert.alert('Yayını Sonlandır', 'Yayını bitirmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sonlandır',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('live_sessions')
              .update({ is_active: false, ended_at: new Date().toISOString() })
              .eq('channel_name', channelName);
          } catch { /* ignore */ }
          await leaveChannel();
          navigation.goBack();
          toast.success('Yayın sonlandırıldı');
        },
      },
    ]);
  };

  if (state.error) {
    return (
      <View style={[s.root, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="warning-outline" size={48} color={colors.fall} />
        <Text style={s.errTitle}>Bağlantı Hatası</Text>
        <Text style={s.errMsg}>{state.error}</Text>
        <Pressable style={s.errBtn} onPress={() => navigation.goBack()}>
          <Text style={s.errBtnTxt}>Geri Dön</Text>
        </Pressable>
        {state.error.includes('App ID') && (
          <Text style={s.errHint}>
            console.agora.io adresinden ücretsiz App ID al,{'\n'}
            .env dosyasına EXPO_PUBLIC_AGORA_APP_ID=xxx ekle.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Kamera önizleme (tam ekran) ── */}
      <View style={s.camera}>
        {state.joined ? (
          <RtcSurfaceView
            canvas={{ uid: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={s.connecting}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={s.connectingTxt}>Yayına Bağlanılıyor…</Text>
          </View>
        )}

        {/* Karartma gradient */}
        <View style={s.topGrad} />
        <View style={s.bottomGrad} />

        {/* ── Üst bilgi çubuğu ── */}
        <View style={[s.topBar, { paddingTop: 8 }]}>
          <View style={s.liveRow}>
            <View style={s.livePill}>
              <View style={s.liveDot} />
              <Text style={s.liveTxt}>CANLI</Text>
            </View>
            <View style={s.durationPill}>
              <Text style={s.durationTxt}>{fmtDuration(duration)}</Text>
            </View>
            <View style={s.viewerPill}>
              <Ionicons name="eye" size={11} color="#FFF" />
              <Text style={s.viewerTxt}>{state.viewers}</Text>
            </View>
          </View>

          <Text style={s.titleTxt} numberOfLines={1}>{title}</Text>

          <Pressable style={s.endBtn} onPress={endStream}>
            <Text style={s.endTxt}>Bitir</Text>
          </Pressable>
        </View>

        {/* ── Hediye animasyonları ── */}
        <View style={s.giftAnims} pointerEvents="none">
          {giftEvents.map(g => (
            <View key={g.id} style={s.giftAnim}>
              <Text style={s.giftAnimIcon}>{g.icon}</Text>
              <Text style={s.giftAnimTxt}>{g.sender} {g.name} gönderdi!</Text>
            </View>
          ))}
        </View>

        {/* ── Kontrol butonları (sağ) ── */}
        <View style={s.controls}>
          <Pressable style={s.ctrlBtn} onPress={toggleMute}>
            <Ionicons name={state.muted ? 'mic-off' : 'mic'} size={22} color="#FFF" />
          </Pressable>
          <Pressable style={s.ctrlBtn} onPress={toggleCamera}>
            <Ionicons name={state.cameraOff ? 'videocam-off' : 'videocam'} size={22} color="#FFF" />
          </Pressable>
          <Pressable style={s.ctrlBtn} onPress={switchCamera}>
            <Ionicons name="camera-reverse" size={22} color="#FFF" />
          </Pressable>
        </View>

        {/* ── Chat mesajları ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          style={s.chatWrap}
        >
          <ScrollView
            ref={scrollRef}
            style={s.chatList}
            contentContainerStyle={{ gap: 4, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.slice(-30).map(m => (
              <View key={m.id} style={[s.chatRow, m.isGift && s.chatRowGift]}>
                <Text style={s.chatUser}>{m.user}</Text>
                <Text style={s.chatText}> {m.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={[s.chatInput, { marginBottom: insets.bottom + 8 }]}>
            <TextInput
              style={s.chatField}
              placeholder="Mesaj yaz…"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={chatMsg}
              onChangeText={setChatMsg}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable style={s.chatSend} onPress={sendMessage}>
              <Ionicons name="send" size={18} color="#FFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  connecting: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#111' },
  connectingTxt: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  topGrad:    { position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(0,0,0,0.55)' },
  bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(0,0,0,0.50)' },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14, gap: 6 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FF3B3B', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  liveTxt:  { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  durationPill: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  durationTxt:  { color: '#FFF', fontSize: 12, fontWeight: '700' },
  viewerPill:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  viewerTxt:    { color: '#FFF', fontSize: 12, fontWeight: '700' },
  titleTxt:     { color: '#FFF', fontSize: 15, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  endBtn:       { position: 'absolute', top: 8, right: 14, backgroundColor: '#FF3B3B', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  endTxt:       { color: '#FFF', fontSize: 13, fontWeight: '800' },

  giftAnims: { position: 'absolute', left: 14, bottom: 180, gap: 8 },
  giftAnim:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  giftAnimIcon: { fontSize: 20 },
  giftAnimTxt:  { color: '#FFD700', fontSize: 13, fontWeight: '700' },

  controls: { position: 'absolute', right: 14, bottom: 200, gap: 14 },
  ctrlBtn:  { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  chatWrap: { position: 'absolute', bottom: 0, left: 0, right: 80 },
  chatList: { maxHeight: 200, paddingHorizontal: 12 },
  chatRow:  { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 2 },
  chatRowGift: { backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 8, paddingHorizontal: 6 },
  chatUser: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  chatText: { color: '#FFF', fontSize: 12 },
  chatInput: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  chatField: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  chatSend:  { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  errTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 16 },
  errMsg:   { fontSize: 14, color: '#AAAAAA', textAlign: 'center', marginTop: 8, paddingHorizontal: 24 },
  errBtn:   { marginTop: 24, backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 28, paddingVertical: 12 },
  errBtnTxt:{ color: '#FFF', fontSize: 15, fontWeight: '700' },
  errHint:  { marginTop: 16, fontSize: 12, color: '#888', textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});
