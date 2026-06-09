"use client";

import {
  buildCreatorTrackRecordNarrative,
  SIGNAL_METRIC_LABELS,
} from "@/features/signals/lib/signal-detail-narrative";
import type { CreatorTrackRecordModel } from "@/features/signals/lib/signal-detail-types";

type Props = {
  record: CreatorTrackRecordModel;
  embedded?: boolean;
};

export function SignalDetailCreatorTrack({ record, embedded = false }: Props) {
  const narrative = buildCreatorTrackRecordNarrative(record);
  const closed = record.closedGreen + record.closedRed;
  const last20Label = record.last20Total > 0 ? `${record.last20Hits}/${record.last20Total} TP` : "—";

  const body = (
    <>
      {embedded ? (
        <h4 className="sdm-producer-trust__subtitle">Geçmiş performans</h4>
      ) : (
        <h3 className="sdm-panel-block__title">Geçmiş performans</h3>
      )}
      <p className="sdm-track-block__narrative">{narrative}</p>
      <div className="sdm-track-grid">
        <div className="sdm-track-cell">
          <p className="sdm-track-cell__label">Kazanma</p>
          <p className="sdm-track-cell__value">{record.winRatePct == null ? "—" : `%${record.winRatePct}`}</p>
        </div>
        <div className="sdm-track-cell">
          <p className="sdm-track-cell__label">Son kapanışlar</p>
          <p className="sdm-track-cell__value">{last20Label}</p>
        </div>
        <div className="sdm-track-cell">
          <p className="sdm-track-cell__label">Kapanan</p>
          <p className="sdm-track-cell__value">
            <span className="sdm-track-cell__up">{record.closedGreen}</span>
            <span className="sdm-track-cell__sep">/</span>
            <span className="sdm-track-cell__down">{record.closedRed}</span>
          </p>
        </div>
        <div className="sdm-track-cell">
          <p className="sdm-track-cell__label">{SIGNAL_METRIC_LABELS.confidenceStability}</p>
          <p className="sdm-track-cell__value">{record.consistencyScore}</p>
        </div>
      </div>
      {closed > 0 ? (
        <p className="sdm-panel-block__meta">Katalogdaki kapanan çağrılardan türetilmiştir.</p>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className="sdm-producer-trust__track" aria-label="Üretici geçmiş performansı">
        {body}
      </div>
    );
  }

  return (
    <section className="sdm-panel-block sdm-track-block" aria-label="Üretici geçmiş performansı">
      {body}
    </section>
  );
}
