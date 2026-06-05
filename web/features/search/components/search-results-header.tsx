"use client";

type Props = {
  query: string;
  total: number;
  isFetching: boolean;
};

export function SearchResultsHeader({ query, total, isFetching }: Props) {
  return (
    <header className="sch-results-head">
      <div className="sch-results-head__main">
        <h1 className="sch-results-head__title">
          <span className="sch-results-head__q">&ldquo;{query}&rdquo;</span> için sonuçlar
        </h1>
        {total > 0 ? <span className="sch-results-head__count">{total} sonuç</span> : null}
      </div>
      {isFetching ? <span className="sch-results-head__status">Güncelleniyor…</span> : null}
    </header>
  );
}
