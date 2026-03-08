/**
 * Ingredient data hooks.
 *
 * - useIngredients() — all ingredients with translations
 * - useIngredientBySlug(slug) — single ingredient lookup
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Ingredient } from "@/api/types";
import { useLanguage } from "@/hooks/useLanguage";

// Re-export for backward compatibility
export type DBIngredient = Ingredient;

/** All ingredients, translated for current language */
export function useIngredients() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["ingredients", lang],
    queryFn: () => api.fetchIngredients(lang),
    staleTime: 5 * 60 * 1000,
  });
}

/** Single ingredient by slug (derived from ingredients list) */
export function useIngredientBySlug(slug: string) {
  const { data: ingredients, ...rest } = useIngredients();
  const ingredient = ingredients?.find((i) => i.slug === slug);
  return { data: ingredient, ...rest };
}
