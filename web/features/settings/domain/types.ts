/** Hesap kontrol merkezi — repository şekli */

export type AccountControlIntelLine = { id: string; label: string; value: string };

export type MutedSurfaceSummary = {
  creators_count: number;
  assets_count: number;
  topics_count: number;
  sample_creator_ids: string[];
  sample_assets: string[];
};

export type MembershipManagementLine = {
  id: string;
  title: string;
  sub: string;
  href: string;
};

export type CreatorControlSurface = {
  visible: boolean;
  headline: string;
  bullets: string[];
  links: { upload: string; subscriptions: string; close_friends: string };
};

export type AccountControlHubPayload = {
  headline: string;
  subline: string;
  data_mode: "mock" | "live_sparse";
  account_overview: {
    trust_line: string;
    verification_line: string;
    premium_line: string;
    session_hint: string;
    login_history_hint: string;
  };
  personalization: {
    confidence_line: string;
    exploration_line: string;
    novelty_line: string;
    drift_line: string;
    market_focus_line: string;
    creator_cluster_hint: string;
    intel_lines: AccountControlIntelLine[];
    muted: MutedSurfaceSummary;
  };
  membership: {
    lines: MembershipManagementLine[];
    billing_hint: string;
  };
  creator: CreatorControlSurface;
  links: {
    subscriptions: string;
    close_friends: string;
    notifications: string;
    messages: string;
    discover: string;
  };
};
