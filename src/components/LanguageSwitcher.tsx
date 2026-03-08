/**
 * Language switcher dropdown.
 *
 * Displays a two-letter country/language code (e.g. EN, UA, DE)
 * and a dropdown with all active languages.
 */

import { useLanguage, type LangCode } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Display codes for the language switcher button.
 * Maps internal language codes to user-facing country-style codes.
 * Fallback: code.toUpperCase() (e.g. "sv" → "SV")
 */
const DISPLAY_CODE: Record<string, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  pl: "PL",
  uk: "UA",  // Ukrainian → UA (country code)
  it: "IT",
  es: "ES",
  pt: "PT",
  cs: "CZ",  // Czech → CZ (country code)
  nl: "NL",
  el: "GR",  // Greek → GR (country code)
  sv: "SE",  // Swedish → SE (country code)
  sk: "SK",
  lv: "LV",
  ro: "RO",
  ka: "GE",  // Georgian → GE (country code)
  bg: "BG",
  ru: "RU",
};

export default function LanguageSwitcher() {
  const { lang, languages, switchLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-muted-foreground transition-colors hover:text-primary focus:outline-none">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-body font-medium">
          {DISPLAY_CODE[lang] || lang.toUpperCase()}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLang(l.code as LangCode)}
            className={`flex items-center gap-2 font-body text-sm cursor-pointer ${
              l.code === lang ? "text-primary font-semibold" : ""
            }`}
          >
            <span className="text-base">{l.flag_emoji}</span>
            <span>{l.native_name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
