import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { localePath, t } = useLanguage();

  return (
    <footer className="relative mt-20 border-t border-border/50 bg-gradient-card">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <Link to={localePath("/")} className="font-display text-2xl font-bold tracking-wide text-gradient-gold">
            COCKTAIL CRAFT
          </Link>

          <nav className="flex flex-wrap justify-center gap-6">
            <Link to={localePath("/cocktails")} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("nav.cocktails", "Cocktails")}
            </Link>
            <Link to={localePath("/shots")} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("nav.shots", "Shots")}
            </Link>
            <Link to={localePath("/non-alcoholic")} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("nav.non_alcoholic", "Non-Alcoholic")}
            </Link>
            <Link to={localePath("/search")} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("nav.search", "Search")}
            </Link>
          </nav>

          <div className="text-center md:text-right">
            <p className="font-body text-sm text-muted-foreground">
              {t("footer.contact", "Contact us at")}{" "}
              <a href="mailto:hello@cocktailcraft.com" className="text-primary hover:underline">
                hello@cocktailcraft.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-border/30 pt-6">
          <span className="font-body text-xs text-muted-foreground">
            © {currentYear} Cocktail Craft. {t("footer.rights", "All rights reserved.")}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
    </footer>
  );
}
