import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navItems = [
  { label: "Cocktails", path: "/cocktails" },
  { label: "Shots", path: "/shots" },
  { label: "Non-Alcoholic", path: "/non-alcoholic" },
  { label: "Ingredients", path: "/ingredients" },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { localePath, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={localePath("/")} className="font-display text-xl font-bold tracking-wide text-gradient-gold">
          COCKTAIL CRAFT
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={localePath(item.path)}
              className={`font-body text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname.endsWith(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {t(`nav.${item.label.toLowerCase().replace(/[^a-z]/g, '_')}`, item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to={localePath("/search")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={localePath(item.path)}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 font-body text-sm font-medium tracking-wide uppercase transition-colors ${
                  location.pathname.endsWith(item.path)
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t(`nav.${item.label.toLowerCase().replace(/[^a-z]/g, '_')}`, item.label)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
