import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput,
  Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { colors, shadow } from '../constants/theme';
import { supabase } from '../lib/supabase';

const QUICK_TAGS = ['BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA', 'XAU', 'USDTRY'];

interface Props {
  visible:     boolean;
  onClose:     () => void;
  onSubmit:    (content: string, assetTag?: string, imageUrl?: string) => Promise<boolean>;
  defaultTag?: string;
}

export function CreatePostModal({ visible, onClose, onSubmit, defaultTag }: Props) {
  const insets     = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [content,   setContent]   = useState('');
  const [tag,       setTag]       = useState(defaultTag ?? '');
  const [saving,    setSaving]    = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [imageUri,  setImageUri]  = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const MAX = 280;

  const handleChange = (t: string) => {
    if (t.length > MAX) return;
    setContent(t);
    setCharCount(t.length);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Galeriye erişim izni ver');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      quality: 0.8, allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      setUploading(true);
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `post-images/${user.id}/${Date.now()}.${ext}`;
      const formData = new FormData();
      formData.append('file', { uri, type: `image/${ext}`, name: fileName } as any);
      const { error } = await supabase.storage.from('avatars').upload(fileName, formData as any, { contentType: `image/${ext}`, upsert: true });
      if (error) return null;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    let imageUrl: string | undefined;
    if (imageUri) {
      const uploaded = await uploadImage(imageUri);
      imageUrl = uploaded ?? undefined;
    }
    const ok = await onSubmit(content.trim(), tag || undefined, imageUrl);
    setSaving(false);
    if (ok) {
      setContent('');
      setTag('');
      setCharCount(0);
      setImageUri(null);
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

          {/* Seçilen görsel önizleme */}
          {imageUri && (
            <View style={s.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
              <Pressable style={s.imageRemove} onPress={() => setImageUri(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color="#fff" />
              </Pressable>
              {uploading && (
                <View style={s.imageUploadOverlay}>
                  <ActivityIndicator color="#fff" />
                  <Text style={s.imageUploadTxt}>Yükleniyor...</Text>
                </View>
              )}
            </View>
          )}

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
              <Pressable style={s.footerBtn} hitSlop={10} onPress={pickImage}>
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={imageUri ? colors.primary : colors.textMuted}
                />
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

  imagePreviewWrap: {
    marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', position: 'relative',
  },
  imagePreview: { width: '100%', height: 180, borderRadius: 12 },
  imageRemove: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
  },
  imageUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  imageUploadTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
