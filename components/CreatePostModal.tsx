import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput,
  Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, shadow } from '../constants/theme';

const QUICK_TAGS = ['BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA', 'XAU', 'USDTRY'];

interface Props {
  visible:     boolean;
  onClose:     () => void;
  onSubmit:    (content: string, assetTag?: string) => Promise<boolean>;
  defaultTag?: string;
}

export function CreatePostModal({ visible, onClose, onSubmit, defaultTag }: Props) {
  const insets     = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [content,  setContent]  = useState('');
  const [tag,      setTag]      = useState(defaultTag ?? '');
  const [saving,   setSaving]   = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX = 280;

  const handleChange = (t: string) => {
    if (t.length > MAX) return;
    setContent(t);
    setCharCount(t.length);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const ok = await onSubmit(content.trim(), tag || undefined);
    setSaving(false);
    if (ok) {
      setContent('');
      setTag('');
      setCharCount(0);
      onClose();
    }
  };

  const remaining = MAX - charCount;
  const isOverLimit = remaining < 0;
  const charColor = remaining < 20 ? '#FF3B3B' : remaining < 50 ? '#FF9500' : colors.textMuted;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={s.header}>
            <Pressable onPress={onClose} style={s.cancelBtn} hitSlop={8}>
              <Text style={s.cancelTxt}>İptal</Text>
            </Pressable>
            <Text style={s.title}>Gönderi Oluştur</Text>
            <Pressable
              style={[s.postBtn, (!content.trim() || isOverLimit) && s.postBtnDisabled]}
              onPress={handleSubmit}
              disabled={saving || !content.trim() || isOverLimit}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.postBtnTxt}>Paylaş</Text>
              }
            </Pressable>
          </View>

          {/* Author */}
          <View style={s.authorRow}>
            <View style={s.avatarWrap}>
              {profile?.avatar_url
                ? <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
                : <View style={[s.avatar, s.avatarFallback]}>
                    <Text style={s.avatarLetter}>
                      {(profile?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
                    </Text>
                  </View>
              }
            </View>
            <View style={s.authorInfo}>
              <Text style={s.authorName}>{profile?.full_name ?? 'Sen'}</Text>
              <Text style={s.authorHandle}>@{profile?.username ?? 'user'}</Text>
            </View>
          </View>

          {/* Input */}
          <TextInput
            style={s.input}
            multiline
            placeholder="Piyasa hakkında ne düşünüyorsun?"
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={handleChange}
            autoFocus
            textAlignVertical="top"
          />

          {/* Asset tag row */}
          <View style={s.tagSection}>
            <Text style={s.tagLabel}>Varlık Etiketi</Text>
            <View style={s.quickTags}>
              {QUICK_TAGS.map(qt => (
                <Pressable
                  key={qt}
                  style={[s.quickTag, tag === qt && s.quickTagActive]}
                  onPress={() => setTag(tag === qt ? '' : qt)}
                >
                  <Text style={[s.quickTagTxt, tag === qt && s.quickTagTxtActive]}>
                    ${qt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <View style={s.footerLeft}>
              <Pressable style={s.footerBtn} hitSlop={10}>
                <Ionicons name="image-outline" size={20} color={colors.primary} />
              </Pressable>
              <Pressable style={s.footerBtn} hitSlop={10}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
              </Pressable>
              <Pressable style={s.footerBtn} hitSlop={10}>
                <Ionicons name="link-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={[s.charCount, { color: charColor }]}>
              {remaining}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.bgPure,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 4, gap: 12,
    maxHeight: '90%',
    ...shadow.lg,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
  },
  cancelBtn: { padding: 4 },
  cancelTxt: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  title:     { fontSize: 16, fontWeight: '800', color: colors.text },
  postBtn: {
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  postBtnDisabled: { backgroundColor: colors.textMuted },
  postBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  avatarWrap: {},
  avatar:        { width: 40, height: 40, borderRadius: 20 },
  avatarFallback:{ backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:  { fontSize: 15, fontWeight: '800', color: colors.textMuted },
  authorInfo:  {},
  authorName:  { fontSize: 14, fontWeight: '700', color: colors.text },
  authorHandle:{ fontSize: 12, color: colors.textMuted },

  input: {
    fontSize: 16, color: colors.text, lineHeight: 23,
    minHeight: 100, paddingHorizontal: 16,
  },

  tagSection:  { paddingHorizontal: 16, gap: 8 },
  tagLabel:    { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickTags:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickTag: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: colors.bgInput, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  quickTagActive:    { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  quickTagTxt:       { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  quickTagTxtActive: { color: colors.primary },

  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider,
  },
  footerLeft: { flex: 1, flexDirection: 'row', gap: 16 },
  footerBtn:  { padding: 4 },
  charCount:  { fontSize: 14, fontWeight: '700' },
});
