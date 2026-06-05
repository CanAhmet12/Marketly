import { hashToUnit } from "@/features/signals/domain/signal-meta";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

import type {
  CreatorTrackRecordModel,
  CreatorUpdateLine,
  RelatedSignalIntel,
  SignalDetailExtension,
  SignalPerformanceModel,
  SignalTimelineEvent,
} from "./signal-detail-types";

function hoursBetween(isoA: string, isoB: number): number {
  return Math.max(0, (isoB - new Date(isoA).getTime()) / 3_600_000);
}

function buildTimeline(row: SignalsFeedRow): SignalTimelineEvent[] {
  const t0 = new Date(row.created_at).getTime();
  const h = hashToUnit(`${row.id}-tl`);
  const out: SignalTimelineEvent[] = [
    { kind: "opened", label: "Çağrı yayınlandı", detail: `${row.timeframe} vade`, at: row.created_at },
    {
      kind: "validated",
      label: "Kurulum kontrolü",
      detail: "Giriş bölgesi ve haber takvimi uyumu",
      at: new Date(t0 + (1.2 + h * 2) * 3_600_000).toISOString(),
    },
  ];

  if (row.result === "TP") {
    out.push({
      kind: "target_hit",
      label: "Hedef gerçekleşti",
      detail: "Kapanış +",
      at: new Date(t0 + (36 + h * 18) * 3_600_000).toISOString(),
    });
    out.push({ kind: "closed_win", label: "Arşivlendi — kazançlı kapanış", at: new Date(t0 + (40 + h * 20) * 3_600_000).toISOString() });
    return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }
  if (row.result === "SL") {
    out.push({
      kind: "stopped",
      label: "Stop seviyesi",
      detail: "Risk çerçevesi sonlandı",
      at: new Date(t0 + (20 + h * 12) * 3_600_000).toISOString(),
    });
    out.push({ kind: "closed_loss", label: "Arşivlendi — zarar sınırında kapanış", at: new Date(t0 + (24 + h * 14) * 3_600_000).toISOString() });
    return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }

  if (!row.is_active) {
    out.push({ kind: "expired", label: "Süre doldu / pasifleştirildi", at: new Date(row.expires_at ?? row.created_at).toISOString() });
    return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }

  out.push({
    kind: "tracking",
    label: "Aktif izleme",
    detail: "Fiyat aksiyonu ve hacim onayı",
    at: new Date(t0 + (4 + h * 3) * 3_600_000).toISOString(),
  });

  if (row.lifecycle_phase === "near_target" || row.lifecycle_phase === "target_hit") {
    out.push({
      kind: "near_target",
      label: "Hedefe yaklaşım",
      detail: "Kısmi realizasyon önerildi",
      at: new Date(t0 + (16 + h * 8) * 3_600_000).toISOString(),
    });
  }

  if (row.lifecycle_phase === "developing") {
    out.push({
      kind: "partial_tp",
      label: "Kısmi hedef",
      detail: "Volatiliteye göre tırnak çıkışı",
      at: new Date(t0 + (10 + h * 5) * 3_600_000).toISOString(),
    });
  }

  out.push({
    kind: "commentary",
    label: "Üretici notu",
    detail: "Takipçi sorularına özet yanıt",
    at: new Date(t0 + (8 + h * 4) * 3_600_000).toISOString(),
  });

  return out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function buildPerformance(row: SignalsFeedRow): SignalPerformanceModel {
  const now = Date.now();
  const hoursActive = hoursBetween(row.created_at, now);
  const h = hashToUnit(`${row.id}-perf`);

  let targetProgressPct: number | null = null;
  let stopHeadroomPct: number | null = null;
  const e = row.entry_price;
  const t = row.target_price;
  const s = row.stop_loss;
  if (e != null && t != null && s != null && row.is_active) {
    const toT = Math.abs(t - e);
    const toS = Math.abs(e - s);
    if (toT + toS > 1e-9) {
      targetProgressPct = Math.round(Math.min(96, 18 + h * 58 * (toT / (toT + toS))));
      stopHeadroomPct = Math.round(Math.min(92, 22 + (1 - h) * 48 * (toS / (toT + toS))));
    }
  }

  let estimatedHoursToTarget: number | null = null;
  if (row.is_active && targetProgressPct != null && targetProgressPct > 5 && targetProgressPct < 98) {
    estimatedHoursToTarget = Math.round(((100 - targetProgressPct) / 100) * (24 + h * 72));
  }

  const trajectoryLabels = [
    "Disiplinli trend takibi",
    "Konsolidasyon sonrası ivme",
    "Makro duyarlı hareket",
    "Volatilite rejimi değişimi",
  ];
  const trajectoryLabel = trajectoryLabels[Math.floor(hashToUnit(`${row.id}-traj`) * trajectoryLabels.length)]!;

  const riskAdjustedScore =
    row.risk_reward_ratio != null && row.analyst.accuracy != null
      ? Math.round(Math.min(3, (row.risk_reward_ratio / 4) * (row.analyst.accuracy / 100) * 3) * 10) / 10
      : null;

  const recentLegLabel =
    row.performance_preview_pct == null
      ? null
      : row.performance_preview_pct >= 6
        ? "Kısa vadede pozitif uç"
        : row.performance_preview_pct <= -6
          ? "Gerileme baskısı"
          : "Nötr bant";

  return {
    currentPnlPct: row.performance_preview_pct,
    targetProgressPct,
    stopHeadroomPct,
    hoursActive: Math.round(hoursActive * 10) / 10,
    estimatedHoursToTarget,
    trajectoryLabel,
    riskAdjustedScore,
    recentLegLabel,
  };
}

function buildCreatorRecord(analystId: string, all: SignalsFeedRow[]): CreatorTrackRecordModel {
  const mine = all.filter((r) => r.analyst.id === analystId);
  const closed = mine.filter((r) => !r.is_active && (r.result === "TP" || r.result === "SL"));
  const green = closed.filter((r) => r.result === "TP").length;
  const red = closed.filter((r) => r.result === "SL").length;
  const activeSignals = mine.filter((r) => r.is_active).length;
  const rrVals = mine.map((r) => r.risk_reward_ratio).filter((x): x is number => x != null && Number.isFinite(x));
  const avgRiskReward = rrVals.length ? Math.round((rrVals.reduce((a, b) => a + b, 0) / rrVals.length) * 100) / 100 : null;

  const sorted = [...mine].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last20 = sorted.slice(0, 20);
  const last20Hits = last20.filter((r) => r.result === "TP").length;
  const last20Total = last20.filter((r) => r.result === "TP" || r.result === "SL").length;

  const profAcc = mine[0]?.analyst.accuracy ?? null;
  const winRatePct = closed.length ? Math.round((green / closed.length) * 100) : profAcc;

  const closedNewestFirst = [...closed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  let streakWins = 0;
  for (const r of closedNewestFirst) {
    if (r.result === "TP") streakWins++;
    else break;
  }

  const spec = mine[0]?.analyst.specialties?.[0] ?? null;
  const consistencyScore = Math.round(Math.min(100, (winRatePct ?? 55) * 0.65 + (avgRiskReward ?? 1.2) * 14 + streakWins * 3));

  return {
    winRatePct,
    last20Hits,
    last20Total,
    avgRiskReward,
    activeSignals,
    closedGreen: green,
    closedRed: red,
    streakWins,
    consistencyScore,
    specialtyStrengthLabel: spec,
  };
}

function buildRelated(row: SignalsFeedRow, all: SignalsFeedRow[]): RelatedSignalIntel {
  const sym = row.symbol.toUpperCase();
  const same = all.filter((r) => r.symbol.toUpperCase() === sym && r.id !== row.id);
  const historicalSameAsset = [...same].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const creatorFollowUps = all
    .filter((r) => r.creator_id === row.creator_id && r.id !== row.id && new Date(r.created_at).getTime() > new Date(row.created_at).getTime())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 4);

  const archivedSameSymbol = same.filter((r) => !r.is_active).slice(0, 4);

  return { historicalSameAsset, creatorFollowUps, archivedSameSymbol };
}

function buildCreatorUpdates(row: SignalsFeedRow): CreatorUpdateLine[] {
  const t0 = new Date(row.created_at).getTime();
  const h = hashToUnit(`${row.id}-cup`);
  return [
    {
      at: new Date(t0 + (3 + h) * 3_600_000).toISOString(),
      text: `${row.symbol} için risk çerçevesi aynı; haber öncesi maruziyeti sınırlı tutun.`,
    },
    {
      at: new Date(t0 + (9 + h * 2) * 3_600_000).toISOString(),
      text: "Hacim onayı gelene kadar parçalı giriş / çıkış öneriyorum.",
    },
  ];
}

/** Tüm sinyal kataloğu üzerinden detay zekâsı — mock dolu, canlıda katalog boşsa sınırlı özet. */
export function deriveSignalDetailExtension(row: SignalsFeedRow, catalog: SignalsFeedRow[]): SignalDetailExtension {
  return {
    timeline: buildTimeline(row),
    performance: buildPerformance(row),
    creatorRecord: buildCreatorRecord(row.analyst.id, catalog.length ? catalog : [row]),
    related: buildRelated(row, catalog.length ? catalog : [row]),
    creatorUpdates: buildCreatorUpdates(row),
  };
}
