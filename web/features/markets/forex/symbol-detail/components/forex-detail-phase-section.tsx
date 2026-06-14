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
  compact?: boolean;
};

export function ForexDetailPhaseSection({
  zone,
  seriesKicker,
  label,
  accent = "peak",
  phase,
  description,
  compact = false,
}: Props) {
  return (
    <section
      className={`cdr-section fx-phase-section${compact ? " cdr-sidebar-block cdr-sidebar-block--phase fx-sidebar-block--phase" : ""}`}
      data-zone={zone}
      aria-label={label}
    >
      <DetailSectionHead seriesKicker={seriesKicker} label={label} accent={accent} />
      <div className="fx-phase-section__body">
        <p className="cdr-section-stub">{description}</p>
        <span className="fx-phase-badge">Faz {phase}</span>
      </div>
    </section>
  );
}
