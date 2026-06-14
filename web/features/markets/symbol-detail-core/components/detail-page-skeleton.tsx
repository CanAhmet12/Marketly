export function DetailPageSkeleton() {
  return (
    <div className="cdr-shell" aria-busy="true" aria-label="Sayfa yükleniyor">
      <div className="cdr-skeleton" style={{ height: 140, marginBottom: 16, borderRadius: 10 }} />
      <div className="cdr-main-grid">
        <div className="cdr-main-col">
          <div className="cdr-skeleton" style={{ height: 420, borderRadius: 10 }} />
          <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
          <div className="cdr-split-row">
            <div className="cdr-skeleton" style={{ height: 280, borderRadius: 10 }} />
            <div className="cdr-skeleton" style={{ height: 280, borderRadius: 10 }} />
          </div>
        </div>
        <div className="cdr-sidebar-col">
          <div className="cdr-skeleton" style={{ height: 260, borderRadius: 10 }} />
          <div className="cdr-skeleton" style={{ height: 220, borderRadius: 10 }} />
          <div className="cdr-skeleton" style={{ height: 180, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
