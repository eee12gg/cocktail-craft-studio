-- 1. Remove anon read access to admin_path
DROP POLICY IF EXISTS "Anyone can read admin_path" ON public.admin_settings;

-- Allow authenticated users to read just the admin_path key (so the app can route admins after login)
CREATE POLICY "Authenticated can read admin_path"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (key = 'admin_path');

-- 2. Fix user_roles: scope admin-manage to write ops only so user-self-read works
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can also see all role rows (in addition to users seeing their own)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Remove broken/inoperative login rate-limit machinery
DROP FUNCTION IF EXISTS public.is_login_rate_limited(text);
DROP TABLE IF EXISTS public.login_attempts;
