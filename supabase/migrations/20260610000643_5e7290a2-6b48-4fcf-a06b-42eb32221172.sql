
-- 1) recipe_translations: visibility + SEO fields
ALTER TABLE public.recipe_translations
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text,
  ADD COLUMN IF NOT EXISTS seo_h1 text;

-- 2) reviews: language code
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS language_code text NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS reviews_recipe_lang_idx
  ON public.reviews (recipe_id, language_code);

-- 3) SEO phrases table
CREATE TABLE IF NOT EXISTS public.recipe_seo_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  phrase text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, language_code, phrase)
);

GRANT SELECT ON public.recipe_seo_phrases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.recipe_seo_phrases TO authenticated;
GRANT ALL ON public.recipe_seo_phrases TO service_role;

ALTER TABLE public.recipe_seo_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read recipe seo phrases"
  ON public.recipe_seo_phrases FOR SELECT
  USING (true);

CREATE POLICY "Admins manage recipe seo phrases"
  ON public.recipe_seo_phrases FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS recipe_seo_phrases_recipe_lang_idx
  ON public.recipe_seo_phrases (recipe_id, language_code, sort_order);
