import { useEffect } from "react";
import { useLanguage, SUPPORTED_LANGS, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://cocktailcraft.com";

interface SeoHeadProps {
  /** Path without language prefix, e.g. "/cocktails" or "/recipe/mojito" */
  path: string;
  title: string;
  description?: string;
  /** Override available languages (e.g. only those with translations) */
  availableLangs?: LangCode[];
}

/**
 * Manages <head> tags: canonical, hreflang, title, meta description.
 * Cleans up on unmount.
 */
export default function SeoHead({ path, title, description, availableLangs }: SeoHeadProps) {
  const { lang, languages } = useLanguage();

  useEffect(() => {
    // Set document title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || title;

    // OG tags
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description || title);
    setMetaProperty("og:url", buildUrl(lang, path));

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = buildUrl(lang, path);

    // Hreflang links
    const activeLangs = availableLangs || 
      languages.filter(l => l.is_active).map(l => l.code as LangCode);
    
    const hreflangElements: HTMLLinkElement[] = [];

    // Add hreflang for each active language
    activeLangs.forEach((code) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = code;
      link.href = buildUrl(code as LangCode, path);
      document.head.appendChild(link);
      hreflangElements.push(link);
    });

    // x-default points to default language
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = buildUrl(DEFAULT_LANG, path);
    document.head.appendChild(xDefault);
    hreflangElements.push(xDefault);

    // Set html lang attribute
    document.documentElement.lang = lang;

    return () => {
      hreflangElements.forEach((el) => el.remove());
    };
  }, [lang, path, title, description, languages, availableLangs]);

  return null;
}

function buildUrl(lang: LangCode, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LANG ? `${SITE_URL}${p}` : `${SITE_URL}/${lang}${p}`;
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}
