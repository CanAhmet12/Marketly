import type { SavedIntelligenceBundle } from "@/features/social/lib/build-saved-intelligence";
import type { SavedSectionId } from "@/features/saved/saved-section-params";
import { SAVED_SECTION_LABELS } from "@/features/saved/saved-section-params";

type Props = {
  intel: SavedIntelligenceBundle;
  sectionLabel: SavedSectionId;
};

export function SavedIntelStrip({ intel, sectionLabel }: Props) {
  if (intel.total === 0) return null;

  const stats = [
    { label: "Toplam", value: String(intel.total), accent: true },
    { label: "Son 7 gün", value: String(intel.recentCount7d), accent: intel.recentCount7d > 0 },
    { label: "Video payı", value: intel.videoSharePct > 0 ? `%${intel.videoSharePct}` : "—" },
    { label: "Yoğun alan", value: intel.topTheme ?? "—", accent: Boolean(intel.topTheme) },
  ];

  return (
    <section className="sv-intel-block" aria-label="Koleksiyon özeti">
      <div className="sv-status-row">
        <span>
          Bölüm · <strong>{SAVED_SECTION_LABELS[sectionLabel]}</strong>
        </span>
        {intel.trendSummary.trim() ? <span>{intel.trendSummary}</span> : null}
      </div>

      <dl className="sv-intel-grid">
        {stats.map((s) => (
          <div key={s.label} className="sv-intel-stat" data-accent={s.accent ? "true" : undefined}>
            <dt className="sv-intel-label">{s.label}</dt>
            <dd className="sv-intel-value">{s.value}</dd>
          </div>
        ))}
      </dl>

      {intel.categoryChips.length > 0 || intel.creatorChips.length > 0 ? (
        <div className="sv-distribution">
          {intel.categoryChips.length > 0 ? (
            <div className="sv-distribution-block">
              <p className="sv-distribution-label">Alan dağılımı</p>
              <ul className="sv-distribution-list">
                {intel.categoryChips.map((chip) => (
                  <li key={chip.label}>
                    <span>{chip.label}</span>
                    <span className="sv-distribution-count">{chip.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {intel.creatorChips.length > 0 ? (
            <div className="sv-distribution-block">
              <p className="sv-distribution-label">Üretici dağılımı</p>
              <ul className="sv-distribution-list">
                {intel.creatorChips.map((chip) => (
                  <li key={chip.label}>
                    <span>{chip.label}</span>
                    <span className="sv-distribution-count">{chip.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
