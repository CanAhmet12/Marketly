import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated, Pressable,
} from 'react-native';
import { colors, shadow } from '../constants/theme';

export interface Badge {
  id:          string;
  icon:        string;
  label:       string;
  description: string;
  color:       string;
  earned:      boolean;
  earnedDate?: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_step',    icon: '🥇', label: 'İlk Adım',       description: 'İlk sinyali paylaş',          color: '#D4AF37', earned: false },
  { id: 'rising_star',   icon: '📈', label: 'Yükselen Yıldız',description: '100 takipçiye ulaş',          color: '#007AFF', earned: false },
  { id: 'streak_7',      icon: '🔥', label: '7 Gün Streak',    description: '7 gün üst üste giriş yap',   color: '#FF6B2B', earned: false },
  { id: 'expert',        icon: '💎', label: 'Uzman Analist',   description: '%70+ isabetlilik (50+ sinyal)',color: '#9945FF', earned: false },
  { id: 'trend_analyst', icon: '👥', label: 'Trend Analist',   description: '1000 takipçiye ulaş',         color: '#00C853', earned: false },
  { id: 'champion',      icon: '🏆', label: 'Haftalık Şampiyon',description: 'Haftanın en popüler sinyali',color: '#FFB800', earned: false },
  { id: 'portfolio_pro', icon: '💼', label: 'Portföy Pro',     description: 'Portföye 5+ varlık ekle',    color: '#0D1633', earned: false },
  { id: 'early_bird',    icon: '🦅', label: 'Early Bird',      description: 'İlk 1000 kullanıcıdan biri', color: '#E53935', earned: false },
  { id: 'ai_explorer',   icon: '🤖', label: 'AI Kaşifi',       description: 'MarketAI ile 10 soru sor',   color: '#5856D6', earned: false },
  { id: 'signal_100',    icon: '⚡', label: '100+ Sinyal',     description: '100 sinyal paylaş',           color: '#FF9500', earned: false },
];

interface Props {
  earnedIds?:  string[];
  compact?:    boolean;
  onPress?:    (badge: Badge) => void;
}

function BadgeItem({ badge, compact, onPress }: { badge: Badge; compact?: boolean; onPress?: (b: Badge) => void }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!badge.earned) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [badge.earned]);

  const opacity = badge.earned ? 1 : 0.35;
  const size    = compact ? 36 : 52;

  return (
    <Pressable
      style={[s.badgeItem, compact && s.badgeItemCompact]}
      onPress={() => onPress?.(badge)}
    >
      <Animated.View style={[
        s.badgeIcon,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: badge.color + (badge.earned ? '22' : '11'),
          borderColor:     badge.color + (badge.earned ? '60' : '20'),
          opacity,
          shadowOpacity:   badge.earned ? shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }) : 0,
          shadowColor:     badge.color,
          shadowRadius:    8, elevation: badge.earned ? 4 : 0,
        },
      ]}>
        <Text style={[s.badgeEmoji, { fontSize: compact ? 16 : 22 }]}>{badge.icon}</Text>
      </Animated.View>
      {!compact && (
        <Text style={[s.badgeLabel, !badge.earned && { color: colors.textMuted }]} numberOfLines={1}>
          {badge.label}
        </Text>
      )}
    </Pressable>
  );
}

export function BadgesRow({ earnedIds = [], compact = false, onPress }: Props) {
  const badges = ALL_BADGES.map(b => ({ ...b, earned: earnedIds.includes(b.id) }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[s.row, compact && { gap: 8 }]}
    >
      {badges.map(b => (
        <BadgeItem key={b.id} badge={b} compact={compact} onPress={onPress} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 14, paddingVertical: 4 },

  badgeItem:        { alignItems: 'center', gap: 5, width: 58 },
  badgeItemCompact: { width: 42, gap: 0 },

  badgeIcon: {
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  badgeEmoji: {},
  badgeLabel: {
    fontSize: 9.5, fontWeight: '700', color: colors.text,
    textAlign: 'center', lineHeight: 12,
  },
});
