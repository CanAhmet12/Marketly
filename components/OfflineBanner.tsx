import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const translateY = useRef(new Animated.Value(-60)).current;
  const prevOffline = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkNet = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const offline = !state.isConnected || !state.isInternetReachable;

        if (offline && !prevOffline.current) {
          // Yeni çevrimdışı
          setIsOffline(true);
          setShowOnline(false);
          Animated.spring(translateY, {
            toValue: 0, useNativeDriver: true, speed: 20,
          }).start();
        } else if (!offline && prevOffline.current) {
          // Bağlantı geri geldi
          setIsOffline(false);
          setShowOnline(true);
          Animated.spring(translateY, {
            toValue: 0, useNativeDriver: true, speed: 20,
          }).start();
          setTimeout(() => {
            Animated.spring(translateY, {
              toValue: -60, useNativeDriver: true, speed: 15,
            }).start(() => setShowOnline(false));
          }, 2500);
        } else if (offline) {
          // Hâlâ çevrimdışı, banner açık kalsın
          Animated.spring(translateY, {
            toValue: 0, useNativeDriver: true, speed: 20,
          }).start();
        } else if (!offline && !prevOffline.current) {
          // İlk yükleme ve çevrimiçi — gizle
          Animated.timing(translateY, {
            toValue: -60, duration: 0, useNativeDriver: true,
          }).start();
        }

        prevOffline.current = offline;
      } catch {}
    };

    checkNet();
    interval = setInterval(checkNet, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline && !showOnline) return null;

  return (
    <Animated.View
      style={[
        s.banner,
        { backgroundColor: showOnline ? '#34C759' : '#FF3B3B' },
        { transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name={showOnline ? 'wifi' : 'wifi-outline'}
        size={16}
        color="#fff"
      />
      <Text style={s.txt}>
        {showOnline ? 'Bağlantı geri geldi' : 'İnternet bağlantısı yok'}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingTop: 44, // SafeArea top için
  },
  txt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
