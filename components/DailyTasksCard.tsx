import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useMarketCoin } from '../hooks/useMarketCoin';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id:       string;
  icon:     React.ComponentProps<typeof Ionicons>['name'];
  label:    string;
  reward:   number;
  target:   number;
  color:    string;
}

const TASKS: Task[] = [
  { id: 'view_market',  icon: 'bar-chart',      label: 'Piyasaları İncele',    reward: 20,  target: 1, color: '#007AFF' },
  { id: 'view_signal',  icon: 'flash',           label: 'Sinyal Oku',           reward: 30,  target: 3, color: '#FF9500' },
  { id: 'watch_video',  icon: 'play-circle',     label: 'Video İzle',           reward: 25,  target: 2, color: '#FF3B3B' },
  { id: 'check_asset',  icon: 'trending-up',     label: 'Varlık Detayı Gör',   reward: 15,  target: 1, color: '#34C759' },
  { id: 'open_app',     icon: 'sunny',           label: 'Günlük Giriş',        reward: 50,  target: 1, color: '#FFB800' },
];

const STORAGE_KEY = '@marketly_daily_tasks';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DailyTasksCard() {
  const { user } = useAuth();
  const { earn }  = useMarketCoin();
  const [progress,  setProgress]  = useState<Record<string, number>>({});
  const [claimed,   setClaimed]   = useState<Set<string>>(new Set());
  const [totalMC,   setTotalMC]   = useState(0);
  const [expanded,  setExpanded]  = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;

  // Load today's progress
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.date === getTodayKey()) {
            setProgress(saved.progress ?? {});
            setClaimed(new Set(saved.claimed ?? []));
            setTotalMC(saved.totalMC ?? 0);
          }
        }
        // Mark "open_app" as done automatically
        setProgress(prev => ({ ...prev, open_app: 1 }));
      } catch {}
    })();
  }, []);

  // Save progress
  const save = async (prog: Record<string, number>, clm: Set<string>, mc: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: getTodayKey(),
        progress: prog,
        claimed: Array.from(clm),
        totalMC: mc,
      }));
    } catch {}
  };

  const claimTask = async (task: Task) => {
    const done = (progress[task.id] ?? 0) >= task.target;
    if (!done || claimed.has(task.id)) return;

    const newClaimed = new Set(claimed);
    newClaimed.add(task.id);
    const newMC = totalMC + task.reward;
    setClaimed(newClaimed);
    setTotalMC(newMC);
    save(progress, newClaimed, newMC);
    // Supabase cüzdanına gerçek MC kazandır
    await earn(task.reward, `Görev: ${task.label}`);
  };

  // Expose increment for external use
  const increment = (taskId: string) => {
    setProgress(prev => {
      const next = { ...prev, [taskId]: (prev[taskId] ?? 0) + 1 };
      save(next, claimed, totalMC);
      return next;
    });
  };

  // Toggle expand
  const toggleExpand = () => {
    setExpanded(v => {
      const toVal = v ? 0 : 1;
      Animated.parallel([
        Animated.spring(rotateAnim, { toValue: toVal, useNativeDriver: true, damping: 12 }),
        Animated.spring(heightAnim, { toValue: toVal, useNativeDriver: false, damping: 14 }),
      ]).start();
      return !v;
    });
  };

  const completedCount = TASKS.filter(t => (progress[t.id] ?? 0) >= t.target).length;
  const progressPct    = completedCount / TASKS.length;

  const chevronRotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  if (!user) return null;

  return (
    <View style={s.wrap}>
      {/* Header */}
      <Pressable style={s.header} onPress={toggleExpand}>
        <LinearGradient colors={['#FFB800', '#FF9500']} style={s.iconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="trophy" size={16} color="#fff" />
        </LinearGradient>

        <View style={s.headerText}>
          <Text style={s.title}>Günlük Görevler</Text>
          <Text style={s.subtitle}>{completedCount}/{TASKS.length} tamamlandı · {totalMC} MC kazanıldı</Text>
        </View>

        {/* Progress bar mini */}
        <View style={s.miniProgress}>
          <View style={[s.miniProgressFill, { width: `${progressPct * 100}%` as any }]} />
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#9AA0AF" />
        </Animated.View>
      </Pressable>

      {/* Tasks list */}
      {expanded && (
        <View style={s.tasksList}>
          {TASKS.map(task => {
            const prog    = progress[task.id] ?? 0;
            const done    = prog >= task.target;
            const isClaimed = claimed.has(task.id);
            const fillPct = Math.min(prog / task.target, 1);

            return (
              <View key={task.id} style={s.taskRow}>
                <View style={[s.taskIcon, { backgroundColor: task.color + '18' }]}>
                  <Ionicons name={task.icon} size={18} color={done ? task.color : '#9AA0AF'} />
                </View>

                <View style={s.taskInfo}>
                  <Text style={[s.taskLabel, done && { color: '#0F0F1A' }]}>{task.label}</Text>
                  <View style={s.progressBar}>
                    <Animated.View style={[s.progressFill, {
                      width: `${fillPct * 100}%` as any,
                      backgroundColor: task.color,
                    }]} />
                  </View>
                  <Text style={s.taskMeta}>{prog}/{task.target} · +{task.reward} MC</Text>
                </View>

                <Pressable
                  style={[
                    s.claimBtn,
                    done && !isClaimed ? s.claimBtnActive : {},
                    isClaimed ? s.claimBtnDone : {},
                  ]}
                  onPress={() => claimTask(task)}
                  disabled={!done || isClaimed}
                >
                  {isClaimed
                    ? <Ionicons name="checkmark" size={14} color="#34C759" />
                    : <Text style={[s.claimTxt, done && s.claimTxtActive]}>Al</Text>
                  }
                </Pressable>
              </View>
            );
          })}

          {/* Total MC + streak */}
          <View style={s.footer}>
            <View style={s.mcTotal}>
              <Text style={s.mcTotalTxt}>🪙 {totalMC} MarketCoin</Text>
            </View>
            {completedCount === TASKS.length && (
              <View style={s.allDoneBadge}>
                <Ionicons name="flame" size={12} color="#FF9500" />
                <Text style={s.allDoneTxt}>Tüm görevler tamamlandı!</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 14,
    marginTop:        10,
    backgroundColor:  '#fff',
    borderRadius:     16,
    overflow:         'hidden',
    shadowColor:      '#000',
    shadowOpacity:    0.06,
    shadowRadius:     8,
    shadowOffset:     { width: 0, height: 2 },
    elevation:        3,
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    padding:         14,
  },
  iconBg: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title:    { fontSize: 14, fontWeight: '800', color: '#0F0F1A' },
  subtitle: { fontSize: 11, color: '#9AA0AF', marginTop: 1 },
  miniProgress: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#F0F0F0', overflow: 'hidden', marginRight: 4,
  },
  miniProgressFill: {
    height: '100%', backgroundColor: '#FFB800', borderRadius: 2,
  },

  tasksList: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  taskIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  taskInfo: { flex: 1, gap: 4 },
  taskLabel: { fontSize: 13, fontWeight: '600', color: '#9AA0AF' },
  progressBar: {
    height: 3, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  taskMeta: { fontSize: 10, color: '#C0C4CE', fontWeight: '600' },

  claimBtn: {
    minWidth: 40, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 10,
  },
  claimBtnActive: { backgroundColor: '#FFB80020', borderWidth: 1, borderColor: '#FFB800' },
  claimBtnDone:   { backgroundColor: '#34C75915' },
  claimTxt:       { fontSize: 12, fontWeight: '700', color: '#C0C4CE' },
  claimTxtActive: { color: '#FF9500' },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  mcTotal: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8E8', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  mcTotalTxt: { fontSize: 12, fontWeight: '700', color: '#FF9500' },
  allDoneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF5E8', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  allDoneTxt: { fontSize: 11, fontWeight: '700', color: '#FF9500' },
});
