/**
 * API entry point.
 * 
 * To switch from Supabase to Strapi (or any other CMS):
 * 1. Create a new adapter implementing ContentAdapter (e.g. src/api/strapi-adapter.ts)
 * 2. Change the import below to your new adapter
 * 3. That's it — all hooks and components will use the new backend automatically
 */

import { supabaseAdapter } from "./supabase-adapter";
import type { ContentAdapter } from "./adapter";

export const api: ContentAdapter = supabaseAdapter;

// Re-export types for convenience
export type { ContentAdapter } from "./adapter";
export type {
  RecipeLight,
  RecipeFull,
  RecipeIngredient,
  Ingredient,
  Language,
  SearchResult,
  SearchIngredientResult,
  LangCode,
} from "./types";
