import { Link } from "react-router-dom";
import type { Recipe } from "@/data/recipes";
import { Clock, Wine } from "lucide-react";

const badgeColors: Record<string, string> = {
  Trending: "bg-primary/20 text-primary",
  Popular: "bg-accent/20 text-accent-foreground",
  "Top 10": "bg-primary/30 text-primary",
  New: "bg-secondary text-secondary-foreground",
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-gradient-card border border-border/50 shadow-card transition-all duration-300 hover:shadow-glow hover:border-primary/30 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="image-immersive transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        {recipe.badge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold font-body ${badgeColors[recipe.badge]}`}
          >
            {recipe.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {recipe.title}
        </h3>
        <p className="font-body text-sm text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground font-body"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {recipe.hashtags.slice(0, 3).map((ht) => (
            <span
              key={ht}
              className="text-xs text-primary font-body font-medium"
            >
              {ht}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-4 pt-3 border-t border-border/30 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.prep_time}
          </span>
          <span className="flex items-center gap-1">
            <Wine className="h-3.5 w-3.5" /> {recipe.alcohol_level}
          </span>
          <span className="ml-auto text-muted-foreground/70">
            {recipe.ingredients.length} ingredients
          </span>
        </div>
      </div>
    </Link>
  );
}
