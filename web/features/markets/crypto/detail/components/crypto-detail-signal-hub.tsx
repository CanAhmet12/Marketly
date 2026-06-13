"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { HScroll } from "@/features/discover/visual-reference/discover-vr-primitives";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { buildCryptoSignalHub } from "@/features/markets/crypto/detail/lib/build-crypto-signal-hub";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { AssetTopAnalyst } from "@/features/markets/types/asset-intelligence";
import { SignalsLiveRailCard } from "@/features/signals/components/signals-live-rail-card";
import {
  SignalDirectionPill,
  thesisGradeLabel,
} from "@/features/signals/components/unified-signal-primitives";
import { SignalsEngagementProvider } from "@/features/signals/contexts/signals-engagement-context";
import { mapFeedRowToLiveCardItem } from "@/features/signals/lib/map-feed-row-to-live-card";
import type { ChannelSignal } from "@/features/channel/types";
import { cn } from "@/lib/cn";

type Props = { bundle: AssetIntelligenceBundle };

const TABLE_PREVIEW_ROWS = 3;

function asDirection(d: string): ChannelSignal["direction"] {
  const u = d.toUpperCase();
  if (u === "BUY" || u === "SELL" || u === "HOLD") return u;
  return "HOLD";
}

function analystBiasLabel(bias: AssetTopAnalyst["bias"]): string {
  if (bias === "bullish") return "Boğa";
  if (bias === "bearish") return "Ayı";
  return "Karışık";
}

function analystBiasClass(bias: AssetTopAnalyst["bias"]): string {
  if (bias === "bullish") return "cd-signal-analyst-bias--bull";
  if (bias === "bearish") return "cd-signal-analyst-bias--bear";
  return "cd-signal-analyst-bias--mixed";
}

function ConfidenceDistribution({
  bins,
  total,
}: {
  bins: { high: number; mid: number; low: number };
  total: number;
}) {
  const denom = Math.max(1, total);
  const segments = [
    { key: "high", label: "Yüksek (70+)", count: bins.high, className: "cd-signal-conf-fill--high" },
    { key: "mid", label: "Orta (50–69)", count: bins.mid, className: "cd-signal-conf-fill--mid" },
    { key: "low", label: "Düşük (<50)", count: bins.low, className: "cd-signal-conf-fill--low" },
  ];

  return (
    <div className="cd-signal-conf-panel">
      <p className="cd-signal-panel-title">Güven dağılımı</p>
      <div className="cd-signal-conf-stack" aria-hidden>
        {segments.map((s) =>
          s.count > 0 ? (
            <div
              key={s.key}
              className={cn("cd-signal-conf-fill", s.className)}
              style={{ width: `${(s.count / denom) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="cd-signal-conf-legend">
        {segments.map((s) => (
          <li key={s.key}>
            <span className={cn("cd-signal-conf-dot", s.className)} aria-hidden />
            <span className="cd-signal-conf-label">{s.label}</span>
            <span className="cd-signal-conf-count">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CryptoDetailSignalHub({ bundle }: Props) {
  const router = useRouter();
  const hub = useMemo(() => buildCryptoSignalHub(bundle), [bundle]);
  const binTotal = hub.confidenceBins.high + hub.confidenceBins.mid + hub.confidenceBins.low;
  const [tableExpanded, setTableExpanded] = useState(false);
  const visibleRows = tableExpanded ? hub.rows : hub.rows.slice(0, TABLE_PREVIEW_ROWS);
  const hiddenRowCount = Math.max(0, hub.rows.length - TABLE_PREVIEW_ROWS);

  const liveItems = useMemo(
    () =>
      bundle.signals
        .filter((s) => s.is_active)
        .slice(0, 8)
        .map(mapFeedRowToLiveCardItem),
    [bundle.signals],
  );

  return (
    <section className="cd-signal-hub cd-signal-v3" role="region" aria-label="Sinyaller">

      <div className="cd-signal-command-grid" role="list">
        {hub.commandMetrics.map((m) => (
          <div
            key={m.key}
            role="listitem"
            className={cn(
              "cd-signal-command-cell",
              m.tone === "bull" && "cd-signal-command-cell--bull",
              m.tone === "bear" && "cd-signal-command-cell--bear",
              m.tone === "gold" && "cd-signal-command-cell--gold",
              m.tone === "muted" && "cd-signal-command-cell--muted",
            )}
          >
            <span className="cd-signal-command-label">{m.label}</span>
            <span className="cd-signal-command-value">{m.value}</span>
            {m.hint ? <span className="cd-signal-command-hint">{m.hint}</span> : null}
          </div>
        ))}
      </div>

      <div className="cd-signal-zone-rule" aria-hidden />

      <div className="cd-signal-intel-grid">
        <div className="cd-signal-consensus-panel">
          <p className="cd-signal-panel-title">Konsensüs</p>

          <div className="cd-signal-gauge-rows">
            <div className="cd-signal-gauge-row">
              <span className="cd-signal-gauge-pct cd-signal-gauge-pct--bull">%{hub.bullPct}</span>
              <div className="cd-signal-gauge-bar">
                <div
                  className="cd-signal-gauge-fill cd-signal-gauge-fill--bull"
                  style={{ width: `${hub.bullPct}%` }}
                />
              </div>
              <span className="cd-signal-gauge-tag cd-signal-gauge-tag--bull">Boğa</span>
            </div>
            <div className="cd-signal-gauge-row">
              <span className="cd-signal-gauge-pct cd-signal-gauge-pct--bear">%{hub.bearPct}</span>
              <div className="cd-signal-gauge-bar">
                <div
                  className="cd-signal-gauge-fill cd-signal-gauge-fill--bear"
                  style={{ width: `${hub.bearPct}%` }}
                />
              </div>
              <span className="cd-signal-gauge-tag cd-signal-gauge-tag--bear">Ayı</span>
            </div>
          </div>

          <dl className="cd-signal-consensus-stats">
            <div>
              <dt>Uyum</dt>
              <dd>%{hub.agreementPct}</dd>
            </div>
            <div>
              <dt>Ort. güven</dt>
              <dd>%{hub.confidenceAvg}</dd>
            </div>
            <div>
              <dt>Aktif analist</dt>
              <dd>{hub.activeAnalysts}</dd>
            </div>
            <div>
              <dt>Çelişen tez</dt>
              <dd>{hub.conflictingGroups}</dd>
            </div>
          </dl>

          {hub.splitSentiment ? (
            <p className="cd-signal-split-badge">Bölünmüş sentiment — tezler ayrışıyor</p>
          ) : null}

          <div className="cd-signal-hub-meta">
            <span>
              <em>Kopya 24s</em> {hub.signalHub.copies24hTotal}
            </span>
            <span>
              <em>Premium</em> {hub.signalHub.premiumVisibleCount}
            </span>
            <span>
              <em>Yoğunluk</em> {hub.signalHub.creatorConcentrationPct}%
            </span>
          </div>
        </div>

        <div className="cd-signal-side-stack">
          <ConfidenceDistribution bins={hub.confidenceBins} total={binTotal} />

          {hub.topAnalysts.length > 0 ? (
            <div className="cd-signal-analyst-panel">
              <p className="cd-signal-panel-title">Öne çıkan analistler</p>
              <ul className="cd-signal-analyst-list">
                {hub.topAnalysts.map((a) => (
                  <li key={a.analystId} className="cd-signal-analyst-row">
                    <SafeAvatar
                      src={a.avatarUrl}
                      alt=""
                      size={28}
                      className="cd-signal-analyst-avatar"
                    />
                    <div className="cd-signal-analyst-main">
                      <span className="cd-signal-analyst-name">
                        {a.display}
                        {a.verified ? <span className="cd-signal-analyst-verified" aria-label="Doğrulanmış">✓</span> : null}
                      </span>
                      <span className="cd-signal-analyst-meta">
                        {a.activeCount} aktif · %{a.avgConfidence}
                      </span>
                    </div>
                    <span className={cn("cd-signal-analyst-bias", analystBiasClass(a.bias))}>
                      {analystBiasLabel(a.bias)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {liveItems.length > 0 ? (
        <>
          <div className="cd-signal-zone-rule" aria-hidden />

          <div className="cd-signal-live-rail" role="region" aria-label="Canlı sinyal kartları">
              <div className="cd-signal-live-rail-head">
              <div>
                <p className="cd-signal-live-rail-title">Canlı sinyal akışı</p>
                <p className="cd-signal-live-rail-sub">{hub.symbol} · giriş, hedef ve canlı takip</p>
              </div>
              <span className="cd-signal-live-rail-stat">
                <span className="cd-signal-live-rail-stat-k">Aktif</span>
                <span className="cd-signal-live-rail-stat-v">{hub.signalSummary.activeTotal}</span>
              </span>
            </div>

            <SignalsEngagementProvider>
              <HScroll className="cd-signal-live-rail-scroll dvr-hscroll--sig-rail">
                {liveItems.map((item, index) => (
                  <div key={item.id} className="cd-signal-live-rail-item shrink-0">
                    <div className="cd-signal-live-rail-card-wrap">
                      <SignalsLiveRailCard
                        item={item}
                        index={index}
                        layout="rail-horizontal"
                        onSelect={() => router.push(item.href)}
                      />
                    </div>
                  </div>
                ))}
              </HScroll>
            </SignalsEngagementProvider>
          </div>
        </>
      ) : null}

      {hub.rows.length > 0 ? (
        <>
          <div className="cd-signal-zone-rule" aria-hidden />

          <div className="cd-signal-table-head">
            <div>
              <p className="cd-signal-table-title">Detay tablosu</p>
              <p className="cd-signal-table-sub">{hub.rows.length} sinyal · giriş / hedef / stop</p>
            </div>
            <Link href={`/signals?asset=${encodeURIComponent(hub.symbol)}`} className="cd-zone-link">
              Sinyal merkezi →
            </Link>
          </div>

          <div className="cd-signal-table-wrap">
            <div className="cd-signal-table-scroll">
              <table className="cd-signal-table">
                <thead>
                  <tr>
                    <th>Analist</th>
                    <th>Yön</th>
                    <th>Giriş</th>
                    <th>TP</th>
                    <th>SL</th>
                    <th>R/R</th>
                    <th>Güven</th>
                    <th>Tez</th>
                    <th>Periyot</th>
                    <th>Kopya</th>
                    <th aria-label="Grafik" />
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "cd-signal-table-row",
                        !row.isActive && "cd-signal-table-row--inactive",
                      )}
                      tabIndex={0}
                      role="link"
                      onClick={() => router.push(row.href)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(row.href);
                        }
                      }}
                    >
                      <td>
                        <span className="cd-signal-table-analyst">
                          <SafeAvatar src={row.analystAvatar} alt="" size={22} />
                          <span>
                            {row.analystDisplay}
                            {row.analystVerified ? (
                              <span className="cd-signal-analyst-verified" aria-label="Doğrulanmış">
                                ✓
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </td>
                      <td>
                        <SignalDirectionPill direction={asDirection(row.direction)} tone="crypto" />
                      </td>
                      <td className="cd-signal-table-num">{row.entryLabel}</td>
                      <td className="cd-signal-table-num cd-signal-table-num--up">{row.targetLabel}</td>
                      <td className="cd-signal-table-num cd-signal-table-num--down">{row.stopLabel}</td>
                      <td className="cd-signal-table-num">{row.rrLabel}</td>
                      <td className="cd-signal-table-conf">%{row.confidence}</td>
                      <td>
                        <span className="cd-signal-grade">{thesisGradeLabel(row.thesisGrade)}</span>
                      </td>
                      <td className="cd-signal-table-meta">
                        <span>{row.timeframe}</span>
                        <span className="cd-signal-table-strategy">{row.strategy}</span>
                      </td>
                      <td className="cd-signal-table-copies">{row.copies24h > 0 ? row.copies24h : "—"}</td>
                      <td>
                        {row.sparkline.length > 1 ? (
                          <MiniSparkline
                            series={row.sparkline}
                            trend={row.direction === "SELL" ? "down" : "up"}
                            height={24}
                            className="w-[52px]"
                          />
                        ) : (
                          <span className="cd-signal-table-dash">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hiddenRowCount > 0 ? (
              <button
                type="button"
                className="cd-signal-table-toggle"
                onClick={() => setTableExpanded((v) => !v)}
                aria-expanded={tableExpanded}
              >
                {tableExpanded ? "Daha az göster" : `${hiddenRowCount} sinyal daha`}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="cd-signal-empty">Bu varlık için aktif sinyal bulunamadı.</p>
      )}
    </section>
  );
}
