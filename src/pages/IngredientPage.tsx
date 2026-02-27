import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { getIngredientBySlug, getRecipesUsingIngredient } from "@/data/ingredients";
import RecipeCard from "@/components/RecipeCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const IngredientPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const ingredient = getIngredientBySlug(slug || "");
  const [expanded, setExpanded] = useState(false);

  if (!ingredient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-display text-gradient-gold">Ingredient Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const relatedRecipes = getRecipesUsingIngredient(ingredient.name);
  const hasDescription = !!ingredient.description;
  const hasQuickRecipe = !!ingredient.quickRecipe;

  // For "Read more" logic: show ~3 lines worth
  const descriptionLines = ingredient.description?.split("\n").filter(Boolean) || [];
  const isLongDescription = descriptionLines.length > 3 || (ingredient.description?.length || 0) > 300;
  const shortDescription = isLongDescription
    ? descriptionLines.slice(0, 2).join("\n")
    : ingredient.description;

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <title>{ingredient.name} — Cocktail Craft</title>
      <meta name="description" content={(ingredient.description || ingredient.name).slice(0, 160)} />

      <div className="max-w-2xl mx-auto px-4 pt-16 pb-8 space-y-8">
        {/* 1. Ingredient Image */}
        <div className="flex justify-center">
          {ingredient.image ? (
            <img
              src={ingredient.image}
              alt={ingredient.name}
              className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-2xl"
              loading="lazy"
            />
          ) : (
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-secondary/30 flex items-center justify-center">
              <span className="text-5xl text-muted-foreground">{ingredient.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Ingredient Name */}
        <h1 className="text-3xl md:text-4xl font-display text-center text-gradient-gold">
          {ingredient.name}
        </h1>

        {/* 2. Description with Read More */}
        {hasDescription && (
          <div className="space-y-3">
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {expanded || !isLongDescription ? ingredient.description : shortDescription}
            </div>
            {isLongDescription && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
              >
                {expanded ? (
                  <>Show less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Read more <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* 3. Quick Recipe */}
        {hasQuickRecipe && ingredient.quickRecipe && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-display text-gradient-gold">Quick Recipe</h2>
            <h3 className="text-lg font-semibold text-foreground">{ingredient.quickRecipe.drinkName}</h3>

            {/* Ingredients */}
            <div className="space-y-1">
              {ingredient.quickRecipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {ing.amount}
                </div>
              ))}
            </div>

            {/* Steps */}
            <ol className="space-y-2">
              {ingredient.quickRecipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  {step.text}
                </li>
              ))}
            </ol>

            {/* View Full Recipe button */}
            {ingredient.quickRecipe.fullRecipeSlug && (
              <Link
                to={`/recipe/${ingredient.quickRecipe.fullRecipeSlug}`}
                className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                View Full Recipe
              </Link>
            )}
          </div>
        )}

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display text-gradient-gold">
              Recipes with {ingredient.name}
            </h2>
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
