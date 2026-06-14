"use client";

type Props =
  | {
      mode: "idle";
    }
  | {
      mode: "results";
      query: string;
      total?: number;
      isFetching?: boolean;
    }
  | {
      mode: "hint";
      query?: string;
      hint: string;
    };

export function SearchPageMast(props: Props) {
  if (props.mode === "idle") {
    return (
      <header className="srch-mast" aria-label="Arama">
        <p className="srch-mast__eyebrow">Keşif terminali</p>
        <h1 className="srch-mast__title">Arama</h1>
        <p className="srch-mast__desc">
          Sembol, üretici, video veya konu arayın — üst çubuktan veya
          <kbd className="srch-mast__kbd">/</kbd> ile odaklanın.
        </p>
      </header>
    );
  }

  if (props.mode === "hint") {
    return (
      <header className="srch-mast srch-mast--compact" aria-label="Arama">
        {props.query ? (
          <>
            <p className="srch-mast__eyebrow">Arama</p>
            <h1 className="srch-mast__title">
              <span className="srch-mast__query">&ldquo;{props.query}&rdquo;</span>
            </h1>
          </>
        ) : (
          <h1 className="srch-mast__title">Arama</h1>
        )}
        <p className="srch-mast__hint">{props.hint}</p>
      </header>
    );
  }

  const { query, total = 0, isFetching = false } = props;

  return (
    <header className="srch-mast srch-mast--compact" aria-label="Arama sonuçları">
      <p className="srch-mast__eyebrow">Sonuçlar</p>
      <div className="srch-mast__meta-row">
        <div className="srch-mast__title-row">
          <h1 className="srch-mast__title">
            <span className="srch-mast__query">&ldquo;{query}&rdquo;</span>
          </h1>
          {total > 0 ? <span className="srch-mast__count">{total} sonuç</span> : null}
        </div>
        {isFetching ? <span className="srch-mast__status">Güncelleniyor…</span> : null}
      </div>
    </header>
  );
}
