import React, { useRef, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { View, Pressable, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons }                   from '@expo/vector-icons';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import type { BottomTabBarProps }     from '@react-navigation/bottom-tabs';

import { HomeScreen }            from '../screens/HomeScreen';
import { DiscoverScreen }        from '../screens/DiscoverScreen';
import { CreateScreen }          from '../screens/CreateScreen';
import { MarketsScreen }         from '../screens/MarketsScreen';
import { LiveScreen }            from '../screens/LiveScreen';
import { ShortsScreen }          from '../screens/ShortsScreen';
import { ProfileScreen }         from '../screens/ProfileScreen';
import { VideoDetailScreen }     from '../screens/VideoDetailScreen';
import { LoginScreen }           from '../screens/LoginScreen';
import { RegisterScreen }        from '../screens/RegisterScreen';
import { NotificationsScreen }   from '../screens/NotificationsScreen';
import { SearchScreen }          from '../screens/SearchScreen';
import { SettingsScreen }        from '../screens/SettingsScreen';
import { AssetDetailScreen }     from '../screens/AssetDetailScreen';
import { PaywallScreen }         from '../screens/PaywallScreen';
import { OnboardingScreen }      from '../screens/OnboardingScreen';
import { EditProfileScreen }     from '../screens/EditProfileScreen';
import { PortfolioScreen }       from '../screens/PortfolioScreen';
import { LeaderboardScreen }     from '../screens/LeaderboardScreen';
import { PriceAlertsScreen }     from '../screens/PriceAlertsScreen';
import { AIAssistantScreen }     from '../screens/AIAssistantScreen';
import { SignalMarketplaceScreen }  from '../screens/SignalMarketplaceScreen';
import { UserProfileScreen }        from '../screens/UserProfileScreen';
import { LiveBroadcastScreen }      from '../screens/LiveBroadcastScreen';
import { LiveWatchScreen }          from '../screens/LiveWatchScreen';

import { useAuth }              from '../contexts/AuthContext';
import { useTabBar, TAB_BAR_H } from '../contexts/TabBarContext';
import { colors }               from '../constants/theme';
import type { VideoItem }       from '../data/mockVideos';
import type { MarketAsset }     from '../data/mockMarkets';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

export type RootStackParamList = {
  Main:          undefined;
  Onboarding:    undefined;
  VideoDetail:   { item: VideoItem };
  AssetDetail:   { asset: MarketAsset };
  LiveFeed:      undefined;
  LiveBroadcast: { channelName: string; title: string; postId: string };
  LiveWatch:     { channelName: string; postId: string; title: string; hostName: string; hostAvatar: string; viewers?: number };
  Login:         undefined;
  Register:      undefined;
  Notifications: undefined;
  ProfileView:   { userId: string; username?: string };
  Paywall:       undefined;
  EditProfile:   undefined;
  Portfolio:     undefined;
  Leaderboard:   undefined;
  PriceAlerts:   undefined;
  AIAssistant:   undefined;
  SignalMarketplace:  undefined;
  Settings:      undefined;
  Search:        undefined;
  Shorts:        undefined;
};

// ─── Tab config ───────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: string;
  component: React.ComponentType<any>;
  icon: IoniconName;
  activeIcon: IoniconName;
  label: string;
  isCenter?: boolean;
}[] = [
  { name: 'Akış',      component: HomeScreen,    icon: 'home-outline',          activeIcon: 'home',          label: 'Akış'      },
  { name: 'Keşfet',    component: DiscoverScreen, icon: 'compass-outline',       activeIcon: 'compass',       label: 'Keşfet'    },
  { name: 'Üret',      component: CreateScreen,   icon: 'add',                   activeIcon: 'add',           label: 'Üret',  isCenter: true },
  { name: 'Piyasalar', component: MarketsScreen,  icon: 'bar-chart-outline',     activeIcon: 'bar-chart',     label: 'Piyasalar' },
  { name: 'Profil',    component: ProfileScreen,  icon: 'person-circle-outline', activeIcon: 'person-circle', label: 'Profil'    },
];

// ─── Animated single tab item with press-scale ───────────────────────────────
function AnimatedTabItem({ cfg, isFocused, onPress }: {
  cfg: typeof TAB_CONFIG[0];
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, tension: 200, friction: 10 }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  }, [scale]);

  return (
    <Pressable
      style={tb.tabItem}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      android_ripple={{ color: 'transparent' }}
    >
      <Animated.View style={[tb.tabIcon, { transform: [{ scale }] }]}>
        <Ionicons
          name={isFocused ? cfg.activeIcon : cfg.icon}
          size={23}
          color={isFocused ? colors.primary : '#AAAAAA'}
        />
        {isFocused && <View style={tb.activeDot} />}
      </Animated.View>
      <Text style={[tb.tabLabel, isFocused && tb.tabLabelActive]}>{cfg.label}</Text>
    </Pressable>
  );
}

// ─── Animated Custom Tab Bar ──────────────────────────────────────────────────
function AnimatedCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { tabBarY } = useTabBar();
  const insets = useSafeAreaInsets();
  const barHeight = TAB_BAR_H;

  return (
    <Animated.View
      style={[
        tb.bar,
        {
          height: barHeight,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          transform: [{ translateY: tabBarY }],
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const cfg = TAB_CONFIG.find((c) => c.name === route.name);
        if (!cfg) return null;

        const isFocused = state.index === index;
        const isCenter  = cfg.isCenter === true;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (isCenter) {
          return (
            <View key={route.key} style={tb.centerWrap}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => [tb.centerBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.92 }] }]}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </Pressable>
              <Text style={tb.centerLabel}>Üret</Text>
            </View>
          );
        }

        return (
          <AnimatedTabItem
            key={route.key}
            cfg={cfg}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </Animated.View>
  );
}

const tb = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EBEBEB',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2,
  },
  tabIcon: { alignItems: 'center', marginBottom: 2 },
  activeDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary,
    marginTop: 2,
  },
  tabLabel: { fontSize: 10.5, fontWeight: '600', color: '#AAAAAA' },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
  centerWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 0,
  },
  centerBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6,
    elevation: 6, marginTop: -14,
  },
  centerLabel: { fontSize: 10.5, fontWeight: '600', color: '#AAAAAA', marginTop: 2 },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="VideoDetail"
        component={VideoDetailScreenWrapper}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="AssetDetail"
        component={AssetDetailScreenWrapper}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="LiveFeed"      component={LiveScreen}  options={{ animation: 'fade' }} />
      <Stack.Screen
        name="LiveBroadcast"
        component={LiveBroadcastScreen}
        options={{ animation: 'fade', presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="LiveWatch"
        component={LiveWatchScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="Login"         component={LoginScreenWrapper} />
      <Stack.Screen name="Register"      component={RegisterScreenWrapper} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreenWrapper}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Shorts"
        component={ShortsScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreenWrapper}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PriceAlerts"
        component={PriceAlertsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="SignalMarketplace"
        component={SignalMarketplaceScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProfileView"
        component={UserProfileScreenWrapper}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// ─── Wrappers ─────────────────────────────────────────────────────────────────
function VideoDetailScreenWrapper({ navigation, route }: any) {
  const { item } = route.params || {};
  if (!item) return null;
  return <VideoDetailScreen item={item} onBack={() => navigation.goBack()} />;
}

function AssetDetailScreenWrapper({ navigation, route }: any) {
  const { asset } = route.params || {};
  if (!asset) return null;
  return <AssetDetailScreen asset={asset} onBack={() => navigation.goBack()} />;
}

function LoginScreenWrapper({ navigation }: any) {
  const { login, error, clearError } = useAuth();
  return (
    <LoginScreen
      onSubmit={login}
      onSwitchToRegister={() => { clearError(); navigation.replace('Register'); }}
      onSuccess={() => navigation.goBack()}
      onBack={() => { clearError(); navigation.goBack(); }}
      externalError={error}
      onClearError={clearError}
    />
  );
}

function RegisterScreenWrapper({ navigation }: any) {
  const { register, error, clearError } = useAuth();
  return (
    <RegisterScreen
      onSubmit={register}
      onSwitchToLogin={() => { clearError(); navigation.replace('Login'); }}
      onSuccess={() => navigation.replace('Onboarding')}
      onBack={() => { clearError(); navigation.goBack(); }}
      externalError={error}
      onClearError={clearError}
    />
  );
}

function NotificationsScreenWrapper({ navigation }: any) {
  return <NotificationsScreen onBack={() => navigation.goBack()} />;
}

function SearchScreenWrapper({ navigation }: any) {
  return <SearchScreen onBack={() => navigation.goBack()} />;
}

function UserProfileScreenWrapper({ navigation, route }: any) {
  const { userId } = route.params || {};
  if (!userId) return null;
  return <UserProfileScreen userId={userId} onBack={() => navigation.goBack()} />;
}
