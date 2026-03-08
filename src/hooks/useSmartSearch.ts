import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";
import type { DBRecipeLight, DBRecipeIngredient } from "@/hooks/useRecipes";
import { useState, useEffect } from "react";

export interface SearchIngredientResult {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  type: string;
}

interface SmartSearchData {
  recipes: DBRecipeLight[];
  ingredients: SearchIngredientResult[];
}

async function smartSearch(query: string, lang: LangCode): Promise<SmartSearchData> {
  if (!query.trim()) return { recipes: [], ingredients: [] };

  const q = query.toLowerCase().trim();

  const [
    recipesRes, recipeTransRes, ingredientsRes, ingTransRes,
    recipeIngsRes, tagsRes, hashtagsRes,
  ] = await Promise.all([
    supabase.from("recipes")
      .select("id, slug, title, category, image_url, description, prep_time, alcohol_level, badge, is_published")
      .eq("is_published", true),
    supabase.from("recipe_translations").select("recipe_id, title, slug, description, language_code"),
    supabase.from("ingredients").select("id, slug, name, image_url, type"),
    supabase.from("ingredient_translations").select("ingredient_id, name, slug, language_code"),
    supabase.from("recipe_ingredients")
      .select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)")
      .order("sort_order"),
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

  // Translation maps
  const recipeTransByRecipe: Record<string, any[]> = {};
  recipeTrans.forEach((t: any) => {
    if (!recipeTransByRecipe[t.recipe_id]) recipeTransByRecipe[t.recipe_id] = [];
    recipeTransByRecipe[t.recipe_id].push(t);
  });

  const ingTransByIng: Record<string, any[]> = {};
  ingTrans.forEach((t: any) => {
    if (!ingTransByIng[t.ingredient_id]) ingTransByIng[t.ingredient_id] = [];
    ingTransByIng[t.ingredient_id].push(t);
  });

  // All ingredient names across languages
  const ingredientAllNames: Record<string, string[]> = {};
  ingredients.forEach((ing: any) => { ingredientAllNames[ing.id] = [ing.name.toLowerCase()]; });
  ingTrans.forEach((t: any) => {
    if (!ingredientAllNames[t.ingredient_id]) ingredientAllNames[t.ingredient_id] = [];
    ingredientAllNames[t.ingredient_id].push(t.name.toLowerCase());
  });

  // Current-language ingredient translation map
  const ingCurrentTrans: Record<string, { name: string; slug: string }> = {};
  if (lang !== DEFAULT_LANG) {
    ingTrans.filter((t: any) => t.language_code === lang).forEach((t: any) => {
      ingCurrentTrans[t.ingredient_id] = { name: t.name, slug: t.slug };
    });
  }

  // ── Search Recipes ──
  const matchedRecipes: DBRecipeLight[] = [];

  for (const r of recipes) {
    let matched = false;

    if (r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)) {
      matched = true;
    }

    if (!matched) {
      const trans = recipeTransByRecipe[r.id] || [];
      for (const t of trans) {
        if (t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)) { matched = true; break; }
      }
    }

    if (!matched) {
      const rIngs = recipeIngs.filter((ri: any) => ri.recipe_id === r.id);
      for (const ri of rIngs) {
        const ingId = (ri.ingredient as any)?.id;
        const names = ingredientAllNames[ingId] || [];
        if (names.some((n) => n.includes(q))) { matched = true; break; }
      }
    }

    if (!matched) {
      const rTags = tags.filter((t: any) => t.recipe_id === r.id);
      if (rTags.some((t: any) => t.tag.toLowerCase().includes(q))) matched = true;
    }

    if (!matched) {
      const rHash = hashtags.filter((h: any) => h.recipe_id === r.id);
      if (rHash.some((h: any) => ((h.hashtag as any)?.name || "").toLowerCase().includes(q))) matched = true;
    }

    if (!matched && r.category.toLowerCase().includes(q)) matched = true;

    if (matched) {
      const currentTrans = lang !== DEFAULT_LANG
        ? (recipeTransByRecipe[r.id] || []).find((t: any) => t.language_code === lang)
        : null;

      const recipeIngredients: DBRecipeIngredient[] = (recipeIngs.filter((ri: any) => ri.recipe_id === r.id) || []).map((i: any) => {
        const ingId = (i.ingredient as any)?.id;
        const it = ingId ? ingCurrentTrans[ingId] : null;
        return {
          name: it?.name || (i.ingredient as any)?.name || "",
          slug: it?.slug || (i.ingredient as any)?.slug || "",
          amount_value: i.amount_value,
          amount_unit: i.amount_unit,
          display_text: i.display_text,
          image_url: (i.ingredient as any)?.image_url || null,
        };
      });

      matchedRecipes.push({
        id: r.id,
        slug: currentTrans?.slug || r.slug,
        title: currentTrans?.title || r.title,
        category: r.category,
        image_url: r.image_url,
        description: currentTrans?.description || r.description,
        prep_time: r.prep_time,
        alcohol_level: r.alcohol_level,
        badge: r.badge,
        is_published: r.is_published,
        ingredients: recipeIngredients,
        tags: tags.filter((t: any) => t.recipe_id === r.id).map((t: any) => t.tag),
        hashtags: hashtags.filter((h: any) => h.recipe_id === r.id).map((h: any) => (h.hashtag as any)?.name || ""),
      });
    }
  }

  // ── Search Ingredients ──
  const matchedIngredients: SearchIngredientResult[] = [];
  for (const ing of ingredients) {
    const allNames = ingredientAllNames[ing.id] || [];
    if (allNames.some((n) => n.includes(q)) || ing.type.toLowerCase().includes(q)) {
      const ct = ingCurrentTrans[ing.id];
      matchedIngredients.push({
        id: ing.id,
        slug: ct?.slug || ing.slug,
        name: ct?.name || ing.name,
        image_url: ing.image_url,
        type: ing.type,
      });
    }
  }

  return { recipes: matchedRecipes, ingredients: matchedIngredients };
}

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
