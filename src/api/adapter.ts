/**
 * ContentAdapter — abstract interface for any backend (Supabase, Strapi, etc.).
 * To switch backends, implement this interface and update `src/api/index.ts`.
 */

import type {
  RecipeLight,
  RecipeFull,
  Ingredient,
  Language,
  SearchResult,
  LangCode,
} from "./types";

export interface ContentAdapter {
  /** Fetch all published recipes (lightweight, for list pages) */
  fetchRecipes(lang: LangCode): Promise<RecipeLight[]>;

  /** Fetch a single recipe by slug (full detail) */
  fetchRecipeBySlug(slug: string, lang: LangCode): Promise<RecipeFull | null>;

  /** Fetch all ingredients */
  fetchIngredients(lang: LangCode): Promise<Ingredient[]>;

  /** Fetch active languages */
  fetchLanguages(): Promise<Language[]>;

  /** Fetch UI translation strings for a language */
  fetchUITranslations(lang: LangCode): Promise<Record<string, string>>;

  /** Cross-language smart search */
  smartSearch(query: string, lang: LangCode): Promise<SearchResult>;
}
