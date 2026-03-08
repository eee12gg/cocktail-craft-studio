import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import SeoHead from "@/components/SeoHead";

const NotFound = () => {
  const location = useLocation();
  const { t, localePath } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center pt-16">
      <SeoHead
        path={location.pathname}
        title={`404 — ${t("notfound.title", "Page not found")} | Cocktail Craft`}
        description={t("notfound.desc", "The page you're looking for doesn't exist.")}
        noindex
      />
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-gradient-gold mb-4">404</h1>
        <p className="font-body text-xl text-muted-foreground mb-6">{t("notfound.title", "Page not found")}</p>
        <Link
          to={localePath("/")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
        >
          <ArrowLeft className="h-4 w-4" /> {t("notfound.back", "Back to Home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
