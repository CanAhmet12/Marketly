export function NotificationsSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="ntf-section-head">
      <h2 className="ntf-section-title">{title}</h2>
      {desc ? <p className="ntf-section-desc">{desc}</p> : null}
    </div>
  );
}
