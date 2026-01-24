-- ========================================
-- STORAGE POLICIES FOR DOCUMENT-IMAGES BUCKET
-- ========================================
-- Execute this in Supabase SQL Editor after creating the bucket

-- Policy 1: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'document-images');

-- Policy 2: Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'document-images');

-- Policy 3: Admins can delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'document-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  )
);
