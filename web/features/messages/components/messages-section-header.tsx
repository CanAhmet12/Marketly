type Props = { title: string; desc?: string };

export function MessagesSectionHeader({ title, desc }: Props) {
  return (
    <div className="msg-section-head">
      <h2 className="msg-section-title">{title}</h2>
      {desc ? <p className="msg-section-desc">{desc}</p> : null}
    </div>
  );
}
