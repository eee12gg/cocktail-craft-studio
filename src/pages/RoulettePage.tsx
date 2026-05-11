import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";

/**
 * Roulette page — picks a random recipe and redirects to it.
 * Filters: is_published = true, show_in_roulette = true, is_hidden = false.
 */
export default function RoulettePage() {
  const { localePath, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("slug")
        .eq("is_published", true)
        .eq("show_in_roulette", true)
        .eq("is_hidden", false);

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        if (error) console.error("[Roulette] error", error);
        toast.error(t("roulette.empty", "Нет доступных коктейлей"));
        navigate(localePath("/"), { replace: true });
        return;
      }
      const random = data[Math.floor(Math.random() * data.length)];
      navigate(localePath(`/recipe/${random.slug}`), { replace: true });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, localePath, t]);

  return (
    <div className="flex min-h-screen items-center justify-center pt-16">
      <div className="text-center">
        <Shuffle className="mx-auto h-12 w-12 text-primary animate-spin" />
        <p className="mt-4 font-body text-muted-foreground">
          {loading
            ? t("roulette.picking", "Picking a random drink...")
            : t("common.loading", "Loading...")}
        </p>
      </div>
    </div>
  );
}
