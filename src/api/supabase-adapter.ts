/**
 * Supabase implementation of ContentAdapter.
 *
 * All database queries are isolated here. The rest of the app
 * accesses data through the abstract ContentAdapter interface.
 *
 * Key features:
 * - Automatic translation overlay (falls back to default language)
 * - Cross-language search (searches all translations)
 * - Parallel query execution for performance
 */

import { supabase } from "@/integrations/supabase/client";
import type { ContentAdapter } from "./adapter";
import type {
  RecipeLight,
  RecipeFull,
  Ingredient,
  Language,
  SearchResult,
  RecipeIngredient,
  SearchIngredientResult,
  LangCode,
} from "./types";

const DEFAULT_LANG = "en";

/* ─── Helper: extract nested join object safely ────────────────────── */
const asAny = (obj: unknown): any => obj;

export const supabaseAdapter: ContentAdapter = {

  /* ═══════════════════════════════════════════════════════════════════
   *  RECIPES — lightweight list for category/home pages
   * ═══════════════════════════════════════════════════════════════════ */
  async fetchRecipes(lang: LangCode): Promise<RecipeLight[]> {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, slug, title, category, image_url, description, prep_time, alcohol_level, badge, is_published")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!recipes?.length) return [];

    const recipeIds = recipes.map((r) => r.id);
    const needsTranslation = lang !== DEFAULT_LANG;

    // Parallel fetch: ingredients, tags, hashtags, and translations
    const [ingredientsRes, tagsRes, hashtagsRes, recipeTransRes, ingTransRes] = await Promise.all([
      supabase
        .from("recipe_ingredients")
        .select("recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)")
        .in("recipe_id", recipeIds)
        .order("sort_order"),
      supabase.from("recipe_tags").select("recipe_id, tag").in("recipe_id", recipeIds),
      supabase.from("recipe_hashtags").select("recipe_id, hashtag:hashtags(name)").in("recipe_id", recipeIds),
      needsTranslation
        ? supabase.from("recipe_translations").select("recipe_id, title, slug, description").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
      needsTranslation
        ? supabase.from("ingredient_translations").select("ingredient_id, name, slug").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    // Build translation lookup maps
    const recipeTransMap: Record<string, { title: string; slug: string; description: string | null }> = {};
    (recipeTransRes.data || []).forEach((t: any) => {
      recipeTransMap[t.recipe_id] = { title: t.title, slug: t.slug, description: t.description };
    });

    const ingTransMap: Record<string, { name: string; slug: string }> = {};
    (ingTransRes.data || []).forEach((t: any) => {
      ingTransMap[t.ingredient_id] = { name: t.name, slug: t.slug };
    });

    // Map recipes with translated content
    return recipes.map((r) => {
      const trans = recipeTransMap[r.id];
      return {
        id: r.id,
        slug: trans?.slug || r.slug,
        title: trans?.title || r.title,
        category: r.category,
        image_url: r.image_url,
        description: trans?.description || r.description,
        prep_time: r.prep_time,
        alcohol_level: r.alcohol_level,
        badge: r.badge,
        is_published: r.is_published,
        ingredients: (ingredientsRes.data || [])
          .filter((i) => i.recipe_id === r.id)
          .map((i) => {
            const ingId = asAny(i.ingredient)?.id;
            const ingTrans = ingId ? ingTransMap[ingId] : null;
            return {
              name: ingTrans?.name || asAny(i.ingredient)?.name || "",
              slug: ingTrans?.slug || asAny(i.ingredient)?.slug || "",
              amount_value: i.amount_value,
              amount_unit: i.amount_unit,
              display_text: i.display_text,
              image_url: asAny(i.ingredient)?.image_url || null,
            };
          }),
        tags: (tagsRes.data || []).filter((t) => t.recipe_id === r.id).map((t) => t.tag),
        hashtags: (hashtagsRes.data || []).filter((h) => h.recipe_id === r.id).map((h) => asAny(h.hashtag)?.name || ""),
      };
    });
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  SINGLE RECIPE — full detail page
   * ═══════════════════════════════════════════════════════════════════ */
  async fetchRecipeBySlug(slug: string, lang: LangCode): Promise<RecipeFull | null> {
    let recipeRow: any = null;

    // Try to find recipe by translated slug first
    if (lang !== DEFAULT_LANG) {
      const { data: trans } = await supabase
        .from("recipe_translations")
        .select("recipe_id")
        .eq("slug", slug)
        .eq("language_code", lang)
        .maybeSingle();

      if (trans) {
        const { data } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", trans.recipe_id)
          .eq("is_published", true)
          .single();
        recipeRow = data;
      }
    }

    // Fallback: find by original slug
    if (!recipeRow) {
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      recipeRow = data;
    }

    if (!recipeRow) return null;

    const recipeId = recipeRow.id;
    const needsTranslation = lang !== DEFAULT_LANG;

    // Parallel fetch all related data
    const [
      ingredientsRes, stepsRes, equipmentRes,
      tagsRes, hashtagsRes, recsRes,
      recipeTransRes, stepTransRes, ingTransRes,
      eqTransRes, riTransRes,
    ] = await Promise.all([
      supabase.from("recipe_ingredients")
        .select("id, recipe_id, display_text, amount_value, amount_unit, sort_order, ingredient:ingredients(id, name, slug, image_url)")
        .eq("recipe_id", recipeId).order("sort_order"),
      supabase.from("recipe_steps")
        .select("id, instruction, step_number")
        .eq("recipe_id", recipeId).order("step_number"),
      supabase.from("recipe_equipment")
        .select("equipment:equipment(id, name, image_url, description)")
        .eq("recipe_id", recipeId),
      supabase.from("recipe_tags").select("tag").eq("recipe_id", recipeId),
      supabase.from("recipe_hashtags").select("hashtag:hashtags(name)").eq("recipe_id", recipeId),
      supabase.from("recipe_recommendations")
        .select("sort_order, recommended:recipes!recipe_recommendations_recommended_recipe_id_fkey(id, slug, title, image_url)")
        .eq("recipe_id", recipeId).order("sort_order"),
      needsTranslation
        ? supabase.from("recipe_translations").select("title, slug, description").eq("recipe_id", recipeId).eq("language_code", lang).maybeSingle()
        : Promise.resolve({ data: null }),
      needsTranslation
        ? supabase.from("recipe_step_translations").select("recipe_step_id, instruction").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
      needsTranslation
        ? supabase.from("ingredient_translations").select("ingredient_id, name, slug").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
      needsTranslation
        ? supabase.from("equipment_translations").select("equipment_id, name, description").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
      needsTranslation
        ? supabase.from("recipe_ingredient_translations").select("recipe_ingredient_id, display_text").eq("language_code", lang)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    // Build translation maps
    const trans = recipeTransRes.data as any;

    const stepTransMap: Record<string, string> = {};
    ((stepTransRes.data as any[]) || []).forEach((t: any) => {
      stepTransMap[t.recipe_step_id] = t.instruction;
    });

    const ingTransMap: Record<string, { name: string; slug: string }> = {};
    ((ingTransRes.data as any[]) || []).forEach((t: any) => {
      ingTransMap[t.ingredient_id] = { name: t.name, slug: t.slug };
    });

    // Translate recommended recipe titles
    const recTransMap: Record<string, { title: string; slug: string }> = {};
    if (needsTranslation && recsRes.data?.length) {
      const recIds = recsRes.data.map((r: any) => asAny(r.recommended)?.id).filter(Boolean);
      if (recIds.length) {
        const { data: recTrans } = await supabase
          .from("recipe_translations")
          .select("recipe_id, title, slug")
          .eq("language_code", lang)
          .in("recipe_id", recIds);
        (recTrans || []).forEach((t: any) => {
          recTransMap[t.recipe_id] = { title: t.title, slug: t.slug };
        });
      }
    }

    return {
      id: recipeRow.id,
      slug: trans?.slug || recipeRow.slug,
      title: trans?.title || recipeRow.title,
      category: recipeRow.category,
      image_url: recipeRow.image_url,
      description: trans?.description || recipeRow.description,
      prep_time: recipeRow.prep_time,
      alcohol_level: recipeRow.alcohol_level,
      badge: recipeRow.badge,
      is_published: recipeRow.is_published,
      ingredients: (ingredientsRes.data || []).map((i: any) => {
        const ingId = asAny(i.ingredient)?.id;
        const it = ingId ? ingTransMap[ingId] : null;
        return {
          name: it?.name || asAny(i.ingredient)?.name || "",
          slug: it?.slug || asAny(i.ingredient)?.slug || "",
          amount_value: i.amount_value,
          amount_unit: i.amount_unit,
          display_text: i.display_text,
          image_url: asAny(i.ingredient)?.image_url || null,
        };
      }),
      equipment: (equipmentRes.data || []).map((e: any) => ({
        name: asAny(e.equipment)?.name || "",
        image_url: asAny(e.equipment)?.image_url || null,
        description: asAny(e.equipment)?.description || null,
      })),
      instructions: (stepsRes.data || []).map((s: any) => stepTransMap[s.id] || s.instruction),
      tags: (tagsRes.data || []).filter((t: any) => t).map((t: any) => t.tag),
      hashtags: (hashtagsRes.data || []).map((h: any) => asAny(h.hashtag)?.name || ""),
      recommendations: (recsRes.data || []).map((rec: any) => {
        const recId = asAny(rec.recommended)?.id || "";
        const rt = recTransMap[recId];
        return {
          id: recId,
          slug: rt?.slug || asAny(rec.recommended)?.slug || "",
          title: rt?.title || asAny(rec.recommended)?.title || "",
          image_url: asAny(rec.recommended)?.image_url || null,
        };
      }),
    };
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  INGREDIENTS
   * ═══════════════════════════════════════════════════════════════════ */
  async fetchIngredients(lang: LangCode): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, slug, name, description, image_url, type")
      .order("name");

    if (error) throw error;
    const ingredients = data || [];

    // No translation needed for default language
    if (lang === DEFAULT_LANG) return ingredients;

    const { data: translations } = await supabase
      .from("ingredient_translations")
      .select("ingredient_id, name, slug, description")
      .eq("language_code", lang);

    const transMap: Record<string, { name: string; slug: string; description: string | null }> = {};
    (translations || []).forEach((t) => {
      transMap[t.ingredient_id] = { name: t.name, slug: t.slug, description: t.description };
    });

    return ingredients.map((ing) => {
      const trans = transMap[ing.id];
      return {
        ...ing,
        name: trans?.name || ing.name,
        slug: trans?.slug || ing.slug,
        description: trans?.description || ing.description,
      };
    });
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  LANGUAGES
   * ═══════════════════════════════════════════════════════════════════ */
  async fetchLanguages(): Promise<Language[]> {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data || []) as Language[];
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  UI TRANSLATIONS
   * ═══════════════════════════════════════════════════════════════════ */
  async fetchUITranslations(lang: LangCode): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from("ui_translations")
      .select("key, value")
      .eq("language_code", lang);
    if (error) throw error;

    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      map[row.key] = row.value;
    });
    return map;
  },

  /* ═══════════════════════════════════════════════════════════════════
   *  SMART SEARCH — cross-language full-text search
   * ═══════════════════════════════════════════════════════════════════ */
  async smartSearch(query: string, lang: LangCode): Promise<SearchResult> {
    if (!query.trim()) return { recipes: [], ingredients: [] };

    const q = query.toLowerCase().trim();

    // Fetch all searchable data in parallel
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

    // Group translations by parent ID
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

    // Build ingredient name index (all languages) for matching
    const ingredientAllNames: Record<string, string[]> = {};
    ingredients.forEach((ing: any) => {
      ingredientAllNames[ing.id] = [ing.name.toLowerCase()];
    });
    ingTrans.forEach((t: any) => {
      if (!ingredientAllNames[t.ingredient_id]) ingredientAllNames[t.ingredient_id] = [];
      ingredientAllNames[t.ingredient_id].push(t.name.toLowerCase());
    });

    // Current language translations for display
    const ingCurrentTrans: Record<string, { name: string; slug: string }> = {};
    if (lang !== DEFAULT_LANG) {
      ingTrans
        .filter((t: any) => t.language_code === lang)
        .forEach((t: any) => {
          ingCurrentTrans[t.ingredient_id] = { name: t.name, slug: t.slug };
        });
    }

    // ── Match recipes ──────────────────────────────────────────────
    const matchedRecipes: RecipeLight[] = [];

    for (const r of recipes) {
      let matched = false;

      // Match against original title/description
      if (r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)) {
        matched = true;
      }

      // Match against all translated titles/descriptions
      if (!matched) {
        const trans = recipeTransByRecipe[r.id] || [];
        for (const t of trans) {
          if (t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)) {
            matched = true;
            break;
          }
        }
      }

      // Match against ingredient names (all languages)
      if (!matched) {
        const rIngs = recipeIngs.filter((ri: any) => ri.recipe_id === r.id);
        for (const ri of rIngs) {
          const ingId = asAny(ri.ingredient)?.id;
          const names = ingredientAllNames[ingId] || [];
          if (names.some((n) => n.includes(q))) {
            matched = true;
            break;
          }
        }
      }

      // Match against tags
      if (!matched) {
        const rTags = tags.filter((t: any) => t.recipe_id === r.id);
        if (rTags.some((t: any) => t.tag.toLowerCase().includes(q))) matched = true;
      }

      // Match against hashtags
      if (!matched) {
        const rHash = hashtags.filter((h: any) => h.recipe_id === r.id);
        if (rHash.some((h: any) => (asAny(h.hashtag)?.name || "").toLowerCase().includes(q))) matched = true;
      }

      // Match against category name
      if (!matched && r.category.toLowerCase().includes(q)) matched = true;

      // Build result with current language translations
      if (matched) {
        const currentTrans = lang !== DEFAULT_LANG
          ? (recipeTransByRecipe[r.id] || []).find((t: any) => t.language_code === lang)
          : null;

        const recipeIngredients: RecipeIngredient[] = recipeIngs
          .filter((ri: any) => ri.recipe_id === r.id)
          .map((i: any) => {
            const ingId = asAny(i.ingredient)?.id;
            const it = ingId ? ingCurrentTrans[ingId] : null;
            return {
              name: it?.name || asAny(i.ingredient)?.name || "",
              slug: it?.slug || asAny(i.ingredient)?.slug || "",
              amount_value: i.amount_value,
              amount_unit: i.amount_unit,
              display_text: i.display_text,
              image_url: asAny(i.ingredient)?.image_url || null,
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
          hashtags: hashtags.filter((h: any) => h.recipe_id === r.id).map((h: any) => asAny(h.hashtag)?.name || ""),
        });
      }
    }

    // ── Match ingredients ──────────────────────────────────────────
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
  },
};
