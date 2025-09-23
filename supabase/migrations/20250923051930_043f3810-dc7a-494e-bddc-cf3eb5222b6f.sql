-- Fix RLS policies for products table to use correct user_id column
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.products;

-- Create the correct admin insert policy
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'::app_role
  )
);