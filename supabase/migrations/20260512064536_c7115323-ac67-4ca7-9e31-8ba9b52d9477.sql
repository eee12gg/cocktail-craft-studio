ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS ip text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS language_code text;

CREATE INDEX IF NOT EXISTS idx_reviews_recipe_ip ON public.reviews(recipe_id, ip);