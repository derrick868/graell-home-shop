-- 1) Ensure profiles.role defaults to 'customer' for safety
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'customer'::app_role;

-- 2) Update handle_new_user to populate required columns and set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  -- Create a matching profile row for the new auth user
  insert into public.profiles (
    id,
    user_id,
    role,
    email,
    first_name,
    last_name
  ) values (
    new.id,                 -- profile id matches auth user id
    new.id,                 -- user_id references auth user id
    'customer',             -- default role
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null)
  );
  return new;
end;
$function$;

-- 3) Ensure the trigger exists on auth.users to call handle_new_user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 4) Add search_path to existing functions to satisfy linter
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id AND role = 'admin'
  );
END;
$$;