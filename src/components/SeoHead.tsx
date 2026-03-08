import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, SUPPORTED_LANGS, DEFAULT_LANG, type LangCode } from "@/hooks/useLanguage";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://cocktailcraft.com";

/** Map language codes to full locale for og:locale */
const LANG_LOCALE_MAP: Record<string, { hreflang: string; ogLocale: string }> = {
  en: { hreflang: "en", ogLocale: "en_US" },
  de: { hreflang: "de", ogLocale: "de_DE" },
  fr: { hreflang: "fr", ogLocale: "fr_FR" },
  pl: { hreflang: "pl", ogLocale: "pl_PL" },
  uk: { hreflang: "uk", ogLocale: "uk_UA" },
  es: { hreflang: "es", ogLocale: "es_ES" },
  it: { hreflang: "it", ogLocale: "it_IT" },
  pt: { hreflang: "pt", ogLocale: "pt_BR" },
  ru: { hreflang: "ru", ogLocale: "ru_RU" },
  cs: { hreflang: "cs", ogLocale: "cs_CZ" },
  nl: { hreflang: "nl", ogLocale: "nl_NL" },
  sv: { hreflang: "sv", ogLocale: "sv_SE" },
  sk: { hreflang: "sk", ogLocale: "sk_SK" },
  lv: { hreflang: "lv", ogLocale: "lv_LV" },
  ro: { hreflang: "ro", ogLocale: "ro_RO" },
  ka: { hreflang: "ka", ogLocale: "ka_GE" },
  bg: { hreflang: "bg", ogLocale: "bg_BG" },
  el: { hreflang: "el", ogLocale: "el_GR" },
};

interface CountryTarget {
  country_code: string;
  language_code: string;
}

interface SeoHeadProps {
  path: string;
  title: string;
  description?: string;
  availableLangs?: LangCode[];
}

export default function SeoHead({ path, title, description, availableLangs }: SeoHeadProps) {
  const { lang, languages } = useLanguage();

  // Fetch country-language targets for regional hreflang
  const { data: countryTargets = [] } = useQuery({
    queryKey: ["country-language-targets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("country_language_targets")
        .select("country_code, language_code");
      return (data || []) as CountryTarget[];
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const managedElements: HTMLElement[] = [];

    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
      managedElements.push(metaDesc);
    }
    metaDesc.content = (description || title).slice(0, 160);

    // OG tags
    const currentLocale = LANG_LOCALE_MAP[lang]?.ogLocale || "en_US";
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", (description || title).slice(0, 160));
    setMetaProperty("og:url", buildUrl(lang, path));
    setMetaProperty("og:locale", currentLocale);
    setMetaProperty("og:type", "website");
    setMetaProperty("og:site_name", "Cocktail Craft");

    // OG locale alternates
    const activeLangs = availableLangs ||
      languages.filter(l => l.is_active).map(l => l.code as LangCode);

    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());

    activeLangs.forEach((code) => {
      if (code === lang) return;
      const locale = LANG_LOCALE_MAP[code]?.ogLocale;
      if (locale) {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:locale:alternate");
        meta.content = locale;
        document.head.appendChild(meta);
        managedElements.push(meta);
      }
    });

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = buildUrl(lang, path);

    // Hreflang links
    const hreflangElements: HTMLLinkElement[] = [];

    // 1. Generic language hreflang (e.g., hreflang="de")
    activeLangs.forEach((code) => {
      const hreflang = LANG_LOCALE_MAP[code]?.hreflang || code;
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = buildUrl(code as LangCode, path);
      document.head.appendChild(link);
      hreflangElements.push(link);
    });

    // 2. Country-specific hreflang (e.g., hreflang="de-AT", "es-MX")
    // These tell Google which language version to show to users in specific countries
    countryTargets.forEach((ct) => {
      if (!activeLangs.includes(ct.language_code as any)) return;
      const hreflang = `${ct.language_code}-${ct.country_code}`;
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = buildUrl(ct.language_code as LangCode, path);
      document.head.appendChild(link);
      hreflangElements.push(link);
    });

    // x-default
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = buildUrl(DEFAULT_LANG, path);
    document.head.appendChild(xDefault);
    hreflangElements.push(xDefault);

    // HTML lang attribute
    document.documentElement.lang = LANG_LOCALE_MAP[lang]?.hreflang || lang;

    return () => {
      hreflangElements.forEach((el) => el.remove());
      managedElements.forEach((el) => {
        if (el.parentNode) el.remove();
      });
    };
  }, [lang, path, title, description, languages, availableLangs, countryTargets]);

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
