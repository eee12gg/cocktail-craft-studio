import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://cocktailcraft.com"; // TODO: replace with actual domain
const DEFAULT_LANG = "en";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch active languages
  const { data: languages } = await supabase
    .from("languages")
    .select("code")
    .eq("is_active", true)
    .order("sort_order");

  const langCodes = (languages || []).map((l: any) => l.code as string);

  // Fetch published recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select("slug, updated_at")
    .eq("is_published", true);

  // Fetch recipe translations
  const { data: recipeTranslations } = await supabase
    .from("recipe_translations")
    .select("recipe_id, language_code, slug");

  // Build recipe slug map by language
  const recipeTransMap: Record<string, Record<string, string>> = {};
  (recipeTranslations || []).forEach((t: any) => {
    if (!recipeTransMap[t.recipe_id]) recipeTransMap[t.recipe_id] = {};
    recipeTransMap[t.recipe_id][t.language_code] = t.slug;
  });

  // Fetch ingredients
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, slug, updated_at");

  const { data: ingredientTranslations } = await supabase
    .from("ingredient_translations")
    .select("ingredient_id, language_code, slug");

  const ingTransMap: Record<string, Record<string, string>> = {};
  (ingredientTranslations || []).forEach((t: any) => {
    if (!ingTransMap[t.ingredient_id]) ingTransMap[t.ingredient_id] = {};
    ingTransMap[t.ingredient_id][t.language_code] = t.slug;
  });

  // Static pages
  const staticPages = ["/", "/cocktails", "/shots", "/non-alcoholic", "/search"];

  let urls = "";

  // Static pages
  for (const page of staticPages) {
    urls += buildUrlEntry(page, langCodes, new Date().toISOString());
  }

  // Recipe pages
  for (const recipe of recipes || []) {
    const transMap = recipeTransMap[recipe.slug] || {};
    // For recipes, each language may have its own slug
    const langSlugs: Record<string, string> = { [DEFAULT_LANG]: recipe.slug };
    // Actually recipe_translations references recipe_id not slug
    // We need to match by looking up the recipe id
    // Let me use a simpler approach - all langs use the same base slug for hreflang
    urls += buildUrlEntry(`/recipe/${recipe.slug}`, langCodes, recipe.updated_at);
  }

  // Actually we need recipe IDs to match translations
  const { data: recipesWithId } = await supabase
    .from("recipes")
    .select("id, slug, updated_at")
    .eq("is_published", true);

  // Rebuild recipe URLs with proper translated slugs
  urls = "";

  for (const page of staticPages) {
    urls += buildUrlEntry(page, langCodes, new Date().toISOString());
  }

  for (const recipe of recipesWithId || []) {
    const transMap = recipeTransMap[recipe.id] || {};
    const langSlugMap: Record<string, string> = {};
    langSlugMap[DEFAULT_LANG] = `/recipe/${recipe.slug}`;
    for (const code of langCodes) {
      if (code === DEFAULT_LANG) continue;
      const tSlug = transMap[code] || recipe.slug;
      langSlugMap[code] = `/recipe/${tSlug}`;
    }
    urls += buildUrlEntryWithSlugs(langSlugMap, langCodes, recipe.updated_at);
  }

  // Ingredient pages
  for (const ing of ingredients || []) {
    const transMap = ingTransMap[ing.id] || {};
    const langSlugMap: Record<string, string> = {};
    langSlugMap[DEFAULT_LANG] = `/ingredient/${ing.slug}`;
    for (const code of langCodes) {
      if (code === DEFAULT_LANG) continue;
      const tSlug = transMap[code] || ing.slug;
      langSlugMap[code] = `/ingredient/${tSlug}`;
    }
    urls += buildUrlEntryWithSlugs(langSlugMap, langCodes, ing.updated_at);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`;

  return new Response(sitemap, { headers: corsHeaders });
});

function buildUrl(lang: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LANG ? `${SITE_URL}${p}` : `${SITE_URL}/${lang}${p}`;
}

function buildUrlEntry(path: string, langCodes: string[], lastmod: string): string {
  let entry = `  <url>\n    <loc>${buildUrl(DEFAULT_LANG, path)}</loc>\n`;
  entry += `    <lastmod>${lastmod.split("T")[0]}</lastmod>\n`;
  // hreflang alternates
  for (const code of langCodes) {
    entry += `    <xhtml:link rel="alternate" hreflang="${code}" href="${buildUrl(code, path)}" />\n`;
  }
  entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(DEFAULT_LANG, path)}" />\n`;
  entry += `  </url>\n`;
  return entry;
}

function buildUrlEntryWithSlugs(langSlugMap: Record<string, string>, langCodes: string[], lastmod: string): string {
  const defaultPath = langSlugMap[DEFAULT_LANG];
  let entry = `  <url>\n    <loc>${buildUrl(DEFAULT_LANG, defaultPath)}</loc>\n`;
  entry += `    <lastmod>${lastmod.split("T")[0]}</lastmod>\n`;
  for (const code of langCodes) {
    const path = langSlugMap[code] || defaultPath;
    entry += `    <xhtml:link rel="alternate" hreflang="${code}" href="${buildUrl(code, path)}" />\n`;
  }
  entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(DEFAULT_LANG, defaultPath)}" />\n`;
  entry += `  </url>\n`;
  return entry;
}
