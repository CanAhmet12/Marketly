import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { colors, radius, shadow } from '../constants/theme';

export function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase deep link'ten gelen token ile oturumu kur
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const validate = (): string | null => {
    if (newPassword.length < 8) return 'Şifre en az 8 karakter olmalıdır.';
    if (!/[A-Z]/.test(newPassword)) return 'Şifre en az bir büyük harf içermelidir.';
    if (!/[0-9]/.test(newPassword)) return 'Şifre en az bir rakam içermelidir.';
    if (newPassword !== confirmPassword) return 'Şifreler eşleşmiyor.';
    return null;
  };

  const handleReset = async () => {
    const err = validate();
    if (err) { Alert.alert('Geçersiz Şifre', err); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert(
        'Şifre Güncellendi ✅',
        'Yeni şifrenizle giriş yapabilirsiniz.',
        [{ text: 'Giriş Yap', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
      );
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Şifre güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.title}>Şifre Sıfırla</Text>
      </View>

      <View style={s.body}>
        {!sessionReady ? (
          <View style={s.waitingState}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={s.waitingText}>E-posta linki doğrulanıyor…</Text>
            <Text style={s.waitingSubText}>
              Eğer bu ekrana direkt geldiyseniz, lütfen e-postanızdaki linke tekrar tıklayın.
            </Text>
          </View>
        ) : (
          <>
            <Text style={s.subtitle}>
              Yeni şifrenizi girin. En az 8 karakter, bir büyük harf ve bir rakam içermelidir.
            </Text>

            {/* Yeni şifre */}
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Yeni şifre"
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Pressable onPress={() => setShowNew(v => !v)} hitSlop={8}>
                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Şifre tekrar */}
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Şifreyi tekrar girin"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Pressable onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Güncelle butonu */}
            <Pressable
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={s.btnTxt}>Şifreyi Güncelle</Text>
              }
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.bgPure,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: { padding: 2 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  body: { flex: 1, padding: 24 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 28 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgPure, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 14, gap: 10,
    ...shadow.sm,
  },
  inputIcon: { marginRight: 2 },
  input: { flex: 1, fontSize: 15, color: colors.text },

  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    ...shadow.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  waitingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 },
  waitingText: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  waitingSubText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
