import type { CloseFriendsHubPayload } from "@/features/close-friends/domain/types";

type Props = {
  payload: Pick<CloseFriendsHubPayload, "affinity_line" | "publishing">;
};

export function CloseFriendsStatusStrip({ payload }: Props) {
  return (
    <div className="cf-status-row">
      {payload.affinity_line.trim() ? <span>{payload.affinity_line}</span> : null}
      <span className="cf-status-badge">{payload.publishing.composer_hint}</span>
    </div>
  );
}
