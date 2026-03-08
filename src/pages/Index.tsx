import { Link } from "react-router-dom";
import { useRecipes, type DBRecipeLight } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import RecipeCard from "@/components/RecipeCard";
import SeoHead from "@/components/SeoHead";
import { ArrowRight, Wine, Zap, Leaf } from "lucide-react";

export default function Index() {
  const { data: recipes, isLoading } = useRecipes();
  const { localePath, t, lang } = useLanguage();
  const featured = (recipes || []).filter((r) => r.badge).slice(0, 6);

  const categories = [
    { label: t("nav.cocktails", "Cocktails"), path: "/cocktails", icon: Wine, description: t("cat.cocktails_desc", "Classic & modern cocktails") },
    { label: t("nav.shots", "Shots"), path: "/shots", icon: Zap, description: t("cat.shots_desc", "Quick & bold shooters") },
    { label: t("nav.non_alcoholic", "Non-Alcoholic"), path: "/non-alcoholic", icon: Leaf, description: t("cat.non_alcoholic_desc", "Refreshing mocktails") },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cocktail Craft",
    url: "https://cocktailcraft.com",
    description: t("seo.home_desc", "Explore expertly curated cocktail recipes — from timeless classics to bold new creations."),
    inLanguage: lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://cocktailcraft.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen">
      <SeoHead
        path="/"
        title={t("seo.home_title", "Cocktail Craft — Discover Perfect Cocktail Recipes")}
        description={t("seo.home_desc", "Explore expertly curated cocktail recipes — from timeless classics to bold new creations. Cocktails, shots, and non-alcoholic mocktails.")}
        jsonLd={jsonLd}
      />

      {/* Hero / H1 */}
      <section className="container mx-auto px-4 pt-24 pb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          {t("home.h1", "Discover Perfect Cocktail Recipes")}
        </h1>
        <p className="mt-3 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("home.subtitle", "From timeless classics to bold new creations — find your next favorite drink.")}
        </p>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <Link key={cat.path} to={localePath(cat.path)} className="group flex items-center gap-4 rounded-xl border border-border/50 bg-gradient-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-glow animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <cat.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{cat.label}</h2>
                <p className="font-body text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.featured", "Featured Recipes")}</h2>
            <p className="mt-1 font-body text-muted-foreground">{t("home.featured_sub", "Our most popular picks")}</p>
          </div>
          <Link to={localePath("/cocktails")} className="hidden items-center gap-1 font-body text-sm font-medium text-primary hover:underline sm:flex">
            {t("home.view_all", "View all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <p className="font-body text-muted-foreground">{t("common.loading", "Loading recipes...")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {featured.map((recipe, i) => (
              <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
