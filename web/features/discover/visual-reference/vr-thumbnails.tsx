/**
 * VR Thumbnail scenes — inline SVG finans görselleri.
 * Gerçek asset gerekmez; tamamen CSS + SVG ile üretilir.
 * Her sahne farklı bir finans ortamını temsil eder.
 */

/* ─── Ortak yardımcılar ──────────────────────────────────────────────────── */

/** Smooth bezier price-action path */
function PriceLine({
  points,
  stroke = "rgba(255,255,255,0.55)",
  width = 1.5,
  fill = false,
  fillColor = "rgba(255,255,255,0.04)",
}: {
  points: [number, number][];
  stroke?: string;
  width?: number;
  fill?: boolean;
  fillColor?: string;
}) {
  if (points.length < 2) return null;
  const d = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1]!;
    const cx1 = px + (x - px) / 3;
    const cx2 = x - (x - px) / 3;
    return `${acc} C ${cx1} ${py}, ${cx2} ${y}, ${x} ${y}`;
  }, "");

  const lastPoint = points[points.length - 1]!;
  const firstPoint = points[0]!;
  const fillPath = fill
    ? `${d} L ${lastPoint[0]} 100 L ${firstPoint[0]} 100 Z`
    : d;

  return (
    <>
      {fill ? (
        <path d={fillPath} fill={fillColor} stroke="none" />
      ) : null}
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** Candle bars */
function CandleBar({ x, open, close, high, low, bullish }: {
  x: number; open: number; close: number; high: number; low: number; bullish: boolean;
}) {
  const color = bullish ? "rgba(52,211,153,0.75)" : "rgba(248,113,113,0.75)";
  const bodyTop = Math.min(open, close);
  const bodyH = Math.abs(close - open);
  return (
    <g>
      <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth="0.5" />
      <rect x={x - 2} y={bodyTop} width="4" height={Math.max(bodyH, 0.5)} fill={color} rx="0.3" />
    </g>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   LIVE THUMBNAILS — broadcast / stüdyo yüzeyi (grafik sadece arka plan dokusu)
   ═══════════════════════════════════════════════════════════════════════════ */

const faintChart1: [number, number][] = [[12, 58], [40, 52], [68, 54], [96, 44], [124, 46], [152, 38], [180, 40]];
const faintChart2: [number, number][] = [[10, 48], [45, 42], [80, 46], [115, 32], [150, 36], [190, 28]];

/** Live-1: BIST market studio — dolu set duvarı, üst ışık, chart arka planda */
export function ThumbLive1() {
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv1bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1a30" />
          <stop offset="50%" stopColor="#060c1a" />
          <stop offset="100%" stopColor="#020408" />
        </linearGradient>
        <linearGradient id="lv1uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(88,118,168,0.32)" />
          <stop offset="42%" stopColor="rgba(10,16,28,0)" />
        </linearGradient>
        <linearGradient id="lv1beamT" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id="lv1spot" cx="52%" cy="-5%" r="78%">
          <stop offset="0%" stopColor="rgba(255,248,235,0.18)" />
          <stop offset="55%" stopColor="rgba(255,248,235,0)" />
        </radialGradient>
        <radialGradient id="lv1vig" cx="50%" cy="50%" r="72%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.48)" />
        </radialGradient>
        <linearGradient id="lv1sc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(36,58,96,0.62)" />
          <stop offset="100%" stopColor="rgba(4,8,16,0.9)" />
        </linearGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv1bg)" />
      <rect width="200" height="56" fill="url(#lv1uplift)" />
      <rect x="96" y="0" width="104" height="50" fill="url(#lv1beamT)" opacity="0.55" />
      {[9, 15, 21, 27, 33].map((y) => (
        <line key={y} x1="6" y1={y} x2="194" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="6" height="58" fill="rgba(0,0,0,0.28)" />
      <rect x="194" y="0" width="6" height="58" fill="rgba(0,0,0,0.28)" />
      <rect x="0" y="0" width="200" height="58" fill="rgba(0,0,0,0.22)" />
      <rect x="0" y="0" width="200" height="3" fill="rgba(255,255,255,0.06)" />
      <circle cx="14" cy="11" r="1.5" fill="rgba(250,204,21,0.45)" />
      <circle cx="24" cy="11" r="1.5" fill="rgba(250,204,21,0.22)" />
      <circle cx="34" cy="11" r="1.5" fill="rgba(148,163,184,0.3)" />
      <rect x="8" y="10" width="54" height="36" rx="1.5" fill="url(#lv1sc)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      <rect x="12" y="14" width="46" height="10" rx="0.6" fill="rgba(52,211,153,0.05)" />
      <polygon points="12,18 58,18 52,28 14,28" fill="rgba(255,255,255,0.028)" />
      <rect x="68" y="7" width="66" height="42" rx="1.5" fill="url(#lv1sc)" stroke="rgba(255,255,255,0.11)" strokeWidth="0.45" />
      <rect x="76" y="11" width="50" height="16" rx="0.8" fill="rgba(45,212,191,0.055)" />
      <polygon points="74,12 132,12 118,34 80,34" fill="rgba(255,255,255,0.032)" />
      <rect x="138" y="11" width="54" height="36" rx="1.5" fill="url(#lv1sc)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.4" />
      <rect x="142" y="15" width="46" height="9" rx="0.5" fill="rgba(96,165,250,0.04)" />
      <g opacity="0.03">
        <PriceLine points={faintChart1} stroke="rgba(52,211,153,0.95)" width={0.48} />
      </g>
      <rect x="0" y="52" width="200" height="5" fill="rgba(0,0,0,0.5)" />
      <rect x="0" y="52" width="200" height="5" fill="rgba(52,211,153,0.055)" />
      <path d="M0 76 L200 70 L200 100 L0 100 Z" fill="rgba(0,0,0,0.58)" />
      <ellipse cx="150" cy="84" rx="24" ry="30" fill="rgba(0,0,0,0.62)" />
      <ellipse cx="150" cy="56" rx="11" ry="13" fill="rgba(0,0,0,0.48)" />
      <ellipse cx="108" cy="86" rx="15" ry="24" fill="rgba(0,0,0,0.42)" />
      <rect x="3" y="3" width="194" height="94" rx="2.2" fill="none" stroke="rgba(255,255,255,0.042)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv1spot)" opacity="0.5" />
      <rect width="200" height="100" fill="url(#lv1vig)" />
    </svg>
  );
}

/** Live-2: Crypto live room — LED duvar + ana ekran + set derinliği */
export function ThumbLive2() {
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv2bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0a32" />
          <stop offset="100%" stopColor="#050210" />
        </linearGradient>
        <linearGradient id="lv2uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(110,60,180,0.28)" />
          <stop offset="45%" stopColor="rgba(8,4,18,0)" />
        </linearGradient>
        <linearGradient id="lv2beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(124,58,237,0)" />
          <stop offset="40%" stopColor="rgba(139,92,246,0.24)" />
          <stop offset="60%" stopColor="rgba(167,139,250,0.2)" />
          <stop offset="100%" stopColor="rgba(124,58,237,0)" />
        </linearGradient>
        <radialGradient id="lv2vig" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.56)" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv2bg)" />
      <rect width="200" height="54" fill="url(#lv2uplift)" />
      {[7, 13, 19, 25, 31].map((y) => (
        <line key={y} x1="8" y1={y} x2="192" y2={y} stroke="rgba(196,181,253,0.035)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="7" height="58" fill="rgba(0,0,0,0.32)" />
      <rect x="193" y="0" width="7" height="58" fill="rgba(0,0,0,0.32)" />
      {[0, 22, 44, 66, 88, 110, 132, 154, 176].map((x, i) => (
        <rect key={i} x={x} y="6" width="10" height="48" rx="1" fill="rgba(88,28,135,0.38)" opacity={0.32 + (i % 3) * 0.1} />
      ))}
      <rect x="16" y="12" width="168" height="40" rx="2" fill="rgba(0,0,0,0.48)" stroke="rgba(167,139,250,0.16)" strokeWidth="0.5" />
      <rect x="24" y="16" width="152" height="12" rx="1" fill="rgba(124,58,237,0.07)" />
      <polygon points="22,18 178,18 168,32 26,32" fill="rgba(196,181,253,0.04)" />
      <rect x="0" y="50" width="200" height="2" fill="rgba(167,139,250,0.08)" />
      <g opacity="0.032">
        <PriceLine points={faintChart2} stroke="rgba(196,181,253,0.95)" width={0.55} fill fillColor="rgba(124,58,237,0.05)" />
      </g>
      <rect x="0" y="0" width="200" height="100" fill="url(#lv2beam)" opacity="0.38" />
      <path d="M0 78 L200 72 L200 100 L0 100 Z" fill="rgba(0,0,0,0.56)" />
      <ellipse cx="142" cy="82" rx="26" ry="32" fill="rgba(0,0,0,0.65)" />
      <ellipse cx="142" cy="54" rx="12" ry="14" fill="rgba(0,0,0,0.46)" />
      <rect x="4" y="4" width="192" height="92" rx="2.2" fill="none" stroke="rgba(196,181,253,0.06)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv2vig)" />
    </svg>
  );
}

/** Live-3: Macro briefing — harita + çift panel + üst ışık */
export function ThumbLive3() {
  const macroPath: [number, number][] = [[0, 62], [35, 58], [70, 52], [105, 48], [140, 44], [175, 40], [200, 38]];
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv3bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e1820" />
          <stop offset="100%" stopColor="#04080c" />
        </linearGradient>
        <linearGradient id="lv3uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(80,120,130,0.3)" />
          <stop offset="48%" stopColor="rgba(4,10,14,0)" />
        </linearGradient>
        <radialGradient id="lv3map" cx="32%" cy="34%" r="62%">
          <stop offset="0%" stopColor="rgba(148,180,190,0.14)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0)" />
        </radialGradient>
        <radialGradient id="lv3vig" cx="50%" cy="50%" r="72%">
          <stop offset="56%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv3bg)" />
      <rect width="200" height="56" fill="url(#lv3uplift)" />
      <ellipse cx="74" cy="36" rx="62" ry="34" fill="url(#lv3map)" />
      {[10, 16, 22, 28, 34].map((y) => (
        <line key={y} x1="10" y1={y} x2="190" y2={y} stroke="rgba(94,234,212,0.03)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="6" height="56" fill="rgba(0,0,0,0.26)" />
      <rect x="194" y="0" width="6" height="56" fill="rgba(0,0,0,0.26)" />
      <path d="M18 42 Q48 26 92 38 T168 32 T200 28" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
      <rect x="10" y="10" width="86" height="36" rx="1.8" fill="rgba(0,0,0,0.44)" stroke="rgba(148,163,184,0.11)" strokeWidth="0.42" />
      <rect x="104" y="10" width="86" height="36" rx="1.8" fill="rgba(0,0,0,0.42)" stroke="rgba(148,163,184,0.12)" strokeWidth="0.42" />
      <rect x="18" y="15" width="70" height="12" rx="0.8" fill="rgba(45,212,191,0.05)" />
      <rect x="112" y="15" width="70" height="12" rx="0.8" fill="rgba(148,163,184,0.06)" />
      <polygon points="52,20 148,20 138,36 58,36" fill="rgba(255,255,255,0.025)" />
      <rect x="48" y="18" width="104" height="28" rx="1.2" fill="rgba(6,14,18,0.62)" stroke="rgba(94,234,212,0.09)" strokeWidth="0.4" />
      <g opacity="0.03">
        <PriceLine points={macroPath} stroke="rgba(94,234,212,0.95)" width={0.48} />
      </g>
      <path d="M0 76 L200 71 L200 100 L0 100 Z" fill="rgba(0,0,0,0.56)" />
      <ellipse cx="148" cy="82" rx="22" ry="30" fill="rgba(0,0,0,0.62)" />
      <ellipse cx="148" cy="56" rx="10" ry="12" fill="rgba(0,0,0,0.46)" />
      <rect x="4" y="4" width="192" height="92" rx="2.2" fill="none" stroke="rgba(94,234,212,0.055)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv3vig)" />
    </svg>
  );
}

/** Live-4: Trading desk — üç monitör + sıcak masa + set çerçevesi */
export function ThumbLive4() {
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv4bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#221010" />
          <stop offset="100%" stopColor="#050202" />
        </linearGradient>
        <linearGradient id="lv4uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(140,50,50,0.22)" />
          <stop offset="50%" stopColor="rgba(12,4,4,0)" />
        </linearGradient>
        <radialGradient id="lv4warm" cx="78%" cy="92%" r="58%">
          <stop offset="0%" stopColor="rgba(248,113,113,0.14)" />
          <stop offset="100%" stopColor="rgba(248,113,113,0)" />
        </radialGradient>
        <radialGradient id="lv4vig" cx="50%" cy="50%" r="70%">
          <stop offset="54%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv4bg)" />
      <rect width="200" height="54" fill="url(#lv4uplift)" />
      <rect width="200" height="100" fill="url(#lv4warm)" />
      <rect x="0" y="8" width="5" height="48" fill="rgba(28,14,14,0.42)" />
      <rect x="195" y="8" width="5" height="48" fill="rgba(28,14,14,0.42)" />
      {[8, 14, 20, 26, 32].map((y) => (
        <line key={y} x1="5" y1={y} x2="195" y2={y} stroke="rgba(255,255,255,0.028)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="6" height="56" fill="rgba(0,0,0,0.3)" />
      <rect x="194" y="0" width="6" height="56" fill="rgba(0,0,0,0.3)" />
      <rect x="6" y="10" width="48" height="34" rx="1.2" fill="rgba(0,0,0,0.56)" stroke="rgba(248,113,113,0.14)" strokeWidth="0.4" />
      <rect x="10" y="14" width="40" height="10" rx="0.6" fill="rgba(248,113,113,0.05)" />
      <rect x="58" y="8" width="84" height="38" rx="1.5" fill="rgba(0,0,0,0.52)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.45" />
      <rect x="66" y="12" width="68" height="14" rx="0.8" fill="rgba(248,113,113,0.045)" />
      <polygon points="62,10 138,10 128,28 68,28" fill="rgba(255,255,255,0.022)" />
      <rect x="146" y="12" width="48" height="32" rx="1.2" fill="rgba(0,0,0,0.54)" stroke="rgba(248,113,113,0.11)" strokeWidth="0.4" />
      <g opacity="0.032">
        <PriceLine points={faintChart1} stroke="rgba(248,113,113,0.9)" width={0.48} />
      </g>
      <path d="M0 74 L200 69 L200 100 L0 100 Z" fill="rgba(0,0,0,0.6)" />
      <ellipse cx="132" cy="80" rx="20" ry="28" fill="rgba(0,0,0,0.64)" />
      <ellipse cx="132" cy="56" rx="9" ry="11" fill="rgba(0,0,0,0.48)" />
      <ellipse cx="168" cy="84" rx="14" ry="22" fill="rgba(0,0,0,0.38)" />
      <rect x="3" y="3" width="194" height="94" rx="2.2" fill="none" stroke="rgba(248,113,113,0.06)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv4vig)" />
    </svg>
  );
}

/** Live-5: BIST market room — dolu ticker duvarı + üst ışık + çerçeve */
export function ThumbLive5() {
  const tiles = [12, 18, 14, 22, 16, 24, 20, 28, 18, 26, 22, 30];
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv5bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c180c" />
          <stop offset="100%" stopColor="#020402" />
        </linearGradient>
        <linearGradient id="lv5uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(52,120,72,0.24)" />
          <stop offset="45%" stopColor="rgba(4,8,4,0)" />
        </linearGradient>
        <radialGradient id="lv5vig" cx="50%" cy="50%" r="72%">
          <stop offset="56%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv5bg)" />
      <rect width="200" height="52" fill="url(#lv5uplift)" />
      {[8, 14, 20, 26].map((y) => (
        <line key={y} x1="6" y1={y} x2="194" y2={y} stroke="rgba(52,211,153,0.03)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="6" height="54" fill="rgba(0,0,0,0.28)" />
      <rect x="194" y="0" width="6" height="54" fill="rgba(0,0,0,0.28)" />
      <rect x="4" y="7" width="192" height="46" rx="2" fill="rgba(0,0,0,0.46)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.48" />
      <rect x="8" y="11" width="184" height="8" rx="1" fill="rgba(0,0,0,0.35)" />
      {[14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94, 102, 110, 118, 126, 134, 142, 150, 158, 166, 174, 182].map((x, i) => (
        <circle key={i} cx={x} cy="15" r="0.9" fill={i % 4 === 0 ? "rgba(248,113,113,0.35)" : "rgba(52,211,153,0.28)"} />
      ))}
      {tiles.map((h, i) => {
        const bull = i % 3 !== 0;
        const x = 10 + i * 15;
        return (
          <rect
            key={i}
            x={x}
            y={48 - h * 0.35}
            width={11}
            height={h * 0.35}
            rx="0.8"
            fill={bull ? "rgba(52,211,153,0.24)" : "rgba(248,113,113,0.2)"}
          />
        );
      })}
      <g opacity="0.036">
        <PriceLine
          points={tiles.map((h, i) => [10 + i * 15 + 5.5, 48 - h * 0.35] as [number, number])}
          stroke="rgba(52,211,153,0.9)"
          width={0.45}
        />
      </g>
      <path d="M0 76 L200 71 L200 100 L0 100 Z" fill="rgba(0,0,0,0.58)" />
      <ellipse cx="154" cy="84" rx="23" ry="29" fill="rgba(0,0,0,0.63)" />
      <ellipse cx="154" cy="57" rx="10" ry="12" fill="rgba(0,0,0,0.46)" />
      <rect x="3" y="3" width="194" height="94" rx="2.2" fill="none" stroke="rgba(52,211,153,0.055)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv5vig)" />
    </svg>
  );
}

/** Live-6: Altın / emtia stüdyosu — çift ekran + amber wash + set derinliği */
export function ThumbLive6() {
  const goldFaint: [number, number][] = [[0, 58], [40, 54], [80, 50], [120, 46], [160, 42], [200, 38]];
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lv6bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1408" />
          <stop offset="100%" stopColor="#050402" />
        </linearGradient>
        <linearGradient id="lv6uplift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(180,130,40,0.26)" />
          <stop offset="48%" stopColor="rgba(12,8,4,0)" />
        </linearGradient>
        <radialGradient id="lv6gold" cx="48%" cy="12%" r="68%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.18)" />
          <stop offset="72%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
        <radialGradient id="lv6vig" cx="50%" cy="50%" r="70%">
          <stop offset="54%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
        </radialGradient>
      </defs>
      <rect width="200" height="100" fill="url(#lv6bg)" />
      <rect width="200" height="54" fill="url(#lv6uplift)" />
      <rect width="200" height="100" fill="url(#lv6gold)" />
      {[9, 15, 21, 27].map((y) => (
        <line key={y} x1="8" y1={y} x2="192" y2={y} stroke="rgba(251,191,36,0.035)" strokeWidth="0.35" />
      ))}
      <rect x="0" y="0" width="6" height="56" fill="rgba(0,0,0,0.28)" />
      <rect x="194" y="0" width="6" height="56" fill="rgba(0,0,0,0.28)" />
      <rect x="0" y="6" width="8" height="50" fill="rgba(40,28,10,0.35)" />
      <rect x="192" y="6" width="8" height="50" fill="rgba(40,28,10,0.35)" />
      <rect x="12" y="9" width="118" height="40" rx="2" fill="rgba(0,0,0,0.5)" stroke="rgba(251,191,36,0.13)" strokeWidth="0.45" />
      <rect x="18" y="14" width="106" height="12" rx="0.8" fill="rgba(245,158,11,0.06)" />
      <polygon points="16,16 124,16 112,34 20,34" fill="rgba(255,255,255,0.03)" />
      <rect x="136" y="12" width="52" height="36" rx="1.5" fill="rgba(0,0,0,0.54)" stroke="rgba(245,158,11,0.11)" strokeWidth="0.42" />
      <rect x="142" y="17" width="40" height="10" rx="0.6" fill="rgba(251,191,36,0.05)" />
      <g opacity="0.03">
        <PriceLine points={goldFaint} stroke="rgba(252,211,77,0.95)" width={0.48} fill fillColor="rgba(217,119,6,0.04)" />
      </g>
      <path d="M0 75 L200 70 L200 100 L0 100 Z" fill="rgba(0,0,0,0.58)" />
      <ellipse cx="146" cy="82" rx="24" ry="30" fill="rgba(0,0,0,0.64)" />
      <ellipse cx="146" cy="55" rx="11" ry="13" fill="rgba(0,0,0,0.47)" />
      <rect x="3" y="3" width="194" height="94" rx="2.2" fill="none" stroke="rgba(251,191,36,0.065)" strokeWidth="0.38" />
      <rect width="200" height="100" fill="url(#lv6vig)" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIDEO THUMBNAILS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Video-1: Portföy yönetimi — pie chart + allocation bars */
export function ThumbVideo1() {
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1828" />
          <stop offset="100%" stopColor="#03060f" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb1)" />
      {/* Pie chart */}
      <circle cx="240" cy="90" r="55" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="28" />
      <circle cx="240" cy="90" r="55" fill="none" stroke="rgba(62,228,205,0.55)" strokeWidth="28"
        strokeDasharray="86 259" strokeDashoffset="0" transform="rotate(-90 240 90)" />
      <circle cx="240" cy="90" r="55" fill="none" stroke="rgba(139,92,246,0.45)" strokeWidth="28"
        strokeDasharray="60 285" strokeDashoffset="-86" transform="rotate(-90 240 90)" />
      <circle cx="240" cy="90" r="55" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="28"
        strokeDasharray="45 300" strokeDashoffset="-146" transform="rotate(-90 240 90)" />
      <circle cx="240" cy="90" r="55" fill="none" stroke="rgba(248,113,113,0.35)" strokeWidth="28"
        strokeDasharray="33 312" strokeDashoffset="-191" transform="rotate(-90 240 90)" />
      <text x="240" y="87" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="bold" fontFamily="monospace">33%</text>
      <text x="240" y="99" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">Hisse</text>
      {/* Allocation list */}
      {[
        { label: "Hisse", pct: 33, color: "rgba(62,228,205,0.7)" },
        { label: "Kripto", pct: 23, color: "rgba(139,92,246,0.7)" },
        { label: "Altın", pct: 17, color: "rgba(251,191,36,0.7)" },
        { label: "Nakit", pct: 13, color: "rgba(248,113,113,0.65)" },
      ].map((row, i) => (
        <g key={i} transform={`translate(20, ${30 + i * 28})`}>
          <rect x="0" y="0" width="4" height="14" fill={row.color} rx="1" />
          <text x="10" y="10" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="monospace">{row.label}</text>
          <text x="10" y="20" fill={row.color} fontSize="8" fontFamily="monospace" fontWeight="bold">{row.pct}%</text>
        </g>
      ))}
    </svg>
  );
}

/** Video-2: Bitcoin on-chain — hash ribbon + block height */
export function ThumbVideo2() {
  const hashPath: [number, number][] = [
    [0,85],[30,78],[60,70],[90,65],[120,60],[150,52],[180,48],[210,42],[240,38],[270,32],[300,28],[320,26]
  ];
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#120a28" />
          <stop offset="100%" stopColor="#050310" />
        </linearGradient>
        <linearGradient id="vb2f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(167,139,250,0.3)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb2)" />
      {/* Hash ribbon area */}
      <PriceLine points={hashPath} stroke="rgba(167,139,250,0.7)" width={2} fill fillColor="url(#vb2f)" />
      {/* Block height dots */}
      {[40, 80, 120, 160, 200, 240, 280].map((x, i) => (
        <circle key={i} cx={x} cy={hashPath.find(p => p[0] >= x)?.[1] ?? 50} r="2.5"
          fill="rgba(167,139,250,0.6)" />
      ))}
      {/* BTC symbol */}
      <text x="12" y="20" fill="rgba(167,139,250,0.7)" fontSize="16" fontWeight="bold" fontFamily="monospace">₿</text>
      <text x="32" y="20" fill="rgba(255,255,255,0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">BITCOIN</text>
      {/* On-chain label */}
      <text x="12" y="32" fill="rgba(167,139,250,0.45)" fontSize="6.5" fontFamily="monospace">ON-CHAIN ANALIZ</text>
    </svg>
  );
}

/** Video-3: BIST100 yıl sonu — bar chart target */
export function ThumbVideo3() {
  const years = [
    { y: "2021", h: 55, bull: true },
    { y: "2022", h: 45, bull: false },
    { y: "2023", h: 75, bull: true },
    { y: "2024", h: 90, bull: true },
    { y: "2025", h: 65, bull: true, target: true },
  ];
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d1f3c" />
          <stop offset="100%" stopColor="#050a14" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb3)" />
      {/* Baseline */}
      <line x1="20" y1="145" x2="300" y2="145" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      {years.map((bar, i) => {
        const x = 30 + i * 55;
        const color = bar.target
          ? "rgba(62,228,205,0.55)"
          : bar.bull ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.45)";
        const borderColor = bar.target ? "rgba(62,228,205,0.85)" : "none";
        return (
          <g key={i}>
            <rect x={x} y={145 - bar.h} width="36" height={bar.h} fill={color} rx="2" />
            {bar.target ? (
              <rect x={x} y={145 - bar.h} width="36" height={bar.h} fill="none"
                stroke={borderColor} strokeWidth="1.2" strokeDasharray="3,2" rx="2" />
            ) : null}
            <text x={x + 18} y={155} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">{bar.y}</text>
            {bar.target ? (
              <text x={x + 18} y={145 - bar.h - 5} textAnchor="middle" fill="rgba(62,228,205,0.8)" fontSize="7" fontWeight="bold" fontFamily="monospace">Hedef</text>
            ) : null}
          </g>
        );
      })}
      <text x="20" y="18" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="bold" fontFamily="monospace">BIST 100</text>
    </svg>
  );
}

/** Video-4: TCMB — interest rate timeline */
export function ThumbVideo4() {
  const rates: [number, number][] = [
    [0,40],[40,40],[70,55],[100,55],[130,70],[160,70],[190,85],[220,85],[250,75],[280,60],[310,50],[320,45]
  ];
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1000" />
          <stop offset="100%" stopColor="#080400" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb4)" />
      {/* Step rate line */}
      <polyline
        points={rates.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none" stroke="rgba(251,191,36,0.65)" strokeWidth="2" strokeLinejoin="round"
      />
      {/* Step dots */}
      {[[70,55],[130,70],[190,85],[250,75],[280,60]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="rgba(251,191,36,0.8)" />
      ))}
      {/* Current rate callout */}
      <rect x="230" y="35" width="70" height="24" rx="4" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.35)" strokeWidth="0.8" />
      <text x="265" y="48" textAnchor="middle" fill="rgba(251,191,36,0.9)" fontSize="8" fontWeight="bold" fontFamily="monospace">%40 Faiz</text>
      <text x="12" y="18" fill="rgba(251,191,36,0.7)" fontSize="10" fontWeight="bold" fontFamily="monospace">TCMB FAİZ</text>
    </svg>
  );
}

/** Video-5: Altın tarihsel — long-term log scale */
export function ThumbVideo5() {
  const goldLT: [number, number][] = [
    [0,140],[30,138],[60,132],[90,125],[120,118],[150,108],[180,95],[210,80],[240,65],[270,50],[295,38],[310,30],[320,28]
  ];
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#201400" />
          <stop offset="100%" stopColor="#0a0600" />
        </linearGradient>
        <linearGradient id="vb5f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(217,119,6,0.3)" />
          <stop offset="100%" stopColor="rgba(217,119,6,0)" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb5)" />
      <PriceLine points={goldLT} stroke="rgba(251,191,36,0.7)" width={2} fill fillColor="url(#vb5f)" />
      {/* Year marks */}
      {["2000","2005","2010","2015","2020","2025"].map((yr, i) => (
        <text key={i} x={i * 62 + 4} y={168} fill="rgba(255,255,255,0.22)" fontSize="6" fontFamily="monospace">{yr}</text>
      ))}
      <text x="12" y="18" fill="rgba(251,191,36,0.7)" fontSize="14" fontFamily="monospace" fontWeight="bold">Au</text>
      <text x="32" y="18" fill="rgba(255,255,255,0.75)" fontSize="9" fontWeight="bold" fontFamily="monospace">ALTIN</text>
    </svg>
  );
}

/** Video-6: VIOP opsiyon — payoff diagram */
export function ThumbVideo6() {
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="vb6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#141414" />
          <stop offset="100%" stopColor="#060606" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#vb6)" />
      {/* Axes */}
      <line x1="30" y1="130" x2="300" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <line x1="160" y1="20" x2="160" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3,3" />
      {/* Long call payoff */}
      <polyline points="30,130 160,130 260,50" fill="none" stroke="rgba(52,211,153,0.65)" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Long put payoff */}
      <polyline points="300,130 160,130 60,50" fill="none" stroke="rgba(139,92,246,0.55)" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4,3" />
      {/* Strike marker */}
      <circle cx="160" cy="130" r="3" fill="rgba(255,255,255,0.6)" />
      <text x="162" y="143" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">ATM</text>
      <text x="12" y="18" fill="rgba(255,255,255,0.75)" fontSize="9" fontWeight="bold" fontFamily="monospace">OPSIYON STRATEJISI</text>
      <text x="12" y="29" fill="rgba(52,211,153,0.5)" fontSize="6.5" fontFamily="monospace">— Long Call</text>
      <text x="12" y="39" fill="rgba(139,92,246,0.5)" fontSize="6.5" fontFamily="monospace">- - Long Put</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PULSE THUMBNAILS  (9:16 portrait)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Pulse-1: BIST100 özet — vertical candle strip */
export function ThumbPulse1() {
  const c = [
    { o:80,c:72,h:68,l:84,bull:true }, { o:72,c:65,h:62,l:75,bull:true },
    { o:65,c:70,h:62,l:73,bull:false }, { o:70,c:60,h:57,l:72,bull:true },
    { o:60,c:55,h:52,l:62,bull:true }, { o:55,c:50,h:48,l:57,bull:true },
  ];
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d1f3c" />
          <stop offset="100%" stopColor="#050a14" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb1)" />
      {c.map((b, i) => (
        <CandleBar key={i} x={10 + i * 14} open={b.o} close={b.c} high={b.h} low={b.l} bullish={b.bull} />
      ))}
      <text x="5" y="120" fill="rgba(62,228,205,0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">BIST</text>
      <text x="5" y="133" fill="rgba(52,211,153,0.7)" fontSize="9" fontFamily="monospace">+1.2%</text>
    </svg>
  );
}

/** Pulse-2: ETH pozisyon — clean line */
export function ThumbPulse2() {
  const ethPath: [number, number][] = [
    [0,120],[15,110],[30,115],[45,95],[60,100],[75,85],[90,78]
  ];
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0e30" />
          <stop offset="100%" stopColor="#06040f" />
        </linearGradient>
        <linearGradient id="pb2f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb2)" />
      <PriceLine points={ethPath} stroke="rgba(167,139,250,0.8)" width={2} fill fillColor="url(#pb2f)" />
      {/* ETH diamond symbol */}
      <polygon points="45,30 52,45 45,55 38,45" fill="rgba(139,92,246,0.4)" stroke="rgba(167,139,250,0.6)" strokeWidth="1" />
      <text x="45" y="75" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="bold" fontFamily="monospace">ETH</text>
    </svg>
  );
}

/** Pulse-3: Altın/Gümüş spread */
export function ThumbPulse3() {
  const au: [number, number][] = [[0,100],[20,95],[40,88],[60,80],[80,72],[90,65]];
  const ag: [number, number][] = [[0,120],[20,118],[40,114],[60,108],[80,98],[90,90]];
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1800" />
          <stop offset="100%" stopColor="#0d0700" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb3)" />
      <PriceLine points={ag} stroke="rgba(200,200,200,0.4)" width={1.2} />
      <PriceLine points={au} stroke="rgba(251,191,36,0.75)" width={2} />
      <text x="5" y="25" fill="rgba(251,191,36,0.8)" fontSize="8" fontWeight="bold" fontFamily="monospace">Au/Ag</text>
      <text x="5" y="36" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="monospace">yayılım↑</text>
    </svg>
  );
}

/** Pulse-4: GARAN destek/direnç */
export function ThumbPulse4() {
  const path: [number, number][] = [
    [0,100],[15,95],[30,90],[45,85],[55,78],[65,82],[75,75],[90,70]
  ];
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f2818" />
          <stop offset="100%" stopColor="#040e07" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb4)" />
      {/* Support/resistance lines */}
      <line x1="0" y1="75" x2="90" y2="75" stroke="rgba(52,211,153,0.35)" strokeWidth="0.8" strokeDasharray="4,3" />
      <line x1="0" y1="95" x2="90" y2="95" stroke="rgba(248,113,113,0.3)" strokeWidth="0.8" strokeDasharray="4,3" />
      <PriceLine points={path} stroke="rgba(52,211,153,0.7)" width={1.8} />
      <text x="5" y="20" fill="rgba(52,211,153,0.75)" fontSize="9" fontWeight="bold" fontFamily="monospace">GARAN</text>
    </svg>
  );
}

/** Pulse-5: VIOP straddle cost */
export function ThumbPulse5() {
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1400" />
          <stop offset="100%" stopColor="#080600" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb5)" />
      {/* Straddle V-shape payoff */}
      <polyline points="10,100 45,55 80,100" fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="45" y1="100" x2="45" y2="55" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2,3" />
      <circle cx="45" cy="100" r="2.5" fill="rgba(251,191,36,0.7)" />
      <text x="45" y="110" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="5.5" fontFamily="monospace">ATM</text>
      <text x="5" y="20" fill="rgba(251,191,36,0.75)" fontSize="8" fontWeight="bold" fontFamily="monospace">VIOP</text>
      <text x="5" y="30" fill="rgba(255,255,255,0.4)" fontSize="5.5" fontFamily="monospace">straddle</text>
    </svg>
  );
}

/** Pulse-6: Fed/Makro — bar chart */
export function ThumbPulse6() {
  const bars = [40, 50, 55, 50, 45, 40, 42, 55, 60];
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#001524" />
          <stop offset="100%" stopColor="#000508" />
        </linearGradient>
      </defs>
      <rect width="90" height="160" fill="url(#pb6)" />
      {bars.map((h, i) => (
        <rect key={i} x={4 + i * 9} y={100 - h} width="7" height={h}
          fill={i === 8 ? "rgba(62,228,205,0.55)" : "rgba(62,228,205,0.22)"} rx="1" />
      ))}
      <text x="5" y="18" fill="rgba(62,228,205,0.7)" fontSize="7" fontWeight="bold" fontFamily="monospace">FED WATCH</text>
    </svg>
  );
}

/** Generic fallback — sparkline */
export function ThumbGeneric({ color = "#3ee4cd" }: { color?: string }) {
  const path: [number, number][] = [
    [0,80],[20,72],[40,65],[60,70],[80,58],[100,52],[120,55],[140,45],[160,40]
  ];
  return (
    <svg viewBox="0 0 160 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="160" height="90" fill="#080a0e" />
      <PriceLine points={path} stroke={`${color}99`} width={2} />
    </svg>
  );
}
