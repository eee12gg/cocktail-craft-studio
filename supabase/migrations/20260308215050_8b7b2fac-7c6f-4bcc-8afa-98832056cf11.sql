-- Allow admins to insert admin_settings
CREATE POLICY "Admins can insert settings" ON public.admin_settings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint on key for upsert
ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_key_unique UNIQUE (key);
