import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMarketCoin } from '../hooks/useMarketCoin';
import { useToast } from '../contexts/ToastContext';
import { shadow, colors } from '../constants/theme';

const EARN_WAYS = [
  { icon: '📊', action: 'Günlük görev tamamla',  reward: '+50 MC',  color: '#007AFF' },
  { icon: '🔥', action: '7 günlük streak',        reward: '+200 MC', color: '#FF6B2B' },
  { icon: '⚡', action: 'Sinyal paylaş',          reward: '+100 MC', color: '#9945FF' },
  { icon: '❤️', action: 'Gönderi beğen (x5)',     reward: '+20 MC',  color: '#FF3B3B' },
  { icon: '👥', action: 'Referansla yeni üye',    reward: '+200 MC', color: '#00C853' },
  { icon: '🎯', action: 'Kazanan sinyal',         reward: '+300 MC', color: '#FFB800' },
];

const SPEND_WAYS = [
  { icon: '🎁', action: 'Creator\'a bahşiş gönder',   cost: '50 MC',  color: '#FF9500' },
  { icon: '🔓', action: 'Premium içerik aç',           cost: '100 MC', color: '#007AFF' },
  { icon: '✨', action: 'Gönderi öne çıkar',           cost: '200 MC', color: '#9945FF' },
  { icon: '🏆', action: 'Liderboard boost',            cost: '500 MC', color: '#FFB800' },
];

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa`;
  return `${Math.floor(h / 24)} gün`;
}

const DAILY_REWARD_KEY = 'mc_last_daily_claim';
const DAILY_REWARD_MC  = 50;

export function MarketCoinScreen() {
  const insets        = useSafeAreaInsets();
  const navigation    = useNavigation<any>();
  const toast         = useToast();
  const { balance, transactions, loading, earn } = useMarketCoin();
  const [canClaim,   setCanClaim]   = useState(false);
  const [claiming,   setClaiming]   = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(DAILY_REWARD_KEY).then((last) => {
      if (!last) { setCanClaim(true); return; }
      const diff = Date.now() - parseInt(last, 10);
      setCanClaim(diff >= 86_400_000); // 24 saat
    });
  }, []);

  const claimDaily = async () => {
    if (!canClaim || claiming) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim,  { toValue: 1,    useNativeDriver: true, tension: 200 }),
    ]).start();
    setClaiming(true);
    const ok = await earn(DAILY_REWARD_MC, 'Günlük ödül');
    if (ok) {
      await AsyncStorage.setItem(DAILY_REWARD_KEY, Date.now().toString());
      setCanClaim(false);
      toast.success(`+${DAILY_REWARD_MC} MC kazandın! 🎉`);
    } else {
      toast.error('Ödül alınamadı, tekrar dene.');
    }
    setClaiming(false);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>MarketCoin</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <LinearGradient colors={['#1A1050', '#0D1F3C', '#0A0A1A']} style={s.balanceGrad}>
            {/* Decorative circles */}
            <View style={[s.circle, { top: -40, right: -40, width: 130, opacity: 0.08 }]} />
            <View style={[s.circle, { bottom: -20, left: 20, width: 80, opacity: 0.06 }]} />

            <View style={s.coinIconWrap}>
              <Text style={s.coinIcon}>🪙</Text>
            </View>
            <Text style={s.balanceLabel}>Bakiye</Text>
            {loading
              ? <ActivityIndicator color="#FFD700" style={{ marginVertical: 8 }} />
              : <Text style={s.balanceValue}>{balance.toLocaleString('tr-TR')}</Text>
            }
            <Text style={s.coinName}>MarketCoin</Text>

            <View style={s.balanceStats}>
              <View style={s.balStat}>
                <Text style={s.balStatVal}>
                  {transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString()}
                </Text>
                <Text style={s.balStatLbl}>Kazanılan</Text>
              </View>
              <View style={s.balStatDivider} />
              <View style={s.balStat}>
                <Text style={s.balStatVal}>
                  {Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toLocaleString()}
                </Text>
                <Text style={s.balStatLbl}>Harcanan</Text>
              </View>
              <View style={s.balStatDivider} />
              <View style={s.balStat}>
                <Text style={s.balStatVal}>{transactions.length}</Text>
                <Text style={s.balStatLbl}>İşlem</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Reward */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎁 Günlük Ödül</Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={[s.dailyBtn, !canClaim && s.dailyBtnClaimed]}
              onPress={claimDaily}
              disabled={!canClaim || claiming}
            >
              <LinearGradient
                colors={canClaim ? ['#FFD700', '#FF9500'] : ['#3A3A4A', '#2A2A3A']}
                style={s.dailyGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.dailyCoin}>🪙</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.dailyTitle, !canClaim && { color: '#666' }]}>
                    {canClaim ? 'Günlük Ödül Al' : 'Bugün Alındı ✓'}
                  </Text>
                  <Text style={[s.dailySub, !canClaim && { color: '#555' }]}>
                    {canClaim ? `+${DAILY_REWARD_MC} MC kazan` : 'Yarın tekrar gel'}
                  </Text>
                </View>
                {claiming
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : canClaim && <Ionicons name="chevron-forward" size={18} color="#FFF" />
                }
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* Earn section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 Nasıl Kazanırsın?</Text>
          <View style={s.cardList}>
            {EARN_WAYS.map((item, i) => (
              <View key={i} style={s.wayRow}>
                <View style={[s.wayIcon, { backgroundColor: item.color + '18' }]}>
                  <Text style={s.wayEmoji}>{item.icon}</Text>
                </View>
                <Text style={s.wayAction}>{item.action}</Text>
                <Text style={[s.wayReward, { color: '#34C759' }]}>{item.reward}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spend section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🛍️ Nasıl Harcarsın?</Text>
          <View style={s.cardList}>
            {SPEND_WAYS.map((item, i) => (
              <View key={i} style={s.wayRow}>
                <View style={[s.wayIcon, { backgroundColor: item.color + '18' }]}>
                  <Text style={s.wayEmoji}>{item.icon}</Text>
                </View>
                <Text style={s.wayAction}>{item.action}</Text>
                <Text style={[s.wayReward, { color: '#FF9500' }]}>{item.cost}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📋 Son İşlemler</Text>
            <View style={s.cardList}>
              {transactions.map(txn => (
                <View key={txn.id} style={s.txnRow}>
                  <View style={[s.txnIcon, { backgroundColor: txn.amount > 0 ? '#34C75918' : '#FF3B3B18' }]}>
                    <Ionicons
                      name={txn.amount > 0 ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={txn.amount > 0 ? '#34C759' : '#FF3B3B'}
                    />
                  </View>
                  <View style={s.txnInfo}>
                    <Text style={s.txnReason}>{txn.reason}</Text>
                    <Text style={s.txnTime}>{timeAgo(txn.created_at)}</Text>
                  </View>
                  <Text style={[s.txnAmount, { color: txn.amount > 0 ? '#34C759' : '#FF3B3B' }]}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount} MC
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {transactions.length === 0 && !loading && (
          <View style={s.emptyTxn}>
            <Text style={s.emptyTxnIcon}>🪙</Text>
            <Text style={s.emptyTxnTxt}>Henüz işlem yok</Text>
            <Text style={s.emptyTxnSub}>Görevleri tamamlayarak MC kazan!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
    root:   { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: colors.bgPure,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    balanceCard:  { margin: 16, borderRadius: 24, overflow: 'hidden', ...shadow.lg },
    balanceGrad:  { padding: 28, alignItems: 'center', gap: 4, position: 'relative' },
    circle:       { position: 'absolute', aspectRatio: 1, borderRadius: 9999, backgroundColor: '#FFD700' },
    coinIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,215,0,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    coinIcon:     { fontSize: 32 },
    balanceLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' },
    balanceValue: { fontSize: 48, fontWeight: '900', color: '#FFD700', letterSpacing: -1 },
    coinName:     { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

    balanceStats:   { flexDirection: 'row', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, width: '100%' },
    balStat:        { flex: 1, alignItems: 'center', gap: 2 },
    balStatVal:     { fontSize: 16, fontWeight: '800', color: '#fff' },
    balStatLbl:     { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
    balStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

    section:      { marginHorizontal: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 10 },

    dailyBtn: { borderRadius: 16, overflow: 'hidden', ...shadow.md },
    dailyBtnClaimed: { opacity: 0.7 },
    dailyGrad: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16 },
    dailyCoin:  { fontSize: 28 },
    dailyTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
    dailySub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    cardList: {
      backgroundColor: colors.bgPure, borderRadius: 16,
      overflow: 'hidden', ...shadow.sm,
      borderWidth: 1, borderColor: colors.border,
    },

    wayRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
    },
    wayIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    wayEmoji:  { fontSize: 16 },
    wayAction: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
    wayReward: { fontSize: 13, fontWeight: '800' },

    txnRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 11,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider,
    },
    txnIcon:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    txnInfo:   { flex: 1 },
    txnReason: { fontSize: 13, fontWeight: '600', color: colors.text },
    txnTime:   { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    txnAmount: { fontSize: 14, fontWeight: '800' },

    emptyTxn:     { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTxnIcon: { fontSize: 40 },
    emptyTxnTxt:  { fontSize: 15, fontWeight: '700', color: colors.text },
    emptyTxnSub:  { fontSize: 12, color: colors.textMuted },
});
