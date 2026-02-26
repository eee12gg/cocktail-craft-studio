import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { searchRecipes } from "@/data/recipes";
import RecipeCard from "@/components/RecipeCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("q") || "";
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchRecipes(query);
  }, [query]);

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
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl font-bold text-foreground mb-6">Search</h1>

        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ingredient, tag, hashtag, equipment..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-border bg-secondary pl-12 pr-4 py-3 text-base font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {query.trim() && (
          <p className="mb-6 font-body text-sm text-muted-foreground">
            {results.length} recipe{results.length !== 1 ? "s" : ""} found for "{query}"
          </p>
        )}

        {results.length > 0 ? (
          <div className="flex flex-col gap-6">
            {results.map((recipe, i) => (
              <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">No results found</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Try different keywords or browse categories.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">Start typing to search</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Search by recipe name, ingredient, tag, hashtag, or equipment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
