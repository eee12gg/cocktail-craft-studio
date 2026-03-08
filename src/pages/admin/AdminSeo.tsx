import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface RecipeSeoData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  category: string;
  translations: { language_code: string; title: string; slug: string; description: string | null }[];
  steps_count: number;
  ingredients_count: number;
  has_image: boolean;
}

interface IngredientSeoData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  translations: { language_code: string; name: string; slug: string }[];
}

interface SeoIssue {
  type: "error" | "warning" | "info";
  page: string;
  message: string;
  slug?: string;
}

const SITE_URL = "https://cocktailcraft.com";

export default function AdminSeo() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [descSearch, setDescSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("issues");
  const [siteTitle, setSiteTitle] = useState("Cocktail Craft");
  const [siteDescription, setSiteDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);
  const [descFilter, setDescFilter] = useState<"all" | "missing" | "short" | "long">("all");

  // Fetch languages
  const { data: languages = [] } = useQuery({
    queryKey: ["admin-languages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("languages")
        .select("code, name, is_active")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  // Fetch recipes with SEO data
  const { data: recipes = [] } = useQuery({
    queryKey: ["admin-seo-recipes"],
    queryFn: async () => {
      const { data: recipesRaw } = await supabase
        .from("recipes")
        .select("id, slug, title, description, image_url, is_published, category")
        .order("title");

      const { data: translations } = await supabase
        .from("recipe_translations")
        .select("recipe_id, language_code, title, slug, description");

      const { data: steps } = await supabase
        .from("recipe_steps")
        .select("recipe_id");

      const { data: ingredients } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id");

      const transMap: Record<string, any[]> = {};
      (translations || []).forEach((t) => {
        if (!transMap[t.recipe_id]) transMap[t.recipe_id] = [];
        transMap[t.recipe_id].push(t);
      });

      const stepsCount: Record<string, number> = {};
      (steps || []).forEach((s) => {
        stepsCount[s.recipe_id] = (stepsCount[s.recipe_id] || 0) + 1;
      });

      const ingCount: Record<string, number> = {};
      (ingredients || []).forEach((i) => {
        ingCount[i.recipe_id] = (ingCount[i.recipe_id] || 0) + 1;
      });

      return (recipesRaw || []).map((r) => ({
        ...r,
        translations: transMap[r.id] || [],
        steps_count: stepsCount[r.id] || 0,
        ingredients_count: ingCount[r.id] || 0,
        has_image: !!r.image_url,
      })) as RecipeSeoData[];
    },
  });

  // Fetch ingredients with SEO data
  const { data: ingredientsList = [] } = useQuery({
    queryKey: ["admin-seo-ingredients"],
    queryFn: async () => {
      const { data: ingsRaw } = await supabase
        .from("ingredients")
        .select("id, slug, name, description, image_url")
        .order("name");

      const { data: translations } = await supabase
        .from("ingredient_translations")
        .select("ingredient_id, language_code, name, slug");

      const transMap: Record<string, any[]> = {};
      (translations || []).forEach((t) => {
        if (!transMap[t.ingredient_id]) transMap[t.ingredient_id] = [];
        transMap[t.ingredient_id].push(t);
      });

      return (ingsRaw || []).map((i) => ({
        ...i,
        translations: transMap[i.id] || [],
      })) as IngredientSeoData[];
    },
  });

  // Fetch country targets
  const { data: countryTargets = [] } = useQuery({
    queryKey: ["admin-seo-countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("country_language_targets")
        .select("country_code, language_code, country_name");
      return data || [];
    },
  });

  // Load site SEO settings
  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["site_title", "site_description"])
      .then(({ data }) => {
        (data || []).forEach((s) => {
          if (s.key === "site_title") setSiteTitle(s.value);
          if (s.key === "site_description") setSiteDescription(s.value);
        });
      });
  }, []);

  // Compute SEO issues
  const issues = useMemo<SeoIssue[]>(() => {
    const result: SeoIssue[] = [];
    const activeLangCodes = languages.map((l) => l.code).filter((c) => c !== "en");

    // Recipe issues
    recipes.forEach((r) => {
      if (!r.description) {
        result.push({ type: "error", page: `Рецепт: ${r.title}`, message: "Нет описания (meta description)", slug: r.slug });
      } else if (r.description.length < 50) {
        result.push({ type: "warning", page: `Рецепт: ${r.title}`, message: `Описание слишком короткое (${r.description.length} символов, рекомендовано 100-160)`, slug: r.slug });
      } else if (r.description.length > 160) {
        result.push({ type: "warning", page: `Рецепт: ${r.title}`, message: `Описание слишком длинное (${r.description.length} символов, рекомендовано до 160)`, slug: r.slug });
      }

      if (!r.has_image) {
        result.push({ type: "error", page: `Рецепт: ${r.title}`, message: "Нет изображения (og:image)", slug: r.slug });
      }

      if (r.steps_count === 0) {
        result.push({ type: "warning", page: `Рецепт: ${r.title}`, message: "Нет шагов приготовления (JSON-LD Recipe)", slug: r.slug });
      }

      if (r.ingredients_count === 0) {
        result.push({ type: "warning", page: `Рецепт: ${r.title}`, message: "Нет ингредиентов", slug: r.slug });
      }

      const translatedLangs = r.translations.map((t) => t.language_code);
      const missingLangs = activeLangCodes.filter((code) => !translatedLangs.includes(code));
      if (missingLangs.length > 0) {
        result.push({
          type: "warning",
          page: `Рецепт: ${r.title}`,
          message: `Нет перевода для: ${missingLangs.join(", ")}`,
          slug: r.slug,
        });
      }

      if (r.title.length > 60) {
        result.push({ type: "info", page: `Рецепт: ${r.title}`, message: `Заголовок > 60 символов (${r.title.length})`, slug: r.slug });
      }
    });

    // Ingredient issues
    ingredientsList.forEach((ing) => {
      if (!ing.description) {
        result.push({ type: "warning", page: `Ингредиент: ${ing.name}`, message: "Нет описания", slug: ing.slug });
      }

      if (!ing.image_url) {
        result.push({ type: "info", page: `Ингредиент: ${ing.name}`, message: "Нет изображения", slug: ing.slug });
      }

      const translatedLangs = ing.translations.map((t) => t.language_code);
      const missingLangs = activeLangCodes.filter((code) => !translatedLangs.includes(code));
      if (missingLangs.length > 0) {
        result.push({
          type: "info",
          page: `Ингредиент: ${ing.name}`,
          message: `Нет перевода для: ${missingLangs.join(", ")}`,
          slug: ing.slug,
        });
      }
    });

    return result;
  }, [recipes, ingredientsList, languages]);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const infoCount = issues.filter((i) => i.type === "info").length;

  const filteredIssues = search
    ? issues.filter(
        (i) =>
          i.page.toLowerCase().includes(search.toLowerCase()) ||
          i.message.toLowerCase().includes(search.toLowerCase())
      )
    : issues;

  // Stats
  const publishedRecipes = recipes.filter((r) => r.is_published).length;
  const recipesWithImages = recipes.filter((r) => r.has_image).length;
  const recipesWithDesc = recipes.filter((r) => r.description && r.description.length >= 50).length;
  const fullyTranslatedRecipes = recipes.filter((r) => {
    const activeLangCodes = languages.map((l) => l.code).filter((c) => c !== "en");
    const translatedLangs = r.translations.map((t) => t.language_code);
    return activeLangCodes.every((code) => translatedLangs.includes(code));
  }).length;

  const handleSaveSiteSettings = async () => {
    setSaving(true);
    const updates = [
      { key: "site_title", value: siteTitle },
      { key: "site_description", value: siteDescription },
    ];
    for (const u of updates) {
      await supabase.from("admin_settings").upsert(u, { onConflict: "key" });
    }
    setSaving(false);
    toast.success("Настройки SEO сохранены");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const seoScore = useMemo(() => {
    if (recipes.length === 0) return 0;
    let score = 100;
    const errPenalty = errorCount * 3;
    const warnPenalty = warningCount * 1;
    score = Math.max(0, Math.min(100, score - errPenalty - warnPenalty));
    return score;
  }, [errorCount, warningCount, recipes.length]);

  const scoreColor = seoScore >= 80 ? "text-green-400" : seoScore >= 50 ? "text-yellow-400" : "text-red-400";
  const scoreBg = seoScore >= 80 ? "bg-green-400/10 border-green-400/30" : seoScore >= 50 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-400/10 border-red-400/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">SEO</h1>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {SITE_URL.replace("https://", "")}
        </a>
      </div>

      {/* Score + Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className={`rounded-xl border p-5 ${scoreBg}`}>
          <span className="text-sm text-muted-foreground">SEO Score</span>
          <p className={`mt-1 font-display text-4xl font-bold ${scoreColor}`}>{seoScore}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Рецептов</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{publishedRecipes}<span className="text-sm text-muted-foreground font-normal">/{recipes.length}</span></p>
          <span className="text-xs text-muted-foreground">опубликовано</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">С изображением</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{recipesWithImages}<span className="text-sm text-muted-foreground font-normal">/{recipes.length}</span></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">С описанием</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{recipesWithDesc}<span className="text-sm text-muted-foreground font-normal">/{recipes.length}</span></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Переведены</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{fullyTranslatedRecipes}<span className="text-sm text-muted-foreground font-normal">/{recipes.length}</span></p>
        </div>
      </div>

      {/* Site-wide SEO settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <button
          onClick={() => toggleSection("settings")}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Общие настройки</h2>
          </div>
          {expandedSection === "settings" ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSection === "settings" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Название сайта</label>
              <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Cocktail Craft" />
              <p className="mt-1 text-xs text-muted-foreground">{siteTitle.length}/60 символов</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Описание сайта (meta description)</label>
              <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Explore expertly curated cocktail recipes..." rows={3} />
              <p className="mt-1 text-xs text-muted-foreground">{siteDescription.length}/160 символов</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs text-muted-foreground mb-1">Активные языки</p>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <span key={l.code} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">{l.code.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs text-muted-foreground mb-1">Региональные таргеты</p>
                <p className="text-sm text-foreground">{countryTargets.length} стран настроено</p>
              </div>
            </div>
            <Button onClick={handleSaveSiteSettings} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
          </div>
        )}
      </section>

      {/* SEO Issues */}
      <section className="rounded-xl border border-border bg-card p-6">
        <button
          onClick={() => toggleSection("issues")}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Проблемы SEO</h2>
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-400/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                  <AlertTriangle className="h-3 w-3" /> {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                  <AlertTriangle className="h-3 w-3" /> {warningCount}
                </span>
              )}
              {infoCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                  {infoCount}
                </span>
              )}
            </div>
          </div>
          {expandedSection === "issues" ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSection === "issues" && (
          <div className="mt-4 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по проблемам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredIssues.length === 0 ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-sm text-muted-foreground">Проблем не найдено!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredIssues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      issue.type === "error"
                        ? "border-red-400/30 bg-red-400/5"
                        : issue.type === "warning"
                        ? "border-yellow-400/30 bg-yellow-400/5"
                        : "border-blue-400/30 bg-blue-400/5"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        issue.type === "error"
                          ? "text-red-400"
                          : issue.type === "warning"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{issue.page}</p>
                      <p className="text-xs text-muted-foreground">{issue.message}</p>
                    </div>
                    {issue.slug && (
                      <a
                        href={issue.page.startsWith("Рецепт") ? `/recipe/${issue.slug}` : `/ingredient/${issue.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Technical SEO */}
      <section className="rounded-xl border border-border bg-card p-6">
        <button
          onClick={() => toggleSection("technical")}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Техническое SEO</h2>
          </div>
          {expandedSection === "technical" ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSection === "technical" && (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusItem label="robots.txt" status="ok" detail="Настроен, /admin/ запрещён" />
              <StatusItem label="Sitemap" status="ok" detail="Динамический, все языки + страны" />
              <StatusItem label="Canonical URL" status="ok" detail="На всех страницах" />
              <StatusItem label="Hreflang теги" status="ok" detail={`${languages.length} языков + ${countryTargets.length} стран`} />
              <StatusItem label="JSON-LD Recipe" status="ok" detail="На страницах рецептов" />
              <StatusItem label="JSON-LD BreadcrumbList" status="ok" detail="На рецептах и ингредиентах" />
              <StatusItem label="JSON-LD WebSite" status="ok" detail="На главной + SearchAction" />
              <StatusItem label="Open Graph" status="ok" detail="og:title, og:desc, og:image, og:locale" />
              <StatusItem label="Twitter Card" status="ok" detail="summary_large_image на всех" />
              <StatusItem label="noindex" status="ok" detail="Поиск, 404 исключены" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusItem({ label, status, detail }: { label: string; status: "ok" | "warning" | "error"; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${status === "ok" ? "text-green-400" : status === "warning" ? "text-yellow-400" : "text-red-400"}`} />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
