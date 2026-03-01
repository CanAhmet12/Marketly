import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  data: number[];   // 0-100 relative values
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 64, height = 32 }: Props) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const barW = Math.floor(width / data.length) - 1;

  return (
    <View style={[styles.wrap, { width, height }]}>
      {data.map((v, i) => {
        const h = Math.max(2, ((v - min) / range) * height);
        return (
          <View
            key={i}
            style={{
              width: barW,
              height: h,
              backgroundColor: color,
              borderRadius: 1,
              opacity: 0.55 + (i / data.length) * 0.45,
              alignSelf: 'flex-end',
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    overflow: 'hidden',
  },
});
