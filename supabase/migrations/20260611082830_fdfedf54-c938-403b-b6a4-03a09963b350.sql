
-- 1) country_language_targets: multi-language per country with default flag
ALTER TABLE public.country_language_targets DROP CONSTRAINT IF EXISTS country_language_targets_country_code_key;
ALTER TABLE public.country_language_targets ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS country_language_targets_country_lang_uniq
  ON public.country_language_targets(country_code, language_code);
CREATE UNIQUE INDEX IF NOT EXISTS country_language_targets_one_default_per_country
  ON public.country_language_targets(country_code) WHERE is_default;

-- Backfill: mark first row of each country as default
UPDATE public.country_language_targets t
SET is_default = true
FROM (
  SELECT DISTINCT ON (country_code) id FROM public.country_language_targets ORDER BY country_code, created_at
) f
WHERE t.id = f.id AND NOT EXISTS (
  SELECT 1 FROM public.country_language_targets x WHERE x.country_code = t.country_code AND x.is_default
);

-- Prevent deleting the last language of a country
CREATE OR REPLACE FUNCTION public.prevent_last_country_language_delete()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.country_language_targets WHERE country_code = OLD.country_code) <= 1 THEN
    RAISE EXCEPTION 'Нельзя удалить последний язык страны %', OLD.country_code;
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_last_country_lang ON public.country_language_targets;
CREATE TRIGGER trg_prevent_last_country_lang
  BEFORE DELETE ON public.country_language_targets
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_country_language_delete();

-- 2) admin_settings: allow_registration flag
INSERT INTO public.admin_settings (key, value)
VALUES ('allow_registration', 'false')
ON CONFLICT (key) DO NOTHING;
