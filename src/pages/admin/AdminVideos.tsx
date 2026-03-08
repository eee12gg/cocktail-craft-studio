import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Video, Upload, Trash2, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface RecipeWithVideo {
  id: string;
  title: string;
  slug: string;
  category: string;
  image_url: string | null;
  video_url: string | null;
}

export default function AdminVideos() {
  const [recipes, setRecipes] = useState<RecipeWithVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "with" | "without">("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, slug, category, image_url, video_url")
      .eq("is_published", true)
      .order("title");

    if (!error && data) {
      setRecipes(data as RecipeWithVideo[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleUpload = async (recipeId: string, file: File) => {
    setUploading(recipeId);
    try {
      const ext = file.name.split(".").pop();
      const path = `videos/${recipeId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("recipes")
        .update({ video_url: urlData.publicUrl })
        .eq("id", recipeId);

      if (updateError) throw updateError;

      toast({ title: "Видео загружено", description: "Видео успешно привязано к рецепту" });
      fetchRecipes();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleSetUrl = async (recipeId: string, url: string) => {
    const { error } = await supabase
      .from("recipes")
      .update({ video_url: url })
      .eq("id", recipeId);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "URL обновлён" });
      fetchRecipes();
    }
  };

  const handleRemove = async (recipeId: string) => {
    const { error } = await supabase
      .from("recipes")
      .update({ video_url: null })
      .eq("id", recipeId);

    if (!error) {
      toast({ title: "Видео удалено" });
      fetchRecipes();
    }
  };

  const filtered = recipes.filter((r) => {
    if (filter === "with" && !r.video_url) return false;
    if (filter === "without" && r.video_url) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const withVideo = recipes.filter((r) => r.video_url).length;
  const withoutVideo = recipes.filter((r) => !r.video_url).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Видео</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="h-4 w-4" />
          <span>{withVideo} с видео</span>
          <span>·</span>
          <span>{withoutVideo} без видео</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "with", "without"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Все" : f === "with" ? "С видео" : "Без видео"}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div className="grid gap-3">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20"
          >
            {/* Thumbnail */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Video className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{recipe.title}</h3>
              <p className="text-xs text-muted-foreground capitalize">{recipe.category}</p>
            </div>

            {/* Video status & actions */}
            <div className="flex items-center gap-2 shrink-0">
              {recipe.video_url ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
                    <Video className="h-3 w-3" />
                    Есть видео
                  </span>
                  <a
                    href={recipe.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleRemove(recipe.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Нет видео
                  </span>
                  <label className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(recipe.id, file);
                      }}
                    />
                  </label>
                </>
              )}
              {uploading === recipe.id && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
