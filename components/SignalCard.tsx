import React, { useState, memo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../contexts/ToastContext';
import { colors, radius, shadow } from '../constants/theme';

// ─── Unified signal type (RealSignal + legacy TradeSignal compatible) ─────────
export interface SignalCardData {
  id:           string;
  // asset
  asset?:       string;   // legacy: "BTC/USDT"
  asset_id?:    string;   // real:   "BTC"
  assetName?:   string;   // legacy
  symbol?:      string;   // real
  logoColor?:   string;
  logoLetter?:  string;
  // direction
  direction:    'BUY' | 'SELL' | 'HOLD';
  confidence:   number;
  // prices (legacy camelCase OR real snake_case)
  entryPrice?:  string | number | null;
  entry_price?: number | null;
  targetPrice?: string | number | null;
  target_price?:number | null;
  stopLoss?:    string | number | null;
  stop_loss?:   number | null;
  timeframe?:   string;
  rationale?:   string | null;
  priceChange?: number;
  isNew?:       boolean;
  postedAt?:    string;
  created_at?:  string;
  // stats (legacy nested OR real flat)
  stats?: { likes: number; comments: number; copies: number };
  likes_count?:  number;
  copies_count?: number;
  // creator
  creator: {
    id?:           string;
    name:          string;
    avatar:        string;
    verified:      boolean;
    successRate?:  number;
    accuracy?:     number;
    totalSignals?: number;
    handle?:       string;
    tier?:         string;
  };
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function ConfidenceStars({ level }: { level: number }) {
  return (
    <View style={cs.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= level ? 'star' : 'star-outline'}
          size={10}
          color={i <= level ? '#FFB800' : '#D0D3DB'}
        />
      ))}
    </View>
  );
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export const SignalCard = memo(function SignalCard({ signal }: { signal: SignalCardData }) {
  const toast = useToast();
  const [liked, setLiked]   = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Normalize fields (real vs legacy) ────────────────────────────────────
  const assetSymbol  = signal.asset   ?? signal.asset_id ?? signal.symbol ?? '?';
  const assetName    = signal.assetName ?? signal.symbol ?? signal.asset_id ?? '';
  const logoColor    = signal.logoColor   ?? '#9AA0AF';
  const logoLetter   = signal.logoLetter  ?? assetSymbol[0] ?? '?';
  const entryPrice   = signal.entryPrice  ?? signal.entry_price  ?? null;
  const targetPrice  = signal.targetPrice ?? signal.target_price ?? null;
  const stopLoss     = signal.stopLoss    ?? signal.stop_loss    ?? null;
  const likesCount   = signal.stats?.likes   ?? signal.likes_count  ?? 0;
  const commentsCount = signal.stats?.comments ?? 0;
  const copiesCount  = signal.stats?.copies  ?? signal.copies_count ?? 0;
  const priceChange  = signal.priceChange ?? 0;
  const postedAt     = signal.postedAt ?? timeAgo(signal.created_at);
  const successRate  = signal.creator.successRate ?? signal.creator.accuracy ?? 0;
  const totalSignals = signal.creator.totalSignals ?? 0;

  const isBuy  = signal.direction === 'BUY';
  const isSell = signal.direction === 'SELL';
  const dirColor = isBuy ? colors.rise : isSell ? colors.fall : '#FF9500';
  const dirBg    = isBuy ? colors.riseLight : isSell ? colors.fallLight : '#FFF5E0';
  const up = priceChange >= 0;

  return (
    <View style={sc.card}>
      {signal.isNew && (
        <View style={sc.newBadge}>
          <Text style={sc.newBadgeTxt}>YENİ</Text>
        </View>
      )}

      {/* Creator row */}
      <View style={sc.creatorRow}>
        <Image source={{ uri: signal.creator.avatar }} style={sc.avatar} />
        <View style={sc.creatorInfo}>
          <View style={sc.nameRow}>
            <Text style={sc.creatorName}>{signal.creator.name}</Text>
            {signal.creator.verified && (
              <View style={sc.verifiedDot}>
                <Ionicons name="checkmark" size={8} color="#FFF" />
              </View>
            )}
          </View>
          <View style={sc.statsRow}>
            {successRate > 0 && (
              <>
                <View style={sc.successPill}>
                  <Text style={sc.successTxt}>%{Math.round(successRate)} başarı</Text>
                </View>
                <Text style={sc.dot}>·</Text>
              </>
            )}
            {totalSignals > 0 && (
              <Text style={sc.totalSig}>{totalSignals} sinyal</Text>
            )}
          </View>
        </View>
        <View style={sc.rightMeta}>
          <Text style={sc.time}>{postedAt}</Text>
          <ConfidenceStars level={signal.confidence} />
        </View>
      </View>

      {/* Signal body */}
      <View style={sc.body}>
        <View style={sc.assetRow}>
          <View style={[sc.logoBubble, { backgroundColor: logoColor + '18' }]}>
            <Text style={[sc.logoTxt, { color: logoColor }]}>{logoLetter}</Text>
          </View>
          <View style={sc.assetInfo}>
            <Text style={sc.assetSymbol}>{assetSymbol}</Text>
            {assetName ? <Text style={sc.assetName}>{assetName}</Text> : null}
          </View>
          <View style={[sc.dirBadge, { backgroundColor: dirBg }]}>
            <Ionicons
              name={isBuy ? 'trending-up' : isSell ? 'trending-down' : 'pause'}
              size={14} color={dirColor}
            />
            <Text style={[sc.dirTxt, { color: dirColor }]}>{signal.direction}</Text>
          </View>
        </View>

        <View style={sc.priceGrid}>
          <View style={sc.priceCell}>
            <Text style={sc.priceLbl}>Giriş</Text>
            <Text style={sc.priceVal}>{entryPrice ?? '-'}</Text>
          </View>
          <View style={sc.priceDivider} />
          <View style={sc.priceCell}>
            <Text style={sc.priceLbl}>Hedef</Text>
            <Text style={[sc.priceVal, { color: colors.rise }]}>{targetPrice ?? '-'}</Text>
          </View>
          <View style={sc.priceDivider} />
          <View style={sc.priceCell}>
            <Text style={sc.priceLbl}>Stop</Text>
            <Text style={[sc.priceVal, { color: colors.fall }]}>{stopLoss ?? '-'}</Text>
          </View>
          <View style={sc.priceDivider} />
          <View style={sc.priceCell}>
            <Text style={sc.priceLbl}>Vade</Text>
            <Text style={sc.priceVal}>{signal.timeframe ?? '-'}</Text>
          </View>
        </View>

        {signal.rationale ? (
          <Text style={sc.rationale} numberOfLines={2}>{signal.rationale}</Text>
        ) : null}

        {priceChange !== 0 && (
          <View style={sc.perfRow}>
            <View style={[sc.perfPill, { backgroundColor: up ? colors.riseLight : colors.fallLight }]}>
              <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={11} color={up ? colors.rise : colors.fall} />
              <Text style={[sc.perfTxt, { color: up ? colors.rise : colors.fall }]}>
                {up ? '+' : ''}{priceChange}% giriş sonrası
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={sc.footer}>
        <Pressable
          style={sc.actionBtn}
          onPress={() => { setLiked(!liked); if (!liked) toast.success('Sinyal beğenildi'); }}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? colors.fall : colors.textMuted} />
          <Text style={[sc.actionTxt, liked && { color: colors.fall }]}>
            {fmt(likesCount + (liked ? 1 : 0))}
          </Text>
        </Pressable>

        <Pressable style={sc.actionBtn}>
          <Ionicons name="chatbubble-outline" size={15} color={colors.textMuted} />
          <Text style={sc.actionTxt}>{fmt(commentsCount)}</Text>
        </Pressable>

        <Pressable
          style={[sc.copyBtn, copied && sc.copyBtnActive]}
          onPress={() => {
            setCopied(!copied);
            toast.success(copied ? 'Sinyal kopyası iptal edildi' : `${assetSymbol} sinyali kopyalandı 📋`);
          }}
        >
          <Ionicons name={copied ? 'copy' : 'copy-outline'} size={14} color={copied ? '#FFF' : colors.primary} />
          <Text style={[sc.copyTxt, copied && sc.copyTxtActive]}>
            {copied ? 'Kopyalandı' : `Kopyala (${fmt(copiesCount)})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const cs = StyleSheet.create({
  stars: { flexDirection: 'row', gap: 2 },
});

const sc = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPure, borderRadius: radius.lg,
    marginHorizontal: 8, marginBottom: 10,
    ...shadow.md, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', position: 'relative',
  },
  newBadge: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    backgroundColor: colors.primary + 'EE',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full,
  },
  newBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  creatorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  creatorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  creatorName: { fontSize: 13, fontWeight: '700', color: colors.text },
  verifiedDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  successPill: { backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  successTxt: { fontSize: 10, fontWeight: '700', color: colors.primaryDark },
  dot: { fontSize: 10, color: colors.textMuted },
  totalSig: { fontSize: 10, color: colors.textMuted },
  rightMeta: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 10, color: colors.textMuted },
  body: { paddingHorizontal: 14, paddingVertical: 12 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logoBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoTxt: { fontSize: 14, fontWeight: '900' },
  assetInfo: { flex: 1 },
  assetSymbol: { fontSize: 16, fontWeight: '900', color: colors.text },
  assetName: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  dirBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
  },
  dirTxt: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  priceGrid: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg, borderRadius: radius.md,
    paddingVertical: 10, marginBottom: 10,
  },
  priceCell: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: 24, backgroundColor: colors.border },
  priceLbl: { fontSize: 9, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 3 },
  priceVal: { fontSize: 12, fontWeight: '800', color: colors.text },
  rationale: { fontSize: 12.5, color: colors.textMuted, lineHeight: 18, marginBottom: 8 },
  perfRow: { flexDirection: 'row' },
  perfPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.full,
  },
  perfTxt: { fontSize: 11, fontWeight: '700' },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.divider,
    paddingHorizontal: 14, paddingVertical: 10, gap: 4,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  actionTxt: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  copyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginLeft: 4, paddingVertical: 8, borderRadius: radius.md,
    backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary + '40',
  },
  copyBtnActive: { backgroundColor: colors.primary },
  copyTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },
  copyTxtActive: { color: '#FFF' },
});
