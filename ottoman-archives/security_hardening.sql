-- GÜVENLİK GÜNCELLEMESİ (Hardening) 🔒

-- 1. STORAGE GÜVENLİĞİ: Sadece Adminler Dosya Yükleyebilir
-- Eski kuralı kaldır (Eskisi: "Herhangi bir üye yükleyebilir")
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Yeni Kural: "Sadece Adminler Yükleyebilir"
CREATE POLICY "Strict Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND is_admin = true
  )
);

-- Silme ve Güncelleme için de sadece Adminler
CREATE POLICY "Strict Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Strict Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);


-- 2. VERİTABANI GÜVENLİĞİ: Belgeler Tablosu (Çift Dikiş)
-- Zaten admin kontrolü eklemiştik ama emin olalım
DROP POLICY IF EXISTS "Admins can insert documents." ON public.documents;
CREATE POLICY "Strict Admin Document Insert"
ON public.documents FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Admins can update documents." ON public.documents;
CREATE POLICY "Strict Admin Document Update"
ON public.documents FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Admins can delete documents." ON public.documents;
CREATE POLICY "Strict Admin Document Delete"
ON public.documents FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);
