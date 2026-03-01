import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** Single shimmer bone */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#E0E3EB', opacity },
        style,
      ]}
    />
  );
}

/** Pre-built skeleton for a video feed card */
export function VideoCardSkeleton() {
  return (
    <View style={sk.videoCard}>
      <Skeleton height={160} borderRadius={14} style={{ marginBottom: 10 }} />
      <Skeleton width="75%" height={14} borderRadius={7} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={12} borderRadius={6} />
    </View>
  );
}

/** Pre-built skeleton for a horizontal asset row */
export function AssetRowSkeleton() {
  return (
    <View style={sk.assetRow}>
      <Skeleton width={42} height={42} borderRadius={21} />
      <View style={sk.assetMid}>
        <Skeleton width="60%" height={13} borderRadius={6} style={{ marginBottom: 5 }} />
        <Skeleton width="40%" height={11} borderRadius={5} />
      </View>
      <View style={sk.assetRight}>
        <Skeleton width={64} height={13} borderRadius={6} style={{ marginBottom: 5 }} />
        <Skeleton width={48} height={20} borderRadius={10} />
      </View>
    </View>
  );
}

/** Pre-built skeleton for a creator/profile row */
export function CreatorRowSkeleton() {
  return (
    <View style={sk.creatorRow}>
      <Skeleton width={46} height={46} borderRadius={23} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="55%" height={13} borderRadius={6} />
        <Skeleton width="40%" height={11} borderRadius={5} />
      </View>
      <Skeleton width={72} height={32} borderRadius={16} />
    </View>
  );
}

/** Feed page skeleton - full HomeScreen loading */
export function FeedSkeleton() {
  return (
    <View style={sk.feed}>
      {/* Header */}
      <View style={sk.headerRow}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <Skeleton width={120} height={24} borderRadius={12} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>
      </View>
      {/* Ticker bar */}
      <Skeleton height={36} borderRadius={0} style={{ marginBottom: 8 }} />
      {/* Chips */}
      <View style={sk.chipRow}>
        {[60, 50, 70, 45, 55].map((w, i) => (
          <Skeleton key={i} width={w} height={28} borderRadius={14} />
        ))}
      </View>
      {/* Featured card */}
      <View style={{ paddingHorizontal: 8 }}>
        <Skeleton height={220} borderRadius={16} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} borderRadius={8} style={{ marginBottom: 6 }} />
        <Skeleton width="45%" height={12} borderRadius={6} style={{ marginBottom: 12 }} />
      </View>
      {/* Grid */}
      <View style={sk.grid}>
        <View style={{ flex: 56 }}>
          <Skeleton height={130} borderRadius={12} style={{ marginBottom: 6 }} />
          <Skeleton width="65%" height={12} borderRadius={6} />
        </View>
        <View style={{ flex: 44 }}>
          <Skeleton height={130} borderRadius={12} style={{ marginBottom: 6 }} />
          <Skeleton width="65%" height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  videoCard: { padding: 12 },
  assetRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  assetMid: { flex: 1 },
  assetRight: { alignItems: 'flex-end', gap: 4 },
  creatorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  feed: { flex: 1, backgroundColor: '#F4F4F4' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFF', gap: 8,
  },
  chipRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFF', marginBottom: 6,
  },
  grid: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 8, marginTop: 8,
  },
});
