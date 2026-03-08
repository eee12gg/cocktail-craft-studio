import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { useRecipesByCategory, type DBRecipe } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import SeoHead from "./SeoHead";
import RecipeCard from "./RecipeCard";

type Category = "cocktails" | "shots" | "non-alcoholic";

const PAGE_SIZE = 20;

const categoryTitles: Record<Category, string> = {
  cocktails: "Cocktails",
  shots: "Shots",
  "non-alcoholic": "Non-Alcoholic",
};

const categoryDescriptions: Record<Category, string> = {
  cocktails: "Classic and contemporary cocktail recipes crafted to perfection.",
  shots: "Quick, bold, and perfect for celebrations.",
  "non-alcoholic": "Refreshing mocktails for every occasion.",
};

export default function CategoryPage({ category }: { category: Category }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { t } = useLanguage();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: allRecipes, isLoading } = useRecipesByCategory(category);

  const availableTags = useMemo(
    () => [...new Set(allRecipes.flatMap((r) => r.tags))],
    [allRecipes]
  );

  const filtered = useMemo(() => {
    let result = allRecipes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
          r.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    }
    if (selectedTag) {
      result = result.filter((r) => r.tags.includes(selectedTag));
    }
    return result;
  }, [search, selectedTag, allRecipes]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedTag, category]);

  const visibleRecipes = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Load more handler
  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const remaining = filtered.length - visibleCount;

  // Category name for button text
  const categoryNameMap: Record<Category, string> = {
    cocktails: "cocktails",
    shots: "shots",
    "non-alcoholic": "mocktails",
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SeoHead
        path={`/${category}`}
        title={`${t(`cat.${category}`, categoryTitles[category])} — Cocktail Craft`}
        description={t(`cat.${category}_desc`, categoryDescriptions[category])}
      />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{t(`cat.${category}`, categoryTitles[category])}</h1>
          <p className="mt-2 font-body text-lg text-muted-foreground">{t(`cat.${category}_desc`, categoryDescriptions[category])}</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder={t("search.placeholder_short", "Search recipes...")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setSelectedTag(null)} className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${!selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t("common.all", "All")}</button>
          {availableTags.map((tag) => (
            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{tag}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><p className="font-body text-muted-foreground">{t("common.loading", "Loading...")}</p></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">{t("search.no_results", "No recipes found")}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">{t("search.try_different", "Try adjusting your search or filters.")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {visibleRecipes.map((recipe, i) => (
              <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 5) * 80}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}

            {/* Load more button */}
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-body text-base font-medium tracking-wide transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99]"
              >
                {t("category.show_more", "Show")} {Math.min(remaining, PAGE_SIZE)} {t(`cat.${category}`, categoryNameMap[category]).toLowerCase()} {t("category.of_total", "of")} {filtered.length}…
              </button>
            )}
          </div>
        )}
    </div>
  );
}
