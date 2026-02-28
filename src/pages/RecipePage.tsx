import { useParams, Link } from "react-router-dom";
import { getRecipeBySlug, getRecipesByCategory } from "@/data/recipes";
import { ingredientImages } from "@/data/ingredientImages";
import RecipeCard from "@/components/RecipeCard";
import DrinkCarousel from "@/components/DrinkCarousel";
import ReviewSection from "@/components/ReviewSection";
import { ArrowLeft, Clock, Wine, ChefHat } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const badgeColors: Record<string, string> = {
  Trending: "bg-primary/20 text-primary",
  Popular: "bg-accent/20 text-accent-foreground",
  "Top 10": "bg-primary/30 text-primary",
  New: "bg-secondary text-secondary-foreground",
};

const categoryLabels: Record<string, string> = {
  cocktails: "Cocktails",
  shots: "Shots",
  "non-alcoholic": "Non-Alcoholic",
};

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const recipe = getRecipeBySlug(slug || "");
  const isMobile = useIsMobile();

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Recipe Not Found</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 font-body text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const similar = getRecipesByCategory(recipe.category)
    .filter((r) => r.id !== recipe.id)
    .slice(0, 3);

  if (isMobile) {
    return (
      <div className="min-h-screen pt-16">
        {/* Top Block: Image + Name + Description (unchanged structure) */}
        <div className="relative">
          <img src={recipe.image} alt={recipe.title} className="w-full object-cover h-[50vh]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
            <Link
              to={`/${recipe.category}`}
              className="mb-2 inline-flex items-center gap-1 font-body text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {categoryLabels[recipe.category]}
            </Link>
            <div className="flex items-start gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">{recipe.title}</h1>
              {recipe.badge && (
                <span className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-body ${badgeColors[recipe.badge]}`}>
                  {recipe.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-8">
          {/* Description */}
          <p className="font-body text-base text-muted-foreground leading-relaxed">{recipe.description}</p>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground">
              <Clock className="h-4 w-4 text-primary" /> {recipe.prep_time}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground">
              <Wine className="h-4 w-4 text-primary" /> {recipe.alcohol_level}
            </span>
          </div>

          {/* 3.2 Ingredients – Vertical list */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Ingredients</h2>
            <div className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <ul className="space-y-3">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-center gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden flex-shrink-0">
                      {ingredientImages[ing.name] ? (
                        <img src={ingredientImages[ing.name]} alt={ing.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-lg font-display text-muted-foreground">
                          {ing.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/ingredient/${ing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                      className="font-body text-sm text-foreground hover:text-primary transition-colors flex-1"
                    >
                      {ing.name}
                    </Link>
                    <span className="font-body text-xs text-muted-foreground whitespace-nowrap">
                      {ing.amount_value} {ing.amount_unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3.3 & 3.4 Carousel (Recipe / Tools) + Control Buttons */}
          <DrinkCarousel recipe={recipe} />

          {/* 3.5 Hashtags */}
          {recipe.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.hashtags.map((ht) => (
                <Link
                  key={ht}
                  to={`/search?q=${encodeURIComponent(ht.slice(1))}`}
                  className="text-sm text-primary font-body font-medium hover:underline"
                >
                  {ht}
                </Link>
              ))}
            </div>
          )}

          {/* 3.6 Reviews */}
          <ReviewSection recipeSlug={recipe.slug} />

          {/* 3.7 Recommended Drinks */}
          {similar.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Recommended Drinks</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                {similar.map((r) => (
                  <Link
                    key={r.id}
                    to={`/recipe/${r.slug}`}
                    className="flex-shrink-0 w-32 group"
                  >
                    <div className="w-32 h-40 rounded-lg overflow-hidden border border-border/50 bg-gradient-card">
                      <img src={r.image} alt={r.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    </div>
                    <p className="mt-2 font-body text-sm text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Image */}
      <div className="relative">
        <img src={recipe.image} alt={recipe.title} className="w-full object-cover h-[60vh]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Link
            to={`/${recipe.category}`}
            className="mb-3 inline-flex items-center gap-1 font-body text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {categoryLabels[recipe.category]}
          </Link>
          <div className="flex items-start gap-3">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{recipe.title}</h1>
            {recipe.badge && (
              <span className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold font-body ${badgeColors[recipe.badge]}`}>
                {recipe.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <p className="font-body text-lg text-muted-foreground leading-relaxed">{recipe.description}</p>

            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground">
                <Clock className="h-4 w-4 text-primary" /> {recipe.prep_time}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground">
                <Wine className="h-4 w-4 text-primary" /> {recipe.alcohol_level}
              </span>
              <Link
                to={`/${recipe.category}`}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {categoryLabels[recipe.category]}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body hover:bg-secondary/80 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.hashtags.map((ht) => (
                <Link
                  key={ht}
                  to={`/search?q=${encodeURIComponent(ht.slice(1))}`}
                  className="text-sm text-primary font-body font-medium hover:underline"
                >
                  {ht}
                </Link>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary font-body">
                      {i + 1}
                    </span>
                    <p className="font-body text-foreground pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Reviews (desktop) */}
            <ReviewSection recipeSlug={recipe.slug} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-center gap-3 border-b border-border/30 pb-3 last:border-0">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden flex-shrink-0">
                      {ingredientImages[ing.name] ? (
                        <img src={ingredientImages[ing.name]} alt={ing.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-lg font-display text-muted-foreground">
                          {ing.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/ingredient/${ing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                      className="font-body text-sm text-foreground hover:text-primary transition-colors flex-1"
                    >
                      {ing.name}
                    </Link>
                    <span className="font-body text-xs text-muted-foreground">
                      {ing.amount_value} {ing.amount_unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment */}
            <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" /> Equipment
              </h2>
              <ul className="space-y-2">
                {recipe.equipment.map((eq) => (
                  <li key={eq} className="font-body text-sm text-muted-foreground">
                    • {eq}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Recipes */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Similar Recipes</h2>
            <div className="flex flex-col gap-6">
              {similar.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
