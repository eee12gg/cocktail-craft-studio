import { Link } from "react-router-dom";
import { recipes } from "@/data/recipes";
import RecipeCard from "@/components/RecipeCard";
import { ArrowRight, Wine, Zap, Leaf } from "lucide-react";

const categories = [
  { label: "Cocktails", path: "/cocktails", icon: Wine, description: "Classic & modern cocktails" },
  { label: "Shots", path: "/shots", icon: Zap, description: "Quick & bold shooters" },
  { label: "Non-Alcoholic", path: "/non-alcoholic", icon: Leaf, description: "Refreshing mocktails" },
];

const featured = recipes.filter((r) => r.badge).slice(0, 6);

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(36 80% 50%), transparent 70%)" }} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl animate-fade-in">
            <span className="text-gradient-gold">Craft</span>{" "}
            <span className="text-foreground">Your Perfect</span>
            <br />
            <span className="text-foreground">Cocktail</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg font-body text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "200ms" }}>
            Discover expertly curated recipes — from timeless classics to bold new creations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Link
              to="/cocktails"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
            >
              Explore Recipes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-body text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.path}
              to={cat.path}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-gradient-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <cat.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{cat.label}</h3>
                <p className="font-body text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Featured Recipes</h2>
            <p className="mt-1 font-body text-muted-foreground">Our most popular picks</p>
          </div>
          <Link
            to="/cocktails"
            className="hidden items-center gap-1 font-body text-sm font-medium text-primary hover:underline sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          {featured.map((recipe, i) => (
            <div key={recipe.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
