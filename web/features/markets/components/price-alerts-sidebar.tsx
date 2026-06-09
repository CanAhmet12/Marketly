import Link from "next/link";

import type { PriceAlertsIntel } from "@/features/markets/lib/build-price-alerts-intel";
import type { PriceAlertRow } from "@/features/markets/hooks/use-price-alerts-page";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";

type Props = {
  intel: PriceAlertsIntel;
  mockOn: boolean;
};

export function PriceAlertsSidebar({ intel, mockOn }: Props) {
  const maxCount = Math.max(...intel.bySymbol.map((s) => s.count), 1);

  return (
    <aside className="pa-sidebar">
      <div className="pa-sidebar-inner">
        <div className="pa-block">
          <div className="pa-block-header">
            <div className="pa-block-title">
              <span className="pa-block-stripe" />
              Alarm özeti
            </div>
          </div>
          <div className="pa-pulse-body">
            <div className="pa-pulse-row">
              <span className="pa-pulse-label">Aktif alarm</span>
              <span className="pa-pulse-val">{intel.totalCount}</span>
            </div>
            <div className="pa-pulse-row">
              <span className="pa-pulse-label">Sembol</span>
              <span className="pa-pulse-val">{intel.symbolCount}</span>
            </div>
            <div className="pa-pulse-row">
              <span className="pa-pulse-label">Üst eşik</span>
              <span className="pa-pulse-val">{intel.aboveCount}</span>
            </div>
            <div className="pa-pulse-row">
              <span className="pa-pulse-label">Alt eşik</span>
              <span className="pa-pulse-val">{intel.belowCount}</span>
            </div>
            <p className="pa-pulse-summary">
              {mockOn ? "Demo modu — alarmlar tarayıcıda saklanır." : "Canlı eşikler sunucuda izlenir."}
            </p>
          </div>
        </div>

        {intel.bySymbol.length > 0 ? (
          <div className="pa-block">
            <div className="pa-block-header">
              <div className="pa-block-title">
                <span className="pa-block-stripe" />
                Sembol dağılımı
              </div>
            </div>
            <div className="pa-dist-rows">
              {intel.bySymbol.slice(0, 6).map((s) => {
                const width = Math.min(100, (s.count / maxCount) * 100);
                return (
                  <Link key={s.symbol} href={`/markets/${encodeURIComponent(s.symbol)}`} className="pa-dist-row">
                    <span className="pa-dist-sym">{s.symbol}</span>
                    <div className="pa-dist-bar">
                      <div className="pa-dist-fill" style={{ width: `${width}%` }} />
                    </div>
                    <span className="pa-dist-count">{s.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {intel.recentAlerts.length > 0 ? (
          <div className="pa-block">
            <div className="pa-block-header">
              <div className="pa-block-title">
                <span className="pa-block-stripe" />
                Son eklenenler
              </div>
            </div>
            <div className="pa-recent-rows">
              {intel.recentAlerts.map((a: PriceAlertRow) => (
                <Link key={a.id} href={`/markets/${encodeURIComponent(a.symbol)}`} className="pa-recent-row">
                  <span className="pa-recent-sym">{a.symbol}</span>
                  <span className="pa-recent-label">{a.label}</span>
                  <span className="pa-recent-time">{formatSocialRelativeTime(a.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="pa-block">
          <div className="pa-block-header">
            <div className="pa-block-title">
              <span className="pa-block-stripe" />
              Finance zone
            </div>
          </div>
          <div className="pa-link-rows">
            <Link href="/hub/watchlist" className="pa-link-row">
              Takip listem →
            </Link>
            <Link href="/hub/portfolio" className="pa-link-row">
              Portföy →
            </Link>
            <Link href="/hub/notifications" className="pa-link-row">
              Bildirimler →
            </Link>
            <Link href="/hub/settings" className="pa-link-row">
              Ayarlar →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
