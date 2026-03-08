import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

export interface SearchRecipeResult {
  id: string;
  slug: string;
  title: string;
  category: "cocktails" | "shots" | "non-alcoholic";
  image_url: string | null;
  description: string | null;
  badge: string | null;
  alcohol_level: string;
  prep_time: string | null;
  matchSource: string; // what matched: "title", "ingredient", "tag", etc.
}

export interface SearchIngredientResult {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  type: string;
}

interface SmartSearchData {
  recipes: SearchRecipeResult[];
  ingredients: SearchIngredientResult[];
}

/**
 * Smart cross-language search.
 * Searches against English base data + all translations so a query
 * in any language returns relevant results regardless of current locale.
 */
async function smartSearch(query: string, lang: LangCode): Promise<SmartSearchData> {
  if (!query.trim()) return { recipes: [], ingredients: [] };

  const q = query.toLowerCase().trim();

  // Fetch all data we need in parallel
  const [
    recipesRes,
    recipeTransRes,
    ingredientsRes,
    ingTransRes,
    recipeIngsRes,
    tagsRes,
    hashtagsRes,
  ] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, slug, title, category, image_url, description, badge, alcohol_level, prep_time, is_published")
      .eq("is_published", true),
    supabase
      .from("recipe_translations")
      .select("recipe_id, title, slug, description, language_code"),
    supabase
      .from("ingredients")
      .select("id, slug, name, image_url, type"),
    supabase
      .from("ingredient_translations")
      .select("ingredient_id, name, slug, language_code"),
    supabase
      .from("recipe_ingredients")
      .select("recipe_id, ingredient_id, ingredient:ingredients(id, name)"),
    supabase.from("recipe_tags").select("recipe_id, tag"),
    supabase.from("recipe_hashtags").select("recipe_id, hashtag:hashtags(name)"),
  ]);

  const recipes = recipesRes.data || [];
  const recipeTrans = recipeTransRes.data || [];
  const ingredients = ingredientsRes.data || [];
  const ingTrans = ingTransRes.data || [];
  const recipeIngs = recipeIngsRes.data || [];
  const tags = tagsRes.data || [];
  const hashtags = hashtagsRes.data || [];

  // Build translation maps for recipes (all languages)
  const recipeTransByRecipe: Record<string, Array<{ title: string; slug: string; description: string | null; language_code: string }>> = {};
  recipeTrans.forEach((t: any) => {
    if (!recipeTransByRecipe[t.recipe_id]) recipeTransByRecipe[t.recipe_id] = [];
    recipeTransByRecipe[t.recipe_id].push(t);
  });

  // Build translation maps for ingredients (all languages)
  const ingTransByIng: Record<string, Array<{ name: string; slug: string; language_code: string }>> = {};
  ingTrans.forEach((t: any) => {
    if (!ingTransByIng[t.ingredient_id]) ingTransByIng[t.ingredient_id] = [];
    ingTransByIng[t.ingredient_id].push(t);
  });

  // Build ingredient name lookup (all languages)
  const ingredientAllNames: Record<string, string[]> = {};
  ingredients.forEach((ing: any) => {
    ingredientAllNames[ing.id] = [ing.name.toLowerCase()];
  });
  ingTrans.forEach((t: any) => {
    if (!ingredientAllNames[t.ingredient_id]) ingredientAllNames[t.ingredient_id] = [];
    ingredientAllNames[t.ingredient_id].push(t.name.toLowerCase());
  });

  // ── Search Recipes ──
  const matchedRecipes: SearchRecipeResult[] = [];
  const matchedRecipeIds = new Set<string>();

  for (const r of recipes) {
    let matchSource = "";

    // Match against English title/description
    if (r.title.toLowerCase().includes(q)) matchSource = "title";
    else if ((r.description || "").toLowerCase().includes(q)) matchSource = "description";

    // Match against all translations of this recipe
    if (!matchSource) {
      const trans = recipeTransByRecipe[r.id] || [];
      for (const t of trans) {
        if (t.title.toLowerCase().includes(q)) { matchSource = "title"; break; }
        if ((t.description || "").toLowerCase().includes(q)) { matchSource = "description"; break; }
      }
    }

    // Match against ingredient names (all languages)
    if (!matchSource) {
      const rIngs = recipeIngs.filter((ri: any) => ri.recipe_id === r.id);
      for (const ri of rIngs) {
        const ingId = (ri.ingredient as any)?.id || ri.ingredient_id;
        const names = ingredientAllNames[ingId] || [];
        if (names.some((n) => n.includes(q))) { matchSource = "ingredient"; break; }
      }
    }

    // Match against tags
    if (!matchSource) {
      const rTags = tags.filter((t: any) => t.recipe_id === r.id);
      if (rTags.some((t: any) => t.tag.toLowerCase().includes(q))) matchSource = "tag";
    }

    // Match against hashtags
    if (!matchSource) {
      const rHash = hashtags.filter((h: any) => h.recipe_id === r.id);
      if (rHash.some((h: any) => ((h.hashtag as any)?.name || "").toLowerCase().includes(q))) matchSource = "hashtag";
    }

    // Match category
    if (!matchSource && r.category.toLowerCase().includes(q)) matchSource = "category";

    if (matchSource) {
      matchedRecipeIds.add(r.id);
      // Use current language translation for display
      const currentTrans = lang !== DEFAULT_LANG
        ? (recipeTransByRecipe[r.id] || []).find((t) => t.language_code === lang)
        : null;
      matchedRecipes.push({
        id: r.id,
        slug: currentTrans?.slug || r.slug,
        title: currentTrans?.title || r.title,
        category: r.category,
        image_url: r.image_url,
        description: currentTrans?.description || r.description,
        badge: r.badge,
        alcohol_level: r.alcohol_level,
        prep_time: r.prep_time,
        matchSource,
      });
    }
  }

  // ── Search Ingredients ──
  const matchedIngredients: SearchIngredientResult[] = [];

  for (const ing of ingredients) {
    const allNames = ingredientAllNames[ing.id] || [];
    if (allNames.some((n) => n.includes(q)) || ing.type.toLowerCase().includes(q)) {
      // Use current language translation for display
      const currentTrans = lang !== DEFAULT_LANG
        ? (ingTransByIng[ing.id] || []).find((t) => t.language_code === lang)
        : null;
      matchedIngredients.push({
        id: ing.id,
        slug: currentTrans?.slug || ing.slug,
        name: currentTrans?.name || ing.name,
        image_url: ing.image_url,
        type: ing.type,
      });
    }
  }

  return { recipes: matchedRecipes, ingredients: matchedIngredients };
}

/** Debounced smart search hook */
export function useSmartSearch(query: string) {
  const { lang } = useLanguage();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["smart-search", debouncedQuery, lang],
    queryFn: () => smartSearch(debouncedQuery, lang),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
