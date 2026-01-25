-- Storage (Dosya Yükleme) İzinlerini Düzeltme
-- Bucket Adı: document-images

-- 1. storage schema'sına erişim olduğundan emin olalım (Supabase varsayılanı)
-- NOT: Storage politikaları 'storage.objects' tablosuna yazılır.

-- 2. "document-images" bucket'ı için PUBLIC okuma izni (Herkes resimleri görebilsin)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'document-images' );

-- 3. "document-images" bucket'ı için YÜKLEME izni (Sadece giriş yapmış kullanıcılar)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);

-- 4. "document-images" bucket'ı için SİLME/GÜNCELLEME izni (Sadece giriş yapmış kullanıcılar)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'document-images' 
  AND auth.role() = 'authenticated'
);
