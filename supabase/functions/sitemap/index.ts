import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const DEFAULT_LANG = "en";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const origin = req.headers.get("origin") || req.headers.get("referer");
  const SITE_URL = origin ? new URL(origin).origin : (Deno.env.get("SITE_URL") || "https://cocktailcraft.com");

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

  // Fetch country-language targets for regional hreflang
  const { data: countryTargets } = await supabase
    .from("country_language_targets")
    .select("country_code, language_code");

  const targets = (countryTargets || []) as { country_code: string; language_code: string }[];

  // Fetch published recipes
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, slug, updated_at")
    .eq("is_published", true);

  const { data: recipeTranslations } = await supabase
    .from("recipe_translations")
    .select("recipe_id, language_code, slug");

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
  const staticPages = ["/", "/cocktails", "/shots", "/non-alcoholic", "/ingredients", "/search"];

  let urls = "";

  for (const page of staticPages) {
    urls += buildUrlEntry(page, langCodes, targets, new Date().toISOString(), SITE_URL);
  }

  for (const recipe of recipes || []) {
    const transMap = recipeTransMap[recipe.id] || {};
    const langSlugMap: Record<string, string> = {};
    langSlugMap[DEFAULT_LANG] = `/recipe/${recipe.slug}`;
    for (const code of langCodes) {
      if (code === DEFAULT_LANG) continue;
      langSlugMap[code] = `/recipe/${transMap[code] || recipe.slug}`;
    }
    urls += buildUrlEntryWithSlugs(langSlugMap, langCodes, targets, recipe.updated_at, SITE_URL);
  }

  for (const ing of ingredients || []) {
    const transMap = ingTransMap[ing.id] || {};
    const langSlugMap: Record<string, string> = {};
    langSlugMap[DEFAULT_LANG] = `/ingredient/${ing.slug}`;
    for (const code of langCodes) {
      if (code === DEFAULT_LANG) continue;
      langSlugMap[code] = `/ingredient/${transMap[code] || ing.slug}`;
    }
    urls += buildUrlEntryWithSlugs(langSlugMap, langCodes, targets, ing.updated_at, SITE_URL);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`;

  return new Response(sitemap, { headers: corsHeaders });
});

function buildUrl(lang: string, path: string, siteUrl: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LANG ? `${siteUrl}${p}` : `${siteUrl}/${lang}${p}`;
}

function buildUrlEntry(
  path: string,
  langCodes: string[],
  targets: { country_code: string; language_code: string }[],
  lastmod: string,
  siteUrl: string,
): string {
  let entry = `  <url>\n    <loc>${buildUrl(DEFAULT_LANG, path, siteUrl)}</loc>\n`;
  entry += `    <lastmod>${lastmod.split("T")[0]}</lastmod>\n`;

  // Generic language hreflang
  for (const code of langCodes) {
    entry += `    <xhtml:link rel="alternate" hreflang="${code}" href="${buildUrl(code, path, siteUrl)}" />\n`;
  }

  // Country-specific hreflang (e.g., de-AT, es-MX)
  for (const ct of targets) {
    if (!langCodes.includes(ct.language_code)) continue;
    entry += `    <xhtml:link rel="alternate" hreflang="${ct.language_code}-${ct.country_code}" href="${buildUrl(ct.language_code, path, siteUrl)}" />\n`;
  }

  entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(DEFAULT_LANG, path, siteUrl)}" />\n`;
  entry += `  </url>\n`;
  return entry;
}

function buildUrlEntryWithSlugs(
  langSlugMap: Record<string, string>,
  langCodes: string[],
  targets: { country_code: string; language_code: string }[],
  lastmod: string,
  siteUrl: string,
): string {
  const defaultPath = langSlugMap[DEFAULT_LANG];
  let entry = `  <url>\n    <loc>${buildUrl(DEFAULT_LANG, defaultPath, siteUrl)}</loc>\n`;
  entry += `    <lastmod>${lastmod.split("T")[0]}</lastmod>\n`;

  // Generic language hreflang
  for (const code of langCodes) {
    const path = langSlugMap[code] || defaultPath;
    entry += `    <xhtml:link rel="alternate" hreflang="${code}" href="${buildUrl(code, path, siteUrl)}" />\n`;
  }

  // Country-specific hreflang
  for (const ct of targets) {
    if (!langCodes.includes(ct.language_code)) continue;
    const path = langSlugMap[ct.language_code] || defaultPath;
    entry += `    <xhtml:link rel="alternate" hreflang="${ct.language_code}-${ct.country_code}" href="${buildUrl(ct.language_code, path, siteUrl)}" />\n`;
  }

  entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(DEFAULT_LANG, defaultPath, siteUrl)}" />\n`;
  entry += `  </url>\n`;
  return entry;
}
