import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import { Shuffle } from "lucide-react";

/**
 * Roulette page — picks a random recipe and redirects to it.
 * Accessible via /roulette in the header navigation.
 */
export default function RoulettePage() {
  const { data: recipes, isLoading } = useRecipes();
  const { localePath, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const random = recipes[Math.floor(Math.random() * recipes.length)];
      navigate(localePath(`/recipe/${random.slug}`), { replace: true });
    }
  }, [recipes, navigate, localePath]);

  return (
    <div className="flex min-h-screen items-center justify-center pt-16">
      <div className="text-center">
        <Shuffle className="mx-auto h-12 w-12 text-primary animate-spin" />
        <p className="mt-4 font-body text-muted-foreground">
          {isLoading
            ? t("common.loading", "Loading...")
            : t("roulette.picking", "Picking a random drink...")}
        </p>
      </div>
    </div>
  );
}
