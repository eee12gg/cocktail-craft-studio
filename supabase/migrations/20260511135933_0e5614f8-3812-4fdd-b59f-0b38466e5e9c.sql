ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS show_in_roulette boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;