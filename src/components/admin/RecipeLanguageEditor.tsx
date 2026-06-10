/**
 * RecipeLanguageEditor — multilingual recipe editor (per-language tabs).
 *
 * Loads only the active language on demand. Each language tab provides:
 *  1) Visibility toggle (controls is_visible on recipe_translations)
 *  2) Title  3) Description
 *  4) Ingredients display text (auto-fill from ingredient translation, fallback en → system)
 *  5) Steps  6) Reviews (lazy, language-scoped)  7) SEO fields
 *  8) SEO phrases manager  9) Page link + copy
 *
 * Saves are field-scoped: each section uses a small upsert/delete instead of
 * shipping the whole recipe object. Cross-language ingredient translations
 * are cached at the React Query level (10 min) and shared between tabs.
 */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, ExternalLink, Copy, Trash2, Plus, GripVertical, Star } from "lucide-react";

const DEFAULT_LANG = "en";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

interface Language { code: string; name: string; flag_emoji: string; }
interface Props { recipeId: string; recipeBaseSlug: string; }

interface RecipeStep { id: string; step_number: number; instruction: string; }
interface RecipeIng {
  id: string;
  sort_order: number;
  display_text: string;
  ingredient_id: string;
  ingredient_name: string;
}

/* ─── Languages list (active, exclude default) ───────────────────── */
function useLanguages() {
  return useQuery({
    queryKey: ["admin-languages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("languages")
        .select("code, name, flag_emoji")
        .eq("is_active", true)
        .order("sort_order");
      return ((data || []) as Language[]).filter((l) => l.code !== DEFAULT_LANG);
    },
    staleTime: 10 * 60 * 1000,
  });
}

/* ─── Recipe structure (shared, lang-agnostic) ───────────────────── */
function useRecipeStructure(recipeId: string) {
  return useQuery({
    queryKey: ["recipe-structure", recipeId],
    queryFn: async () => {
      const [stepsRes, ingsRes] = await Promise.all([
        supabase.from("recipe_steps").select("id, step_number, instruction").eq("recipe_id", recipeId).order("step_number"),
        supabase.from("recipe_ingredients")
          .select("id, sort_order, display_text, ingredient_id, ingredient:ingredients(name)")
          .eq("recipe_id", recipeId).order("sort_order"),
      ]);
      const steps: RecipeStep[] = (stepsRes.data || []) as any;
      const ings: RecipeIng[] = (ingsRes.data || []).map((i: any) => ({
        id: i.id,
        sort_order: i.sort_order,
        display_text: i.display_text,
        ingredient_id: i.ingredient_id,
        ingredient_name: i.ingredient?.name || "?",
      }));
      return { steps, ings };
    },
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000,
  });
}

/* ─── Per-language data (loaded only for active tab) ─────────────── */
interface LangData {
  translation: {
    id: string | null;
    title: string;
    slug: string;
    description: string;
    is_visible: boolean;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_h1: string;
  };
  stepInstructions: Record<string, string>;
  ingDisplay: Record<string, string>;
}

function useLangData(recipeId: string, lang: string, enabled: boolean) {
  return useQuery({
    queryKey: ["recipe-lang", recipeId, lang],
    enabled: enabled && !!recipeId && !!lang,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<LangData> => {
      const [trRes, stepTrRes, ingTrRes] = await Promise.all([
        (supabase.from("recipe_translations") as any)
          .select("id, title, slug, description, is_visible, seo_title, seo_description, seo_keywords, seo_h1")
          .eq("recipe_id", recipeId).eq("language_code", lang).maybeSingle(),
        supabase.from("recipe_step_translations").select("recipe_step_id, instruction").eq("language_code", lang),
        supabase.from("recipe_ingredient_translations").select("recipe_ingredient_id, display_text").eq("language_code", lang),
      ]);
      const tr: any = trRes.data || {};
      const stepInstructions: Record<string, string> = {};
      (stepTrRes.data || []).forEach((r: any) => { stepInstructions[r.recipe_step_id] = r.instruction; });
      const ingDisplay: Record<string, string> = {};
      (ingTrRes.data || []).forEach((r: any) => { ingDisplay[r.recipe_ingredient_id] = r.display_text; });
      return {
        translation: {
          id: tr.id ?? null,
          title: tr.title ?? "",
          slug: tr.slug ?? "",
          description: tr.description ?? "",
          is_visible: tr.is_visible !== false,
          seo_title: tr.seo_title ?? "",
          seo_description: tr.seo_description ?? "",
          seo_keywords: tr.seo_keywords ?? "",
          seo_h1: tr.seo_h1 ?? "",
        },
        stepInstructions,
        ingDisplay,
      };
    },
  });
}

/* ─── Ingredient translation lookup (cached globally) ────────────── */
function useIngredientTranslations(lang: string, ingredientIds: string[]) {
  return useQuery({
    queryKey: ["ing-trans", lang, ingredientIds.slice().sort().join(",")],
    enabled: !!lang && ingredientIds.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const map: Record<string, string> = {};
      if (!ingredientIds.length) return map;
      const { data } = await supabase
        .from("ingredient_translations")
        .select("ingredient_id, name")
        .eq("language_code", lang)
        .in("ingredient_id", ingredientIds);
      (data || []).forEach((r: any) => { map[r.ingredient_id] = r.name; });
      return map;
    },
  });
}

/* ═════════════════════════════════════════════════════════════════ */

export default function RecipeLanguageEditor({ recipeId, recipeBaseSlug }: Props) {
  const { data: languages = [] } = useLanguages();
  const [activeLang, setActiveLang] = useState<string>("");

  useEffect(() => {
    if (!activeLang && languages.length) setActiveLang(languages[0].code);
  }, [languages, activeLang]);

  if (!languages.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
      <Label className="text-base font-semibold">Мультиязычный редактор</Label>
      <p className="text-xs text-muted-foreground mb-3">
        Картинка и структура общие. Каждая вкладка грузит данные только при открытии.
      </p>

      <Tabs value={activeLang} onValueChange={setActiveLang}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((l) => (
            <TabsTrigger key={l.code} value={l.code} className="gap-1">
              <span>{l.flag_emoji}</span>
              <span className="uppercase text-xs">{l.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((l) => (
          <TabsContent key={l.code} value={l.code} className="mt-3">
            {activeLang === l.code && (
              <LangPanel
                recipeId={recipeId}
                recipeBaseSlug={recipeBaseSlug}
                lang={l.code}
                langName={l.name}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ─── Per-language panel ─────────────────────────────────────────── */
function LangPanel({
  recipeId, recipeBaseSlug, lang, langName,
}: { recipeId: string; recipeBaseSlug: string; lang: string; langName: string }) {
  const qc = useQueryClient();
  const { data: structure } = useRecipeStructure(recipeId);
  const { data: langData, isLoading } = useLangData(recipeId, lang, true);

  const ingredientIds = useMemo(
    () => (structure?.ings || []).map((i) => i.ingredient_id),
    [structure],
  );
  const { data: ingTransNames = {} } = useIngredientTranslations(lang, ingredientIds);

  // Local editable state (mirrors loaded data; persisted via per-field saves)
  const [trans, setTrans] = useState<LangData["translation"] | null>(null);
  const [stepInstr, setStepInstr] = useState<Record<string, string>>({});
  const [ingDisp, setIngDisp] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (langData) {
      setTrans(langData.translation);
      setStepInstr(langData.stepInstructions);
      setIngDisp(langData.ingDisplay);
    }
  }, [langData]);

  const updateTrans = useCallback(
    (patch: Partial<LangData["translation"]>) => setTrans((p) => (p ? { ...p, ...patch } : p)),
    [],
  );

  const saveTranslation = async () => {
    if (!trans) return;
    if (!trans.title.trim()) { toast.error("Введите название"); return; }
    setSaving(true);
    try {
      const slug = trans.slug.trim() || slugify(trans.title);
      const payload = {
        recipe_id: recipeId,
        language_code: lang,
        title: trans.title.trim(),
        slug,
        description: trans.description.trim() || null,
        is_visible: trans.is_visible,
        seo_title: trans.seo_title.trim() || null,
        seo_description: trans.seo_description.trim() || null,
        seo_keywords: trans.seo_keywords.trim() || null,
        seo_h1: trans.seo_h1.trim() || null,
      };
      const table = (supabase.from("recipe_translations") as any);
      const res = trans.id
        ? await table.update(payload).eq("id", trans.id)
        : await table.insert(payload);
      if (res.error) throw res.error;
      toast.success(`Перевод (${lang.toUpperCase()}) сохранён`);
      qc.invalidateQueries({ queryKey: ["recipe-lang", recipeId, lang] });
    } catch (e: any) {
      toast.error("Ошибка: " + (e.message || "неизвестная"));
    } finally { setSaving(false); }
  };

  const saveSteps = async () => {
    if (!structure) return;
    setSaving(true);
    try {
      await supabase.from("recipe_step_translations")
        .delete()
        .eq("language_code", lang)
        .in("recipe_step_id", structure.steps.map((s) => s.id));
      const rows = structure.steps
        .filter((s) => (stepInstr[s.id] || "").trim())
        .map((s) => ({ recipe_step_id: s.id, language_code: lang, instruction: stepInstr[s.id].trim() }));
      if (rows.length) {
        const { error } = await supabase.from("recipe_step_translations").insert(rows);
        if (error) throw error;
      }
      toast.success("Шаги сохранены");
    } catch (e: any) {
      toast.error("Ошибка: " + (e.message || "неизвестная"));
    } finally { setSaving(false); }
  };

  const saveIngDisplay = async () => {
    if (!structure) return;
    setSaving(true);
    try {
      await supabase.from("recipe_ingredient_translations")
        .delete()
        .eq("language_code", lang)
        .in("recipe_ingredient_id", structure.ings.map((i) => i.id));
      const rows = structure.ings
        .filter((i) => (ingDisp[i.id] || "").trim())
        .map((i) => ({ recipe_ingredient_id: i.id, language_code: lang, display_text: ingDisp[i.id].trim() }));
      if (rows.length) {
        const { error } = await supabase.from("recipe_ingredient_translations").insert(rows);
        if (error) throw error;
      }
      toast.success("Ингредиенты сохранены");
    } catch (e: any) {
      toast.error("Ошибка: " + (e.message || "неизвестная"));
    } finally { setSaving(false); }
  };

  if (isLoading || !trans || !structure) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Загрузка…</div>;
  }

  const pageSlug = trans.slug || recipeBaseSlug;
  const pageUrl = `/${lang}/recipe/${pageSlug}`;

  return (
    <div className="space-y-4">
      {/* 1) Visibility */}
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <Label>Показывать на этом языке ({langName})</Label>
          <p className="text-xs text-muted-foreground">
            Если выключено: страница скрыта, исключена из sitemap и поиска, помечена noindex.
          </p>
        </div>
        <Switch
          checked={trans.is_visible}
          onCheckedChange={(v) => updateTrans({ is_visible: v })}
        />
      </div>

      {/* 2-3) Title / Slug / Description */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Название ({lang.toUpperCase()})</Label>
          <Input value={trans.title} onChange={(e) => updateTrans({ title: e.target.value })} />
        </div>
        <div>
          <Label>Slug ({lang.toUpperCase()})</Label>
          <Input value={trans.slug} placeholder="auto" onChange={(e) => updateTrans({ slug: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Описание</Label>
        <Textarea rows={3} value={trans.description} onChange={(e) => updateTrans({ description: e.target.value })} />
      </div>

      <Button size="sm" onClick={saveTranslation} disabled={saving}>
        <Save className="h-4 w-4 mr-1" /> Сохранить основное
      </Button>

      <Accordion type="multiple" className="space-y-1">
        {/* 4) Ingredients display text */}
        {structure.ings.length > 0 && (
          <AccordionItem value="ings">
            <AccordionTrigger className="text-sm font-semibold">
              Ингредиенты ({structure.ings.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {structure.ings.map((ing) => {
                const auto = ingTransNames[ing.ingredient_id] || ing.ingredient_name;
                return (
                  <div key={ing.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground min-w-[160px] truncate">{auto}</span>
                    <Input
                      placeholder={ing.display_text || auto}
                      value={ingDisp[ing.id] || ""}
                      onChange={(e) => setIngDisp((p) => ({ ...p, [ing.id]: e.target.value }))}
                    />
                  </div>
                );
              })}
              <Button size="sm" onClick={saveIngDisplay} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> Сохранить ингредиенты
              </Button>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 5) Steps */}
        {structure.steps.length > 0 && (
          <AccordionItem value="steps">
            <AccordionTrigger className="text-sm font-semibold">
              Шаги приготовления ({structure.steps.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {structure.steps.map((s) => (
                <div key={s.id} className="flex items-start gap-2">
                  <span className="mt-2 text-xs text-muted-foreground w-6 shrink-0">{s.step_number}.</span>
                  <Textarea
                    rows={2}
                    placeholder={s.instruction}
                    value={stepInstr[s.id] || ""}
                    onChange={(e) => setStepInstr((p) => ({ ...p, [s.id]: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              ))}
              <Button size="sm" onClick={saveSteps} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> Сохранить шаги
              </Button>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 6) Reviews (lazy) */}
        <AccordionItem value="reviews">
          <AccordionTrigger className="text-sm font-semibold">Отзывы</AccordionTrigger>
          <AccordionContent>
            <ReviewsPanel recipeId={recipeId} lang={lang} pageUrl={pageUrl} />
          </AccordionContent>
        </AccordionItem>

        {/* 7) SEO */}
        <AccordionItem value="seo">
          <AccordionTrigger className="text-sm font-semibold">SEO</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div>
              <Label>SEO Title</Label>
              <Input value={trans.seo_title} onChange={(e) => updateTrans({ seo_title: e.target.value })} />
            </div>
            <div>
              <Label>SEO Description</Label>
              <Textarea rows={2} value={trans.seo_description} onChange={(e) => updateTrans({ seo_description: e.target.value })} />
            </div>
            <div>
              <Label>SEO Keywords (через запятую)</Label>
              <Input value={trans.seo_keywords} onChange={(e) => updateTrans({ seo_keywords: e.target.value })} />
            </div>
            <div>
              <Label>SEO H1</Label>
              <Input value={trans.seo_h1} onChange={(e) => updateTrans({ seo_h1: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">SEO Slug = поле «Slug» сверху.</p>
            <Button size="sm" onClick={saveTranslation} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> Сохранить SEO
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 8) SEO phrases */}
        <AccordionItem value="phrases">
          <AccordionTrigger className="text-sm font-semibold">SEO поисковые фразы</AccordionTrigger>
          <AccordionContent>
            <PhrasesPanel recipeId={recipeId} lang={lang} />
          </AccordionContent>
        </AccordionItem>

        {/* 9) Link */}
        <AccordionItem value="link">
          <AccordionTrigger className="text-sm font-semibold">Ссылка на страницу</AccordionTrigger>
          <AccordionContent className="flex items-center gap-2">
            <Input readOnly value={pageUrl} />
            <Button variant="outline" size="icon" onClick={() => window.open(pageUrl, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="icon"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.origin + pageUrl);
                toast.success("Ссылка скопирована");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/* ─── Reviews (lazy, paged) ──────────────────────────────────────── */
function ReviewsPanel({ recipeId, lang, pageUrl }: { recipeId: string; lang: string; pageUrl: string }) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["recipe-reviews-admin", recipeId, lang, page],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const res = await (supabase.from("reviews") as any)
        .select("id, author_name, rating, text, is_visible, created_at", { count: "exact" })
        .eq("recipe_id", recipeId)
        .eq("language_code", lang)
        .order("created_at", { ascending: false })
        .range(from, to);
      return { rows: (res.data || []) as any[], count: res.count || 0 };
    },
    staleTime: 60 * 1000,
  });

  const remove = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Ошибка"); else { toast.success("Удалено"); refetch(); }
  };

  const toggleVisible = async (id: string, v: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_visible: v }).eq("id", id);
    if (error) toast.error("Ошибка"); else refetch();
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Загрузка…</div>;
  const { rows = [], count = 0 } = data || {};

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Всего: {count}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет отзывов на этом языке.</p>
      ) : (
        rows.map((r: any) => (
          <div key={r.id} className="rounded-md border border-border p-2 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{r.author_name}</span>
              <div className="flex items-center gap-1 text-xs text-primary">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{r.text}</p>
            <div className="flex items-center gap-2 text-xs">
              <Switch checked={r.is_visible} onCheckedChange={(v) => toggleVisible(r.id, v)} />
              <span className="text-muted-foreground">{r.is_visible ? "виден" : "скрыт"}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => window.open(pageUrl, "_blank")}>
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(r.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))
      )}
      {count > pageSize && (
        <div className="flex justify-between text-xs">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Назад</Button>
          <span className="self-center">Стр. {page + 1} / {Math.ceil(count / pageSize)}</span>
          <Button size="sm" variant="outline" disabled={(page + 1) * pageSize >= count} onClick={() => setPage((p) => p + 1)}>Вперёд →</Button>
        </div>
      )}
    </div>
  );
}

/* ─── SEO phrases manager ────────────────────────────────────────── */
function PhrasesPanel({ recipeId, lang }: { recipeId: string; lang: string }) {
  const qc = useQueryClient();
  const key = ["recipe-seo-phrases", recipeId, lang];
  const { data: phrases = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await (supabase.from("recipe_seo_phrases") as any)
        .select("id, phrase, sort_order")
        .eq("recipe_id", recipeId)
        .eq("language_code", lang)
        .order("sort_order");
      return (data || []) as { id: string; phrase: string; sort_order: number }[];
    },
    staleTime: 60 * 1000,
  });
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [search, setSearch] = useState("");

  const insertMany = async (list: string[]) => {
    const clean = list.map((s) => s.trim()).filter(Boolean);
    if (!clean.length) return;
    const base = phrases.length;
    const rows = clean.map((p, i) => ({
      recipe_id: recipeId, language_code: lang, phrase: p, sort_order: base + i,
    }));
    const { error } = await (supabase.from("recipe_seo_phrases") as any)
      .upsert(rows, { onConflict: "recipe_id,language_code,phrase", ignoreDuplicates: true });
    if (error) toast.error("Ошибка: " + error.message);
    else { toast.success(`Добавлено: ${clean.length}`); qc.invalidateQueries({ queryKey: key }); }
  };

  const remove = async (id: string) => {
    const { error } = await (supabase.from("recipe_seo_phrases") as any).delete().eq("id", id);
    if (error) toast.error("Ошибка"); else qc.invalidateQueries({ queryKey: key });
  };

  const filtered = search.trim()
    ? phrases.filter((p) => p.phrase.toLowerCase().includes(search.toLowerCase()))
    : phrases;

  if (isLoading) return <div className="text-sm text-muted-foreground">Загрузка…</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Добавить одну фразу" value={single} onChange={(e) => setSingle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && single.trim()) { e.preventDefault(); insertMany([single]); setSingle(""); } }} />
        <Button size="sm" onClick={() => { if (single.trim()) { insertMany([single]); setSingle(""); } }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Textarea rows={3} placeholder="Массовое добавление: по одной фразе на строку" value={bulk} onChange={(e) => setBulk(e.target.value)} />
        <Button size="sm" className="mt-1" onClick={() => { insertMany(bulk.split("\n")); setBulk(""); }} disabled={!bulk.trim()}>
          Добавить списком
        </Button>
      </div>
      <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="space-y-1">
        {filtered.length === 0
          ? <p className="text-xs text-muted-foreground">Фраз нет.</p>
          : filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded border border-border px-2 py-1">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{p.phrase}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(p.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        {filtered.length > 0 && <Badge variant="outline" className="text-xs">{filtered.length} фраз</Badge>}
      </div>
    </div>
  );
}
