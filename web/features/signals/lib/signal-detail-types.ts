import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type SignalTimelineKind =
  | "opened"
  | "validated"
  | "tracking"
  | "near_target"
  | "partial_tp"
  | "adjustment"
  | "target_hit"
  | "stopped"
  | "closed_win"
  | "closed_loss"
  | "expired"
  | "commentary";

export type SignalTimelineEvent = {
  kind: SignalTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type SignalPerformanceModel = {
  currentPnlPct: number | null;
  targetProgressPct: number | null;
  stopHeadroomPct: number | null;
  hoursActive: number;
  estimatedHoursToTarget: number | null;
  trajectoryLabel: string;
  riskAdjustedScore: number | null;
  recentLegLabel: string | null;
};

export type CreatorTrackRecordModel = {
  winRatePct: number | null;
  last20Hits: number;
  last20Total: number;
  avgRiskReward: number | null;
  activeSignals: number;
  closedGreen: number;
  closedRed: number;
  streakWins: number;
  consistencyScore: number;
  specialtyStrengthLabel: string | null;
};

export type CreatorUpdateLine = {
  at: string;
  text: string;
};

export type RelatedSignalIntel = {
  historicalSameAsset: SignalsFeedRow[];
  creatorFollowUps: SignalsFeedRow[];
  archivedSameSymbol: SignalsFeedRow[];
};

export type SignalDetailExtension = {
  timeline: SignalTimelineEvent[];
  performance: SignalPerformanceModel;
  creatorRecord: CreatorTrackRecordModel;
  related: RelatedSignalIntel;
  creatorUpdates: CreatorUpdateLine[];
};
