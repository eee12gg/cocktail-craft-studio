import { useRecipes, type DBRecipeLight } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import RecipeCard from "@/components/RecipeCard";
import SeoHead from "@/components/SeoHead";
import { useEffect, useRef, useState, useMemo } from "react";

const PAGE_SIZE = 12;

export default function Index() {
  const { data: recipes, isLoading } = useRecipes();
  const { t, lang } = useLanguage();

  /* ── Shuffle once per mount so the feed feels fresh ── */
  const shuffled = useMemo(() => {
    if (!recipes?.length) return [];
    const arr = [...recipes];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [recipes]);

  /* ── Infinite scroll state ── */
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, shuffled.length));
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shuffled.length]);

  const hasMore = visible < shuffled.length;

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
      <section className="container mx-auto px-4 pt-24 pb-10 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          {t("home.h1", "Discover Perfect Cocktail Recipes")}
        </h1>
        <p className="mt-3 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("home.subtitle", "From timeless classics to bold new creations — find your next favorite drink.")}
        </p>
      </section>

      {/* Infinite drink feed */}
      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <p className="font-body text-muted-foreground">{t("common.loading", "Loading recipes...")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {shuffled.slice(0, visible).map((recipe, i) => (
              <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="h-1" />

            {hasMore && (
              <p className="text-center font-body text-sm text-muted-foreground py-4">
                {t("common.loading", "Loading recipes...")}
              </p>
            )}

            {!hasMore && shuffled.length > 0 && (
              <p className="text-center font-body text-sm text-muted-foreground py-4">
                {t("common.no_more", "No more recipes")}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
