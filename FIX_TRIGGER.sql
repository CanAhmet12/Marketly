-- Bu SQL'i Supabase Dashboard → SQL Editor'a yapıştır ve Run'a tıkla
-- ============================================================

-- Trigger fonksiyonunu exception-safe yapıyoruz
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Benzersiz username oluştur: email prefix + UUID'nin ilk 6 karakteri
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')
  ) || '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);

  INSERT INTO profiles (id, username, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    upper(substr(md5(random()::text), 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata olursa bile kullanıcı kaydını engelleme, sadece logla
    RAISE LOG 'handle_new_user hatası: % için %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
