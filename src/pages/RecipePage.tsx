import { useParams, Link } from "react-router-dom";
import { useRecipeBySlug, useRecipesByCategory } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import SeoHead from "@/components/SeoHead";
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
  const { data: recipe, isLoading } = useRecipeBySlug(slug || "");
  const { data: categoryRecipes } = useRecipesByCategory(recipe?.category || "cocktails");
  const { localePath, t } = useLanguage();
  const { localePath, t } = useLanguage();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="font-body text-muted-foreground">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">{t("recipe.not_found", "Recipe Not Found")}</h1>
          <Link to={localePath("/")} className="mt-4 inline-flex items-center gap-2 font-body text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> {t("common.back_home", "Back to Home")}
          </Link>
        </div>
      </div>
    );
  }

  const similar = recipe.recommendations.length > 0
    ? recipe.recommendations
    : (categoryRecipes || []).filter((r) => r.id !== recipe.id).slice(0, 3).map((r) => ({ id: r.id, slug: r.slug, title: r.title, image_url: r.image_url }));

  const seoHead = recipe ? (
    <SeoHead
      path={`/recipe/${recipe.slug}`}
      title={`${recipe.title} — Cocktail Craft`}
      description={recipe.description || `${recipe.title} recipe`}
    />
  ) : null;

  if (isMobile) {
    return (
      <div className="min-h-screen pt-16">
        {seoHead}
        <div className="relative">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="h-[50vh] w-full bg-card object-contain" loading="eager" fetchPriority="high" />
          ) : (
            <div className="h-[50vh] w-full bg-card flex items-center justify-center">
              <span className="text-6xl text-muted-foreground">{recipe.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
            <Link to={localePath(`/${recipe.category}`)} className="mb-2 inline-flex items-center gap-1 font-body text-sm text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> {categoryLabels[recipe.category]}
            </Link>
            <div className="flex items-start gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground">{recipe.title}</h1>
              {recipe.badge && (
                <span className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-body ${badgeColors[recipe.badge] || ""}`}>{recipe.badge}</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-8">
          <p className="font-body text-base text-muted-foreground leading-relaxed">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {recipe.prep_time && <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground"><Clock className="h-4 w-4 text-primary" /> {recipe.prep_time}</span>}
            <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground"><Wine className="h-4 w-4 text-primary" /> {recipe.alcohol_level}</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t("recipe.ingredients", "Ingredients")}</h2>
            <div className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <ul className="space-y-3">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-center gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden flex-shrink-0">
                      {ing.image_url ? (
                        <img src={ing.image_url} alt={ing.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-lg font-display text-muted-foreground">{ing.name.charAt(0)}</span>
                      )}
                    </div>
                    <Link to={localePath(`/ingredient/${ing.slug}`)} className="font-body text-sm text-foreground hover:text-primary transition-colors flex-1">{ing.name}</Link>
                    <span className="font-body text-xs text-muted-foreground whitespace-nowrap">{ing.amount_value} {ing.amount_unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DrinkCarousel recipe={recipe} />

          {recipe.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.hashtags.map((ht) => (
                <Link key={ht} to={localePath(`/search?q=${encodeURIComponent(ht)}`)} className="text-sm text-primary font-body font-medium hover:underline">#{ht}</Link>
              ))}
            </div>
          )}

          <ReviewSection recipeId={recipe.id} recipeSlug={recipe.slug} />

          {similar.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t("recipe.recommended", "Recommended Drinks")}</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                {similar.map((r) => (
                  <Link key={r.id} to={localePath(`/recipe/${r.slug}`)} className="flex-shrink-0 w-32 group">
                    <div className="w-32 h-40 rounded-lg overflow-hidden border border-border/50 bg-gradient-card">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary"><span className="text-3xl text-muted-foreground">{r.title.charAt(0)}</span></div>
                      )}
                    </div>
                    <p className="mt-2 font-body text-sm text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="min-h-screen pt-28">
      {seoHead}
      <div className="relative">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="h-[60vh] w-full bg-card object-contain" loading="eager" fetchPriority="high" />
        ) : (
          <div className="h-[60vh] w-full bg-card flex items-center justify-center">
            <span className="text-8xl text-muted-foreground">{recipe.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Link to={localePath(`/${recipe.category}`)} className="mb-3 inline-flex items-center gap-1 font-body text-sm text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> {categoryLabels[recipe.category]}
          </Link>
          <div className="flex items-start gap-3">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{recipe.title}</h1>
            {recipe.badge && (
              <span className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold font-body ${badgeColors[recipe.badge] || ""}`}>{recipe.badge}</span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">{recipe.description}</p>
        <div className="flex flex-wrap gap-3 mb-10">
          {recipe.prep_time && <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground"><Clock className="h-4 w-4 text-primary" /> {recipe.prep_time}</span>}
          <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground"><Wine className="h-4 w-4 text-primary" /> {recipe.alcohol_level}</span>
          <Link to={localePath(`/${recipe.category}`)} className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">{categoryLabels[recipe.category]}</Link>
        </div>

        <div className="grid grid-cols-[3fr_4fr_3fr] gap-8 items-start mb-12">
          <div className="rounded-xl border border-border/50 bg-gradient-card p-6 max-h-[600px] overflow-y-auto">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">{t("recipe.ingredients", "Ingredients")}</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing) => (
                <li key={ing.name} className="flex items-center gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden flex-shrink-0">
                    {ing.image_url ? (
                      <img src={ing.image_url} alt={ing.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-lg font-display text-muted-foreground">{ing.name.charAt(0)}</span>
                    )}
                  </div>
                  <Link to={localePath(`/ingredient/${ing.slug}`)} className="font-body text-sm text-foreground hover:text-primary transition-colors flex-1">{ing.name}</Link>
                  <span className="font-body text-xs text-muted-foreground whitespace-nowrap">{ing.amount_value} {ing.amount_unit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">{t("recipe.recipe", "Recipe")}</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary font-body">{i + 1}</span>
                  <p className="font-body text-foreground pt-1 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2"><ChefHat className="h-5 w-5 text-primary" /> {t("recipe.bar_tools", "Bar Tools")}</h2>
            <ul className="space-y-3">
              {recipe.equipment.map((eq) => (
                <li key={eq.name} className="flex items-center gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {eq.image_url ? (
                      <img src={eq.image_url} alt={eq.name} className="w-full h-full object-cover" />
                    ) : (
                      <ChefHat className="h-5 w-5 text-primary/70" />
                    )}
                  </div>
                  <div>
                    <span className="font-body text-sm text-foreground">{eq.name}</span>
                    {eq.description && <p className="font-body text-xs text-muted-foreground line-clamp-1">{eq.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {(recipe.hashtags.length > 0 || recipe.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-10">
            {recipe.hashtags.map((ht) => (
              <Link key={ht} to={localePath(`/search?q=${encodeURIComponent(ht)}`)} className="rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-body font-medium hover:bg-primary/20 transition-colors">#{ht}</Link>
            ))}
            {recipe.tags.map((tag) => (
              <Link key={tag} to={localePath(`/search?q=${encodeURIComponent(tag)}`)} className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground font-body hover:bg-secondary/80 transition-colors">{tag}</Link>
            ))}
          </div>
        )}

        <div className="mb-12">
          <ReviewSection recipeId={recipe.id} recipeSlug={recipe.slug} />
        </div>

        {similar.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">{t("recipe.recommended", "Recommended Drinks")}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
              {similar.map((r) => (
                <Link key={r.id} to={localePath(`/recipe/${r.slug}`)} className="flex-shrink-0 w-44 group">
                  <div className="w-44 h-52 rounded-xl overflow-hidden border border-border/50 bg-gradient-card">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary"><span className="text-4xl text-muted-foreground">{r.title.charAt(0)}</span></div>
                    )}
                  </div>
                  <p className="mt-3 font-body text-sm text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
