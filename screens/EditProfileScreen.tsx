import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { radius, shadow, colors } from '../constants/theme';

export function EditProfileScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [fullName,       setFullName]       = useState(profile?.full_name  ?? user?.name  ?? '');
  const [username,       setUsername]       = useState(profile?.username   ?? user?.username ?? '');
  const [bio,            setBio]            = useState((profile as any)?.bio ?? '');
  const [avatarUrl,      setAvatarUrl]      = useState(profile?.avatar_url ?? '');
  const [coverUrl,       setCoverUrl]       = useState((profile as any)?.cover_url ?? '');
  const [saving,         setSaving]         = useState(false);
  const [uploadingAvt,   setUploadingAvt]   = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [showUrlInput,   setShowUrlInput]   = useState(false);

  const hasChanges = (
    (profile?.full_name  ?? '') !== fullName  ||
    (profile?.username   ?? '') !== username  ||
    ((profile as any)?.bio       ?? '') !== bio       ||
    (profile?.avatar_url ?? '') !== avatarUrl ||
    ((profile as any)?.cover_url ?? '') !== coverUrl
  );

  const handleBack = () => {
    if (!hasChanges) { navigation.goBack(); return; }
    Alert.alert(
      'Değişiklikler Kaydedilmedi',
      'Yaptığın değişiklikler kaybolacak. Çıkmak istiyor musun?',
      [
        { text: 'Devam Et', style: 'cancel' },
        { text: 'Çık', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  // ── Avatar fotoğrafı yükle ────────────────────────────────────────────────
  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin ver.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0] || !user?.id) return;

    setUploadingAvt(true);
    try {
      const asset    = result.assets[0];
      const ext      = asset.uri.split('.').pop() ?? 'jpg';
      const filePath = `avatars/${user.id}_${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob     = await response.blob();

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: `image/${ext}`, upsert: true });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(urlData.publicUrl);
      toast.success('Profil fotoğrafı yüklendi ✓');
    } catch {
      toast.error('Fotoğraf yüklenemedi');
    } finally {
      setUploadingAvt(false);
    }
  };

  // ── Kapak fotoğrafı yükle ─────────────────────────────────────────────────
  const pickCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin ver.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0] || !user?.id) return;

    setUploadingCover(true);
    try {
      const asset    = result.assets[0];
      const ext      = asset.uri.split('.').pop() ?? 'jpg';
      const filePath = `covers/${user.id}_${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob     = await response.blob();

      // covers bucket'ı yoksa avatars'a yedekliyoruz
      let bucket = 'covers';
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, { contentType: `image/${ext}`, upsert: true });

      if (upErr) {
        // Bucket bulunamadı — avatars bucket'ına yükle
        if (upErr.message?.includes('Bucket not found') || upErr.message?.includes('not found')) {
          bucket = 'avatars';
          const { error: upErr2 } = await supabase.storage
            .from(bucket)
            .upload(filePath, blob, { contentType: `image/${ext}`, upsert: true });
          if (upErr2) throw upErr2;
        } else {
          throw upErr;
        }
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setCoverUrl(urlData.publicUrl);
      toast.success('Kapak fotoğrafı yüklendi ✓');
    } catch {
      toast.error('Kapak fotoğrafı yüklenemedi');
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCover = () => {
    Alert.alert('Kapak Fotoğrafını Kaldır', 'Kapak fotoğrafı silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kaldır', style: 'destructive', onPress: () => setCoverUrl('') },
    ]);
  };

  // Sync when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setUsername(profile.username  ?? '');
      setBio((profile as any).bio   ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
      setCoverUrl((profile as any).cover_url ?? '');
      if (profile.avatar_url) setShowUrlInput(true);
    }
  }, [profile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = 'İsim en az 2 karakter olmalıdır.';
    if (!username.trim() || username.trim().length < 3)
      e.username = 'Kullanıcı adı en az 3 karakter olmalıdır.';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
      e.username = 'Sadece harf, rakam ve _ kullanılabilir.';
    if (bio.length > 160)
      e.bio = 'Biyografi en fazla 160 karakter olabilir.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate() || !user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name:  fullName.trim(),
          username:   username.trim().toLowerCase(),
          bio:        bio.trim(),
          avatar_url: avatarUrl.trim() || null,
          cover_url:  coverUrl.trim()  || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          setErrors({ username: 'Bu kullanıcı adı zaten alınmış.' });
        } else {
          toast.error('Kaydedilemedi: ' + error.message);
        }
        return;
      }

      await refreshProfile();
      toast.success('Profil güncellendi ✓');
      navigation.goBack();
    } catch {
      toast.error('Bir hata oluştu. Tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  const avatarSeed    = username || user?.id || 'user';
  const displayAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&size=120`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>Profili Düzenle</Text>
        <Pressable onPress={save} style={s.saveBtn} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#007AFF" />
            : <Text style={s.saveTxt}>Kaydet</Text>
          }
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Kapak fotoğrafı ─────────────────────────────────────────────── */}
        <View style={s.coverSection}>
          <Pressable style={s.coverWrap} onPress={pickCover} disabled={uploadingCover}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={s.coverImg} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#0D1F3C', '#1A3A6C', '#0D1F3C']}
                style={s.coverPlaceholder}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.4)" />
                <Text style={s.coverPlaceholderTxt}>Kapak Fotoğrafı Ekle</Text>
                <Text style={s.coverPlaceholderSub}>16:9 oranında önerilir</Text>
              </LinearGradient>
            )}

            {/* Düzenle overlay */}
            <View style={s.coverEditOverlay}>
              {uploadingCover
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={16} color="#fff" />
              }
              <Text style={s.coverEditTxt}>{coverUrl ? 'Değiştir' : 'Fotoğraf Ekle'}</Text>
            </View>
          </Pressable>

          {/* Kapağı kaldır */}
          {coverUrl ? (
            <Pressable style={s.removeCoverBtn} onPress={removeCover}>
              <Ionicons name="trash-outline" size={13} color="#FF3B3B" />
              <Text style={s.removeCoverTxt}>Kapağı Kaldır</Text>
            </Pressable>
          ) : null}
        </View>

        {/* ── Avatar ──────────────────────────────────────────────────────── */}
        <View style={s.avatarSection}>
          <Pressable style={s.avatarWrap} onPress={pickAvatar} disabled={uploadingAvt}>
            <Image source={{ uri: displayAvatar }} style={s.avatar} />
            <View style={s.avatarEdit}>
              {uploadingAvt
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={14} color="#fff" />
              }
            </View>
          </Pressable>
          <Text style={s.avatarHint}>Profil fotoğrafını değiştir</Text>
        </View>

        {/* Avatar URL — yalnızca manuel URL girişi istenirse göster */}
        {avatarUrl.startsWith('http') ? null : (
          !showUrlInput ? (
            <Pressable style={s.pasteUrlBtn} onPress={() => setShowUrlInput(true)}>
              <Ionicons name="link-outline" size={14} color={colors.textMuted} />
              <Text style={s.pasteUrlTxt}>URL ile fotoğraf ekle (isteğe bağlı)</Text>
            </Pressable>
          ) : (
            <Field
              label="Fotoğraf URL'si"
              placeholder="https://..."
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              error={errors.avatarUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          )
        )}

        {/* Full name */}
        <Field
          label="Ad Soyad"
          placeholder="Adın ve soyadın"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
        />

        {/* Username */}
        <Field
          label="Kullanıcı Adı"
          placeholder="ornek_kullanici"
          value={username}
          onChangeText={text => setUsername(text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
          error={errors.username}
          autoCapitalize="none"
          prefix="@"
        />

        {/* Bio */}
        <View style={s.fieldWrap}>
          <Text style={s.label}>Biyografi</Text>
          <TextInput
            style={[s.input, s.bioInput, errors.bio ? s.inputError : null]}
            placeholder="Kendini tanıt... (maks. 160 karakter)"
            placeholderTextColor={colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={160}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{bio.length}/160</Text>
          {errors.bio && <Text style={s.errorTxt}>{errors.bio}</Text>}
        </View>

        {/* Email (read-only) */}
        <View style={s.fieldWrap}>
          <Text style={s.label}>E-posta (değiştirilemez)</Text>
          <View style={[s.input, s.readOnly]}>
            <Text style={s.readOnlyTxt}>{user?.email}</Text>
            <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          </View>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────
interface FieldProps {
  label:           string;
  placeholder:     string;
  value:           string;
  onChangeText:    (t: string) => void;
  error?:          string;
  prefix?:         string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:   'default' | 'url' | 'email-address';
}

function Field({ label, placeholder, value, onChangeText, error, prefix, autoCapitalize, keyboardType }: FieldProps) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, error ? s.inputError : null]}>
        {prefix && <Text style={s.prefix}>{prefix}</Text>}
        <TextInput
          style={[s.input, s.inputFlex]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize ?? 'words'}
          keyboardType={keyboardType ?? 'default'}
        />
      </View>
      {error && <Text style={s.errorTxt}>{error}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingBottom:     12,
    backgroundColor:   colors.bgPure,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  saveBtn:     { minWidth: 60, alignItems: 'flex-end', justifyContent: 'center', height: 36 },
  saveTxt:     { color: '#007AFF', fontSize: 16, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingTop: 0 },

  // ── Cover ────────────────────────────────────────────────────────────────
  coverSection:   { marginHorizontal: -20, marginBottom: 0 },
  coverWrap:      { width: '100%', height: 160, overflow: 'hidden', position: 'relative' },
  coverImg:       { width: '100%', height: '100%' },
  coverPlaceholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  coverPlaceholderTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  coverPlaceholderSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  coverEditOverlay: {
    position: 'absolute', bottom: 10, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5,
  },
  coverEditTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  removeCoverBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 20,
    backgroundColor: '#FF3B3B10',
  },
  removeCoverTxt: { fontSize: 12, color: '#FF3B3B', fontWeight: '600' },

  // ── Avatar ───────────────────────────────────────────────────────────────
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
  avatarWrap:    { position: 'relative' },
  avatar:        { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.bgInput },
  avatarEdit: {
    position:        'absolute',
    bottom:           0, right: 0,
    width:            28, height:          28,
    borderRadius:     14,
    backgroundColor: '#007AFF',
    alignItems:      'center', justifyContent: 'center',
    borderWidth:      2, borderColor: colors.bg,
  },
  avatarHint: { color: colors.textMuted, fontSize: 12, marginTop: 8 },

  fieldWrap:  { marginBottom: 18 },
  label:      {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7,
  },
  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   colors.bgInput,
    borderRadius:      radius.md,
    borderWidth:       1,
    borderColor:       colors.border,
    paddingHorizontal: 14,
  },
  prefix:    { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginRight: 4 },
  input: {
    backgroundColor:   colors.bgInput,
    borderRadius:      radius.md,
    borderWidth:       1,
    borderColor:       colors.border,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             colors.text,
  },
  inputFlex:  {
    flex: 1, borderWidth: 0,
    paddingHorizontal: 0, paddingVertical: 11,
    backgroundColor: 'transparent',
  },
  inputError: { borderColor: '#FF3B3B' },
  bioInput:   { height: 100, paddingTop: 12 },
  charCount:  { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  errorTxt:   { color: '#FF3B3B', fontSize: 12, marginTop: 4 },

  readOnly: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    opacity:         0.6,
  },
  readOnlyTxt: { color: colors.textMuted, fontSize: 15 },

  pasteUrlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, marginBottom: 14,
  },
  pasteUrlTxt: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
});
