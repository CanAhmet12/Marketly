import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../constants/theme';

interface RegisterScreenProps {
  onSubmit: (name: string, email: string, password: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
  externalError?: string | null;
  onClearError?: () => void;
}

function getPasswordStrength(p: string): { level: number; label: string; color: string } {
  if (p.length === 0) return { level: 0, label: '', color: '#E0E0E0' };
  if (p.length < 6) return { level: 1, label: 'Zayıf', color: colors.fall };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { level: 2, label: 'Orta', color: colors.warning };
  return { level: 3, label: 'Güçlü', color: colors.rise };
}

export function RegisterScreen({ onSubmit, onSwitchToLogin, onSuccess, onBack, externalError, onClearError }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
        Animated.timing(errorShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const strength = getPasswordStrength(password);
  const animateBtn = (v: number) =>
    Animated.spring(btnScale, { toValue: v, useNativeDriver: true, speed: 50 }).start();

  const handleSubmit = async () => {
    setLocalError(null);
    onClearError?.();
    if (!agreed) { setLocalError('Kullanım koşullarını kabul etmelisiniz.'); return; }
    if (!name.trim()) { setLocalError('Ad Soyad boş olamaz.'); return; }
    if (!email.trim()) { setLocalError('E-posta adresi boş olamaz.'); return; }
    if (!password) { setLocalError('Şifre boş olamaz.'); return; }
    setLoading(true);
    try {
      const success = await onSubmit(name.trim(), email.trim(), password);
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
          <Text style={s.tagline}>Binlerce yatırımcıya katıl</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Hesap Oluştur</Text>
          <Text style={s.cardSub}>Hepsi ücretsiz, hemen başla</Text>

          {/* Error banner */}
          {error && (
            <Animated.View style={[s.errorBanner, { transform: [{ translateX: errorShake }] }]}>
              <Ionicons name="alert-circle" size={16} color={colors.fall} />
              <Text style={s.errorTxt}>{error}</Text>
            </Animated.View>
          )}

          {/* Perk pills */}
          <View style={s.perkRow}>
            {['📈 Canlı piyasa', '🎯 AI sinyaller', '👥 Topluluk'].map((p) => (
              <View key={p} style={s.perkPill}>
                <Text style={s.perkTxt}>{p}</Text>
              </View>
            ))}
          </View>

          {/* Fields */}
          <View style={s.fieldGroup}>
            <View style={[s.inputWrap, focusedField === 'name' && s.inputFocused]}>
              <Ionicons name="person-outline" size={18} color={focusedField === 'name' ? colors.primary : colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Ad Soyad"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

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

            <View>
              <View style={[s.inputWrap, focusedField === 'pass' && s.inputFocused]}>
                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'pass' ? colors.primary : colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Şifre (min. 6 karakter)"
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

              {/* Password strength bar */}
              {password.length > 0 && (
                <View style={s.strengthWrap}>
                  <View style={s.strengthBar}>
                    {[1, 2, 3].map((l) => (
                      <View
                        key={l}
                        style={[
                          s.strengthSegment,
                          { backgroundColor: strength.level >= l ? strength.color : colors.border },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Terms */}
          <Pressable style={s.termsRow} onPress={() => setAgreed(!agreed)}>
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={11} color="#FFF" />}
            </View>
            <Text style={s.termsTxt}>
              <Text style={s.termsLink}>Kullanım Koşulları</Text>
              {' '}ve{' '}
              <Text style={s.termsLink}>Gizlilik Politikası</Text>
              {"'nı kabul ediyorum"}
            </Text>
          </Pressable>

          {/* Submit */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[s.submitBtn, (loading || !agreed) && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading || !agreed}
              onPressIn={() => animateBtn(0.97)}
              onPressOut={() => animateBtn(1)}
            >
              {loading
                ? <Text style={s.submitBtnTxt}>Kayıt yapılıyor...</Text>
                : (
                  <View style={s.submitBtnInner}>
                    <Text style={s.submitBtnTxt}>Kayıt Ol — Ücretsiz</Text>
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

          {/* Social */}
          <View style={s.socialRow}>
            <Pressable style={s.socialBtn}>
              <Text style={s.socialIcon}>G</Text>
              <Text style={s.socialTxt}>Google ile Kayıt</Text>
            </Pressable>
          </View>
        </View>

        {/* Switch */}
        <View style={s.switchRow}>
          <Text style={s.switchTxt}>Zaten hesabınız var mı? </Text>
          <Pressable onPress={onSwitchToLogin}>
            <Text style={s.switchLink}>Giriş Yap</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgPure, alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...shadow.sm },

  brand: { alignItems: 'center', marginBottom: 24, marginTop: 4 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...shadow.md,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 5, borderRadius: 3, backgroundColor: '#FFF' },
  appName: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: colors.bgPure, borderRadius: radius.lg,
    padding: 22, marginBottom: 20, ...shadow.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textMuted, marginBottom: 14 },

  perkRow: { flexDirection: 'row', gap: 6, marginBottom: 18, flexWrap: 'wrap' },
  perkPill: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: radius.full,
  },
  perkTxt: { fontSize: 11, color: colors.primaryDark, fontWeight: '600' },

  fieldGroup: { gap: 10, marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgInput, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: 'transparent',
    paddingHorizontal: 12, height: 50,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.text },

  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 2 },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', width: 40, textAlign: 'right' },

  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsTxt: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  termsLink: { color: colors.primary, fontWeight: '600' },

  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    height: 52, alignItems: 'center', justifyContent: 'center',
    ...shadow.md, shadowColor: colors.primary,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divTxt: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  socialRow: {},
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 46, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.bgPure,
  },
  socialIcon: { fontSize: 15, fontWeight: '900', color: '#EA4335' },
  socialTxt: { fontSize: 14, fontWeight: '600', color: colors.text },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchTxt: { fontSize: 14, color: colors.textMuted },
  switchLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.fallLight, borderRadius: radius.sm,
    padding: 10, marginBottom: 14, borderWidth: 1, borderColor: colors.fall + '40',
  },
  errorTxt: { flex: 1, fontSize: 13, color: colors.fall, fontWeight: '600' },
});
