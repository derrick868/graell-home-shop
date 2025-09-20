-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);

-- Create storage policies for category uploads
CREATE POLICY "Category images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'category-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update category images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'category-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete category images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'category-images' AND is_admin(auth.uid()));