-- Add role field to profiles table
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Update the role column to use the enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE app_role USING role::app_role;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for admin access to products
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- Create RLS policies for admin access to categories
CREATE POLICY "Admins can insert categories" ON public.categories
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON public.categories
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" ON public.categories
FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- Create RLS policy for admins to view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Create RLS policy for admins to update order status
CREATE POLICY "Admins can update orders" ON public.orders
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

-- Insert a default admin user (you can change this email to your own)
-- First, you'll need to sign up with this email through the app, then run this to make yourself admin
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';