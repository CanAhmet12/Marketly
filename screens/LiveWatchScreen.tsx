/**
 * LiveWatchScreen — İzleyici ekranı.
 * Yayıncının kamera akışını gerçek zamanlı izler, chat gönderir, hediye verir.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal,
  Animated, Image as RNImage,
} from 'react-native';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RtcSurfaceView, useAgoraLive } from '../hooks/useAgoraLive';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, radius, font } from '../constants/theme';

const GIFTS = [
  { id: 'g1', icon: '💎', name: 'Elmas',  color: '#00BFFF', cost: 500 },
  { id: 'g2', icon: '🚀', name: 'Roket',  color: '#FF6B35', cost: 200 },
  { id: 'g3', icon: '🏆', name: 'Kupa',   color: '#FFB800', cost: 100 },
  { id: 'g4', icon: '❤️', name: 'Kalp',   color: '#FF3B6F', cost:  50 },
  { id: 'g5', icon: '🌟', name: 'Yıldız', color: '#FFD700', cost:  20 },
  { id: 'g6', icon: '👏', name: 'Alkış',  color: '#00C853', cost:  10 },
];

interface ChatMsg { id: string; user: string; text: string; avatar?: string; isGift?: boolean; isMine?: boolean }

/** Yeni mesaj gelince hafif titreme animasyonu yapan satır */
function ChatBubble({ m }: { m: ChatMsg }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.chatRow, m.isGift && s.chatRowGift, m.isMine && s.chatRowMine, { opacity: fadeAnim }]}>
      {m.avatar ? (
        <RNImage source={{ uri: m.avatar }} style={s.chatAvatar} />
      ) : (
        <View style={[s.chatAvatarPlaceholder, m.isMine && { backgroundColor: colors.primary + '80' }]}>
          <Text style={{ fontSize: 9, color: '#FFF', fontFamily: font.bold }}>{m.user?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}
      <View style={s.chatBubble}>
        <Text style={[s.chatUser, m.isGift && s.chatUserGift, m.isMine && s.chatUserMine]}>{m.user}</Text>
        <Text style={[s.chatText, m.isGift && s.chatTextGift]}> {m.text}</Text>
      </View>
    </Animated.View>
  );
}

export function LiveWatchScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const toast      = useToast();
  const { user, profile } = useAuth();
  const channelName: string = route.params?.channelName ?? '';
  const postId:      string = route.params?.postId ?? '';
  const streamTitle: string = route.params?.title ?? 'Canlı Yayın';
  const hostName:    string = route.params?.hostName ?? 'Yayıncı';
  const hostAvatar:  string = route.params?.hostAvatar ?? '';

  const { state, leaveChannel } = useAgoraLive(channelName, 'audience');

  const [chatMsg,      setChatMsg]     = useState('');
  const [messages,     setMessages]    = useState<ChatMsg[]>([]);
  const [showGifts,    setShowGifts]   = useState(false);
  const [giftAnims,    setGiftAnims]   = useState<{ id: string; icon: string; name: string; sender: string }[]>([]);
  const [viewers,      setViewers]     = useState(route.params?.viewers ?? 0);
  const [mcBalance,    setMcBalance]   = useState<number>(0);
  const [sendingGift,  setSendingGift] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // MarketCoin cüzdan bakiyesini yükle
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('marketcoin_wallet').select('balance').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setMcBalance(data?.balance ?? 0); });
  }, [user?.id]);

  // Realtime chat subscription
  useEffect(() => {
    if (!postId) return;

    // Geçmiş mesajları yükle
    supabase.from('live_messages')
      .select('id, username, content, is_gift, gift_icon, gift_name, created_at, avatar_url, user_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data.map(m => ({
          id: m.id, user: m.username ?? 'İzleyici',
          text: m.is_gift ? `${m.gift_icon} ${m.gift_name} gönderdi!` : m.content,
          isGift: m.is_gift,
          avatar: m.avatar_url ?? undefined,
          isMine: m.user_id === user?.id,
        })));
      });

    const sub = supabase
      .channel(`watch_chat_${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_messages', filter: `post_id=eq.${postId}` },
        (payload) => {
          const msg = payload.new as any;
          const isGift = msg.is_gift;
          setMessages(prev => [...prev, {
            id:     msg.id,
            user:   msg.username ?? 'İzleyici',
            text:   isGift ? `${msg.gift_icon} ${msg.gift_name} gönderdi!` : msg.content,
            isGift,
            avatar: msg.avatar_url ?? undefined,
            isMine: msg.user_id === user?.id,
          }]);
          if (isGift) {
            const anim = { id: msg.id, icon: msg.gift_icon ?? '🎁', name: msg.gift_name ?? 'Hediye', sender: msg.username ?? 'İzleyici' };
            setGiftAnims(prev => [...prev, anim]);
            setTimeout(() => setGiftAnims(prev => prev.filter(g => g.id !== anim.id)), 3000);
          }
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe();

    // Viewer sayısını takip et (live_sessions tablosundan)
    const viewerSub = supabase
      .channel(`viewers_${postId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `post_id=eq.${postId}` },
        (payload) => { setViewers((payload.new as any).viewer_count ?? 0); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
      supabase.removeChannel(viewerSub);
    };
  }, [postId]);

  // Yayın bitiş durumunu Supabase'den dinle
  useEffect(() => {
    if (!postId) return;
    const ended = supabase
      .channel(`session_end_${postId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'live_sessions', filter: `post_id=eq.${postId}`,
      }, (payload) => {
        if ((payload.new as any)?.is_active === false) {
          toast.info('Yayın sona erdi');
          leaveChannel().finally(() => navigation.goBack());
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ended); };
  }, [postId, leaveChannel, navigation, toast]);

  // Giriş: viewer_count artır (atomic RPC)
  useEffect(() => {
    if (!postId) return;
    supabase.rpc('increment_viewers', { session_post_id: postId }).then(() => {});
    return () => {
      // Çıkış: viewer_count azalt (atomic RPC)
      supabase.rpc('decrement_viewers', { session_post_id: postId }).then(() => {});
    };
  }, [postId]);

  const handleLeave = useCallback(async () => {
    await leaveChannel();
    navigation.goBack();
  }, [leaveChannel, navigation]);

  const sendMessage = async () => {
    if (!chatMsg.trim()) return;
    const text = chatMsg.trim();
    setChatMsg('');
    try {
      await supabase.from('live_messages').insert({
        post_id:    postId,
        user_id:    user?.id,
        username:   profile?.username ?? 'İzleyici',
        content:    text,
        is_gift:    false,
        avatar_url: profile?.avatar_url ?? null,
      });
    } catch { /* ignore */ }
  };

  const sendGift = async (gift: typeof GIFTS[0]) => {
    if (!user) { toast.info('Giriş yapman gerekiyor'); return; }
    if (mcBalance < gift.cost) {
      toast.error(`Yetersiz bakiye! ${gift.cost} MC gerekiyor, bakiyen: ${mcBalance} MC`);
      return;
    }
    setSendingGift(true);
    try {
      const newBalance = mcBalance - gift.cost;

      // 1. Bakiyeyi düş (optimistic)
      setMcBalance(newBalance);

      // 2. DB'de cüzdan güncelle
      const { error: walletErr } = await supabase
        .from('marketcoin_wallet')
        .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

      if (walletErr) {
        // Rollback optimistic
        setMcBalance(mcBalance);
        toast.error('Hediye gönderilemedi');
        return;
      }

      // 3. İşlem kaydı
      await supabase.from('marketcoin_transactions').insert({
        user_id: user.id,
        amount:  -gift.cost,
        type:    'spend',
        reason:  `Hediye: ${gift.name} (Yayın: ${streamTitle})`,
      });

      // 4. Live chat'e yaz
      if (postId) {
        await supabase.from('live_messages').insert({
          post_id:   postId,
          user_id:   user.id,
          username:  profile?.username ?? profile?.full_name ?? 'İzleyici',
          content:   `${gift.icon} ${gift.name} gönderdi!`,
          is_gift:   true,
          gift_icon: gift.icon,
          gift_name: gift.name,
        });
      }

      toast.success(`${gift.icon} "${gift.name}" gönderildi! (-${gift.cost} MC)`);
      setShowGifts(false);
    } catch {
      toast.error('Bir hata oluştu');
      setMcBalance(mcBalance); // rollback
    } finally {
      setSendingGift(false);
    }
  };

  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Video akışı (tam ekran) ── */}
      <View style={s.video}>
        {state.joined && state.remoteUids.length > 0 ? (
          <RtcSurfaceView
            canvas={{ uid: state.remoteUids[0] }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={s.waiting}>
            {hostAvatar ? (
              <Image source={{ uri: hostAvatar }} style={s.hostAvatar} />
            ) : (
              <Ionicons name={state.error ? 'wifi-outline' : 'radio'} size={56} color="rgba(255,255,255,0.4)" />
            )}
            {!state.error && <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 16 }} />}
            <Text style={s.waitingTxt}>
              {state.error ? 'Bağlantı kurulamadı' : `${hostName} yayına bağlanıyor…`}
            </Text>
            {state.error && (
              <Pressable style={s.retryBtn} onPress={() => navigation.goBack()}>
                <Text style={s.retryTxt}>Geri Dön</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={s.topGrad} />
        <View style={s.bottomGrad} />

        {/* ── Üst çubuk ── */}
        <View style={[s.topBar, { paddingTop: 8 }]}>
          <View style={s.topLeft}>
            <View style={s.livePill}>
              <View style={s.liveDot} />
              <Text style={s.liveTxt}>CANLI</Text>
            </View>
            <View style={s.viewerPill}>
              <Ionicons name="eye" size={10} color="#FFF" />
              <Text style={s.viewerTxt}>{viewers > 0 ? viewers : state.remoteUids.length + 1}</Text>
            </View>
          </View>

          {hostAvatar ? (
            <View style={s.hostRow}>
              <Image source={{ uri: hostAvatar }} style={s.hostAvatarSmall} />
              <Text style={s.hostNameTxt} numberOfLines={1}>{hostName}</Text>
            </View>
          ) : (
            <Text style={s.hostNameTxt}>{hostName}</Text>
          )}

          <Pressable style={s.closeBtn} onPress={handleLeave}>
            <Ionicons name="close" size={22} color="#FFF" />
          </Pressable>
        </View>

        {/* ── Hediye animasyonları ── */}
        <View style={s.giftAnims} pointerEvents="none">
          {giftAnims.map(g => (
            <View key={g.id} style={s.giftAnim}>
              <Text style={s.giftIcon}>{g.icon}</Text>
              <Text style={s.giftTxt}>{g.sender} {g.name} gönderdi!</Text>
            </View>
          ))}
        </View>

        {/* ── Chat + kontroller ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          style={s.chatWrap}
        >
          <ScrollView
            ref={scrollRef}
            style={[s.chatList, chatExpanded && s.chatListExpanded]}
            contentContainerStyle={{ gap: 4, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.slice(-60).map(m => (
              <ChatBubble key={m.id} m={m} />
            ))}
          </ScrollView>

          <View style={[s.chatInputRow, { paddingBottom: insets.bottom + 8 }]}>
            <Pressable style={s.expandBtn} onPress={() => setChatExpanded(e => !e)} hitSlop={6}>
              <Ionicons name={chatExpanded ? 'chevron-down' : 'chevron-up'} size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
            <Pressable style={s.giftBtn} onPress={() => setShowGifts(true)}>
              <Text style={s.giftBtnIcon}>🎁</Text>
            </Pressable>
            <TextInput
              style={s.chatField}
              placeholder="Yorum yaz…"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={chatMsg}
              onChangeText={setChatMsg}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable style={s.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={16} color="#FFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* ── Gift Modal ── */}
      <Modal transparent visible={showGifts} animationType="slide" onRequestClose={() => setShowGifts(false)}>
        <Pressable style={gm.backdrop} onPress={() => setShowGifts(false)} />
        <View style={gm.sheet}>
          <View style={gm.handle} />

          {/* Header: başlık + bakiye */}
          <View style={gm.header}>
            <Text style={gm.title}>🎁 Hediye Gönder</Text>
            <View style={gm.balance}>
              <Text style={gm.balIcon}>🪙</Text>
              <Text style={gm.balVal}>{mcBalance.toLocaleString()} MC</Text>
            </View>
          </View>

          <Text style={gm.hint}>
            MarketCoin ile yayıncıya destek ol. Her hediyenin maliyeti karşıda gösterilir.
          </Text>

          <View style={gm.grid}>
            {GIFTS.map(g => {
              const canAfford = mcBalance >= g.cost;
              return (
                <Pressable
                  key={g.id}
                  style={[gm.card, !canAfford && gm.cardDisabled]}
                  onPress={() => sendGift(g)}
                  disabled={sendingGift || !canAfford}
                >
                  <Text style={gm.giftIcon}>{g.icon}</Text>
                  <Text style={gm.giftName}>{g.name}</Text>
                  <View style={[gm.cost, { backgroundColor: canAfford ? '#FFF9E6' : '#F8F8F8' }]}>
                    <Text style={[gm.costTxt, { color: canAfford ? '#FFB800' : '#CCC' }]}>
                      🪙 {g.cost}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {mcBalance === 0 && (
            <Text style={gm.noBalance}>
              MarketCoin bakiyen yok. Uygulama içi aktiviteler ile kazanabilirsin.
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },

  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', gap: 8 },
  hostAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FF3B3B' },
  waitingTxt: { color: '#FFFFFF99', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  retryTxt: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  topGrad:    { position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(0,0,0,0.5)' },

  topBar:    { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  topLeft:   { flexDirection: 'row', gap: 6 },
  livePill:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF3B3B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot:   { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  liveTxt:   { color: '#FFF', fontSize: 10, fontWeight: '900' },
  viewerPill:{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 },
  viewerTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  hostRow:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  hostAvatarSmall: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#FF3B3B' },
  hostNameTxt:     { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },

  giftAnims: { position: 'absolute', left: 12, bottom: 160, gap: 8 },
  giftAnim:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  giftIcon:  { fontSize: 18 },
  giftTxt:   { color: '#FFD700', fontSize: 12, fontWeight: '700' },

  chatWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  chatList: { maxHeight: 180, paddingHorizontal: 12 },
  chatListExpanded: { maxHeight: 320 },
  chatRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  chatRowGift:   { backgroundColor: 'rgba(255,215,0,0.12)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginVertical: 1 },
  chatRowMine:   { backgroundColor: 'rgba(10,132,255,0.15)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, marginVertical: 1 },
  chatAvatar:           { width: 20, height: 20, borderRadius: 10, marginTop: 1 },
  chatAvatarPlaceholder:{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  chatBubble:    { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  chatUser:      { color: '#FFD700', fontSize: 12, fontFamily: font.bold },
  chatUserGift:  { color: '#FFD700' },
  chatUserMine:  { color: '#5AC8FA' },
  chatText:      { color: '#FFF', fontSize: 12 },
  chatTextGift:  { color: '#FFE066' },
  chatInputRow:  { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingTop: 8 },
  expandBtn:     { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  giftBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  giftBtnIcon: { fontSize: 20 },
  chatField: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 9, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sendBtn:  { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});

const gm = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:       { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  handle:      { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0', marginBottom: 16 },
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title:       { flex: 1, fontSize: 17, fontWeight: '800', color: '#0D0D0D' },
  balance:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9E6', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#FFE0A0' },
  balIcon:     { fontSize: 13 },
  balVal:      { fontSize: 13, fontWeight: '800', color: '#FFB800' },
  hint:        { fontSize: 11, color: '#9AA0AF', marginBottom: 14, lineHeight: 15 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
  card:        { width: '30%', alignItems: 'center', gap: 5, backgroundColor: '#F8F9FB', borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  cardDisabled:{ opacity: 0.4 },
  giftIcon:    { fontSize: 28 },
  giftName:    { fontSize: 11, fontWeight: '700', color: '#0D0D0D' },
  cost:        { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  costTxt:     { fontSize: 10, fontWeight: '800' },
  noBalance:   { fontSize: 11, color: '#FF3B3B', textAlign: 'center', marginTop: 8, paddingHorizontal: 8, lineHeight: 16 },
});
