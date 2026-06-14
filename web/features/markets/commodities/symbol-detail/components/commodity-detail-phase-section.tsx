import {
  DetailSectionHead,
  type DetailSectionAccent,
} from "@/features/markets/symbol-detail-core/components/detail-section-head";

type Props = {
  zone: string;
  seriesKicker: string;
  label: string;
  accent?: DetailSectionAccent;
  phase: number;
  description: string;
};

export function CommodityDetailPhaseSection({
  zone,
  seriesKicker,
  label,
  accent = "peak",
  phase,
  description,
}: Props) {
  return (
    <section className="cdr-section cmr-phase-section" data-zone={zone} aria-label={label}>
      <DetailSectionHead seriesKicker={seriesKicker} label={label} accent={accent} />
      <div className="cmr-phase-section__body">
        <p className="cdr-section-stub">{description}</p>
        <span className="cmr-phase-badge">Faz {phase}</span>
      </div>
    </section>
  );
}
