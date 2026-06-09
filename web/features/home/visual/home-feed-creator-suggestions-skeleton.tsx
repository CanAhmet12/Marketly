type Props = { count?: number };

export function HomeFeedCreatorSuggestionsSkeleton({ count = 3 }: Props) {
  return (
    <div className="hv-ref-creator-suggest hv-ref-creator-suggest--skeleton" aria-hidden>
      <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--title" />
      <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--desc" />
      <ul className="hv-ref-creator-suggest__list">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="hv-ref-creator-suggest__row">
            <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--avatar" />
            <div className="hv-ref-creator-suggest__shimmer-block">
              <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--name" />
              <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--handle" />
            </div>
            <div className="hv-ref-creator-suggest__shimmer hv-ref-creator-suggest__shimmer--cta" />
          </li>
        ))}
      </ul>
    </div>
  );
}
