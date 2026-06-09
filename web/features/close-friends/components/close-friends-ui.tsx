export function CloseFriendsSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="cf-section-head">
      <h2 className="cf-section-title">{title}</h2>
      {desc ? <p className="cf-section-desc">{desc}</p> : null}
    </div>
  );
}
