
-- Backfill: give all existing partners the dropshipper role too, and vice versa
INSERT INTO user_roles (user_id, role)
SELECT ur.user_id, 'dropshipper'::app_role
FROM user_roles ur
WHERE ur.role = 'partner'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT ur.user_id, 'partner'::app_role
FROM user_roles ur
WHERE ur.role = 'dropshipper'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user to always assign both partner + dropshipper roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Always assign BOTH partner and dropshipper roles for all new signups
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'partner'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'dropshipper'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;
