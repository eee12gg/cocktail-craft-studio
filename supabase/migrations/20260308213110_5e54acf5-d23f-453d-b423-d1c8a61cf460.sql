CREATE TABLE public.country_language_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_name text NOT NULL,
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  flag_emoji text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code)
);

ALTER TABLE public.country_language_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage country targets"
  ON public.country_language_targets
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view country targets"
  ON public.country_language_targets
  FOR SELECT
  TO anon, authenticated
  USING (true);