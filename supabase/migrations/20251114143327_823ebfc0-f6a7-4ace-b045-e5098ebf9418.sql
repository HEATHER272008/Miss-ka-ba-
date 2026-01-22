-- Update the handle_new_user function to include all new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    name, 
    email, 
    phone,
    parent_guardian_name,
    birthday,
    adviser_name,
    section, 
    parent_number,
    terms_accepted
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'parent_guardian_name',
    (NEW.raw_user_meta_data->>'birthday')::date,
    NEW.raw_user_meta_data->>'adviser_name',
    NEW.raw_user_meta_data->>'section',
    NEW.raw_user_meta_data->>'parent_number',
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false)
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  
  RETURN NEW;
END;
$function$;
