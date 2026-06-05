export function CreatorsPageSkeleton() {
  return (
    <div className="creators-page ms-page-wrapper ms-container-full" aria-busy aria-label="Yükleniyor">
      <div className="creators-page__head">
        <div className="motion-shimmer h-5 w-40 rounded bg-[var(--color-divider)]" />
      </div>
      <div className="creators-page__controls">
        <div className="creators-page__toolbar px-3 py-2">
          <div className="motion-shimmer h-[30px] w-full max-w-md rounded bg-[var(--color-divider)]" />
          <div className="mt-2 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="motion-shimmer h-6 w-14 rounded bg-[var(--color-divider)]" />
            ))}
          </div>
        </div>
      </div>
      <div className="creators-page__body">
        <div className="creators-page__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="motion-shimmer h-44 rounded-[var(--radius-lg)] bg-[var(--color-divider)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
