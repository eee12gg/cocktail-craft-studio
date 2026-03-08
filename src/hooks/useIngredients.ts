import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";

export interface DBIngredient {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  type: string;
}

async function fetchIngredients(lang: LangCode): Promise<DBIngredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, slug, name, description, image_url, type")
    .order("name");

  if (error) throw error;
  const ingredients = data || [];

  if (lang === DEFAULT_LANG) return ingredients;

  // Fetch translations
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
}

export function useIngredients() {
  const { lang } = useLanguage();
  return useQuery({
    queryKey: ["ingredients", lang],
    queryFn: () => fetchIngredients(lang),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIngredientBySlug(slug: string) {
  const { data: ingredients, ...rest } = useIngredients();
  const ingredient = ingredients?.find((i) => i.slug === slug);
  return { data: ingredient, ...rest };
}
