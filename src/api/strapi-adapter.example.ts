/**
 * Example Strapi adapter — implement this when ready to migrate.
 * 
 * Strapi Content Types to create (matching current data model):
 * 
 * 1. Recipe (collection)
 *    - title (text), slug (uid), description (richtext), category (enum: cocktails/shots/non-alcoholic)
 *    - image (media), badge (enum: Trending/Popular/Top 10/New), alcohol_level (enum)
 *    - prep_time (text), is_published (boolean)
 *    - ingredients (relation: many-to-many with Ingredient, via recipe_ingredients component)
 *    - steps (component: repeatable { step_number, instruction })
 *    - equipment (relation: many-to-many with Equipment)
 *    - tags (JSON array or relation), hashtags (relation: many-to-many)
 *    - recommendations (relation: many-to-many self-referencing)
 *    - localizations (i18n plugin handles this automatically)
 *
 * 2. Ingredient (collection)
 *    - name (text), slug (uid), description (richtext), type (enum)
 *    - image (media)
 *    - localizations (i18n)
 *
 * 3. Equipment (collection)
 *    - name (text), slug (uid), description (richtext), image (media)
 *
 * 4. Hashtag (collection)
 *    - name (text, unique)
 *
 * Enable the i18n plugin for Recipe & Ingredient to handle translations.
 * 
 * Environment variables needed:
 *   VITE_STRAPI_URL=https://your-strapi.example.com
 *   VITE_STRAPI_TOKEN=your-api-token (if using token auth)
 */

import type { ContentAdapter } from "./adapter";
import type {
  RecipeLight,
  RecipeFull,
  Ingredient,
  Language,
  SearchResult,
  LangCode,
} from "./types";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || "";

async function strapiFetch(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`/api${endpoint}`, STRAPI_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`);
  return res.json();
}

export const strapiAdapter: ContentAdapter = {
  async fetchRecipes(lang: LangCode): Promise<RecipeLight[]> {
    // Example: GET /api/recipes?locale={lang}&populate=ingredients.ingredient,tags,hashtags&filters[is_published]=true
    // TODO: implement mapping from Strapi response to RecipeLight[]
    throw new Error("strapiAdapter.fetchRecipes not implemented yet");
  },

  async fetchRecipeBySlug(slug: string, lang: LangCode): Promise<RecipeFull | null> {
    // Example: GET /api/recipes?locale={lang}&filters[slug]={slug}&populate=deep
    // TODO: implement
    throw new Error("strapiAdapter.fetchRecipeBySlug not implemented yet");
  },

  async fetchIngredients(lang: LangCode): Promise<Ingredient[]> {
    // Example: GET /api/ingredients?locale={lang}&populate=image
    // TODO: implement
    throw new Error("strapiAdapter.fetchIngredients not implemented yet");
  },

  async fetchLanguages(): Promise<Language[]> {
    // Strapi i18n: GET /api/i18n/locales
    // TODO: map to Language[]
    throw new Error("strapiAdapter.fetchLanguages not implemented yet");
  },

  async fetchUITranslations(lang: LangCode): Promise<Record<string, string>> {
    // Could use a single-type or custom endpoint
    // TODO: implement
    throw new Error("strapiAdapter.fetchUITranslations not implemented yet");
  },

  async smartSearch(query: string, lang: LangCode): Promise<SearchResult> {
    // Use Strapi's _q parameter or custom search endpoint
    // TODO: implement
    throw new Error("strapiAdapter.smartSearch not implemented yet");
  },
};
