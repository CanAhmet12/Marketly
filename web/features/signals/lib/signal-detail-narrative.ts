import { buildSymbolConsensusIntel } from "@/features/signals/lib/signal-intelligence-build";
import type { CreatorTrackRecordModel, SignalTimelineEvent } from "@/features/signals/lib/signal-detail-types";
import type { SymbolConsensusIntel } from "@/features/signals/intelligence/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

/** L2 — Metrik etiketleri (çakışmayı önler) */
export const SIGNAL_METRIC_LABELS = {
  signalConfidence: "Tez gücü",
  analystTrust: "Üretici skoru",
  consensusConfidence: "Ort. tez gücü",
  directionAgreement: "Yön uyumu",
  bullShare: "AL oranı",
  bearShare: "SAT oranı",
  confidenceStability: "Güven istikrarı",
  platformAccuracy: "Platform isabeti",
} as const;

export type SignalDetailVerdictTone = "positive" | "neutral" | "caution" | "split";

export type SignalDetailVerdict = {
  line: string;
  tone: SignalDetailVerdictTone;
};

export type ConsensusDirectionCounts = {
  buy: number;
  sell: number;
  hold: number;
  activeTotal: number;
};

export type ConsensusNarrative = {
  headline: string;
  sampleLine: string;
  directionLine: string;
  counts: ConsensusDirectionCounts;
  dominantDirection: "BUY" | "SELL" | "HOLD" | null;
};

export type RelatedSignalOutcome = {
  label: string;
  tone: "active" | "tp" | "sl" | "archive" | "neutral";
};

const HONEST_TIMELINE_KINDS = new Set<SignalTimelineEvent["kind"]>([
  "opened",
  "target_hit",
  "stopped",
  "closed_win",
  "closed_loss",
  "expired",
]);

function directionTr(d: SignalsFeedRow["direction"]): string {
  if (d === "BUY") return "AL";
  if (d === "SELL") return "SAT";
  return "BEKLE";
}

function countDirectionsForSymbol(catalog: readonly SignalsFeedRow[], symbol: string): ConsensusDirectionCounts {
  const u = symbol.trim().toUpperCase();
  const active = catalog.filter((r) => r.symbol.trim().toUpperCase() === u && r.is_active);
  return {
    buy: active.filter((r) => r.direction === "BUY").length,
    sell: active.filter((r) => r.direction === "SELL").length,
    hold: active.filter((r) => r.direction === "HOLD").length,
    activeTotal: active.length,
  };
}

function dominantDirection(counts: ConsensusDirectionCounts): "BUY" | "SELL" | "HOLD" | null {
  if (counts.activeTotal === 0) return null;
  const { buy, sell, hold } = counts;
  if (buy >= sell && buy >= hold && buy > 0) return "BUY";
  if (sell >= buy && sell >= hold && sell > 0) return "SELL";
  if (hold > 0) return "HOLD";
  return null;
}

function creatorPerformanceClause(
  row: SignalsFeedRow,
  creatorRecord: CreatorTrackRecordModel | null | undefined,
): string | null {
  const closed = (creatorRecord?.closedGreen ?? 0) + (creatorRecord?.closedRed ?? 0);
  if (creatorRecord && closed > 0 && creatorRecord.winRatePct != null) {
    return `üretici ${closed} kapanan çağrıda %${creatorRecord.winRatePct} TP`;
  }
  if (creatorRecord && creatorRecord.last20Total > 0) {
    return `son ${creatorRecord.last20Total} kapanışta ${creatorRecord.last20Hits} TP`;
  }
  if (row.analyst.accuracy != null) {
    return `üretici platform isabeti %${row.analyst.accuracy}`;
  }
  return null;
}

/** L1 — Tek satırlık verdict (canlı veriden türetilir) */
export function buildSignalDetailVerdict(
  row: SignalsFeedRow,
  catalog: readonly SignalsFeedRow[],
  creatorRecord?: CreatorTrackRecordModel | null,
): SignalDetailVerdict {
  const consensus = buildSymbolConsensusIntel([...catalog], row.symbol);
  const counts = countDirectionsForSymbol(catalog, row.symbol);
  const dominant = dominantDirection(counts);
  const dir = directionTr(row.direction);

  const lead = `${row.symbol} ${dir} çağrısı — ${SIGNAL_METRIC_LABELS.signalConfidence.toLowerCase()} %${row.confidence}`;

  let consensusClause: string;
  let tone: SignalDetailVerdictTone = "neutral";

  if (counts.activeTotal === 0) {
    consensusClause = "sembolde başka aktif çağrı yok";
    tone = "caution";
  } else if (consensus.splitSentiment) {
    consensusClause = `görüş bölünmüş (${counts.buy} AL, ${counts.sell} SAT${counts.hold > 0 ? `, ${counts.hold} BEKLE` : ""})`;
    tone = "split";
  } else if (consensus.agreementPct >= 72) {
    consensusClause = `${consensus.activeAnalysts} analistte güçlü yön uyumu (%${consensus.agreementPct})`;
    tone = "positive";
  } else {
    consensusClause = `${consensus.activeAnalysts} analist, orta düzey uyum (%${consensus.agreementPct})`;
  }

  const perf = creatorPerformanceClause(row, creatorRecord);
  const perfClause = perf ? `; ${perf}` : "";

  let alignClause = "";
  if (dominant && counts.activeTotal > 0) {
    if (row.direction === dominant) {
      alignClause = "; çağrı semboldeki baskın görüşle uyumlu";
      if (tone === "neutral") tone = "positive";
    } else if (consensus.splitSentiment) {
      alignClause = "; bu çağrı azınlık görüşünde";
      tone = "split";
    } else {
      alignClause = "; bu çağrı baskın görüşten ayrışıyor";
      tone = "caution";
    }
  }

  return {
    line: `${lead}; ${consensusClause}${perfClause}${alignClause}`,
    tone,
  };
}

/** L3 + L4 — Konsensüs anlatımı */
export function buildConsensusNarrative(
  consensus: SymbolConsensusIntel,
  counts: ConsensusDirectionCounts,
  currentDirection: SignalsFeedRow["direction"],
): ConsensusNarrative {
  const symbolTotal = counts.activeTotal;
  const sampleLine =
    symbolTotal === 0
      ? "Bu sembolde şu an aktif çağrı yok — örneklem yetersiz."
      : consensus.activeAnalysts === 1
        ? `1 analist, ${symbolTotal} aktif çağrı — düşük örneklem.`
        : `${consensus.activeAnalysts} analist, ${symbolTotal} aktif çağrı.`;

  const dirParts: string[] = [];
  if (counts.buy > 0) dirParts.push(`${counts.buy} AL`);
  if (counts.sell > 0) dirParts.push(`${counts.sell} SAT`);
  if (counts.hold > 0) dirParts.push(`${counts.hold} BEKLE`);
  const directionLine = dirParts.length ? dirParts.join(" · ") : "Aktif yön yok";

  const dom = dominantDirection(counts);
  let headline: string;

  if (symbolTotal === 0) {
    headline = "Piyasa görüşü için yeterli aktif çağrı bulunmuyor.";
  } else if (consensus.splitSentiment) {
    headline = `${counts.buy + counts.sell + counts.hold} aktif çağrıda görüş bölünmüş — tek yön çıkarımı riskli.`;
  } else if (dom === "BUY") {
    headline =
      consensus.agreementPct >= 72
        ? `Analistlerin çoğu AL yönünde (%${consensus.agreementPct} uyum).`
        : `AL yönü önde; uyum orta düzeyde (%${consensus.agreementPct}).`;
  } else if (dom === "SELL") {
    headline =
      consensus.agreementPct >= 72
        ? `Analistlerin çoğu SAT yönünde (%${consensus.agreementPct} uyum).`
        : `SAT yönü önde; uyum orta düzeyde (%${consensus.agreementPct}).`;
  } else {
    headline = `BEKLE ağırlıklı görüş — net yön sinyali zayıf.`;
  }

  const cur = directionTr(currentDirection);
  if (symbolTotal > 0 && dom && currentDirection !== dom && !consensus.splitSentiment) {
    headline += ` Bu çağrı ${cur}; baskın görüş ${directionTr(dom)}.`;
  }

  return {
    headline,
    sampleLine,
    directionLine,
    counts,
    dominantDirection: dom,
  };
}

export function getConsensusDirectionCounts(catalog: readonly SignalsFeedRow[], symbol: string): ConsensusDirectionCounts {
  return countDirectionsForSymbol(catalog, symbol);
}

/** L5 — Üretici geçmiş performans özeti */
export function buildCreatorTrackRecordNarrative(rec: CreatorTrackRecordModel): string {
  const closed = rec.closedGreen + rec.closedRed;
  if (closed > 0 && rec.winRatePct != null) {
    const streak = rec.streakWins > 0 ? ` · ardışık ${rec.streakWins} TP serisi` : "";
    return `${closed} kapanan çağrıda %${rec.winRatePct} hedef gerçekleşme (${rec.closedGreen} TP / ${rec.closedRed} SL)${streak}.`;
  }
  if (rec.last20Total > 0) {
    return `Son ${rec.last20Total} kapanışta ${rec.last20Hits} hedef (TP) — örneklem sınırlı.`;
  }
  if (rec.activeSignals > 0) {
    return `${rec.activeSignals} aktif çağrı; henüz yeterli kapanış verisi yok.`;
  }
  return "Kapanmış çağrı verisi henüz oluşmadı.";
}

/** L7 — Benzer çağrı sonuç bağlamı */
export function describeRelatedSignalOutcome(row: SignalsFeedRow): RelatedSignalOutcome {
  if (row.is_active) {
    return { label: "Aktif", tone: "active" };
  }
  if (row.result === "TP") {
    return { label: "Hedef (TP)", tone: "tp" };
  }
  if (row.result === "SL") {
    return { label: "Stop (SL)", tone: "sl" };
  }
  return { label: "Arşiv", tone: "archive" };
}

/** L8 — Yalnızca doğrulanabilir timeline olayları */
export function filterHonestTimelineEvents(events: SignalTimelineEvent[]): SignalTimelineEvent[] {
  return events.filter((ev) => HONEST_TIMELINE_KINDS.has(ev.kind));
}

/** L6 — Trade plan kısa yorum (seviyeler mevcut) */
export function buildTradePlanNarrative(row: SignalsFeedRow): string | null {
  const rr = row.risk_reward_ratio ?? (row.riskRewardLabel ? parseFloat(row.riskRewardLabel.replace(/[^\d.]/g, "")) : null);
  if (row.entry_price == null || row.target_price == null || row.stop_loss == null) {
    return null;
  }
  const rrPart =
    rr != null && Number.isFinite(rr)
      ? rr >= 2
        ? `R/R ${rr.toFixed(1)}:1 — ödül riskin ${rr.toFixed(1)} katı`
        : rr >= 1
          ? `R/R ${rr.toFixed(1)}:1 — dengeli risk/ödül`
          : `R/R ${rr.toFixed(1)}:1 — dar ödül penceresi`
      : null;
  const dir = directionTr(row.direction);
  const levelPart = `${dir} planı: giriş ${row.entryZoneLabel ?? "seviye"}, hedef ve stop tanımlı`;
  return rrPart ? `${levelPart}; ${rrPart}` : levelPart;
}
