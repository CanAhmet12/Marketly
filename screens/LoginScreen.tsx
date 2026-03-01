import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../constants/theme';

interface LoginScreenProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
  externalError?: string | null;
  onClearError?: () => void;
}

export function LoginScreen({ onSubmit, onSwitchToRegister, onSuccess, onBack, externalError, onClearError }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const btnScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  const error = externalError || localError;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorShake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const animateBtn = (toValue: number) => {
    Animated.spring(btnScale, { toValue, useNativeDriver: true, speed: 50 }).start();
  };

  const handleSubmit = async () => {
    setLocalError(null);
    onClearError?.();
    if (!email.trim()) { setLocalError('E-posta adresi boş olamaz.'); return; }
    if (!password) { setLocalError('Şifre boş olamaz.'); return; }
    setLoading(true);
    try {
      const success = await onSubmit(email.trim(), password);
      if (success) onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        {onBack && (
          <Pressable onPress={onBack} style={s.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
        )}

        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logoBox}>
            <View style={s.bars}>
              <View style={[s.bar, { height: 8 }]} />
              <View style={[s.bar, { height: 13 }]} />
              <View style={[s.bar, { height: 18 }]} />
              <View style={[s.bar, { height: 13 }]} />
            </View>
          </View>
          <Text style={s.appName}>marketly</Text>
          <Text style={s.tagline}>Finans. İçerik. Topluluk.</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Tekrar hoş geldiniz</Text>
          <Text style={s.cardSub}>Hesabınıza giriş yapın</Text>

          {/* Error banner */}
          {error && (
            <Animated.View style={[s.errorBanner, { transform: [{ translateX: errorShake }] }]}>
              <Ionicons name="alert-circle" size={16} color={colors.fall} />
              <Text style={s.errorTxt}>{error}</Text>
            </Animated.View>
          )}

          {/* Inputs */}
          <View style={s.fieldGroup}>
            <View style={[s.inputWrap, focusedField === 'email' && s.inputFocused]}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? colors.primary : colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="E-posta adresi"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[s.inputWrap, focusedField === 'pass' && s.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'pass' ? colors.primary : colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Şifre"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setFocusedField('pass')}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable style={s.forgotRow}>
            <Text style={s.forgotTxt}>Şifremi Unuttum</Text>
          </Pressable>

          {/* Login button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              onPressIn={() => animateBtn(0.97)}
              onPressOut={() => animateBtn(1)}
            >
              {loading
                ? <Text style={s.submitBtnTxt}>Giriş yapılıyor...</Text>
                : (
                  <View style={s.submitBtnInner}>
                    <Text style={s.submitBtnTxt}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                  </View>
                )
              }
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>veya</Text>
            <View style={s.divLine} />
          </View>

          {/* Social login */}
          <View style={s.socialRow}>
            <Pressable style={s.socialBtn}>
              <Text style={s.socialIcon}>G</Text>
              <Text style={s.socialTxt}>Google</Text>
            </Pressable>
            <Pressable style={s.socialBtn}>
              <Ionicons name="logo-apple" size={18} color={colors.text} />
              <Text style={s.socialTxt}>Apple</Text>
            </Pressable>
          </View>
        </View>

        {/* Switch */}
        <View style={s.switchRow}>
          <Text style={s.switchTxt}>Hesabınız yok mu? </Text>
          <Pressable onPress={onSwitchToRegister}>
            <Text style={s.switchLink}>Ücretsiz Kayıt Ol</Text>
          </Pressable>
        </View>

        {/* Trust signals */}
        <View style={s.trustRow}>
          {['🔒 SSL Güvenli', '✦ KVKK Uyumlu', '⚡ Anlık veri'].map((t) => (
            <View key={t} style={s.trustItem}>
              <Text style={s.trustTxt}>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgPure, alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...shadow.sm },

  // Brand
  brand: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...shadow.md,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 5, borderRadius: 3, backgroundColor: '#FFF' },
  appName: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  // Card
  card: {
    backgroundColor: colors.bgPure, borderRadius: radius.lg,
    padding: 22, marginBottom: 20, ...shadow.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },

  // Inputs
  fieldGroup: { gap: 10, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgInput, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: 'transparent',
    paddingHorizontal: 12, height: 50,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.text },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 18, marginTop: 4 },
  forgotTxt: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Submit button
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    height: 52, alignItems: 'center', justifyContent: 'center',
    ...shadow.md, shadowColor: colors.primary,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divTxt: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  // Social
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, height: 46, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.bgPure,
  },
  socialIcon: { fontSize: 15, fontWeight: '900', color: '#EA4335' },
  socialTxt: { fontSize: 14, fontWeight: '600', color: colors.text },

  // Switch
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  switchTxt: { fontSize: 14, color: colors.textMuted },
  switchLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.fallLight, borderRadius: radius.sm,
    padding: 10, marginBottom: 14, borderWidth: 1, borderColor: colors.fall + '40',
  },
  errorTxt: { flex: 1, fontSize: 13, color: colors.fall, fontWeight: '600' },

  // Trust
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
  trustItem: {},
  trustTxt: { fontSize: 11, color: colors.textMuted },
});
