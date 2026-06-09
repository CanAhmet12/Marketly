export function SavedSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="sv-section-head">
      <h2 className="sv-section-title">{title}</h2>
      {desc ? <p className="sv-section-desc">{desc}</p> : null}
    </div>
  );
}
