import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  screenName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ errorInfo: info.componentStack ?? null });
    console.error(`[ErrorBoundary${this.props.screenName ? ':' + this.props.screenName : ''}]`, error, info);

    // Supabase'e arka planda log gönder (başarısızlık sessiz geçer)
    try {
      supabase.from('error_logs').insert({
        screen:     this.props.screenName ?? 'unknown',
        message:    error.message,
        stack:      error.stack?.slice(0, 2000) ?? null,
        component_stack: info.componentStack?.slice(0, 2000) ?? null,
        platform:   Platform.OS,
        app_version: null,
        created_at: new Date().toISOString(),
      }).then(() => {});
    } catch {}
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={s.container}>
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Ionicons name="warning-outline" size={48} color="#FF9500" />
            </View>
            <Text style={s.title}>Bir şeyler ters gitti</Text>
            <Text style={s.subtitle}>
              {this.props.screenName
                ? `${this.props.screenName} yüklenirken beklenmedik bir hata oluştu.`
                : 'Bu bölüm yüklenirken beklenmedik bir hata oluştu.'}
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={s.devBox} showsVerticalScrollIndicator={false}>
                <Text style={s.devError}>{this.state.error.message}</Text>
                {this.state.errorInfo && (
                  <Text style={s.devStack} numberOfLines={8}>
                    {this.state.errorInfo}
                  </Text>
                )}
              </ScrollView>
            )}

            <Pressable style={s.retryBtn} onPress={this.handleRetry}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={s.retryTxt}>Tekrar Dene</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.bgPure,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FF950018',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title:    { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  devBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    maxHeight: 160,
    marginTop: 4,
  },
  devError: { color: '#FF6B6B', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  devStack: { color: '#A0A0C0', fontSize: 10, lineHeight: 16 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  retryTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
