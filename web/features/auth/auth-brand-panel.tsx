"use client";

import type { AuthScene } from "./auth-scenes";

const TICKER_LOGIN = [
  { sym: "BTC", chg: "+2.41%", up: true },
  { sym: "ETH", chg: "-0.82%", up: false },
  { sym: "XU100", chg: "+0.64%", up: true },
  { sym: "EUR/TRY", chg: "+0.12%", up: true },
];

const TICKER_REGISTER = [
  { sym: "For You", chg: "Kişisel", up: true },
  { sym: "Sinyal", chg: "Şeffaf", up: true },
  { sym: "Analist", chg: "Takip", up: true },
  { sym: "Keşfet", chg: "Akıllı", up: true },
];

function WideChart({ accent, sceneId }: { accent: string; sceneId: string }) {
  const gradId = `auth-chart-fill-${sceneId}`;
  return (
    <svg className="auth-brand__chart" viewBox="0 0 520 100" fill="none" aria-hidden preserveAspectRatio="none">
      <path
        d="M0 72 L52 64 L104 58 L156 44 L208 50 L260 34 L312 28 L364 22 L416 18 L468 12 L520 8"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M0 72 L52 64 L104 58 L156 44 L208 50 L260 34 L312 28 L364 22 L416 18 L468 12 L520 8 L520 100 L0 100 Z"
        fill={`url(#${gradId})`}
        opacity="0.15"
      />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AuthBrandPanel({ scene }: { scene: AuthScene }) {
  const ticker = scene.id === "login" ? TICKER_LOGIN : TICKER_REGISTER;

  return (
    <div className="auth-brand">
      <p className="auth-brand__kicker">{scene.kicker}</p>
      <h1 className="auth-brand__title">
        {scene.title}
        <span className="auth-brand__title-accent"> {scene.titleAccent}</span>
      </h1>
      <p className="auth-brand__subtitle">{scene.subtitle}</p>

      <WideChart accent={scene.accent} sceneId={scene.id} />

      <ul className="auth-brand__stats">
        {scene.features.map((f, i) => (
          <li key={f.label} className="auth-brand__stat">
            <span className="auth-brand__stat-value">{f.value}</span>
            <span className="auth-brand__stat-label">{f.label}</span>
            {i < scene.features.length - 1 ? <span className="auth-brand__stat-sep" aria-hidden /> : null}
          </li>
        ))}
      </ul>

      <p className="auth-brand__ticker" aria-hidden>
        {ticker.map((t, i) => (
          <span key={t.sym} className="auth-brand__ticker-item">
            <strong>{t.sym}</strong>
            <em className={t.up ? "is-up" : "is-down"}>{t.chg}</em>
            {i < ticker.length - 1 ? <span className="auth-brand__ticker-dot" /> : null}
          </span>
        ))}
      </p>
    </div>
  );
}
