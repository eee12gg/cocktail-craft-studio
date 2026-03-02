
-- Create ingredient_type enum
CREATE TYPE public.ingredient_type AS ENUM ('alcohol', 'liqueur', 'syrup', 'juice', 'fruit', 'mixer', 'other');

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  type ingredient_type NOT NULL DEFAULT 'other',
  description TEXT,
  image_url TEXT,
  image_thumb_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view ingredients"
  ON public.ingredients FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can insert ingredients"
  ON public.ingredients FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ingredients"
  ON public.ingredients FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ingredients"
  ON public.ingredients FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
