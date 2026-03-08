/**
 * Shared types for the content API layer.
 * These types are backend-agnostic — used by both Supabase and Strapi adapters.
 */

export interface RecipeIngredient {
  name: string;
  slug: string;
  amount_value: number | null;
  amount_unit: string | null;
  display_text: string;
  image_url: string | null;
}

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

export interface RecipeFull extends RecipeLight {
  equipment: { name: string; image_url: string | null; description: string | null }[];
  instructions: string[];
  recommendations: { id: string; slug: string; title: string; image_url: string | null }[];
}

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  type: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  is_active: boolean;
  sort_order: number;
}

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

export type LangCode = string;
