import { useLanguage, type LangCode } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const { lang, languages, switchLang } = useLanguage();

  const currentLang = languages.find((l) => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-muted-foreground transition-colors hover:text-primary focus:outline-none">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-body font-medium uppercase">{lang}</span>
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
