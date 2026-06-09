"use client";

import Link from "next/link";

import {
  ECONOMY_SEGMENT_COLOR,
  ECONOMY_SEGMENT_LABEL,
} from "@/features/studio/lib/studio-economy-insights";
import type { StudioEconomyMemberRow } from "@/features/studio/repository/types";

type Props = {
  members: StudioEconomyMemberRow[];
};

export function StudioEconomyMembersPanel({ members }: Props) {
  if (members.length === 0) return null;

  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">Üye Segmentleri</div>
      </div>
      <div className="st-economy-table-wrap">
        <table className="st-tier-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Segment</th>
              <th>Kalite</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {members.slice(0, 8).map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={m.href} className="st-economy-member-name">
                    {m.name}
                  </Link>
                </td>
                <td>
                  <span
                    className="st-economy-segment-badge"
                    style={{
                      background: `${ECONOMY_SEGMENT_COLOR[m.segment]}18`,
                      color: ECONOMY_SEGMENT_COLOR[m.segment],
                    }}
                  >
                    {ECONOMY_SEGMENT_LABEL[m.segment]}
                  </span>
                </td>
                <td className="st-economy-quality-cell">{m.quality_label}</td>
                <td className="st-economy-status-cell">{m.invite_status ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
