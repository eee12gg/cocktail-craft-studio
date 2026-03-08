import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useIngredientBySlug } from "@/hooks/useIngredients";
import { useRecipes, type DBRecipeLight } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import SeoHead from "@/components/SeoHead";
import RecipeCard from "@/components/RecipeCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const IngredientPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: ingredient, isLoading } = useIngredientBySlug(slug || "");
  const { data: allRecipes } = useRecipes();
  const { localePath, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-display text-gradient-gold">{t("ingredient.not_found", "Ingredient Not Found")}</h1>
          <Link to={localePath("/")} className="text-primary hover:underline">{t("common.back_home", "Back to Home")}</Link>
        </div>
      </div>
    );
  }

  const relatedRecipes = (allRecipes || []).filter((r) =>
    r.ingredients.some((i) => i.slug === ingredient.slug)
  );

  const hasDescription = !!ingredient.description;
  const isLongDescription = (ingredient.description?.length || 0) > 300;
  const shortDescription = isLongDescription
    ? ingredient.description!.slice(0, 300) + "..."
    : ingredient.description;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        path={`/ingredient/${ingredient.slug}`}
        title={`${ingredient.name} — Cocktail Craft`}
        description={(ingredient.description || ingredient.name).slice(0, 160)}
      />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-8 space-y-8">
        <div className="flex justify-center">
          {ingredient.image_url ? (
            <img src={ingredient.image_url} alt={ingredient.name} className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-2xl" loading="lazy" />
          ) : (
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-secondary/30 flex items-center justify-center">
              <span className="text-5xl text-muted-foreground">{ingredient.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-display text-center text-gradient-gold">{ingredient.name}</h1>

        {hasDescription && (
          <div className="space-y-3">
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {expanded || !isLongDescription ? ingredient.description : shortDescription}
            </div>
            {isLongDescription && (
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                {expanded ? (<>{t("common.show_less", "Show less")} <ChevronUp className="w-4 h-4" /></>) : (<>{t("common.read_more", "Read more")} <ChevronDown className="w-4 h-4" /></>)}
              </button>
            )}
          </div>
        )}

        {relatedRecipes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display text-gradient-gold">{t("ingredient.recipes_with", "Recipes with")} {ingredient.name}</h2>
            <div className="flex flex-col gap-6">
              {relatedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientPage;
