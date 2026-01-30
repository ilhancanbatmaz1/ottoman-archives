-- Kullanıcı tablosuna abonelik sütunlarını ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

-- Güvenlik için Service Role (sunucu) bu sütunları her zaman güncelleyebilir
-- RLS politikası gerekmez çünkü Service Role Key kullanıyoruz (Bypasses RLS)
-- Ancak yine de tablo izinlerini garantiye alalım:
GRANT UPDATE ON public.users TO service_role;
