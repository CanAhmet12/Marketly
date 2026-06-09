import type { CloseFriendsHubPayload, PrivateCircleSummary } from "@/features/close-friends/domain/types";
import { CloseFriendsCircleRow } from "@/features/close-friends/components/close-friends-circle-row";

type RailDef = { key: keyof CloseFriendsHubPayload["rails"]; title: string; sub?: string };

const RAIL_DEFS: RailDef[] = [
  { key: "trusted_groups", title: "Güvenilir gruplar" },
  { key: "premium_inner", title: "Premium iç çember" },
  { key: "portfolio_related", title: "Portföyle ilişkili daireler" },
  { key: "strategy_fit", title: "Strateji uyumu" },
  { key: "macro_private", title: "Makro & özel masa" },
  { key: "active_communities", title: "Aktif özel topluluklar" },
];

type Props = {
  payload: Pick<CloseFriendsHubPayload, "rails" | "your_circles" | "suggested_circles">;
  mode: "overview" | "discover" | "circles";
};

export function CloseFriendsDiscoverySection({ payload, mode }: Props) {
  if (mode === "circles") {
    if (payload.your_circles.length === 0) return null;
    return (
      <section>
        <div className="cf-section-head">
          <h2 className="cf-section-title">Senin dairelerin</h2>
          <p className="cf-section-desc">Yakın takip üreticilerinin özel segmentleri</p>
        </div>
        <div className="cf-catalog-grid">
          {payload.your_circles.map((c) => (
            <CloseFriendsCircleRow key={c.id} circle={c} />
          ))}
        </div>
      </section>
    );
  }

  const suggested = payload.suggested_circles;
  const visibleRails = RAIL_DEFS.map((def) => ({
    ...def,
    circles: payload.rails[def.key],
  })).filter((r) => r.circles.length > 0);

  if (mode === "overview") {
    const preview = payload.your_circles.slice(0, 4);
    if (preview.length === 0 && visibleRails.length === 0 && suggested.length === 0) return null;
    return (
      <>
        {preview.length > 0 ? (
          <section>
            <div className="cf-section-head">
              <h2 className="cf-section-title">Dairelerin</h2>
            </div>
            <div className="cf-rail-scroll">
              {preview.map((c: PrivateCircleSummary) => (
                <CloseFriendsCircleRow key={c.id} circle={c} />
              ))}
            </div>
          </section>
        ) : null}
        {visibleRails.slice(0, 1).map((rail) => (
          <section key={rail.key} className="cf-rail-block">
            <div className="cf-section-head">
              <h2 className="cf-section-title">{rail.title}</h2>
              {rail.sub ? <p className="cf-section-desc">{rail.sub}</p> : null}
            </div>
            <div className="cf-rail-scroll">
              {rail.circles.map((c) => (
                <CloseFriendsCircleRow key={c.id} circle={c} />
              ))}
            </div>
          </section>
        ))}
      </>
    );
  }

  if (suggested.length > 0) {
    return (
      <>
        <section>
          <div className="cf-section-head">
            <h2 className="cf-section-title">Önerilen özel topluluklar</h2>
            <p className="cf-section-desc">İlgi grafiği + üyelik davranışı</p>
          </div>
          <div className="cf-rail-scroll">
            {suggested.map((c) => (
              <CloseFriendsCircleRow key={c.id} circle={c} />
            ))}
          </div>
        </section>
        {visibleRails.map((rail) => (
          <section key={rail.key} className="cf-rail-block">
            <div className="cf-section-head">
              <h2 className="cf-section-title">{rail.title}</h2>
            </div>
            <div className="cf-rail-scroll">
              {rail.circles.map((c) => (
                <CloseFriendsCircleRow key={c.id} circle={c} />
              ))}
            </div>
          </section>
        ))}
      </>
    );
  }

  return (
    <>
      {visibleRails.map((rail) => (
        <section key={rail.key} className="cf-rail-block">
          <div className="cf-section-head">
            <h2 className="cf-section-title">{rail.title}</h2>
          </div>
          <div className="cf-rail-scroll">
            {rail.circles.map((c) => (
              <CloseFriendsCircleRow key={c.id} circle={c} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
