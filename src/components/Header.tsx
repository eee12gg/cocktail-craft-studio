import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Shuffle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useRecipes } from "@/hooks/useRecipes";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

interface NavItem {
  label: string;
  path: string;
  key: string;
  children?: { label: string; path: string; key: string }[];
  desktopHidden?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Cocktails", path: "/cocktails", key: "cocktails" },
  { label: "Non-Alcoholic", path: "/non-alcoholic", key: "non_alcoholic" },
  { label: "Classic", path: "/cocktails/classic", key: "classic" },
  { label: "My Bar", path: "/ingredients", key: "my_bar" },
  { label: "Roulette", path: "/roulette", key: "roulette" },
  { label: "Contact", path: "/contacts", key: "contact", desktopHidden: true },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { localePath, t } = useLanguage();
  const { data: recipes } = useRecipes();
  const isOnSearch = location.pathname.endsWith("/search");

  const handleRoulette = (e: React.MouseEvent) => {
    e.preventDefault();
    if (recipes && recipes.length > 0) {
      const random = recipes[Math.floor(Math.random() * recipes.length)];
      navigate(localePath(`/recipe/${random.slug}`));
    }
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    const lp = localePath(path);
    return location.pathname === lp || location.pathname.endsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to={localePath("/")}
          className="font-display text-xl font-bold tracking-wide text-gradient-gold"
        >
          COCKTAIL CRAFT
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => {
            if (item.key === "roulette") {
              return (
                <button
                  key={item.key}
                  onClick={handleRoulette}
                  className="flex items-center gap-1 font-body text-sm font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-primary"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  {t(`nav.${item.key}`, item.label)}
                </button>
              );
            }

            if (item.children) {
              return (
                <div key={item.key} className="group relative">
                  <Link
                    to={localePath(item.path)}
                    className={`flex items-center gap-1 font-body text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                      isActive(item.path) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t(`nav.${item.key}`, item.label)}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="rounded-lg border border-border/50 bg-popover py-1.5 shadow-lg min-w-[160px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.key}
                          to={localePath(child.path)}
                          className={`block px-4 py-2 font-body text-sm transition-colors hover:bg-secondary ${
                            isActive(child.path)
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          {t(`nav.${child.key}`, child.label)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                to={localePath(item.path)}
                className={`font-body text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t(`nav.${item.key}`, item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => (isOnSearch ? navigate(-1) : navigate(localePath("/search")))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
            aria-label="Search"
          >
            {isOnSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              if (item.key === "roulette") {
                return (
                  <button
                    key={item.key}
                    onClick={handleRoulette}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 font-body text-sm font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Shuffle className="h-4 w-4" />
                    {t(`nav.${item.key}`, item.label)}
                  </button>
                );
              }

              return (
                <div key={item.key}>
                  <Link
                    to={localePath(item.path)}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-4 py-3 font-body text-sm font-medium tracking-wide uppercase transition-colors ${
                      isActive(item.path)
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t(`nav.${item.key}`, item.label)}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.key}
                      to={localePath(child.path)}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-lg pl-8 pr-4 py-2 font-body text-xs tracking-wide uppercase transition-colors ${
                        isActive(child.path)
                          ? "text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      ↳ {t(`nav.${child.key}`, child.label)}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
