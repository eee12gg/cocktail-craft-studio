import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useIngredients } from "@/hooks/useIngredients";
import SeoHead from "@/components/SeoHead";

const TYPE_LABELS: Record<string, string> = {
  alcohol: "Alcohol",
  liqueur: "Liqueur",
  syrup: "Syrup",
  juice: "Juice",
  fruit: "Fruit",
  mixer: "Mixer",
  other: "Other",
};

export default function IngredientsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: ingredients, isLoading } = useIngredients();
  const { localePath, t } = useLanguage();

  const types = useMemo(() => {
    if (!ingredients) return [];
    return [...new Set(ingredients.map((i) => i.type))].sort();
  }, [ingredients]);

  const grouped = useMemo(() => {
    if (!ingredients) return {};
    const filtered = selectedType
      ? ingredients.filter((i) => i.type === selectedType)
      : ingredients;
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((ing) => {
      const type = ing.type || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(ing);
    });
    return groups;
  }, [ingredients, selectedType]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SeoHead
        path="/ingredients"
        title="Ingredients — Cocktail Craft"
        description="Browse all cocktail ingredients by type — spirits, liqueurs, syrups, juices, fruits, and more."
      />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {t("nav.ingredients", "Ingredients")}
          </h1>
          <p className="mt-2 font-body text-lg text-muted-foreground">
            {t("ingredients.subtitle", "Explore all ingredients used in our recipes.")}
          </p>
        </div>

        {/* Type filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${
              !selectedType
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {t("common.all", "All")}
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors ${
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <p className="font-body text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground">{t("ingredients.no_results", "No ingredients found")}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([type, items]) => (
                <section key={type}>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 border-b border-border/50 pb-2">
                    {TYPE_LABELS[type] || type}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((ing) => (
                      <Link
                        key={ing.id}
                        to={localePath(`/ingredient/${ing.slug}`)}
                        className="group rounded-xl border border-border/50 bg-gradient-card p-4 transition-all hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="aspect-square w-full rounded-lg bg-secondary/50 border border-border/30 overflow-hidden mb-3">
                          {ing.image_url ? (
                            <img
                              src={ing.image_url}
                              alt={ing.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl font-display text-muted-foreground">
                                {ing.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {ing.name}
                        </h3>
                        {ing.description && (
                          <p className="mt-1 font-body text-xs text-muted-foreground line-clamp-2">
                            {ing.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
