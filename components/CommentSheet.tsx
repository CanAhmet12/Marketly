import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Image, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useComments, Comment } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';
import { colors, radius, shadow } from '../constants/theme';

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'şimdi';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

// ─── Tek yorum satırı ─────────────────────────────────────────────────────────
const CommentRow = memo(function CommentRow({
  c, onLike, onDelete, isOwner,
}: {
  c: Comment;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
    onLike(c.id);
  };

  return (
    <View style={cs.row}>
      {c.author_avatar
        ? <Image source={{ uri: c.author_avatar }} style={cs.avatar} />
        : <View style={[cs.avatar, cs.avatarFb]}>
            <Text style={cs.avatarLetter}>{c.author_name[0]?.toUpperCase()}</Text>
          </View>
      }
      <View style={cs.bubble}>
        <View style={cs.bubbleHeader}>
          <Text style={cs.author}>{c.author_name}</Text>
          <Text style={cs.handleTxt}>{c.author_handle} · {timeAgo(c.created_at)}</Text>
        </View>
        <Text style={cs.content}>{c.content}</Text>
        <View style={cs.bubbleActions}>
          <Pressable style={cs.likeBtn} onPress={handleLike} hitSlop={8}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Ionicons
                name={c.is_liked ? 'heart' : 'heart-outline'}
                size={13}
                color={c.is_liked ? '#FF3B3B' : colors.textMuted}
              />
            </Animated.View>
            {c.likes > 0 && (
              <Text style={[cs.likeCount, c.is_liked && { color: '#FF3B3B' }]}>{c.likes}</Text>
            )}
          </Pressable>
          {isOwner && (
            <Pressable onPress={() => onDelete(c.id)} hitSlop={8} style={{ marginLeft: 8 }}>
              <Ionicons name="trash-outline" size={13} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
});

// ─── Ana bileşen ─────────────────────────────────────────────────────────────
interface Props {
  postId:  string | null;
  visible: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export function CommentSheet({ postId, visible, onClose, onCommentAdded }: Props) {
  const insets          = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const inputRef        = useRef<TextInput>(null);
  const listRef         = useRef<FlatList>(null);
  const slideAnim       = useRef(new Animated.Value(600)).current;

  const {
    comments, loading, submitting,
    addComment, toggleCommentLike, deleteComment,
  } = useComments(visible ? postId : null);

  // Slide animasyonu
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      useNativeDriver: true,
      damping: 25, stiffness: 200,
    }).start();
    if (visible) setTimeout(() => inputRef.current?.focus(), 400);
  }, [visible]);

  // Yeni yorum gelince scroll to bottom
  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [comments.length]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    const content = text.trim();
    setText('');
    const ok = await addComment(content);
    if (ok) {
      onCommentAdded?.();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={cs.overlay} onPress={onClose} />

      <Animated.View style={[cs.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={cs.handleWrap}>
          <View style={cs.handleBar} />
        </View>

        {/* Başlık */}
        <View style={cs.header}>
          <Text style={cs.title}>Yorumlar</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Yorum listesi */}
        {loading ? (
          <View style={cs.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={cs.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
            <Text style={cs.emptyTxt}>Henüz yorum yok</Text>
            <Text style={cs.emptySub}>İlk yorumu sen yap!</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={c => c.id}
            renderItem={({ item }) => (
              <CommentRow
                c={item}
                onLike={toggleCommentLike}
                onDelete={deleteComment}
                isOwner={item.user_id === user?.id}
              />
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}

        {/* Input alanı */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={10}
        >
          <View style={[cs.inputBar, { paddingBottom: insets.bottom + 8 }]}>
            {profile?.avatar_url
              ? <Image source={{ uri: profile.avatar_url }} style={cs.inputAvatar} />
              : <View style={[cs.inputAvatar, cs.avatarFb]}>
                  <Text style={cs.avatarLetter}>
                    {(profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
                  </Text>
                </View>
            }
            <View style={cs.inputWrap}>
              <TextInput
                ref={inputRef}
                style={cs.input}
                placeholder="Yorum ekle..."
                placeholderTextColor={colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                returnKeyType="default"
              />
            </View>
            <Pressable
              style={[cs.sendBtn, (!text.trim() || submitting) && cs.sendBtnDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim() || submitting}
            >
              {submitting
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="send" size={16} color="#FFF" />
              }
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const cs = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '75%',
    backgroundColor: colors.bgPure,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    ...shadow.sm,
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handleBar:  { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTxt:    { fontSize: 15, fontWeight: '600', color: colors.text },
  emptySub:    { fontSize: 13, color: colors.textMuted },

  // Yorum satırı
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  avatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgInput },
  avatarFb:     { justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF22' },
  avatarLetter: { fontSize: 14, fontWeight: '700', color: colors.primary },
  bubble:       { flex: 1 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  author:       { fontSize: 13, fontWeight: '700', color: colors.text },
  handleTxt:    { fontSize: 11, color: colors.textMuted },
  content:      { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleActions:{ flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  likeBtn:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount:    { fontSize: 11, color: colors.textMuted },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 10, gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    backgroundColor: colors.bgPure,
  },
  inputAvatar: { width: 34, height: 34, borderRadius: 17, marginBottom: 2 },
  inputWrap:   {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 8, minHeight: 38,
  },
  input:  { fontSize: 14, color: colors.text, maxHeight: 100 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
