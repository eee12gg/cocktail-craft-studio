
-- Languages table
CREATE TABLE public.languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active languages" ON public.languages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage languages" ON public.languages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default languages
INSERT INTO public.languages (code, name, native_name, flag_emoji, is_active, sort_order) VALUES
  ('en', 'English', 'English', '🇬🇧', true, 0),
  ('de', 'German', 'Deutsch', '🇩🇪', true, 1),
  ('fr', 'French', 'Français', '🇫🇷', true, 2),
  ('pl', 'Polish', 'Polski', '🇵🇱', true, 3),
  ('uk', 'Ukrainian', 'Українська', '🇺🇦', true, 4);

-- Recipe translations
CREATE TABLE public.recipe_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, language_code),
  UNIQUE(language_code, slug)
);

ALTER TABLE public.recipe_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipe translations" ON public.recipe_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage recipe translations" ON public.recipe_translations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ingredient translations
CREATE TABLE public.ingredient_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ingredient_id, language_code),
  UNIQUE(language_code, slug)
);

ALTER TABLE public.ingredient_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ingredient translations" ON public.ingredient_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage ingredient translations" ON public.ingredient_translations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- UI translations (static strings)
CREATE TABLE public.ui_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(language_code, key)
);

ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view UI translations" ON public.ui_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage UI translations" ON public.ui_translations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Recipe step translations
CREATE TABLE public.recipe_step_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_step_id UUID NOT NULL REFERENCES public.recipe_steps(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  instruction TEXT NOT NULL,
  UNIQUE(recipe_step_id, language_code)
);

ALTER TABLE public.recipe_step_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view step translations" ON public.recipe_step_translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage step translations" ON public.recipe_step_translations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for translations
CREATE TRIGGER update_recipe_translations_updated_at
  BEFORE UPDATE ON public.recipe_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredient_translations_updated_at
  BEFORE UPDATE ON public.ingredient_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
