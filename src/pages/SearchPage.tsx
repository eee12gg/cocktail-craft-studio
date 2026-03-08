import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { useLanguage } from "@/hooks/useLanguage";
import SeoHead from "@/components/SeoHead";
import RecipeCard from "@/components/RecipeCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("q") || "";
  const [query, setQuery] = useState(initial);
  const { t, localePath } = useLanguage();
  const { data, isLoading } = useSmartSearch(query);

  const recipes = data?.recipes || [];
  const ingredients = data?.ingredients || [];
  const totalResults = recipes.length + ingredients.length;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SeoHead
        path="/search"
        title={`${t("nav.search", "Search")} — Cocktail Craft`}
        description={t("seo.search_desc", "Search cocktail recipes by name, ingredient, tag or equipment.")}
        noindex
      />
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl font-bold text-foreground mb-6">{t("nav.search", "Search")}</h1>

        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search.placeholder", "Search by name, ingredient, tag, hashtag, equipment...")}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-border bg-secondary pl-12 pr-4 py-3 text-base font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {query.trim() && (
          <p className="mb-6 font-body text-sm text-muted-foreground">
            {totalResults} {t("search.results", "result(s) found for")} "{query}"
          </p>
        )}

        {query.trim() && totalResults === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">{t("search.no_results", "No results found")}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">{t("search.try_different", "Try different keywords or browse categories.")}</p>
          </div>
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">{t("search.start_typing", "Start typing to search")}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">{t("search.hint", "Search by recipe name, ingredient, tag, hashtag, or equipment.")}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Ingredients section */}
            {ingredients.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  {t("search.ingredients", "Ingredients")} ({ingredients.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ingredients.map((ing, i) => (
                    <Link
                      key={ing.id}
                      to={localePath(`/ingredient/${ing.slug}`)}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-gradient-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-glow animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {ing.image_url ? (
                        <img src={ing.image_url} alt={ing.name} loading="lazy" decoding="async" className="h-14 w-14 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xl">🧪</div>
                      )}
                      <span className="font-body text-sm text-foreground text-center leading-tight group-hover:text-primary transition-colors">
                        {ing.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recipes section — original RecipeCard layout */}
            {recipes.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  {t("search.recipes", "Recipes")} ({recipes.length})
                </h2>
                <div className="flex flex-col gap-6">
                  {recipes.map((recipe, i) => (
                    <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <RecipeCard recipe={recipe} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
