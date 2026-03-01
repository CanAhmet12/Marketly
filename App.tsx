import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider }  from './contexts/ToastContext';
import { TabBarProvider } from './contexts/TabBarContext';
import { ThemeProvider }  from './contexts/ThemeContext';
import { RootNavigator }  from './navigation/RootNavigator';
import { registerForPushNotifications, savePushToken } from './services/notificationService';
import { PriceAlertWatcher } from './components/PriceAlertWatcher';
import { colors } from './constants/theme';

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
    <NavigationContainer theme={NAV_THEME}>
      <TabBarProvider>
        <ToastProvider>
          <RootNavigator />
          <PriceAlertWatcher />
          <StatusBar style="dark" />
        </ToastProvider>
      </TabBarProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
