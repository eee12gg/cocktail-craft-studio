/**
 * Smart search hook with debouncing.
 *
 * Searches across all languages (recipe titles, ingredients, tags, hashtags)
 * and returns results in the current language.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

// Re-export types for backward compatibility
export type { SearchIngredientResult } from "@/api/types";

/** Debounce delay in ms before triggering search */
const DEBOUNCE_MS = 250;

export function useSmartSearch(query: string) {
  const { lang } = useLanguage();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
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
