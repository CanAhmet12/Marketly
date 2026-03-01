import React, { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Share,
  Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { colors, shadow } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const CARD_W = W - 32;
const CARD_H = CARD_W * 1.2; // ~9:7.5 oranı

interface Holding {
  symbol:     string;
  allocation: number;
  color:      string;
}

interface Props {
  totalValue:   number;
  totalPnL:     number;
  totalPnLPct:  number;
  holdings:     Holding[];
  referralCode?: string;
}

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', BNB: '#F3BA2F', SOL: '#9945FF',
  XRP: '#00AAE4', AAPL: '#555555', NVDA: '#76B900', TSLA: '#CC0000',
  MSFT: '#00A4EF', XAU: '#D4AF37',
};
function assetColor(sym: string) { return ASSET_COLORS[sym.toUpperCase()] ?? '#9AA0AF'; }

function fmtUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function PortfolioShareCard({ totalValue, totalPnL, totalPnLPct, holdings, referralCode }: Props) {
  const toast    = useToast();
  const { profile } = useAuth();
  const isUp     = totalPnL >= 0;
  const top5     = holdings.slice(0, 5);

  const handleShare = useCallback(async () => {
    const pct = `${isUp ? '+' : ''}${totalPnLPct.toFixed(1)}%`;
    const val = fmtUSD(totalValue);
    const ref = referralCode ? `\n\n📲 Marketly'e katıl: marketly.io/ref/${referralCode}` : '\n\n📲 Marketly ile yatırım takibi: marketly.io';

    const message = `${isUp ? '📈' : '📉'} Portföy Performansı\n\n` +
      `Toplam Değer: ${val}\n` +
      `Getiri: ${pct} (${isUp ? '+' : ''}${fmtUSD(totalPnL)})\n\n` +
      `🏆 Top Varlıklar:\n` +
      top5.map(h => `• ${h.symbol}: %${h.allocation.toFixed(1)}`).join('\n') +
      ref;

    try {
      await Share.share({ message, title: 'Portföy Performansım' });
    } catch (e) {
      toast.error('Paylaşım başarısız');
    }
  }, [totalValue, totalPnL, totalPnLPct, isUp, top5, referralCode, toast]);

  return (
    <View style={s.wrapper}>
      {/* Share card preview */}
      <View style={[s.card, { width: CARD_W, minHeight: CARD_H * 0.7 }]}>
        <LinearGradient
          colors={isUp ? ['#051A0A', '#0A2E15', '#051A0A'] : ['#1A0505', '#2E0A0A', '#1A0505']}
          style={s.cardGrad}
        >
          {/* Decorative */}
          <View style={[s.deco, { top: -50, right: -50, width: 160 }]} />
          <View style={[s.deco, { bottom: -30, left: 0, width: 100 }]} />

          {/* Header */}
          <View style={s.cardHeader}>
            <View style={s.logoArea}>
              <Text style={s.logoTxt}>M</Text>
            </View>
            <Text style={s.appName}>Marketly</Text>
            <Text style={s.cardDate}>
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* User */}
          <Text style={s.username}>@{profile?.username ?? 'investor'}</Text>

          {/* Main value */}
          <Text style={s.mainValue}>{fmtUSD(totalValue)}</Text>
          <View style={[s.pnlPill, { backgroundColor: isUp ? '#34C75920' : '#FF3B3B20' }]}>
            <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={16} color={isUp ? '#34C759' : '#FF3B3B'} />
            <Text style={[s.pnlTxt, { color: isUp ? '#34C759' : '#FF3B3B' }]}>
              {isUp ? '+' : ''}{totalPnLPct.toFixed(2)}%  ({isUp ? '+' : ''}{fmtUSD(totalPnL)})
            </Text>
          </View>

          {/* Allocation bar */}
          {top5.length > 0 && (
            <>
              <View style={s.allocBar}>
                {top5.map((h, i) => (
                  <View
                    key={h.symbol}
                    style={[s.allocSlice, {
                      flex: h.allocation / 100,
                      backgroundColor: h.color || assetColor(h.symbol),
                      borderTopLeftRadius:    i === 0 ? 4 : 0,
                      borderBottomLeftRadius: i === 0 ? 4 : 0,
                      borderTopRightRadius:    i === top5.length - 1 ? 4 : 0,
                      borderBottomRightRadius: i === top5.length - 1 ? 4 : 0,
                    }]}
                  />
                ))}
              </View>
              <View style={s.legendRow}>
                {top5.map(h => (
                  <View key={h.symbol} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: h.color || assetColor(h.symbol) }]} />
                    <Text style={s.legendTxt}>{h.symbol}</Text>
                    <Text style={s.legendPct}>{h.allocation.toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Footer */}
          <View style={s.cardFooter}>
            <Text style={s.footerTxt}>marketly.io</Text>
            {referralCode && (
              <Text style={s.footerRef}>ref: {referralCode}</Text>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Share button */}
      <Pressable style={s.shareBtn} onPress={handleShare}>
        <LinearGradient
          colors={isUp ? ['#00C853', '#00962E'] : ['#FF3B3B', '#C0392B']}
          style={s.shareBtnGrad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={s.shareTxt}>Portföyü Paylaş</Text>
        </LinearGradient>
      </Pressable>

      {referralCode && (
        <View style={s.refBox}>
          <Ionicons name="gift-outline" size={14} color={colors.primary} />
          <Text style={s.refTxt}>
            Referans kodun: <Text style={s.refCode}>{referralCode}</Text> · Her davet +200 MC
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 12, paddingHorizontal: 16 },

  card:     { borderRadius: 20, overflow: 'hidden', ...shadow.lg },
  cardGrad: { padding: 20, gap: 10, position: 'relative' },
  deco: {
    position: 'absolute', aspectRatio: 1, borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoArea: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center',
  },
  logoTxt:   { fontSize: 14, fontWeight: '900', color: '#fff' },
  appName:   { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1 },
  cardDate:  { fontSize: 10, color: 'rgba(255,255,255,0.4)' },

  username:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  mainValue: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  pnlPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pnlTxt: { fontSize: 15, fontWeight: '800' },

  allocBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 4, gap: 2 },
  allocSlice: { height: '100%' },
  legendRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendTxt:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  legendPct:  { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 4, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerTxt: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  footerRef: { fontSize: 11, color: 'rgba(255,255,255,0.2)' },

  shareBtn:     { width: '100%', borderRadius: 14, overflow: 'hidden' },
  shareBtnGrad: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareTxt:     { color: '#fff', fontSize: 15, fontWeight: '800' },

  refBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryLight, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    width: '100%', borderWidth: 1, borderColor: colors.primary + '30',
  },
  refTxt:  { fontSize: 12, color: colors.textMuted, flex: 1 },
  refCode: { fontWeight: '800', color: colors.primary },
});
