
-- Equipment translations (bar tools)
CREATE TABLE IF NOT EXISTS public.equipment_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (equipment_id, language_code)
);

ALTER TABLE public.equipment_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view equipment translations"
  ON public.equipment_translations FOR SELECT USING (true);

CREATE POLICY "Admins can manage equipment translations"
  ON public.equipment_translations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_equipment_translations_updated_at
  BEFORE UPDATE ON public.equipment_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipe ingredient display_text translations
CREATE TABLE IF NOT EXISTS public.recipe_ingredient_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_ingredient_id UUID NOT NULL REFERENCES public.recipe_ingredients(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  display_text TEXT NOT NULL,
  UNIQUE (recipe_ingredient_id, language_code)
);

ALTER TABLE public.recipe_ingredient_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipe ingredient translations"
  ON public.recipe_ingredient_translations FOR SELECT USING (true);

CREATE POLICY "Admins can manage recipe ingredient translations"
  ON public.recipe_ingredient_translations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
