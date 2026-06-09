export type AuthFeature = {
  label: string;
  value: string;
};

export type AuthSceneId = "login" | "register" | "forgot" | "update" | "confirm";

export type AuthScene = {
  id: AuthSceneId;
  kicker: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  features: AuthFeature[];
  accent: string;
  accent2: string;
  panelBg: string;
};

export const AUTH_LOGIN_SCENE: AuthScene = {
  id: "login",
  kicker: "Güvenli oturum",
  title: "Terminaline",
  titleAccent: "bağlan.",
  subtitle: "Watchlist, sinyaller ve kişisel akışın kaldığın yerden devam eder.",
  features: [
    { label: "Canlı piyasa", value: "29+ sembol" },
    { label: "Topluluk", value: "Şeffaf sinyaller" },
    { label: "Kişisel akış", value: "For You" },
  ],
  accent: "#00c853",
  accent2: "#00b8d4",
  panelBg: "#080d12",
};

export const AUTH_REGISTER_SCENE: AuthScene = {
  id: "register",
  kicker: "Yeni hesap",
  title: "Piyasa kimliğini",
  titleAccent: "oluştur.",
  subtitle: "Kayıt sonrası üç adımlık kurulumla öneri motoru seni tanır.",
  features: [
    { label: "İlgi alanı", value: "Akıllı sıralama" },
    { label: "Analist ağı", value: "Takip & keşfet" },
    { label: "Başlangıç", value: "Watchlist hazır" },
  ],
  accent: "#7c4dff",
  accent2: "#536dfe",
  panelBg: "#0a0814",
};

export const AUTH_FORGOT_SCENE: AuthScene = {
  id: "forgot",
  kicker: "Hesap kurtarma",
  title: "Şifreni",
  titleAccent: "yenile.",
  subtitle: "Kayıtlı e-postana tek kullanımlık güvenli bağlantı göndeririz.",
  features: [
    { label: "Güvenli", value: "Tek seferlik link" },
    { label: "Hızlı", value: "Dakikalar içinde" },
    { label: "Korumalı", value: "Şifreli oturum" },
  ],
  accent: "#f59e0b",
  accent2: "#f97316",
  panelBg: "#0c0a08",
};

export const AUTH_UPDATE_SCENE: AuthScene = {
  id: "update",
  kicker: "Yeni şifre",
  title: "Hesabını",
  titleAccent: "güçlendir.",
  subtitle: "Güçlü bir şifre seç — terminaline güvenli şekilde geri dön.",
  features: [
    { label: "Minimum", value: "8 karakter" },
    { label: "Güvenlik", value: "Anında geçerli" },
    { label: "Erişim", value: "Tek adım" },
  ],
  accent: "#00b8d4",
  accent2: "#00c853",
  panelBg: "#080d12",
};

export const AUTH_CONFIRM_SCENE: AuthScene = {
  id: "confirm",
  kicker: "E-posta doğrulama",
  title: "Hesabını",
  titleAccent: "etkinleştir.",
  subtitle: "Gelen kutundaki bağlantıyla kimliğini doğrula, kuruluma geç.",
  features: [
    { label: "Güvenlik", value: "Doğrulanmış hesap" },
    { label: "Erişim", value: "Tam özellik" },
    { label: "Kurulum", value: "3 adım" },
  ],
  accent: "#7c4dff",
  accent2: "#a78bfa",
  panelBg: "#0a0814",
};

export function resolveAuthScene(pathname: string): AuthScene {
  if (pathname.startsWith("/auth/register")) return AUTH_REGISTER_SCENE;
  if (pathname.startsWith("/auth/forgot-password")) return AUTH_FORGOT_SCENE;
  if (pathname.startsWith("/auth/update-password")) return AUTH_UPDATE_SCENE;
  if (pathname.startsWith("/auth/confirm-email")) return AUTH_CONFIRM_SCENE;
  return AUTH_LOGIN_SCENE;
}
