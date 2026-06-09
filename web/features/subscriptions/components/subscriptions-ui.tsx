export function SubscriptionsSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="sub-section-head">
      <h2 className="sub-section-title">{title}</h2>
      {desc ? <p className="sub-section-desc">{desc}</p> : null}
    </div>
  );
}
