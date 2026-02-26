import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { getRecipesByCategory, allTags, type Category } from "@/data/recipes";
import RecipeCard from "./RecipeCard";

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

  const allRecipes = getRecipesByCategory(category);
  const availableTags = useMemo(
    () => [...new Set(allRecipes.flatMap((r) => r.tags))],
    [category]
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
  }, [search, selectedTag, category]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {categoryTitles[category]}
          </h1>
          <p className="mt-2 font-body text-lg text-muted-foreground">
            {categoryDescriptions[category]}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${
              !selectedTag
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">No recipes found</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((recipe, i) => (
              <div
                key={recipe.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
