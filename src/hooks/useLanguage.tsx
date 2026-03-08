/**
 * Language / i18n provider and hook.
 *
 * Reads the `:lang` URL parameter and provides:
 * - `lang` — current ISO language code
 * - `localePath(path)` — prefixes path with language code
 * - `switchLang(code)` — navigates to the same page in another language
 * - `t(key, fallback)` — returns translated UI string from the database
 */

import React, { createContext, useContext, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Language } from "@/api/types";

/* ─── Supported languages ──────────────────────────────────────────── */
export const SUPPORTED_LANGS = [
  "en", "de", "fr", "pl", "uk",
  "it", "es", "pt", "cs", "nl",
  "el", "sv", "sk", "lv", "ro",
  "ka", "bg",
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: LangCode = "en";

// Re-export for convenience
export type { Language } from "@/api/types";

/* ─── Context type ─────────────────────────────────────────────────── */
interface LanguageContextType {
  /** Current language code (e.g. "en", "uk", "de") */
  lang: LangCode;
  /** List of active languages from the database */
  languages: Language[];
  /** Whether language list is still loading */
  isLoading: boolean;
  /** Build a locale-aware path: localePath("/cocktails") → "/de/cocktails" */
  localePath: (path: string) => string;
  /** Navigate to the same page in a different language */
  switchLang: (code: LangCode) => void;
  /** Translate a UI key, falling back to the provided default */
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

/* ─── Provider ─────────────────────────────────────────────────────── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current language from URL param, default to "en"
  const lang: LangCode = SUPPORTED_LANGS.includes(params.lang as LangCode)
    ? (params.lang as LangCode)
    : DEFAULT_LANG;

  // Fetch available languages (cached 10 min)
  const { data: languages = [], isLoading: langsLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.fetchLanguages(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch UI translation strings for current language
  const { data: uiStrings = {} } = useQuery({
    queryKey: ["ui_translations", lang],
    queryFn: () => api.fetchUITranslations(lang),
    staleTime: 10 * 60 * 1000,
  });

  // Build locale-prefixed path
  const localePath = useMemo(() => {
    return (path: string) => {
      const p = path.startsWith("/") ? path : `/${path}`;
      return lang === DEFAULT_LANG ? p : `/${lang}${p}`;
    };
  }, [lang]);

  // Switch to another language while staying on the same page
  const switchLang = (newLang: LangCode) => {
    const currentPath = location.pathname;
    let basePath = currentPath;

    // Strip current language prefix if present
    const langPrefix = `/${lang}`;
    if (lang !== DEFAULT_LANG && basePath.startsWith(langPrefix)) {
      basePath = basePath.slice(langPrefix.length) || "/";
    }

    const newPath = newLang === DEFAULT_LANG ? basePath : `/${newLang}${basePath}`;
    navigate(newPath + location.search);
  };

  // Translation lookup with fallback
  const t = (key: string, fallback?: string) => {
    return uiStrings[key] || fallback || key;
  };

  const value: LanguageContextType = {
    lang,
    languages,
    isLoading: langsLoading,
    localePath,
    switchLang,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ─── Hook ─────────────────────────────────────────────────────────── */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
