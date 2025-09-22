-- Create trigger to automatically create user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a matching profile row for the new auth user
  INSERT INTO public.profiles (
    id,
    user_id,
    role,
    email,
    first_name,
    last_name
  ) VALUES (
    NEW.id,                 -- profile id matches auth user id
    NEW.id,                 -- user_id references auth user id
    'customer',             -- default role
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', null),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', null)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();