import React, { createContext, useContext, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Language } from "@/api/types";

export const SUPPORTED_LANGS = ["en", "de", "fr", "pl", "uk", "it", "es", "pt", "cs", "nl", "el", "sv", "sk", "lv", "ro", "ka", "bg"] as const;
export type LangCode = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: LangCode = "en";

// Re-export Language type
export type { Language } from "@/api/types";

interface LanguageContextType {
  lang: LangCode;
  languages: Language[];
  isLoading: boolean;
  localePath: (path: string) => string;
  switchLang: (code: LangCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const lang: LangCode = SUPPORTED_LANGS.includes(params.lang as LangCode)
    ? (params.lang as LangCode)
    : DEFAULT_LANG;

  const { data: languages = [], isLoading: langsLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => api.fetchLanguages(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: uiStrings = {} } = useQuery({
    queryKey: ["ui_translations", lang],
    queryFn: () => api.fetchUITranslations(lang),
    staleTime: 10 * 60 * 1000,
  });

  const localePath = useMemo(() => {
    return (path: string) => {
      const p = path.startsWith("/") ? path : `/${path}`;
      return lang === DEFAULT_LANG ? p : `/${lang}${p}`;
    };
  }, [lang]);

  const switchLang = (newLang: LangCode) => {
    const currentPath = location.pathname;
    let basePath = currentPath;
    const langPrefix = `/${lang}`;
    if (lang !== DEFAULT_LANG && basePath.startsWith(langPrefix)) {
      basePath = basePath.slice(langPrefix.length) || "/";
    }
    const newPath = newLang === DEFAULT_LANG ? basePath : `/${newLang}${basePath}`;
    navigate(newPath + location.search);
  };

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

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
