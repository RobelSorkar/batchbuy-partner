-- SECURITY FIX: public.profiles currently allows any authenticated user to
-- read every other user's full_name, phone, and address via:
--   CREATE POLICY "Users can view all profiles" ON public.profiles
--     FOR SELECT TO authenticated USING (true);
--
-- Replace it with owner-only + admin-only access, and expose a safe,
-- name-only projection for the one legitimate cross-user read
-- (participant display names on batch/project pages).

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Safe public projection: no phone, no address. Runs with the view owner's
-- privileges (not the caller's), so it can bypass the now-restrictive
-- profiles RLS while only ever returning name/avatar.
CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT user_id, full_name, avatar_url
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
