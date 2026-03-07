import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary }  from './components/ErrorBoundary';
import { OfflineBanner }  from './components/OfflineBanner';
import { ToastProvider }    from './contexts/ToastContext';
import { TabBarProvider }   from './contexts/TabBarContext';
import { ThemeProvider }    from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { RootNavigator, DEEP_LINK_CONFIG }  from './navigation/RootNavigator';
import { registerForPushNotifications, savePushToken } from './services/notificationService';
import { PriceAlertWatcher } from './components/PriceAlertWatcher';
import { colors } from './constants/theme';

// ─── Deep link (marketly://) config ───────────────────────────────────────────
const linking = {
  prefixes: [Linking.createURL('/'), 'marketly://'],
  config: DEEP_LINK_CONFIG,
};

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card:       colors.bgPure,
    border:     colors.border,
    text:       colors.text,
  },
};

function AppInner() {
  const { user } = useAuth();
  const notifListener    = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token && user?.id) savePushToken(user.id, token);
    });

    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Bildirim alındı:', notification.request.content.title);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      console.log('Bildirim tıklandı:', data);
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id]);

  return (
    <NavigationContainer theme={NAV_THEME} linking={linking}>
      <TabBarProvider>
        <ToastProvider>
          <RootNavigator />
          <PriceAlertWatcher />
          <OfflineBanner />
          <StatusBar style="dark" />
        </ToastProvider>
      </TabBarProvider>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary screenName="Uygulama">
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <AuthProvider>
              <AppInner />
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
