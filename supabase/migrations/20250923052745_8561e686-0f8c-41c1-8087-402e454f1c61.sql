-- Storage RLS policies for product and category images
-- Allow public read, and only admins can write

-- PRODUCT IMAGES
CREATE POLICY IF NOT EXISTS "Public can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

-- CATEGORY IMAGES
CREATE POLICY IF NOT EXISTS "Public can view category images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY IF NOT EXISTS "Admins can upload category images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can update category images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()));

CREATE POLICY IF NOT EXISTS "Admins can delete category images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'category-images' AND public.is_admin(auth.uid()));