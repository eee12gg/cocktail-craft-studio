/**
 * Full per-language translation editor for a recipe.
 * Edits: title, description, slug, steps, recipe-ingredient display text.
 * Image and structural data stay shared across languages.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Language { code: string; name: string; flag_emoji: string; }

interface RecipeStep { id: string; step_number: number; instruction: string; }
interface RecipeIng { id: string; sort_order: number; display_text: string; ingredient_name: string; }

interface Props {
  recipeId: string;
}

interface PerLang {
  title: string;
  slug: string;
  description: string;
  steps: Record<string, string>; // step_id -> instruction
  ingredients: Record<string, string>; // ri_id -> display_text
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function RecipeTranslationTabs({ recipeId }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [ings, setIngs] = useState<RecipeIng[]>([]);
  const [data, setData] = useState<Record<string, PerLang>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [langRes, stepsRes, ingsRes, recTransRes, stepTransRes, ingTransRes] = await Promise.all([
      supabase.from("languages").select("code, name, flag_emoji").eq("is_active", true).order("sort_order"),
      supabase.from("recipe_steps").select("id, step_number, instruction").eq("recipe_id", recipeId).order("step_number"),
      supabase.from("recipe_ingredients")
        .select("id, sort_order, display_text, ingredient:ingredients(name)")
        .eq("recipe_id", recipeId).order("sort_order"),
      supabase.from("recipe_translations").select("*").eq("recipe_id", recipeId),
      supabase.from("recipe_step_translations").select("*"),
      supabase.from("recipe_ingredient_translations").select("*"),
    ]);

    const langs = (langRes.data || []).filter((l: any) => l.code !== "en");
    setLanguages(langs);

    const stepRows: RecipeStep[] = (stepsRes.data || []) as any;
    const ingRows: RecipeIng[] = (ingsRes.data || []).map((i: any) => ({
      id: i.id, sort_order: i.sort_order, display_text: i.display_text,
      ingredient_name: i.ingredient?.name || "?",
    }));
    setSteps(stepRows);
    setIngs(ingRows);

    const stepIds = new Set(stepRows.map((s) => s.id));
    const ingIds = new Set(ingRows.map((i) => i.id));

    const map: Record<string, PerLang> = {};
    langs.forEach((l: any) => {
      map[l.code] = { title: "", slug: "", description: "", steps: {}, ingredients: {} };
    });
    (recTransRes.data || []).forEach((r: any) => {
      if (map[r.language_code]) {
        map[r.language_code].title = r.title || "";
        map[r.language_code].slug = r.slug || "";
        map[r.language_code].description = r.description || "";
      }
    });
    (stepTransRes.data || []).forEach((s: any) => {
      if (map[s.language_code] && stepIds.has(s.recipe_step_id)) {
        map[s.language_code].steps[s.recipe_step_id] = s.instruction;
      }
    });
    (ingTransRes.data || []).forEach((s: any) => {
      if (map[s.language_code] && ingIds.has(s.recipe_ingredient_id)) {
        map[s.language_code].ingredients[s.recipe_ingredient_id] = s.display_text;
      }
    });
    setData(map);
  }, [recipeId]);

  useEffect(() => { if (recipeId) load(); }, [recipeId, load]);

  const update = (lang: string, patch: Partial<PerLang>) =>
    setData((p) => ({ ...p, [lang]: { ...p[lang], ...patch } }));

  const save = async (lang: string) => {
    const d = data[lang];
    if (!d?.title?.trim()) { toast.error("Введите название"); return; }
    setSaving(lang);

    try {
      const slug = d.slug?.trim() || slugify(d.title);

      // Recipe translation upsert
      const { data: existRec } = await supabase
        .from("recipe_translations").select("id")
        .eq("recipe_id", recipeId).eq("language_code", lang).maybeSingle();
      const recPayload = { recipe_id: recipeId, language_code: lang, title: d.title.trim(), slug, description: d.description?.trim() || null };
      const recErr = existRec
        ? (await supabase.from("recipe_translations").update(recPayload).eq("id", existRec.id)).error
        : (await supabase.from("recipe_translations").insert(recPayload)).error;
      if (recErr) throw recErr;

      // Steps: delete then insert non-empty
      await supabase.from("recipe_step_translations").delete().eq("language_code", lang).in("recipe_step_id", steps.map(s => s.id));
      const stepRows = steps
        .filter((s) => (d.steps[s.id] || "").trim())
        .map((s) => ({ recipe_step_id: s.id, language_code: lang, instruction: d.steps[s.id].trim() }));
      if (stepRows.length) {
        const { error } = await supabase.from("recipe_step_translations").insert(stepRows);
        if (error) throw error;
      }

      // Ingredients display_text
      await supabase.from("recipe_ingredient_translations").delete().eq("language_code", lang).in("recipe_ingredient_id", ings.map(i => i.id));
      const ingRows = ings
        .filter((i) => (d.ingredients[i.id] || "").trim())
        .map((i) => ({ recipe_ingredient_id: i.id, language_code: lang, display_text: d.ingredients[i.id].trim() }));
      if (ingRows.length) {
        const { error } = await supabase.from("recipe_ingredient_translations").insert(ingRows);
        if (error) throw error;
      }

      toast.success(`Перевод (${lang}) сохранён`);
    } catch (e: any) {
      toast.error("Ошибка: " + (e.message || "неизвестная"));
    } finally {
      setSaving(null);
    }
  };

  if (languages.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
      <Label className="text-base font-semibold">Переводы (полный редактор)</Label>
      <p className="text-xs text-muted-foreground mb-3">Картинка и структура общие. Текстовые поля заполняются для каждого языка отдельно.</p>
      <Tabs defaultValue={languages[0]?.code}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((l) => (
            <TabsTrigger key={l.code} value={l.code} className="gap-1">
              <span>{l.flag_emoji}</span><span className="uppercase text-xs">{l.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {languages.map((l) => {
          const d = data[l.code] || { title: "", slug: "", description: "", steps: {}, ingredients: {} };
          return (
            <TabsContent key={l.code} value={l.code} className="space-y-4 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Название ({l.name})</Label>
                  <Input value={d.title} onChange={(e) => update(l.code, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Slug ({l.code})</Label>
                  <Input value={d.slug} onChange={(e) => update(l.code, { slug: e.target.value })} placeholder="auto" />
                </div>
              </div>
              <div>
                <Label>Описание ({l.name})</Label>
                <Textarea value={d.description} onChange={(e) => update(l.code, { description: e.target.value })} rows={3} />
              </div>

              {ings.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Ингредиенты — текст отображения ({l.name})</Label>
                  <div className="mt-2 space-y-2">
                    {ings.map((ing) => (
                      <div key={ing.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground min-w-[140px] truncate">{ing.ingredient_name}</span>
                        <Input
                          placeholder={ing.display_text}
                          value={d.ingredients[ing.id] || ""}
                          onChange={(e) => update(l.code, { ingredients: { ...d.ingredients, [ing.id]: e.target.value } })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Шаги приготовления ({l.name})</Label>
                  <div className="mt-2 space-y-2">
                    {steps.map((s) => (
                      <div key={s.id} className="flex items-start gap-2">
                        <span className="mt-2 text-xs text-muted-foreground w-6 shrink-0">{s.step_number}.</span>
                        <Textarea
                          placeholder={s.instruction}
                          value={d.steps[s.id] || ""}
                          onChange={(e) => update(l.code, { steps: { ...d.steps, [s.id]: e.target.value } })}
                          rows={2}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button size="sm" onClick={() => save(l.code)} disabled={saving === l.code}>
                <Save className="h-4 w-4 mr-1" />
                {saving === l.code ? "Сохранение..." : `Сохранить (${l.code.toUpperCase()})`}
              </Button>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
