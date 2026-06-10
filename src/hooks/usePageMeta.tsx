/**
 * Page-level meta context.
 *
 * Allows a page (e.g. RecipePage) to publish the list of languages
 * in which the current content is visible. The global LanguageSwitcher
 * subscribes and filters hidden languages out of the dropdown.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface PageMeta {
  /** Active visible languages for the current page (undefined = no restriction). */
  visibleLangs?: string[];
  setVisibleLangs: (langs: string[] | undefined) => void;
}

const PageMetaContext = createContext<PageMeta | null>(null);

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [visibleLangs, setVisibleLangs] = useState<string[] | undefined>(undefined);
  return (
    <PageMetaContext.Provider value={{ visibleLangs, setVisibleLangs }}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta() {
  const ctx = useContext(PageMetaContext);
  if (!ctx) {
    // Tolerate consumers outside the provider with no-op fallback.
    return { visibleLangs: undefined, setVisibleLangs: (() => {}) as PageMeta["setVisibleLangs"] };
  }
  return ctx;
}

/** Helper for pages to declare their visible languages for the duration of mount. */
export function useDeclareVisibleLangs(langs: string[] | undefined) {
  const { setVisibleLangs } = usePageMeta();
  const stable = JSON.stringify(langs ?? null);
  const apply = useCallback(() => setVisibleLangs(langs), [stable, setVisibleLangs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    apply();
    return () => setVisibleLangs(undefined);
  }, [apply, setVisibleLangs]);
}
