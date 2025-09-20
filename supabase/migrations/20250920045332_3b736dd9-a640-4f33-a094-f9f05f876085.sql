-- Fix the handle_new_user function to use 'customer' instead of 'user'
-- since the app_role enum only accepts 'admin' and 'customer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer'); -- default new users as 'customer'
  return new;
end;
$function$;