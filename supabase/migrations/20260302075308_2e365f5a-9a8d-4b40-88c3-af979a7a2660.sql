
-- Recipe category enum
CREATE TYPE public.recipe_category AS ENUM ('cocktails', 'shots', 'non-alcoholic');

-- Badge enum
CREATE TYPE public.recipe_badge AS ENUM ('Trending', 'Popular', 'Top 10', 'New');

-- Alcohol level enum  
CREATE TYPE public.alcohol_level AS ENUM ('None', 'Light', 'Medium', 'Strong');

-- Equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON public.equipment FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Hashtags table
CREATE TABLE public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hashtags" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "Admins can manage hashtags" ON public.hashtags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category recipe_category NOT NULL DEFAULT 'cocktails',
  image_url TEXT,
  image_thumb_url TEXT,
  description TEXT,
  prep_time TEXT,
  alcohol_level alcohol_level NOT NULL DEFAULT 'Medium',
  badge recipe_badge,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published recipes" ON public.recipes FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update recipes" ON public.recipes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete recipes" ON public.recipes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipe tags
CREATE TABLE public.recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(recipe_id, tag)
);
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe tags" ON public.recipe_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipe tags" ON public.recipe_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recipe hashtags junction
CREATE TABLE public.recipe_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, hashtag_id)
);
ALTER TABLE public.recipe_hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe hashtags" ON public.recipe_hashtags FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipe hashtags" ON public.recipe_hashtags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recipe ingredients junction
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  amount_value NUMERIC,
  amount_unit TEXT,
  display_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(recipe_id, ingredient_id)
);
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipe ingredients" ON public.recipe_ingredients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recipe equipment junction
CREATE TABLE public.recipe_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, equipment_id)
);
ALTER TABLE public.recipe_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe equipment" ON public.recipe_equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipe equipment" ON public.recipe_equipment FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recipe steps
CREATE TABLE public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  instruction TEXT NOT NULL,
  UNIQUE(recipe_id, step_number)
);
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recipe steps" ON public.recipe_steps FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipe steps" ON public.recipe_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recommended drinks junction
CREATE TABLE public.recipe_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  recommended_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(recipe_id, recommended_recipe_id),
  CHECK (recipe_id != recommended_recipe_id)
);
ALTER TABLE public.recipe_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view recommendations" ON public.recipe_recommendations FOR SELECT USING (true);
CREATE POLICY "Admins can manage recommendations" ON public.recipe_recommendations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible reviews" ON public.reviews FOR SELECT USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
