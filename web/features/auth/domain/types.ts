export type AuthSurfaceId = "login" | "register" | "forgot" | "update";

export type AuthFormPresentation = {
  title: string;
  subtitle: string;
  primary_cta: string;
  secondary_hint: string | null;
};

export type AuthShellPresentation = {
  brand_line: string;
  ethos_line: string;
  foot_note: string | null;
  cross_links: { href: string; label: string }[];
};
