import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { RecipeLight, SearchIngredientResult } from "@/api/types";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

// Re-export types for backward compatibility
export type { SearchIngredientResult } from "@/api/types";

export function useSmartSearch(query: string) {
  const { lang } = useLanguage();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["smart-search", debouncedQuery, lang],
    queryFn: () => api.smartSearch(debouncedQuery, lang),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
