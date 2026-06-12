
-- Grant table-level privileges to anon for all editor-managed tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.recipes,
  public.recipe_translations,
  public.recipe_ingredients,
  public.recipe_ingredient_translations,
  public.recipe_steps,
  public.recipe_step_translations,
  public.recipe_equipment,
  public.recipe_hashtags,
  public.recipe_tags,
  public.recipe_recommendations,
  public.recipe_seo_phrases,
  public.ingredients,
  public.ingredient_translations,
  public.ingredient_types,
  public.equipment,
  public.equipment_translations,
  public.hashtags,
  public.languages,
  public.country_language_targets,
  public.reviews,
  public.contact_messages,
  public.admin_settings,
  public.ui_translations
TO anon;

-- Add permissive ALL policies for anon on each editor-managed table
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'recipes','recipe_translations','recipe_ingredients','recipe_ingredient_translations',
    'recipe_steps','recipe_step_translations','recipe_equipment','recipe_hashtags',
    'recipe_tags','recipe_recommendations','recipe_seo_phrases',
    'ingredients','ingredient_translations','ingredient_types',
    'equipment','equipment_translations','hashtags',
    'languages','country_language_targets','reviews','contact_messages',
    'admin_settings','ui_translations'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Editor open access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Editor open access" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
