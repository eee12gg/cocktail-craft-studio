
-- 1. Create ingredient_types table
CREATE TABLE public.ingredient_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredient_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ingredient types"
  ON public.ingredient_types FOR SELECT USING (true);

CREATE POLICY "Admins can manage ingredient types"
  ON public.ingredient_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed from existing enum values
INSERT INTO public.ingredient_types (name, slug) VALUES
  ('Alcohol', 'alcohol'),
  ('Liqueur', 'liqueur'),
  ('Syrup', 'syrup'),
  ('Juice', 'juice'),
  ('Fruit', 'fruit'),
  ('Mixer', 'mixer'),
  ('Other', 'other');

-- 2. Add type_id FK to ingredients
ALTER TABLE public.ingredients ADD COLUMN type_id uuid REFERENCES public.ingredient_types(id);

-- Populate type_id from existing enum
UPDATE public.ingredients i
SET type_id = it.id
FROM public.ingredient_types it
WHERE it.slug = i.type::text;

-- 3. Add description and image columns to equipment
ALTER TABLE public.equipment ADD COLUMN description text;
ALTER TABLE public.equipment ADD COLUMN image_url text;
ALTER TABLE public.equipment ADD COLUMN image_thumb_url text;
