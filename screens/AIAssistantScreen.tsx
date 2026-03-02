import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Dimensions, Modal,
  FlatList, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { useAIChat, AISession } from '../hooks/useAIChat';
import { colors, shadow } from '../constants/theme';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');

// ─── Öneri soruları ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '📈', text: 'BTC bu hafta ne yapar?' },
  { icon: '💼', text: 'Portföyümü nasıl çeşitlendirmeliyim?' },
  { icon: '⚡', text: 'En iyi DCA stratejisi nedir?' },
  { icon: '🏆', text: 'Altın mı Bitcoin mi?' },
  { icon: '🔍', text: 'NVIDIA hissesi hakkında analiz?' },
  { icon: '💱', text: 'Dolar/TL nereye gider?' },
];

// ─── Mesaj tipi ───────────────────────────────────────────────────────────────
interface Message {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  time:    string;
}

// ─── AI çağrısı ───────────────────────────────────────────────────────────────
async function callAI(messages: { role: string; content: string }[], context: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { messages, context },
    });
    if (error) throw error;
    return data?.reply ?? 'Yanıt alınamadı.';
  } catch {
    return generateDemoReply(messages[messages.length - 1]?.content ?? '');
  }
}

function generateDemoReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('btc') || q.includes('bitcoin')) {
    return '**Bitcoin Analizi** 📊\n\nBitcoin şu an kritik bir destek seviyesinde. Teknik göstergeler:\n\n• **RSI:** 58 (nötr bölge)\n• **MACD:** Pozitif kesişim yakın\n• **Destek:** $60,000–$62,000\n• **Direnç:** $68,000–$70,000\n\nKısa vadede konsolidasyon bekleniyor. DCA stratejisi için iyi bir dönem.';
  }
  if (q.includes('portföy') || q.includes('çeşitlendirme')) {
    return '**Portföy Çeşitlendirmesi** 💼\n\nOptimal dağılım önerisi:\n\n• **%40** — Kripto (BTC %25, ETH %15)\n• **%30** — Hisseler (teknoloji ağırlıklı)\n• **%20** — Altın / emtia\n• **%10** — Nakit / stablecoin\n\nRisk toleransınıza göre bu oranları ayarlayın.';
  }
  if (q.includes('dca')) {
    return '**DCA (Dollar-Cost Averaging) Stratejisi** ⚡\n\nDCA\'nın avantajları:\n\n1. Fiyat volatilitesini yumuşatır\n2. Duygusal kararları azaltır\n3. Uzun vadede maliyet ortalaması düşer\n\n**Öneri:** Aylık sabit bir miktar belirle ve piyasa koşulundan bağımsız al. Kripto için haftalık, hisseler için aylık ideal.';
  }
  if (q.includes('nvda') || q.includes('nvidia')) {
    return '**NVIDIA (NVDA) Analizi** 🖥️\n\nAI chip liderliği devam ediyor:\n\n• **P/E Oranı:** Yüksek (premium değerleme)\n• **Büyüme:** Veri merkezi geliri rekor\n• **Risk:** Yüksek değerleme, rekabet artışı\n\n**Görüş:** Uzun vadeli potansiyel güçlü. Kısa vadede düzeltme riski var. Kademeli alım önerilebilir.';
  }
  return `**MarketAI Yanıtı** 🤖\n\n"${question}" sorunuz için analiz yapıyorum...\n\nBu konuda daha detaylı bir yanıt için lütfen konuyu daha spesifik belirtin. Örneğin: hangi zaman dilimi, hangi varlık, teknik mi temel analiz mi?\n\n_Pro üyeler için sınırsız soru hakkı mevcuttur._`;
}

// ─── Mesaj kabarcığı ──────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser  = msg.role === 'user';
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (/^\*\*(.+)\*\*/.test(line)) {
        return (
          <Text key={i} style={[mb.msgTxt, { fontWeight: '800', fontSize: 15 }]}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <Text key={i} style={mb.msgTxt}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <Text key={j} style={{ fontWeight: '800' }}>{part.replace(/\*\*/g, '')}</Text>
                : part
            )}
          </Text>
        );
      }
      if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
        return <Text key={i} style={[mb.msgTxt, { paddingLeft: 4 }]}>{'  ' + line}</Text>;
      }
      if (line.startsWith('_') && line.endsWith('_')) {
        return (
          <Text key={i} style={[mb.msgTxt, { fontStyle: 'italic', color: colors.textMuted }]}>
            {line.replace(/_/g, '')}
          </Text>
        );
      }
      if (line === '') return <Text key={i} style={{ height: 6 }} />;
      return <Text key={i} style={mb.msgTxt}>{line}</Text>;
    });
  };

  return (
    <Animated.View style={[
      mb.wrap,
      isUser ? mb.wrapUser : mb.wrapAI,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      {!isUser && (
        <View style={mb.aiAvatar}>
          <Text style={mb.aiAvatarTxt}>AI</Text>
        </View>
      )}
      <View style={[mb.bubble, isUser ? mb.bubbleUser : mb.bubbleAI]}>
        {renderContent(msg.content)}
        <Text style={mb.time}>{msg.time}</Text>
      </View>
    </Animated.View>
  );
}

const mb = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, paddingHorizontal: 16 },
  wrapUser: { justifyContent: 'flex-end' },
  wrapAI:   { justifyContent: 'flex-start' },

  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center',
  },
  aiAvatarTxt: { fontSize: 10, fontWeight: '900', color: '#fff' },

  bubble: {
    maxWidth: W * 0.75, borderRadius: 18, padding: 13, gap: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: colors.bgPure, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.sm,
  },
  msgTxt: { fontSize: 14, color: colors.text, lineHeight: 20 },
  time:   { fontSize: 10, color: colors.textMuted, alignSelf: 'flex-end', marginTop: 4 },
});

// ─── Geçmiş drawer ────────────────────────────────────────────────────────────
function HistoryDrawer({
  visible,
  sessions,
  loading,
  currentSessionId,
  onSelect,
  onNew,
  onDelete,
  onClose,
}: {
  visible:          boolean;
  sessions:         AISession[];
  loading:          boolean;
  currentSessionId: string | null;
  onSelect:         (id: string) => void;
  onNew:            () => void;
  onDelete:         (id: string) => void;
  onClose:          () => void;
}) {
  const insets = useSafeAreaInsets();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={hd.overlay} onPress={onClose} />
      <View style={[hd.drawer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        {/* Drawer header */}
        <View style={hd.drawerHeader}>
          <Text style={hd.drawerTitle}>Sohbet Geçmişi</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Yeni sohbet butonu */}
        <Pressable style={hd.newBtn} onPress={onNew}>
          <LinearGradient
            colors={[colors.primary, '#00A846']}
            style={hd.newBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={hd.newBtnTxt}>Yeni Sohbet</Text>
          </LinearGradient>
        </Pressable>

        {/* Oturum listesi */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : sessions.length === 0 ? (
          <View style={hd.empty}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
            <Text style={hd.emptyTxt}>Henüz sohbet yok</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
            renderItem={({ item }) => {
              const isActive = item.id === currentSessionId;
              return (
                <Pressable
                  style={[hd.sessionRow, isActive && hd.sessionRowActive]}
                  onPress={() => { onSelect(item.id); onClose(); }}
                  onLongPress={() => {
                    Alert.alert(
                      'Sohbeti Sil',
                      'Bu sohbet kalıcı olarak silinecek.',
                      [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => onDelete(item.id) },
                      ]
                    );
                  }}
                >
                  <View style={hd.sessionIcon}>
                    <Ionicons
                      name={isActive ? 'chatbubble' : 'chatbubble-outline'}
                      size={16}
                      color={isActive ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <View style={hd.sessionInfo}>
                    <Text style={[hd.sessionTitle, isActive && hd.sessionTitleActive]} numberOfLines={1}>
                      {item.title || 'Sohbet'}
                    </Text>
                    <Text style={hd.sessionDate}>{formatDate(item.updated_at)}</Text>
                  </View>
                  {isActive && <View style={hd.activeDot} />}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const hd = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position:        'absolute',
    left:            0, top: 0, bottom: 0,
    width:           W * 0.8,
    backgroundColor: colors.bgPure,
    ...shadow.lg,
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  drawerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

  newBtn:    { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  newBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 46,
  },
  newBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

  empty:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTxt: { color: colors.textMuted, fontSize: 14 },

  sessionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: 10, marginBottom: 2,
  },
  sessionRowActive: { backgroundColor: colors.primary + '12' },
  sessionIcon:  { width: 32, alignItems: 'center' },
  sessionInfo:  { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  sessionTitleActive: { color: colors.primary },
  sessionDate:  { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  activeDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function AIAssistantScreen() {
  const insets       = useSafeAreaInsets();
  const navigation   = useNavigation<any>();
  const { user }     = useAuth();
  const { isFree }   = useSubscription();
  const { assets }   = useMarketPrices();
  const {
    sessions, loadingSessions,
    loadSessions, loadMessages,
    getOrCreateSession, createNewSession,
    saveMessage, deleteSession,
    tablesExist,
  } = useAIChat();

  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState('');
  const [thinking,       setThinking]       = useState(false);
  const [dailyCount,     setDailyCount]     = useState(0);
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const FREE_LIMIT = 5;
  const scrollRef  = useRef<ScrollView>(null);
  // Tracks whether we already saved at least one user message in current session
  const msgCountRef = useRef(0);

  // ── Günlük soru sayısı ────────────────────────────────────────────────────
  useEffect(() => {
    const key = `@ai_daily_${new Date().toISOString().slice(0, 10)}`;
    AsyncStorage.getItem(key).then(v => {
      if (v) setDailyCount(parseInt(v, 10) || 0);
    });
  }, []);

  const nowStr = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const dbMsgToLocal = (m: { id: string; role: 'user' | 'assistant'; content: string; created_at: string }): Message => ({
    id:      m.id,
    role:    m.role,
    content: m.content,
    time:    new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  });

  // ── Oturum yükle (mount) ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      setSessionLoading(true);
      try {
        const sid = await getOrCreateSession();
        if (!mounted) return;
        setSessionId(sid);

        if (sid) {
          const dbMsgs = await loadMessages(sid);
          if (mounted && dbMsgs.length > 0) {
            msgCountRef.current = dbMsgs.filter(m => m.role === 'user').length;
            setMessages(dbMsgs.map(dbMsgToLocal));
          }
        }
      } catch {}
      finally { if (mounted) setSessionLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Karşılama mesajı (assets yüklenince güncelle) ─────────────────────────
  useEffect(() => {
    const topAssets = assets.slice(0, 3).map(a =>
      `${a.symbol}: ${a.priceFormatted} (${a.change_percent >= 0 ? '+' : ''}${a.change_percent.toFixed(2)}%)`
    ).join(', ');

    setMessages(prev => {
      const welcomeMsg: Message = {
        id:      'welcome',
        role:    'assistant',
        content: `Merhaba! Ben **MarketAI**'yım 🤖\n\nPiyasalar, yatırım stratejileri ve kripto hakkında her şeyi sorabilirsin.\n\n📊 Anlık: ${topAssets || 'Veri yükleniyor...'}`,
        time:    nowStr(),
      };
      // Eğer DB'den mesaj yüklendiyse karşılama mesajı ekleme
      if (prev.length > 0 && prev[0]?.id !== 'welcome') return prev;
      if (prev.length === 0) return [welcomeMsg];
      if (prev[0]?.id === 'welcome') return [welcomeMsg, ...prev.slice(1)];
      return prev;
    });
  }, [assets, sessionLoading]);

  // ── Geçmişi aç ───────────────────────────────────────────────────────────
  const openHistory = useCallback(async () => {
    setHistoryOpen(true);
    await loadSessions();
  }, [loadSessions]);

  // ── Geçmişten oturum seç ─────────────────────────────────────────────────
  const selectSession = useCallback(async (sid: string) => {
    if (sid === sessionId) return;
    setSessionLoading(true);
    setMessages([]);
    setSessionId(sid);
    msgCountRef.current = 0;
    try {
      const dbMsgs = await loadMessages(sid);
      if (dbMsgs.length > 0) {
        msgCountRef.current = dbMsgs.filter(m => m.role === 'user').length;
        setMessages(dbMsgs.map(dbMsgToLocal));
      }
    } catch {}
    finally { setSessionLoading(false); }
  }, [sessionId, loadMessages]);

  // ── Yeni sohbet ───────────────────────────────────────────────────────────
  const startNewChat = useCallback(async () => {
    setHistoryOpen(false);
    const newSid = await createNewSession();
    if (newSid) {
      setSessionId(newSid);
      setMessages([]);
      msgCountRef.current = 0;
    }
  }, [createNewSession]);

  // ── Oturum sil ────────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback(async (sid: string) => {
    await deleteSession(sid);
    if (sid === sessionId) {
      // Silinen aktif oturumsa yeni oturum başlat
      await startNewChat();
    }
  }, [deleteSession, sessionId, startNewChat]);

  // ── Mesaj gönder ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    if (isFree && dailyCount >= FREE_LIMIT) {
      navigation.navigate('Paywall');
      return;
    }

    const userMsg: Message = {
      id:      Date.now().toString(),
      role:    'user',
      content: trimmed,
      time:    nowStr(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    const newCount = dailyCount + 1;
    setDailyCount(newCount);
    const key = `@ai_daily_${new Date().toISOString().slice(0, 10)}`;
    AsyncStorage.setItem(key, String(newCount));

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // DB kayıt (user msg)
    const isFirst = msgCountRef.current === 0;
    msgCountRef.current += 1;
    if (sessionId) await saveMessage(sessionId, 'user', trimmed, isFirst);

    const history = [...messages.filter(m => m.id !== 'welcome'), userMsg]
      .map(m => ({ role: m.role, content: m.content }));

    const topCrypto = assets.filter(a => a.category === 'crypto').slice(0, 5);
    const topStocks = assets.filter(a => a.category === 'stocks').slice(0, 3);
    const topForex  = assets.filter(a => a.category === 'forex').slice(0, 2);
    const context   = [
      'PIYASA_VERILERI:',
      ...[...topCrypto, ...topStocks, ...topForex].map(a =>
        `${a.symbol}: ${a.priceFormatted} (${a.change_percent >= 0 ? '+' : ''}${a.change_percent.toFixed(2)}%)`
      ),
      `TARIH: ${new Date().toLocaleDateString('tr-TR')}`,
    ].join(' | ');

    let reply: string;
    try {
      reply = await callAI(history, context);
    } catch {
      reply = '⚠️ Bağlantı sorunu yaşandı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.';
    }
    setThinking(false);

    const aiMsg: Message = {
      id:      (Date.now() + 1).toString(),
      role:    'assistant',
      content: reply,
      time:    nowStr(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // DB kayıt (AI msg)
    if (sessionId) await saveMessage(sessionId, 'assistant', reply);
  }, [thinking, isFree, dailyCount, messages, assets, navigation, sessionId, saveMessage]);

  const isAtLimit = isFree && dailyCount >= FREE_LIMIT;
  const showSuggestions = messages.filter(m => m.id !== 'welcome').length === 0 && !thinking && !sessionLoading;

  return (
    <>
      <KeyboardAvoidingView
        style={[s.root, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 56}
      >
        {/* Header */}
        <LinearGradient colors={['#0A0A1A', '#0D1F3C']} style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Pressable style={s.headerCenter} onPress={openHistory}>
            <View style={s.aiDot} />
            <Text style={s.headerTitle}>MarketAI</Text>
            <View style={s.onlinePill}>
              <Text style={s.onlineTxt}>CANLI</Text>
            </View>
          </Pressable>
          <View style={s.headerRight}>
            {/* Geçmiş butonu */}
            <Pressable onPress={openHistory} style={s.iconBtn} hitSlop={8}>
              <Ionicons name="time-outline" size={20} color="#fff" />
            </Pressable>
            {/* Yeni sohbet */}
            <Pressable onPress={startNewChat} style={s.iconBtn} hitSlop={8}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </Pressable>
            {isFree && (
              <Pressable onPress={() => navigation.navigate('Paywall')} style={s.proBtn}>
                <Ionicons name="flash" size={13} color="#FFD700" />
                <Text style={s.proTxt}>PRO</Text>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* Günlük soru sayacı */}
        {isFree && (
          <View style={s.limitBar}>
            <Text style={s.limitTxt}>Günlük {dailyCount}/{FREE_LIMIT} soru · </Text>
            <Pressable onPress={() => navigation.navigate('Paywall')}>
              <Text style={s.limitLink}>Sınırsız için Pro'ya geç →</Text>
            </Pressable>
          </View>
        )}

        {/* Supabase tablolar eksikse uyarı */}
        {tablesExist === false && (
          <View style={s.noDbBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#FF9500" />
            <Text style={s.noDbTxt}>Sohbet geçmişi kaydedilemedi (tablo eksik)</Text>
          </View>
        )}

        {/* Mesajlar */}
        {sessionLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={s.loadingTxt}>Sohbet yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={s.msgList}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {thinking && (
              <View style={s.thinkingWrap}>
                <View style={s.thinkingBubble}>
                  <View style={s.dotRow}>
                    {[0, 1, 2].map(i => (
                      <BounceDot key={i} delay={i * 150} />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Öneri soruları */}
        {showSuggestions && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.suggestionsRow}
          >
            {SUGGESTIONS.map((sg, i) => (
              <Pressable key={i} style={sug.chip} onPress={() => sendMessage(sg.text)}>
                <Text style={sug.icon}>{sg.icon}</Text>
                <Text style={sug.txt}>{sg.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input bar */}
        <View style={[s.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          {isAtLimit ? (
            <Pressable style={s.limitBtn} onPress={() => navigation.navigate('Paywall')}>
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={s.limitBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flash" size={16} color="#fff" />
                <Text style={s.limitBtnTxt}>Sınırsız Soru İçin Pro'ya Geç</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <>
              <TextInput
                style={s.input}
                value={input}
                onChangeText={setInput}
                placeholder="Piyasalar hakkında sor..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={400}
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
              />
              <Pressable
                style={[s.sendBtn, (!input.trim() || thinking) && s.sendBtnDisabled]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || thinking}
              >
                {thinking
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="send" size={18} color="#fff" />
                }
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Geçmiş drawer */}
      <HistoryDrawer
        visible={historyOpen}
        sessions={sessions}
        loading={loadingSessions}
        currentSessionId={sessionId}
        onSelect={selectSession}
        onNew={startNewChat}
        onDelete={handleDeleteSession}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}

// ─── Bounce dot animasyonu ────────────────────────────────────────────────────
function BounceDot({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: -5, duration: 250, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,  duration: 250, useNativeDriver: true }),
        Animated.delay(500 - delay),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.View style={[s2.dot, { transform: [{ translateY: y }] }]} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  headerTitle:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  onlinePill: {
    backgroundColor: '#34C75930', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  onlineTxt: { fontSize: 9, fontWeight: '900', color: '#34C759', letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  proBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFD70020', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FFD70040',
  },
  proTxt: { fontSize: 11, fontWeight: '900', color: '#FFD700' },

  limitBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FF950012', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#FF950030',
  },
  limitTxt:  { fontSize: 12, color: colors.textMuted },
  limitLink: { fontSize: 12, color: '#FF9500', fontWeight: '700' },

  noDbBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF950010', paddingHorizontal: 16, paddingVertical: 6,
  },
  noDbTxt: { fontSize: 11, color: '#FF9500' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { color: colors.textMuted, fontSize: 13 },

  msgList: { flex: 1 },

  thinkingWrap:   { paddingHorizontal: 16, marginBottom: 12 },
  thinkingBubble: {
    alignSelf: 'flex-start', backgroundColor: colors.bgPure,
    borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 14, borderWidth: 1, borderColor: colors.border,
    marginLeft: 38,
  },
  dotRow: { flexDirection: 'row', gap: 5, alignItems: 'center', height: 18 },

  suggestionsRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: 'flex-start' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: colors.bgPure,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadow.md,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    backgroundColor: colors.bgInput, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.textMuted },

  limitBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  limitBtnGrad: {
    height: 48, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  limitBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

const sug = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bgPure, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.xs,
  },
  icon: { fontSize: 14 },
  txt:  { fontSize: 12, fontWeight: '600', color: colors.text },
});

const s2 = StyleSheet.create({
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.textMuted },
});
