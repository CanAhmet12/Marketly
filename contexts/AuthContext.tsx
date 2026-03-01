import React, {
  createContext, useContext, useState,
  useEffect, ReactNode, useCallback,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

// ─── Tipler ───────────────────────────────────────────────────────────────────
export interface User {
  id:      string;
  name:    string;
  email:   string;
  avatar?: string;
  username?: string;
  tier?:    'free' | 'pro' | 'elite';
  verified?: boolean;
}

interface AuthContextType {
  user:       User | null;
  profile:    Profile | null;
  session:    Session | null;
  isLoading:  boolean;
  error:      string | null;
  login:      (email: string, password: string) => Promise<boolean>;
  register:   (name: string, email: string, password: string) => Promise<boolean>;
  logout:     () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Validasyon ───────────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password: string) {
  return password.length >= 6;
}

// ─── Profil → User dönüştürücü ────────────────────────────────────────────────
function profileToUser(profile: Profile, email: string): User {
  return {
    id:       profile.id,
    name:     profile.full_name || profile.username,
    email,
    avatar:   profile.avatar_url || undefined,
    username: profile.username,
    tier:     profile.tier,
    verified: profile.verified,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]    = useState<User | null>(null);
  const [profile,   setProfile] = useState<Profile | null>(null);
  const [session,   setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error,     setError]   = useState<string | null>(null);

  const clearError = () => setError(null);

  // Streak güncelle: son girişten bu yana 1 gün geçtiyse streak +1, 2 gün geçtiyse sıfırla
  const updateStreak = useCallback(async (userId: string, profile: any) => {
    try {
      const now      = new Date();
      const lastLogin = profile.last_login ? new Date(profile.last_login) : null;
      if (!lastLogin) {
        await supabase.from('profiles').update({ last_login: now.toISOString(), streak_days: 1 }).eq('id', userId);
        return;
      }
      const daysSince = Math.floor((now.getTime() - lastLogin.getTime()) / 86_400_000);
      if (daysSince === 0) return; // Aynı gün — değiştirme
      const newStreak = daysSince === 1 ? (profile.streak_days ?? 0) + 1 : 1;
      await supabase.from('profiles')
        .update({ last_login: now.toISOString(), streak_days: newStreak })
        .eq('id', userId);
    } catch { /* sessizce geç */ }
  }, []);

  // Profil yükle
  const loadProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (err || !data) {
        // Profil henüz oluşturulmamış olabilir — trigger çalışıyor
        setUser({ id: userId, name: email.split('@')[0], email });
        return;
      }

      setProfile(data as Profile);
      setUser(profileToUser(data as Profile, email));

      // Streak güncelle (sessiz)
      updateStreak(userId, data);
    } catch {
      setUser({ id: userId, name: email.split('@')[0], email });
    }
  }, [updateStreak]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    await loadProfile(session.user.id, session.user.email || '');
  }, [session, loadProfile]);

  // Oturum başlatma — uygulama açılışında
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id, s.user.email || '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Oturum değişimlerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          await loadProfile(s.user.id, s.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ─── Giriş ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);

    if (!email.trim())              { setError('E-posta adresi boş olamaz.');       return false; }
    if (!validateEmail(email.trim())) { setError('Geçerli bir e-posta adresi girin.'); return false; }
    if (!password)                  { setError('Şifre boş olamaz.');               return false; }
    if (!validatePassword(password)) { setError('Şifre en az 6 karakter olmalıdır.'); return false; }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-posta veya şifre hatalı.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-posta adresinizi doğrulayın.');
        } else {
          setError(authError.message);
        }
        return false;
      }

      return true;
    } catch {
      setError('Giriş başarısız. İnternet bağlantınızı kontrol edin.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Kayıt ──────────────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);

    if (!name.trim() || name.trim().length < 2) { setError('İsim en az 2 karakter olmalıdır.'); return false; }
    if (!validateEmail(email.trim()))            { setError('Geçerli bir e-posta adresi girin.'); return false; }
    if (!validatePassword(password))             { setError('Şifre en az 6 karakter olmalıdır.'); return false; }

    setLoading(true);
    try {
      const cleanEmail    = email.trim().toLowerCase();
      const emailPrefix   = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const randomSuffix  = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const username      = (emailPrefix || 'user') + randomSuffix;

      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name.trim(), username },
        },
      });

      if (authError) {
        if (authError.message.includes('User already registered') ||
            authError.message.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı.');
        } else if (authError.message.includes('database error')) {
          // Trigger hatası — kullanıcı oluştu ama profil oluşmadı olabilir
          // Yine de devam et, profil sonra oluşturulur
          return true;
        } else {
          setError(authError.message);
        }
        return false;
      }

      // Trigger çalışmamışsa profili manuel oluştur
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id:           data.user.id,
            username,
            full_name:    name.trim(),
            avatar_url:   '',
            referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
          }, { onConflict: 'id' });

        if (profileError) {
          // Profil hatası kritik değil — oturum yine de açılabilir
          console.warn('[Auth] Profil oluşturma uyarısı:', profileError.message);
        }
      }

      return true;
    } catch {
      setError('Kayıt başarısız. İnternet bağlantınızı kontrol edin.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Çıkış ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, session, isLoading, error,
      login, register, logout, clearError, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
