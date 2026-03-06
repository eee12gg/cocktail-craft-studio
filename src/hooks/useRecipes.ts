import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

async function fetchFullRecipes(): Promise<DBRecipe[]> {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!recipes || recipes.length === 0) return [];

  const recipeIds = recipes.map((r) => r.id);

  const [ingredientsRes, stepsRes, equipmentRes, tagsRes, hashtagsRes, recsRes] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(name, slug, image_url)")
      .in("recipe_id", recipeIds)
      .order("sort_order"),
    supabase
      .from("recipe_steps")
      .select("recipe_id, instruction, step_number")
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
  ]);

  return recipes.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    image_url: r.image_url,
    description: r.description,
    prep_time: r.prep_time,
    alcohol_level: r.alcohol_level,
    badge: r.badge,
    is_published: r.is_published,
    ingredients: (ingredientsRes.data || [])
      .filter((i) => i.recipe_id === r.id)
      .map((i) => ({
        name: (i.ingredient as any)?.name || "",
        slug: (i.ingredient as any)?.slug || "",
        amount_value: i.amount_value,
        amount_unit: i.amount_unit,
        display_text: i.display_text,
        image_url: (i.ingredient as any)?.image_url || null,
      })),
    equipment: (equipmentRes.data || [])
      .filter((e) => e.recipe_id === r.id)
      .map((e) => ({
        name: (e.equipment as any)?.name || "",
        image_url: (e.equipment as any)?.image_url || null,
        description: (e.equipment as any)?.description || null,
      })),
    instructions: (stepsRes.data || [])
      .filter((s) => s.recipe_id === r.id)
      .map((s) => s.instruction),
    tags: (tagsRes.data || [])
      .filter((t) => t.recipe_id === r.id)
      .map((t) => t.tag),
    hashtags: (hashtagsRes.data || [])
      .filter((h) => h.recipe_id === r.id)
      .map((h) => (h.hashtag as any)?.name || ""),
    recommendations: (recsRes.data || [])
      .filter((rec) => rec.recipe_id === r.id)
      .map((rec) => ({
        id: (rec.recommended as any)?.id || "",
        slug: (rec.recommended as any)?.slug || "",
        title: (rec.recommended as any)?.title || "",
        image_url: (rec.recommended as any)?.image_url || null,
      })),
  }));
}

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: fetchFullRecipes,
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
      r.equipment.some((e) => e.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q)
  );
  return { data: results, ...rest };
}
