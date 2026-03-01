import React, {
  createContext, useContext, useState, useRef, useCallback, ReactNode,
} from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

interface ToastContextType {
  show: (opts: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const CONFIG: Record<ToastType, { bg: string; iconColor: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  success: { bg: '#0D0D0D', iconColor: '#00C853', icon: 'checkmark-circle' },
  error:   { bg: '#0D0D0D', iconColor: '#FF3B3B', icon: 'alert-circle' },
  info:    { bg: '#0D0D0D', iconColor: '#007AFF', icon: 'information-circle' },
  warning: { bg: '#0D0D0D', iconColor: '#FF9500', icon: 'warning' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    idRef.current += 1;
    setToast({ ...opts, id: idRef.current });

    translateY.setValue(80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(hide, opts.duration ?? 2800);
  }, [hide]);

  const success = useCallback((message: string) => show({ message, type: 'success' }), [show]);
  const error   = useCallback((message: string) => show({ message, type: 'error' }),   [show]);
  const info    = useCallback((message: string) => show({ message, type: 'info' }),    [show]);

  const cfg = CONFIG[toast?.type ?? 'info'];

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            t.wrap,
            { bottom: insets.bottom + 80, transform: [{ translateY }], opacity },
          ]}
          pointerEvents="box-none"
        >
          <Pressable style={[t.pill, { backgroundColor: cfg.bg }]} onPress={hide}>
            <Ionicons name={toast.icon ?? cfg.icon} size={18} color={cfg.iconColor} />
            <Text style={t.msg} numberOfLines={2}>{toast.message}</Text>
            <Pressable onPress={hide} hitSlop={10}>
              <Ionicons name="close" size={15} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const t = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 16, right: 16,
    alignItems: 'center', zIndex: 9999,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  msg: { flex: 1, fontSize: 14, color: '#FFF', fontWeight: '600', lineHeight: 18 },
});
