/**
 * Shared types for the content API layer.
 *
 * These types are backend-agnostic — used by both Supabase and Strapi
 * adapters. Any new backend only needs to return data matching these shapes.
 */

/* ─── Recipe types ─────────────────────────────────────────────────── */

/** A single ingredient within a recipe */
export interface RecipeIngredient {
  name: string;
  slug: string;
  amount_value: number | null;
  amount_unit: string | null;
  display_text: string;
  image_url: string | null;
}

/** Lightweight recipe data — used in list/card views */
export interface RecipeLight {
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
  ingredients: RecipeIngredient[];
  tags: string[];
  hashtags: string[];
}

/** Full recipe data — used on the recipe detail page */
export interface RecipeFull extends RecipeLight {
  equipment: { name: string; image_url: string | null; description: string | null }[];
  instructions: string[];
  recommendations: { id: string; slug: string; title: string; image_url: string | null }[];
}

/* ─── Ingredient types ─────────────────────────────────────────────── */

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  type: string;
}

/* ─── Language / i18n types ────────────────────────────────────────── */

export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  is_active: boolean;
  sort_order: number;
}

/* ─── Search types ─────────────────────────────────────────────────── */

export interface SearchResult {
  recipes: RecipeLight[];
  ingredients: SearchIngredientResult[];
}

export interface SearchIngredientResult {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  type: string;
}

/** Language code alias (flexible string for adapter compatibility) */
export type LangCode = string;
