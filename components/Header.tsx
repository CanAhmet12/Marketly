import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
  notificationCount?: number;
  avatarUri?: string;
}

export function Header({
  onProfilePress,
  onSearchPress,
  onNotificationPress,
  hasNotification,
  notificationCount = 1,
  avatarUri,
}: Props) {
  return (
    <View style={s.container}>
      {/* Logo */}
      <View style={s.logo}>
        <View style={s.logoIcon}>
          <View style={s.bar1} />
          <View style={s.bar2} />
          <View style={s.bar3} />
        </View>
        <Text style={s.logoText}>
          market<Text style={s.logoAccent}>ly</Text>
        </Text>
      </View>

      {/* Right actions */}
      <View style={s.actions}>
        <Pressable onPress={onSearchPress} style={s.iconBtn}>
          <Ionicons name="search-outline" size={22} color="#1A1A2E" />
        </Pressable>

        <Pressable onPress={onNotificationPress} style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color="#1A1A2E" />
          {hasNotification && (
            <View style={s.notifBadge}>
              <Text style={s.notifTxt}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={onProfilePress} style={s.avatarBtn}>
          <View style={s.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Ionicons name="person" size={14} color="#888" />
              </View>
            )}
          </View>
          <View style={s.onlineDot} />
        </Pressable>
      </View>
    </View>
  );
}

const GREEN = '#00C853';

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },

  // Logo
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { flexDirection: 'row', alignItems: 'flex-end', gap: 2.5 },
  bar1: { width: 3.5, height: 7, borderRadius: 2, backgroundColor: GREEN },
  bar2: { width: 3.5, height: 12, borderRadius: 2, backgroundColor: GREEN },
  bar3: { width: 3.5, height: 17, borderRadius: 2, backgroundColor: GREEN },
  logoText: {
    fontSize: 20, fontWeight: '800', color: '#0F0F1A',
    letterSpacing: -0.8,
  },
  logoAccent: { color: GREEN },

  // Actions
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 14, height: 14, borderRadius: 7,
    backgroundColor: '#FF3B3B',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#FFF',
  },
  notifTxt: { color: '#FFF', fontSize: 7.5, fontWeight: '900' },

  avatarBtn: { position: 'relative', marginLeft: 4 },
  avatarRing: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: GREEN,
    padding: 1.5,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 14 },
  avatarFallback: {
    backgroundColor: '#F0F0F5',
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 0,
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: GREEN, borderWidth: 1.5, borderColor: '#FFF',
  },
});
