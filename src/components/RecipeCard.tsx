import { Link } from "react-router-dom";
import type { DBRecipe } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";

const badgeColors: Record<string, string> = {
  Trending: "bg-primary/20 text-primary",
  Popular: "bg-accent/20 text-accent-foreground",
  "Top 10": "bg-primary/30 text-primary",
  New: "bg-secondary text-secondary-foreground",
};

export default function RecipeCard({ recipe }: { recipe: DBRecipe }) {
  const { localePath } = useLanguage();

  return (
    <div className="relative flex flex-col md:flex-row items-start gap-6 rounded-xl bg-gradient-card border border-border/50 shadow-card p-5 transition-all duration-300 hover:shadow-glow hover:border-primary/30">
      {recipe.badge && (
        <span className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-semibold font-body ${badgeColors[recipe.badge] || ""}`}>
          {recipe.badge}
        </span>
      )}

      <Link to={localePath(`/recipe/${recipe.slug}`)} className="flex-shrink-0 flex flex-col items-center w-full md:w-48 group">
        <div className="relative w-40 h-52 md:w-48 md:h-60 overflow-hidden rounded-lg">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">{recipe.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <h3 className="mt-3 font-display text-base md:text-lg font-semibold text-foreground text-center group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
      </Link>

      <div className="hidden md:flex items-center text-3xl text-muted-foreground font-light self-center">=</div>

      <div className="flex-1 min-w-0 w-full self-center">
        <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {recipe.ingredients.map((ing, i) => (
            <div key={ing.name + i} className="flex items-start gap-0">
              <Link
                to={localePath(`/ingredient/${ing.slug}`)}
                className="flex flex-col items-center flex-shrink-0 w-20 md:w-24 group/ing"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden flex items-center justify-center transition-all group-hover/ing:border-primary/50 group-hover/ing:shadow-glow">
                  {ing.image_url ? (
                    <img src={ing.image_url} alt={ing.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-2xl font-display text-muted-foreground">{ing.name.charAt(0)}</span>
                  )}
                </div>
                <span className="mt-1.5 text-xs font-body text-muted-foreground text-center leading-tight line-clamp-2 group-hover/ing:text-foreground transition-colors">
                  {ing.name}
                </span>
              </Link>
              {i < recipe.ingredients.length - 1 && (
                <span className="flex-shrink-0 self-center text-lg text-muted-foreground/50 mx-1 mt-4">+</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
