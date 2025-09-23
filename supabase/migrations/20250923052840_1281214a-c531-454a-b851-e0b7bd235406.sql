-- Recreate storage RLS policies with compatible syntax

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

-- CATEGORY IMAGES
DROP POLICY IF EXISTS "Public can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;

CREATE POLICY "Public can view category images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update category images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete category images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()));