import type { HomeVisualMarketItem } from "./mock-data";

function sparkPoints(seed: string, up: boolean, changePct: number): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
  const pts: string[] = [];
  const vol = Math.min(7, 1.4 + Math.min(5, Math.abs(changePct)) * 0.45);
  let y = up ? 15 : 9;
  for (let x = 0; x <= 52; x += 4) {
    h = (h * 31 + x) % 13;
    const step = (up ? -h % vol : h % vol) * 0.42;
    y = Math.max(3, Math.min(21, y + step + (up ? -0.35 : 0.35)));
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

type Props = {
  items: HomeVisualMarketItem[];
};

export function HomeVisualMarketStrip({ items }: Props) {
  return (
    <div className="hv-ref-strip hv-ref-strip--continuous" aria-label="Piyasa özeti">
      {items.map((m) => {
        const sign = m.changePct > 0.04 ? "up" : m.changePct < -0.04 ? "down" : "flat";
        const chg =
          sign === "flat"
            ? "0,00%"
            : `${m.changePct > 0 ? "+" : ""}${m.changePct.toFixed(2).replace(".", ",")}%`;
        const stroke =
          sign === "down"
            ? "rgba(248,113,113,0.55)"
            : sign === "up"
              ? "rgba(62,232,208,0.5)"
              : "rgba(175,182,196,0.35)";
        const Inner = (
          <>
            <div className="hv-ref-strip__sym">{m.symbol}</div>
            <div className="hv-ref-strip__row">
              <span className="hv-ref-strip__price">{m.price}</span>
              <span className="hv-ref-strip__chg" data-sign={sign}>
                {chg}
              </span>
            </div>
            <svg className="hv-ref-strip__spark" viewBox="0 0 52 24" aria-hidden>
              <polyline
                fill="none"
                stroke={stroke}
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkPoints(m.symbol, sign === "up", m.changePct)}
              />
            </svg>
          </>
        );
        const href = m.href;
        return href ? (
          <a key={m.symbol} href={href} className="hv-ref-strip__item" aria-label={`${m.symbol} ${m.name}`}>
            {Inner}
          </a>
        ) : (
          <button key={m.symbol} type="button" className="hv-ref-strip__item" aria-label={`${m.symbol} ${m.name}`}>
            {Inner}
          </button>
        );
      })}
    </div>
  );
}
