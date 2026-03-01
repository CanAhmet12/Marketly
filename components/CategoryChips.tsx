import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';

const CATS = [
  { id: 'For You',     label: 'For You' },
  { id: 'Stocks',      label: 'Stocks' },
  { id: 'Crypto',      label: 'Crypto' },
  { id: 'Commodities', label: 'Commodities' },
  { id: 'LIVE',        label: 'LIVE' },
];

interface Props {
  selected: string;
  onSelect: (c: string) => void;
}

export function CategoryChips({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CATS.map((cat) => {
          const active = selected === cat.id;
          const isLive = cat.id === 'LIVE';
          return (
            <Pressable key={cat.id} onPress={() => onSelect(cat.id)} style={styles.chipWrap}>
              <Text
                style={[
                  styles.chipTxt,
                  active && !isLive && styles.chipTxtActive,
                  isLive && styles.liveTxt,
                  isLive && active && styles.liveTxtActive,
                ]}
              >
                {cat.label}
              </Text>
              {active && !isLive && <View style={styles.underline} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 0,
    gap: 4,
    alignItems: 'flex-start',
  },
  chipWrap: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    position: 'relative',
    marginRight: 2,
  },
  chipTxt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9AA0AF',
  },
  chipTxtActive: {
    color: '#0D0D0D',
    fontWeight: '700',
  },
  liveTxt: {
    color: '#00C853',
    fontWeight: '700',
  },
  liveTxtActive: {
    color: '#00C853',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#00C853',
    borderRadius: 2,
  },
});
