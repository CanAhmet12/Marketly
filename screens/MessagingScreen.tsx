import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, TextInput,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator,
  Animated, Dimensions, Alert, Clipboard, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useConversations, useDirectMessages, DMConversation, DMMessage } from '../hooks/useMessages';
import { colors, shadow, radius, font } from '../constants/theme';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');

// ─── Avatar yardımcısı ────────────────────────────────────────────────────────
function UserAvatar({ url, username, size = 44 }: { url?: string | null; username?: string; size?: number }) {
  const seed = username || 'user';
  const uri  = url || `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=${size * 2}`;
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.bgInput }}
    />
  );
}

// ─── Zaman formatlayıcı ───────────────────────────────────────────────────────
function formatTime(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const diffMs   = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1)   return 'şimdi';
  if (diffMins < 60)  return `${diffMins}dk`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}sa`;
  const diffDays = Math.floor(diffMins / 1440);
  if (diffDays < 7)   return `${diffDays}g`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION LIST VIEW
// ─────────────────────────────────────────────────────────────────────────────
/** Yeni konuşma başlatma modal'ı — kullanıcı arar, tıklar, chat açılır */
function NewConversationModal({
  visible, onClose, onStartChat,
}: {
  visible: boolean;
  onClose: () => void;
  onStartChat: (userId: string, username: string, avatarUrl?: string) => void;
}) {
  const { user } = useAuth();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, verified')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', user?.id ?? '')
        .limit(12);
      setResults(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, user?.id]);

  const handleClose = () => { setQuery(''); setResults([]); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={nm.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={nm.sheet}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={nm.title}>Yeni Mesaj</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={nm.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={nm.searchInput}
              placeholder="Kullanıcı adı veya isim ara…"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCapitalize="none"
            />
            {loading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {results.length === 0 && query.trim().length > 0 && !loading && (
              <View style={nm.empty}>
                <Ionicons name="people-outline" size={32} color={colors.textMuted} />
                <Text style={nm.emptyTxt}>Kullanıcı bulunamadı</Text>
              </View>
            )}
            {results.map(u => (
              <Pressable
                key={u.id}
                style={({ pressed }) => [nm.userRow, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  handleClose();
                  onStartChat(u.id, u.username ?? u.full_name ?? 'Kullanıcı', u.avatar_url ?? undefined);
                }}
              >
                {u.avatar_url ? (
                  <Image source={{ uri: u.avatar_url }} style={nm.avatar} />
                ) : (
                  <View style={[nm.avatar, nm.avatarFallback]}>
                    <Text style={nm.avatarLetter}>{(u.full_name ?? u.username ?? '?')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View style={nm.userInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={nm.userName}>{u.full_name ?? u.username}</Text>
                    {u.verified && <Ionicons name="checkmark-circle" size={13} color="#007AFF" />}
                  </View>
                  <Text style={nm.userHandle}>@{u.username}</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ConversationList({
  onOpenChat,
}: {
  onOpenChat: (conv: DMConversation) => void;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { conversations, loading, tablesExist, totalUnread, loadConversations } = useConversations();
  const [showNewChat, setShowNewChat] = useState(false);

  const renderItem = ({ item }: { item: DMConversation }) => {
    const other    = item.other_user;
    const isUser1  = item.user1_id === user?.id;
    const unread   = isUser1 ? item.unread_count_1 : item.unread_count_2;
    const hasUnread = unread > 0;

    return (
      <Pressable
        style={({ pressed }) => [cl.row, pressed && { opacity: 0.75 }]}
        onPress={() => onOpenChat(item)}
      >
        <View style={cl.avatarWrap}>
          <UserAvatar url={other?.avatar_url} username={other?.username} size={50} />
          {hasUnread && <View style={cl.onlineDot} />}
        </View>

        <View style={cl.info}>
          <View style={cl.nameRow}>
            <Text style={[cl.name, hasUnread && cl.nameBold]} numberOfLines={1}>
              {other?.full_name || other?.username || 'Kullanıcı'}
            </Text>
            {other?.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#007AFF" style={{ marginLeft: 3 }} />
            )}
            <Text style={cl.time}>{formatTime(item.last_message_at)}</Text>
          </View>
          <View style={cl.lastMsgRow}>
            <Text style={[cl.lastMsg, hasUnread && cl.lastMsgBold]} numberOfLines={1}>
              {item.last_message || 'Konuşma başladı'}
            </Text>
            {hasUnread && (
              <View style={cl.badge}>
                <Text style={cl.badgeTxt}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[cl.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={cl.header}>
        <Pressable onPress={() => navigation.goBack()} style={cl.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={cl.headerCenter}>
          <Text style={cl.title}>Mesajlar</Text>
          {totalUnread > 0 && (
            <View style={cl.totalBadge}>
              <Text style={cl.totalBadgeTxt}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <Pressable
          style={cl.composeBtn}
          onPress={() => setShowNewChat(true)}
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Tablo yoksa — kullanıcı dostu boş durum */}
      {tablesExist === false ? (
        <View style={cl.emptyState}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '05']}
            style={cl.emptyIconBg}
          >
            <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
          </LinearGradient>
          <Text style={cl.emptyTitle}>Mesajlaşma Yakında</Text>
          <Text style={cl.emptySubtitle}>
            Bu özellik çok yakında kullanıma açılacak.{'\n'}
            Haber almak için bildirimleri açık tut!
          </Text>
        </View>
      ) : loading ? (
        <View style={cl.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={cl.emptyState}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '05']}
            style={cl.emptyIconBg}
          >
            <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
          </LinearGradient>
          <Text style={cl.emptyTitle}>Henüz mesaj yok</Text>
          <Text style={cl.emptySubtitle}>
            Bir kullanıcının profiline git ve{'\n'}"Mesaj Gönder" butonuna bas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onRefresh={loadConversations}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={cl.separator} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      )}

      {/* Yeni konuşma modal'ı */}
      <NewConversationModal
        visible={showNewChat}
        onClose={() => setShowNewChat(false)}
        onStartChat={async (targetUserId, targetUsername, targetAvatar) => {
          if (!user?.id) return;
          // Mevcut konuşmayı bul ya da yeni oluştur
          const existing = conversations.find(c =>
            (c.user1_id === user.id && c.user2_id === targetUserId) ||
            (c.user2_id === user.id && c.user1_id === targetUserId)
          );
          if (existing) {
            onOpenChat(existing);
          } else {
            // Yeni konuşma kaydı oluştur
            const { data: newConv } = await supabase
              .from('dm_conversations')
              .upsert(
                { user1_id: user.id, user2_id: targetUserId, last_message_at: new Date().toISOString() },
                { onConflict: 'user1_id,user2_id' }
              )
              .select()
              .single();
            if (newConv) {
              // Konuşmaları yenile ve aç
              await loadConversations();
              onOpenChat({
                ...newConv,
                other_user: { id: targetUserId, username: targetUsername, avatar_url: targetAvatar },
              } as DMConversation);
            }
          }
        }}
      />
    </View>
  );
}

const cl = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:        { fontSize: 18, fontWeight: '800', color: colors.text },
  totalBadge: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  totalBadgeTxt: { fontSize: 11, fontWeight: '800', color: '#fff' },
  composeBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.bgPure,
  },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2, borderColor: colors.bgPure,
  },
  info:       { flex: 1 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  name:       { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  nameBold:   { fontWeight: '800' },
  time:       { fontSize: 11, color: colors.textMuted },
  lastMsgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lastMsg:    { flex: 1, fontSize: 13, color: colors.textMuted },
  lastMsgBold: { color: colors.text, fontWeight: '600' },
  badge: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center',
  },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 78 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  sqlBox: {
    backgroundColor: '#1A1A2E', borderRadius: 8, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: '#333',
  },
  sqlTxt: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#7EC8E3' },
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ChatView({
  conversation,
  onBack,
}: {
  conversation: DMConversation;
  onBack: () => void;
}) {
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { messages, loading, sending, sendMessage } = useDirectMessages(conversation.id);
  const [input, setInput] = useState('');
  const scrollRef = useRef<FlatList<DMMessage>>(null);
  const other = conversation.other_user;

  const isMe = (msg: DMMessage) => msg.sender_id === user?.id;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const txt = input.trim();
    if (!txt || sending) return;
    setInput('');
    await sendMessage(txt);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [input, sending, sendMessage]);

  const renderMessage = ({ item, index }: { item: DMMessage; index: number }) => {
    const mine = isMe(item);
    const prevMsg  = messages[index - 1];
    const nextMsg  = messages[index + 1];
    const isSameAsPrev = prevMsg && prevMsg.sender_id === item.sender_id;
    const isSameAsNext = nextMsg && nextMsg.sender_id === item.sender_id;

    // Zaman etiketi — 5+ dakika arayla
    const showTime = !prevMsg ||
      new Date(item.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000;

    const handleLongPress = () => {
      const options: string[] = ['Kopyala', 'İptal'];
      if (mine) options.splice(1, 0, 'Sil');

      Alert.alert('Mesaj', undefined, [
        {
          text: 'Kopyala',
          onPress: () => Clipboard.setString(item.content),
        },
        ...(mine ? [{
          text: 'Sil',
          style: 'destructive' as const,
          onPress: () => {
            Alert.alert('Mesajı Sil', 'Bu mesaj kalıcı olarak silinecek.', [
              { text: 'Vazgeç', style: 'cancel' },
              {
                text: 'Sil', style: 'destructive',
                onPress: async () => {
                  try {
                    const { supabase } = await import('../lib/supabase');
                    await supabase.from('dm_messages').delete().eq('id', item.id);
                  } catch {}
                },
              },
            ]);
          },
        }] : []),
        { text: 'İptal', style: 'cancel' },
      ]);
    };

    return (
      <View>
        {showTime && (
          <Text style={cv.timeLabel}>
            {new Date(item.created_at).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        )}
        <View style={[cv.msgRow, mine ? cv.msgRowRight : cv.msgRowLeft]}>
          {/* Karşı tarafın avatarı — sadece son mesajda göster */}
          {!mine && !isSameAsNext && (
            <UserAvatar url={other?.avatar_url} username={other?.username} size={28} />
          )}
          {!mine && isSameAsNext && <View style={{ width: 28 }} />}

          <Pressable
            onLongPress={handleLongPress}
            delayLongPress={400}
            style={[
              cv.bubble,
              mine ? cv.bubbleMe : cv.bubbleThem,
              isSameAsPrev && mine   && cv.bubbleMeGrouped,
              isSameAsPrev && !mine  && cv.bubbleThemGrouped,
            ]}
          >
            <Text style={[cv.bubbleTxt, mine && cv.bubbleTxtMe]}>{item.content}</Text>
            {/* Okundu ikonu (gönderilen mesajlarda) */}
            {mine && (
              <Ionicons
                name={item.is_read ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={item.is_read ? '#34C759' : 'rgba(255,255,255,0.6)'}
                style={cv.readIcon}
              />
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[cv.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      <Pressable
        style={cv.header}
        onPress={() => navigation.navigate('ProfileView', { userId: other?.id })}
      >
        <Pressable onPress={onBack} style={cv.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <UserAvatar url={other?.avatar_url} username={other?.username} size={38} />
        <View style={cv.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={cv.headerName} numberOfLines={1}>
              {other?.full_name || other?.username || 'Kullanıcı'}
            </Text>
            {other?.verified && (
              <Ionicons name="checkmark-circle" size={15} color="#007AFF" />
            )}
          </View>
          <Text style={cv.headerUsername}>@{other?.username}</Text>
        </View>
        <Pressable
          style={cv.viewProfileBtn}
          onPress={() => navigation.navigate('ProfileView', { userId: other?.id })}
        >
          <Ionicons name="person-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </Pressable>

      {/* Mesajlar */}
      {loading ? (
        <View style={cv.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={cv.listContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={cv.emptyWrap}>
              <UserAvatar url={other?.avatar_url} username={other?.username} size={64} />
              <Text style={cv.emptyName}>{other?.full_name || other?.username}</Text>
              <Text style={cv.emptyHint}>Merhaba de ve konuşmayı başlat 👋</Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={[cv.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={cv.input}
          value={input}
          onChangeText={setInput}
          placeholder="Mesaj yaz..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          style={[cv.sendBtn, (!input.trim() || sending) && cv.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="send" size={18} color="#fff" />
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const cv = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.bgPure,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    ...shadow.sm,
  },
  backBtn:      { width: 34, alignItems: 'center' },
  headerInfo:   { flex: 1 },
  headerName:   { fontSize: 15, fontWeight: '700', color: colors.text },
  headerUsername: { fontSize: 12, color: colors.textMuted },
  viewProfileBtn: { padding: 6 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 2 },

  timeLabel: {
    textAlign: 'center', fontSize: 11, color: colors.textMuted,
    marginVertical: 8,
  },
  msgRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginVertical: 1 },
  msgRowLeft:  { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },

  bubble: {
    maxWidth: W * 0.72, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9,
    flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', gap: 4,
  },
  bubbleMe:    {
    backgroundColor: colors.primary, borderBottomRightRadius: 5,
    ...shadow.xs,
  },
  bubbleThem:  {
    backgroundColor: colors.bgPure, borderBottomLeftRadius: 5,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.xs,
  },
  bubbleMeGrouped:   { borderBottomRightRadius: 18 },
  bubbleThemGrouped: { borderBottomLeftRadius: 18 },

  bubbleTxt:   { fontSize: 14, color: colors.text, lineHeight: 19, flexShrink: 1 },
  bubbleTxtMe: { color: '#fff' },
  readIcon:    { alignSelf: 'flex-end', marginLeft: 2 },

  emptyWrap:  { flex: 1, alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyName:  { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyHint:  { fontSize: 13, color: colors.textMuted },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: colors.bgPure,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    ...shadow.md,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
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
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — Yönlendirici bileşen
// ─────────────────────────────────────────────────────────────────────────────
export function MessagingScreen() {
  const route = useRoute<any>();
  const [activeConv, setActiveConv] = useState<DMConversation | null>(null);
  const { conversations, getOrCreateConversation } = useConversations();

  // Dışarıdan (UserProfileScreen gibi) bir openUserId parametresi gelebilir
  useEffect(() => {
    const openUserId = route.params?.openUserId as string | undefined;
    if (!openUserId) return;

    (async () => {
      const convId = await getOrCreateConversation(openUserId);
      if (!convId) return;

      // Konuşma objesini bul ya da geçici oluştur
      const existing = conversations.find(c => c.id === convId);
      if (existing) { setActiveConv(existing); return; }

      // Konuşma henüz listede yoksa minimal obje oluştur
      setActiveConv({
        id: convId,
        user1_id: '',
        user2_id: openUserId,
        last_message: null,
        last_message_at: new Date().toISOString(),
        unread_count_1: 0,
        unread_count_2: 0,
        created_at: new Date().toISOString(),
        other_user: route.params?.otherUser,
      });
    })();
  }, [route.params?.openUserId]);

  if (activeConv) {
    return (
      <ChatView
        conversation={activeConv}
        onBack={() => setActiveConv(null)}
      />
    );
  }

  return (
    <ConversationList
      onOpenChat={setActiveConv}
    />
  );
}

const nm = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.bgPure,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 17, color: colors.text, fontFamily: font.bold },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, fontFamily: font.regular },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 16, color: colors.primary, fontFamily: font.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, color: colors.text, fontFamily: font.semiBold },
  userHandle: { fontSize: 12, color: colors.textMuted, fontFamily: font.regular, marginTop: 1 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTxt: { fontSize: 14, color: colors.textMuted },
});
