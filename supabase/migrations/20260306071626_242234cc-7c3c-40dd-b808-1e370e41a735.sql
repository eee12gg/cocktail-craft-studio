
-- Admin settings table for dynamic admin URL
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/update
CREATE POLICY "Admins can read settings"
  ON public.admin_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous read of admin_path only (for routing)
CREATE POLICY "Anyone can read admin_path"
  ON public.admin_settings FOR SELECT TO anon
  USING (key = 'admin_path');

-- Seed default admin path
INSERT INTO public.admin_settings (key, value) VALUES ('admin_path', 'admin');
