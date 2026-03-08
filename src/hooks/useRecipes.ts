import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";

export interface DBRecipeIngredient {
  name: string;
  slug: string;
  amount_value: number | null;
  amount_unit: string | null;
  display_text: string;
  image_url: string | null;
}

export interface DBRecipe {
  id: string;
  slug: string;
  title: string;
  category: "cocktails" | "shots" | "non-alcoholic";
  image_url: string | null;
  description: string | null;
  prep_time: string | null;
  alcohol_level: string;
  badge: string | null;
  is_published: boolean;
  ingredients: DBRecipeIngredient[];
  equipment: { name: string; image_url: string | null; description: string | null }[];
  instructions: string[];
  tags: string[];
  hashtags: string[];
  recommendations: { id: string; slug: string; title: string; image_url: string | null }[];
}

async function fetchFullRecipes(lang: LangCode): Promise<DBRecipe[]> {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!recipes || recipes.length === 0) return [];

  const recipeIds = recipes.map((r) => r.id);

  // Fetch translations for non-default language
  const needsTranslation = lang !== DEFAULT_LANG;

  const [
    ingredientsRes, stepsRes, equipmentRes, tagsRes, hashtagsRes, recsRes,
    recipeTransRes, stepTransRes, ingTransRes,
  ] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)")
      .in("recipe_id", recipeIds)
      .order("sort_order"),
    supabase
      .from("recipe_steps")
      .select("recipe_id, id, instruction, step_number")
      .in("recipe_id", recipeIds)
      .order("step_number"),
    supabase
      .from("recipe_equipment")
      .select("recipe_id, equipment:equipment(name, image_url, description)")
      .in("recipe_id", recipeIds),
    supabase
      .from("recipe_tags")
      .select("recipe_id, tag")
      .in("recipe_id", recipeIds),
    supabase
      .from("recipe_hashtags")
      .select("recipe_id, hashtag:hashtags(name)")
      .in("recipe_id", recipeIds),
    supabase
      .from("recipe_recommendations")
      .select("recipe_id, sort_order, recommended:recipes!recipe_recommendations_recommended_recipe_id_fkey(id, slug, title, image_url)")
      .in("recipe_id", recipeIds)
      .order("sort_order"),
    // Recipe translations
    needsTranslation
      ? supabase.from("recipe_translations").select("recipe_id, title, slug, description").eq("language_code", lang)
      : Promise.resolve({ data: [] as any[] }),
    // Step translations
    needsTranslation
      ? supabase.from("recipe_step_translations").select("recipe_step_id, instruction").eq("language_code", lang)
      : Promise.resolve({ data: [] as any[] }),
    // Ingredient translations
    needsTranslation
      ? supabase.from("ingredient_translations").select("ingredient_id, name, slug").eq("language_code", lang)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  // Build translation maps
  const recipeTransMap: Record<string, { title: string; slug: string; description: string | null }> = {};
  (recipeTransRes.data || []).forEach((t: any) => {
    recipeTransMap[t.recipe_id] = { title: t.title, slug: t.slug, description: t.description };
  });

  const stepTransMap: Record<string, string> = {};
  (stepTransRes.data || []).forEach((t: any) => {
    stepTransMap[t.recipe_step_id] = t.instruction;
  });

  const ingTransMap: Record<string, { name: string; slug: string }> = {};
  (ingTransRes.data || []).forEach((t: any) => {
    ingTransMap[t.ingredient_id] = { name: t.name, slug: t.slug };
  });

  // Build recommendation translation map
  const recTransMap2: Record<string, { title: string; slug: string }> = {};
  (recipeTransRes.data || []).forEach((t: any) => {
    recTransMap2[t.recipe_id] = { title: t.title, slug: t.slug };
  });

  return recipes.map((r) => {
    const trans = recipeTransMap[r.id];

    return {
      id: r.id,
      slug: trans?.slug || r.slug,
      title: trans?.title || r.title,
      category: r.category,
      image_url: r.image_url,
      description: trans?.description || r.description,
      prep_time: r.prep_time,
      alcohol_level: r.alcohol_level,
      badge: r.badge,
      is_published: r.is_published,
      ingredients: (ingredientsRes.data || [])
        .filter((i) => i.recipe_id === r.id)
        .map((i) => {
          const ingId = (i.ingredient as any)?.id;
          const ingTrans = ingId ? ingTransMap[ingId] : null;
          return {
            name: ingTrans?.name || (i.ingredient as any)?.name || "",
            slug: ingTrans?.slug || (i.ingredient as any)?.slug || "",
            amount_value: i.amount_value,
            amount_unit: i.amount_unit,
            display_text: i.display_text,
            image_url: (i.ingredient as any)?.image_url || null,
          };
        }),
      equipment: (equipmentRes.data || [])
        .filter((e) => e.recipe_id === r.id)
        .map((e) => ({
          name: (e.equipment as any)?.name || "",
          image_url: (e.equipment as any)?.image_url || null,
          description: (e.equipment as any)?.description || null,
        })),
      instructions: (stepsRes.data || [])
        .filter((s) => s.recipe_id === r.id)
        .map((s) => stepTransMap[s.id] || s.instruction),
      tags: (tagsRes.data || [])
        .filter((t) => t.recipe_id === r.id)
        .map((t) => t.tag),
      hashtags: (hashtagsRes.data || [])
        .filter((h) => h.recipe_id === r.id)
        .map((h) => (h.hashtag as any)?.name || ""),
      recommendations: (recsRes.data || [])
        .filter((rec) => rec.recipe_id === r.id)
        .map((rec) => {
          const recId = (rec.recommended as any)?.id || "";
          const recTrans = recTransMap2[recId];
          return {
            id: recId,
            slug: recTrans?.slug || (rec.recommended as any)?.slug || "",
            title: recTrans?.title || (rec.recommended as any)?.title || "",
            image_url: (rec.recommended as any)?.image_url || null,
          };
        }),
    };
  });
}

export function useRecipes() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["recipes", lang],
    queryFn: () => fetchFullRecipes(lang),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipeBySlug(slug: string) {
  const { data: recipes, ...rest } = useRecipes();
  const recipe = recipes?.find((r) => r.slug === slug);
  return { data: recipe, ...rest };
}

export function useRecipesByCategory(category: string) {
  const { data: recipes, ...rest } = useRecipes();
  const filtered = recipes?.filter((r) => r.category === category) || [];
  return { data: filtered, ...rest };
}

export function useSearchRecipes(query: string) {
  const { data: recipes, ...rest } = useRecipes();
  if (!query.trim()) return { data: [], ...rest };
  const q = query.toLowerCase();
  const results = (recipes || []).filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.hashtags.some((h) => h.toLowerCase().includes(q)) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
      r.equipment.some((e) => e.name.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q)
  );
  return { data: results, ...rest };
}
