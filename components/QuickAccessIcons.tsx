import React from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ITEMS = [
  {
    id: 'trending', label: 'Trending',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#E8FAF0' }]}>
        <Ionicons name="trending-up" size={21} color="#00C853" />
      </View>
    ),
  },
  {
    id: 'bist100', label: 'BIST100',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#E30A17' }]}>
        <Text style={styles.flagTxt}>🇹🇷</Text>
      </View>
    ),
  },
  {
    id: 'bitcoin', label: 'Bitcoin',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#FFF3E0' }]}>
        <Text style={[styles.symbolTxt, { color: '#F7931A' }]}>₿</Text>
      </View>
    ),
  },
  {
    id: 'gold', label: 'Gold',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#FFF8E1' }]}>
        <Text style={styles.goldEmoji}>🥇</Text>
      </View>
    ),
  },
  {
    id: 'nasdaq', label: 'Nasdaq',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#E3F2FD' }]}>
        <Ionicons name="bar-chart" size={20} color="#1565C0" />
      </View>
    ),
  },
  {
    id: 'live', label: 'LIVE',
    render: () => (
      <View style={[styles.circle, { backgroundColor: '#111' }]}>
        <Text style={styles.liveLabelTxt}>LIVE</Text>
        <View style={styles.livePulse} />
      </View>
    ),
  },
];

interface Props { onSelect: (id: string) => void }

export function QuickAccessIcons({ onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.item, idx === ITEMS.length - 1 && { marginRight: 0 }]}
          >
            {item.render()}
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  scroll: {
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontSize: 11, color: '#5A5F6E', fontWeight: '500', marginTop: 5 },
  flagTxt: { fontSize: 22 },
  symbolTxt: { fontSize: 20, fontWeight: '900' },
  goldEmoji: { fontSize: 22 },
  liveLabelTxt: { color: '#00C853', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  livePulse: {
    position: 'absolute',
    bottom: 9, right: 9,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#00C853',
  },
});
