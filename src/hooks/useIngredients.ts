import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBIngredient {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  type: string;
}

async function fetchIngredients(): Promise<DBIngredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, slug, name, description, image_url, type")
    .order("name");

  if (error) throw error;
  return data || [];
}

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIngredientBySlug(slug: string) {
  const { data: ingredients, ...rest } = useIngredients();
  const ingredient = ingredients?.find((i) => i.slug === slug);
  return { data: ingredient, ...rest };
}
