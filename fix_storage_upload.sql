-- Supabase Storage RLS Policy - Only Admins Can Upload
-- This ensures only users with is_admin=true can upload to document-images

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Only admins can upload to document-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view document-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update document-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete document-images" ON storage.objects;

-- 2. Only admins can upload (INSERT) to document-images
CREATE POLICY "Only admins can upload to document-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'document-images' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);

-- 3. Everyone can view (SELECT) images from document-images
-- This allows your public site visitors to see document images
CREATE POLICY "Public can view document-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'document-images');

-- 4. Only admins can update their uploads
CREATE POLICY "Admins can update document-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'document-images'
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
)
WITH CHECK (bucket_id = 'document-images');

-- 5. Only admins can delete uploads
CREATE POLICY "Admins can delete document-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'document-images'
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.is_admin = true
    )
);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%document-images%'
ORDER BY policyname;
