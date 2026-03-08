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

/** Lightweight recipe for list pages (no steps, equipment, recommendations) */
export interface DBRecipeLight {
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
  tags: string[];
  hashtags: string[];
}

// ─── Light fetch for category/list pages ────────────────────────────────
async function fetchLightRecipes(lang: LangCode): Promise<DBRecipeLight[]> {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, slug, title, category, image_url, description, prep_time, alcohol_level, badge, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!recipes?.length) return [];

  const recipeIds = recipes.map((r) => r.id);
  const needsTranslation = lang !== DEFAULT_LANG;

  const [ingredientsRes, tagsRes, hashtagsRes, recipeTransRes, ingTransRes] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)")
      .in("recipe_id", recipeIds)
      .order("sort_order"),
    supabase.from("recipe_tags").select("recipe_id, tag").in("recipe_id", recipeIds),
    supabase.from("recipe_hashtags").select("recipe_id, hashtag:hashtags(name)").in("recipe_id", recipeIds),
    needsTranslation
      ? supabase.from("recipe_translations").select("recipe_id, title, slug, description").eq("language_code", lang)
      : Promise.resolve({ data: [] as any[] }),
    needsTranslation
      ? supabase.from("ingredient_translations").select("ingredient_id, name, slug").eq("language_code", lang)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const recipeTransMap: Record<string, { title: string; slug: string; description: string | null }> = {};
  (recipeTransRes.data || []).forEach((t: any) => {
    recipeTransMap[t.recipe_id] = { title: t.title, slug: t.slug, description: t.description };
  });

  const ingTransMap: Record<string, { name: string; slug: string }> = {};
  (ingTransRes.data || []).forEach((t: any) => {
    ingTransMap[t.ingredient_id] = { name: t.name, slug: t.slug };
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
      tags: (tagsRes.data || []).filter((t) => t.recipe_id === r.id).map((t) => t.tag),
      hashtags: (hashtagsRes.data || []).filter((h) => h.recipe_id === r.id).map((h) => (h.hashtag as any)?.name || ""),
    };
  });
}

// ─── Full fetch for a single recipe ────────────────────────────────────
async function fetchSingleRecipe(slug: string, lang: LangCode): Promise<DBRecipe | null> {
  // Try to find by slug or translated slug
  let recipeRow: any = null;

  if (lang !== DEFAULT_LANG) {
    const { data: trans } = await supabase
      .from("recipe_translations")
      .select("recipe_id")
      .eq("slug", slug)
      .eq("language_code", lang)
      .maybeSingle();
    if (trans) {
      const { data } = await supabase.from("recipes").select("*").eq("id", trans.recipe_id).eq("is_published", true).single();
      recipeRow = data;
    }
  }

  if (!recipeRow) {
    const { data } = await supabase.from("recipes").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
    recipeRow = data;
  }

  if (!recipeRow) return null;

  const recipeId = recipeRow.id;
  const needsTranslation = lang !== DEFAULT_LANG;

  const [ingredientsRes, stepsRes, equipmentRes, tagsRes, hashtagsRes, recsRes, recipeTransRes, stepTransRes, ingTransRes] = await Promise.all([
    supabase.from("recipe_ingredients").select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)").eq("recipe_id", recipeId).order("sort_order"),
    supabase.from("recipe_steps").select("id, instruction, step_number").eq("recipe_id", recipeId).order("step_number"),
    supabase.from("recipe_equipment").select("equipment:equipment(name, image_url, description)").eq("recipe_id", recipeId),
    supabase.from("recipe_tags").select("tag").eq("recipe_id", recipeId),
    supabase.from("recipe_hashtags").select("hashtag:hashtags(name)").eq("recipe_id", recipeId),
    supabase.from("recipe_recommendations").select("sort_order, recommended:recipes!recipe_recommendations_recommended_recipe_id_fkey(id, slug, title, image_url)").eq("recipe_id", recipeId).order("sort_order"),
    needsTranslation ? supabase.from("recipe_translations").select("title, slug, description").eq("recipe_id", recipeId).eq("language_code", lang).maybeSingle() : Promise.resolve({ data: null }),
    needsTranslation ? supabase.from("recipe_step_translations").select("recipe_step_id, instruction").eq("language_code", lang) : Promise.resolve({ data: [] as any[] }),
    needsTranslation ? supabase.from("ingredient_translations").select("ingredient_id, name, slug").eq("language_code", lang) : Promise.resolve({ data: [] as any[] }),
  ]);

  const trans = recipeTransRes.data as any;
  const stepTransMap: Record<string, string> = {};
  ((stepTransRes.data as any[]) || []).forEach((t: any) => { stepTransMap[t.recipe_step_id] = t.instruction; });
  const ingTransMap: Record<string, { name: string; slug: string }> = {};
  ((ingTransRes.data as any[]) || []).forEach((t: any) => { ingTransMap[t.ingredient_id] = { name: t.name, slug: t.slug }; });

  // Recommendation translations
  const recTransMap: Record<string, { title: string; slug: string }> = {};
  if (needsTranslation && recsRes.data?.length) {
    const recIds = recsRes.data.map((r: any) => (r.recommended as any)?.id).filter(Boolean);
    if (recIds.length) {
      const { data: recTrans } = await supabase.from("recipe_translations").select("recipe_id, title, slug").eq("language_code", lang).in("recipe_id", recIds);
      (recTrans || []).forEach((t: any) => { recTransMap[t.recipe_id] = { title: t.title, slug: t.slug }; });
    }
  }

  return {
    id: recipeRow.id,
    slug: trans?.slug || recipeRow.slug,
    title: trans?.title || recipeRow.title,
    category: recipeRow.category,
    image_url: recipeRow.image_url,
    description: trans?.description || recipeRow.description,
    prep_time: recipeRow.prep_time,
    alcohol_level: recipeRow.alcohol_level,
    badge: recipeRow.badge,
    is_published: recipeRow.is_published,
    ingredients: (ingredientsRes.data || []).map((i: any) => {
      const ingId = (i.ingredient as any)?.id;
      const it = ingId ? ingTransMap[ingId] : null;
      return {
        name: it?.name || (i.ingredient as any)?.name || "",
        slug: it?.slug || (i.ingredient as any)?.slug || "",
        amount_value: i.amount_value,
        amount_unit: i.amount_unit,
        display_text: i.display_text,
        image_url: (i.ingredient as any)?.image_url || null,
      };
    }),
    equipment: (equipmentRes.data || []).map((e: any) => ({
      name: (e.equipment as any)?.name || "",
      image_url: (e.equipment as any)?.image_url || null,
      description: (e.equipment as any)?.description || null,
    })),
    instructions: (stepsRes.data || []).map((s: any) => stepTransMap[s.id] || s.instruction),
    tags: (tagsRes.data || []).map((t: any) => t.tag),
    hashtags: (hashtagsRes.data || []).map((h: any) => (h.hashtag as any)?.name || ""),
    recommendations: (recsRes.data || []).map((rec: any) => {
      const recId = (rec.recommended as any)?.id || "";
      const rt = recTransMap[recId];
      return {
        id: recId,
        slug: rt?.slug || (rec.recommended as any)?.slug || "",
        title: rt?.title || (rec.recommended as any)?.title || "",
        image_url: (rec.recommended as any)?.image_url || null,
      };
    }),
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────

/** Light recipes list — for home, category, search pages */
export function useRecipes() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["recipes-light", lang],
    queryFn: () => fetchLightRecipes(lang),
    staleTime: 5 * 60 * 1000,
  });
}

/** Full single recipe — for recipe detail page */
export function useRecipeBySlug(slug: string) {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["recipe", slug, lang],
    queryFn: () => fetchSingleRecipe(slug, lang),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
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
      r.category.toLowerCase().includes(q)
  );
  return { data: results, ...rest };
}
