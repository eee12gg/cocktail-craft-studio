/**
 * Recipe data hooks.
 *
 * - useRecipes() — all published recipes (lightweight, for lists)
 * - useRecipeBySlug(slug) — single recipe with full details
 * - useRecipesByCategory(cat) — filtered subset by category
 * - useSearchRecipes(query) — client-side text search (legacy)
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { RecipeLight, RecipeFull, RecipeIngredient } from "@/api/types";
import { useLanguage } from "@/hooks/useLanguage";

// Re-export types for backward compatibility
export type DBRecipeIngredient = RecipeIngredient;
export type DBRecipe = RecipeFull;
export type DBRecipeLight = RecipeLight;

/** All published recipes (lightweight list) */
export function useRecipes() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["recipes-light", lang],
    queryFn: () => api.fetchRecipes(lang),
    staleTime: 5 * 60 * 1000,
  });
}

/** Single recipe by slug (full detail with steps, equipment, etc.) */
export function useRecipeBySlug(slug: string) {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["recipe", slug, lang],
    queryFn: () => api.fetchRecipeBySlug(slug, lang),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/** Recipes filtered by category */
export function useRecipesByCategory(category: string) {
  const { data: recipes, ...rest } = useRecipes();
  const filtered = recipes?.filter((r) => r.category === category) || [];
  return { data: filtered, ...rest };
}

/** Client-side search across recipes (used as fallback) */
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
