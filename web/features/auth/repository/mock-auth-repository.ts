import type { AuthRepository } from "./auth-repository";
import type { AuthFormPresentation, AuthShellPresentation, AuthSurfaceId } from "../domain/types";

const SHELL: AuthShellPresentation = {
  brand_line: "Marketly",
  ethos_line: "Piyasa kimliğinizi tek merkezde toplayın — sakin, üretici odaklı, veri disiplinli.",
  foot_note: "Mock modunda oturum tarayıcıda simüle edilir; canlıda Supabase Auth.",
  cross_links: [
    { href: "/discover", label: "Keşfet" },
    { href: "/markets", label: "Piyasalar" },
    { href: "/signals", label: "Sinyaller" },
    { href: "/watchlist", label: "Watchlist" },
  ],
};

const FORMS: Record<AuthSurfaceId, AuthFormPresentation> = {
  login: {
    title: "Giriş yap",
    subtitle: "Watchlist, sinyaller ve akışın kaldığın yerden devam eder.",
    primary_cta: "Giriş yap",
    secondary_hint: null,
  },
  register: {
    title: "Hesap oluştur",
    subtitle: "Kayıt sonrası kısa kurulumla For You akışın kişiselleşir.",
    primary_cta: "Hesap oluştur",
    secondary_hint: "Mock modunda e-posta onayı atlanır.",
  },
  forgot: {
    title: "Erişim sıfırlama",
    subtitle: "Bağlantı güvenli oturumla sınırlıdır; spam klasörünü kontrol edin.",
    primary_cta: "Bağlantı gönder",
    secondary_hint: null,
  },
  update: {
    title: "Yeni şifre",
    subtitle: "Güçlü şifre + benzersiz kelimeler; oturumlarınız yenilenir.",
    primary_cta: "Şifreyi güncelle",
    secondary_hint: null,
  },
};

export class MockAuthRepository implements AuthRepository {
  getShellPresentation(): AuthShellPresentation {
    return SHELL;
  }

  getFormPresentation(surface: AuthSurfaceId): AuthFormPresentation {
    return FORMS[surface] ?? FORMS.login;
  }
}
