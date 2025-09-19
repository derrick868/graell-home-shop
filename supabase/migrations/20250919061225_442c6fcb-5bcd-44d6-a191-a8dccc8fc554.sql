-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Update orders table to include proper joins for admin access
CREATE POLICY "Admins can view all orders with profile info"
ON public.profiles
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = user_id
);