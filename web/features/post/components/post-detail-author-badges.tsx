import { POST_DETAIL_VERIFIED_LABEL, postDetailTierLabel } from "../post-detail-labels";

type Props = {
  verified?: boolean;
  tier?: string;
  badgeClassName?: string;
  tierClassName?: string;
};

export function PostDetailAuthorBadges({
  verified,
  tier,
  badgeClassName = "pd-badge",
  tierClassName = "pd-badge",
}: Props) {
  const tierLabel = tier ? postDetailTierLabel(tier) : null;
  const tierKey = tier?.toLowerCase();

  return (
    <>
      {verified ? (
        <span className={`${badgeClassName} pd-badge--verified`}>{POST_DETAIL_VERIFIED_LABEL}</span>
      ) : null}
      {tierLabel && tierKey === "elite" ? (
        <span className={`${tierClassName} pd-badge--elite`}>{tierLabel}</span>
      ) : null}
      {tierLabel && tierKey === "pro" ? (
        <span className={`${tierClassName} pd-badge--pro`}>{tierLabel}</span>
      ) : null}
    </>
  );
}
