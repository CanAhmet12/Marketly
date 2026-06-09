"use client";

import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { portfolioRiskLevel } from "@/features/markets/lib/portfolio-cat-colors";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  stats: Pick<PortfolioLiveStats, "riskScore" | "riskLabel">;
  risk: PortfolioIntelligenceBundle["risk"];
  strategyMix: PortfolioIntelligenceBundle["strategyMix"];
};

export function PortfolioRiskPanel({ stats, risk, strategyMix }: Props) {
  const riskLvl = portfolioRiskLevel(stats.riskScore);

  return (
    <>
      <div className="pf-block">
        <div className="pf-block-header">
          <div className="pf-block-title">
            <span className="pf-block-stripe" />
            Strateji Karması
          </div>
        </div>
        <div className="pf-strategy-rows">
          {strategyMix.map((mix, i) => (
            <div key={mix.label} className="pf-strat-row">
              <div className="pf-strat-header">
                <span className="pf-strat-label">{mix.label}</span>
                <span className="pf-strat-pct">%{mix.pct}</span>
              </div>
              <div className="pf-strat-bar">
                <div className={`pf-strat-fill pf-strat-fill--${i % 3}`} style={{ width: `${mix.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pf-block" data-pf-block-zone="risk">
        <div className="pf-block-header">
          <div className="pf-block-title">
            <span className={cn("pf-block-stripe", "pf-block-stripe--risk", `pf-block-stripe--risk-${riskLvl}`)} />
            Risk Analizi
          </div>
        </div>
        <div className="pf-risk-body">
          <div className="pf-risk-gauge">
            <div>
              <div className={cn("pf-risk-score", `pf-risk-tone--${riskLvl}`)}>{stats.riskScore}</div>
              <div className="pf-risk-label">{stats.riskLabel} Risk</div>
            </div>
            <div className="pf-risk-items">
              {[
                { label: "Konsantrasyon", val: risk.concentrationLabel },
                { label: "Makro hassasiyet", val: risk.macroSensitivity },
                { label: "Volatilite", val: risk.volCluster },
                { label: "Rejim", val: risk.regimeAlignment },
              ].map((item) => (
                <div key={item.label} className="pf-risk-item">
                  <span className="pf-risk-item-label">{item.label}</span>
                  <span className="pf-risk-item-value">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          {risk.sectorTop.length > 0 ? (
            <div className="pf-sector-rows">
              {risk.sectorTop.map((sec) => (
                <div key={sec.label} className="pf-sector-row">
                  <span className="pf-sector-label">{sec.label}</span>
                  <div className="pf-sector-bar">
                    <div className="pf-sector-fill" style={{ width: `${sec.pct}%` }} />
                  </div>
                  <span className="pf-sector-pct">%{sec.pct}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="pf-corr-block">
            <span className="pf-corr-title">Korelasyon ipuçları</span>
            {risk.correlatedPairs.length === 0 ? (
              <p className="pf-empty-hint">Daha fazla pozisyonla çift analizi açılır.</p>
            ) : (
              <div className="pf-corr-rows">
                {risk.correlatedPairs.map((p, i) => (
                  <div key={`${p.a}-${p.b}-${i}`} className="pf-corr-row">
                    <span className="pf-corr-pair">
                      {p.a} ↔ {p.b}
                    </span>
                    <span className="pf-corr-note">{p.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
