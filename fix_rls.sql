-- RLS (Güvenlik) Politikalarını Onarma
-- Bu komutlar, kullanıcının kendi profilini okumasına izin verir.
-- Böylece sistem kullanıcının 'is_admin' olup olmadığını kontrol edebilir.

-- 1. Tablo güvenliğini aktif et
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Eski politikaları temizle (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 3. "Kullanıcılar kendi profilini görebilir" izni ver
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- 4. "Kullanıcılar kendi profilini güncelleyebilir" izni ver
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 5. Admin kullanıcısını tekrar garantiye al
UPDATE public.users 
SET is_admin = true, subscription_status = 'premium'
WHERE email = 'admin@ottoman.com';
