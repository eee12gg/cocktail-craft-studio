import { useState, useRef, useEffect } from "react";
import type { DBRecipe } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";

interface DrinkCarouselProps {
  recipe: DBRecipe;
}

export default function DrinkCarousel({ recipe }: DrinkCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  const slide0Ref = useRef<HTMLDivElement>(null);
  const slide1Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const h0 = slide0Ref.current?.scrollHeight || 0;
      const h1 = slide1Ref.current?.scrollHeight || 0;
      setContainerHeight(Math.max(h0, h1));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [recipe]);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-card" style={{ height: containerHeight ? `${containerHeight}px` : "auto" }}>
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          <div ref={slide0Ref} className="w-full flex-shrink-0 p-5">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">{t("recipe.recipe", "Recipe")}</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary font-body">{i + 1}</span>
                  <p className="font-body text-sm text-foreground pt-0.5 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div ref={slide1Ref} className="w-full flex-shrink-0 p-5">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">{t("recipe.bar_tools", "Bar Tools")}</h3>
            <ul className="space-y-3">
              {recipe.equipment.map((eq) => (
                <li key={eq.name} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/50 border border-border/30 overflow-hidden">
                    {eq.image_url ? (
                      <img src={eq.image_url} alt={eq.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🍸</span>
                    )}
                  </div>
                  <span className="font-body text-sm text-foreground">{eq.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setActiveSlide(0)} className={`flex-1 rounded-lg py-2.5 font-body text-sm font-semibold transition-all ${activeSlide === 0 ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>Recipe</button>
        <button onClick={() => setActiveSlide(1)} className={`flex-1 rounded-lg py-2.5 font-body text-sm font-semibold transition-all ${activeSlide === 1 ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>Tools</button>
      </div>
    </div>
  );
}
