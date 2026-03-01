import React, { ReactNode } from 'react';
import {
  View, Text, Pressable, StyleSheet, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../hooks/useSubscription';
import type { Feature }    from '../hooks/useSubscription';

export type { Feature };

interface Props {
  feature:     Feature;
  children:    ReactNode;
  style?:      ViewStyle;
  label?:      string;      // custom lock message
  subtle?:     boolean;     // show a small lock icon instead of full overlay
}

/**
 * Wraps any content and shows a paywall overlay
 * when the user doesn't have access to `feature`.
 */
export function ProGate({ feature, children, style, label, subtle = false }: Props) {
  const { hasFeature } = useSubscription();
  const navigation     = useNavigation<any>();

  if (hasFeature(feature)) return <>{children}</>;

  if (subtle) {
    return (
      <View style={[styles.subtleWrap, style]}>
        {children}
        <View style={styles.subtleOverlay} pointerEvents="none">
          <Ionicons name="lock-closed" size={14} color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Blurred / dimmed content behind */}
      <View style={styles.lockedContent} pointerEvents="none">
        {children}
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.lockCard}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={28} color="#fff" />
          </View>
          <Text style={styles.lockTitle}>Pro Özelliği</Text>
          <Text style={styles.lockDesc}>
            {label ?? 'Bu özelliği kullanmak için Marketly Pro\'ya geçin.'}
          </Text>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.ctaText}>⚡ Pro'ya Geç</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  lockedContent: {
    opacity: 0.25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius:   12,
  },
  lockCard: {
    alignItems:      'center',
    backgroundColor: '#1C1C2E',
    borderRadius:    16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginHorizontal: 20,
    borderWidth:     1,
    borderColor:     'rgba(0,122,255,0.3)',
    shadowColor:     '#007AFF',
    shadowOpacity:   0.25,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       8,
  },
  lockIcon: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#007AFF',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
  },
  lockTitle: {
    color:          '#fff',
    fontSize:       17,
    fontWeight:     '700',
    marginBottom:   6,
  },
  lockDesc: {
    color:          '#9AA0AF',
    fontSize:       13,
    textAlign:      'center',
    lineHeight:     18,
    marginBottom:   18,
  },
  ctaBtn: {
    backgroundColor: '#007AFF',
    borderRadius:    10,
    paddingVertical: 11,
    paddingHorizontal: 32,
  },
  ctaText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   15,
  },
  // Subtle variant
  subtleWrap: {
    position: 'relative',
  },
  subtleOverlay: {
    position:        'absolute',
    top:             4,
    right:           4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius:    10,
    padding:         3,
  },
});
