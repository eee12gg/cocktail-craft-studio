import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, Search, GlassWater, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import TranslationTabs from "@/components/admin/TranslationTabs";

const CATEGORIES = [
  { value: "cocktails", label: "Коктейли" },
  { value: "shots", label: "Шоты" },
  { value: "non-alcoholic", label: "Безалкогольные" },
] as const;

const BADGES = [
  { value: "__none__", label: "Нет" },
  { value: "Trending", label: "Trending" },
  { value: "Popular", label: "Popular" },
  { value: "Top 10", label: "Top 10" },
  { value: "New", label: "New" },
] as const;

const ALCOHOL_LEVELS = [
  { value: "None", label: "Без алкоголя" },
  { value: "Light", label: "Лёгкий" },
  { value: "Medium", label: "Средний" },
  { value: "Strong", label: "Крепкий" },
] as const;

type Category = "cocktails" | "shots" | "non-alcoholic";

interface RecipeRow {
  id: string;
  slug: string;
  title: string;
  category: Category;
  image_url: string | null;
  image_thumb_url: string | null;
  description: string | null;
  prep_time: string | null;
  alcohol_level: string;
  badge: string | null;
  is_published: boolean;
  created_at: string;
}

interface IngredientOption { id: string; name: string; }
interface EquipmentOption { id: string; name: string; }
interface RecipeOption { id: string; title: string; }

interface StepItem { instruction: string; }
interface IngredientItem { ingredient_id: string; amount_value: string; amount_unit: string; display_text: string; }
interface EquipmentItem { equipment_id: string; }
interface TagItem { tag: string; }
interface HashtagItem { hashtag_id: string; name: string; }
interface RecommendationItem { recommended_recipe_id: string; }

interface FormData {
  title: string;
  slug: string;
  category: Category;
  description: string;
  prep_time: string;
  alcohol_level: "None" | "Light" | "Medium" | "Strong";
  badge: "" | "Trending" | "Popular" | "Top 10" | "New";
  is_published: boolean;
  image_url: string | null;
  image_thumb_url: string | null;
  steps: StepItem[];
  ingredients: IngredientItem[];
  equipment: EquipmentItem[];
  tags: TagItem[];
  hashtags: HashtagItem[];
  recommendations: RecommendationItem[];
}

const emptyForm: FormData = {
  title: "", slug: "", category: "cocktails", description: "", prep_time: "5 min",
  alcohol_level: "Medium", badge: "", is_published: false,
  image_url: null, image_thumb_url: null,
  steps: [{ instruction: "" }],
  ingredients: [],
  equipment: [],
  tags: [],
  hashtags: [],
  recommendations: [],
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminDrinks() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Reference data
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);
  const [recipeOptions, setRecipeOptions] = useState<RecipeOption[]>([]);
  const [allHashtags, setAllHashtags] = useState<{ id: string; name: string }[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newTag, setNewTag] = useState("");

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("recipes").select("*").order("title");
    if (error) toast.error("Ошибка загрузки");
    else setRecipes((data as RecipeRow[]) || []);
    setLoading(false);
  };

  const fetchReferenceData = useCallback(async () => {
    const [ingRes, eqRes, htRes, recRes] = await Promise.all([
      supabase.from("ingredients").select("id, name").order("name"),
      supabase.from("equipment").select("id, name").order("name"),
      supabase.from("hashtags").select("id, name").order("name"),
      supabase.from("recipes").select("id, title").order("title"),
    ]);
    if (ingRes.data) setIngredientOptions(ingRes.data);
    if (eqRes.data) setEquipmentOptions(eqRes.data);
    if (htRes.data) setAllHashtags(htRes.data);
    if (recRes.data) setRecipeOptions(recRes.data);
  }, []);

  useEffect(() => { fetchRecipes(); fetchReferenceData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = async (recipe: RecipeRow) => {
    setEditingId(recipe.id);
    // Load related data
    const [stepsRes, ingRes, eqRes, tagsRes, htRes, recRes] = await Promise.all([
      supabase.from("recipe_steps").select("*").eq("recipe_id", recipe.id).order("step_number"),
      supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipe.id).order("sort_order"),
      supabase.from("recipe_equipment").select("equipment_id").eq("recipe_id", recipe.id),
      supabase.from("recipe_tags").select("tag").eq("recipe_id", recipe.id),
      supabase.from("recipe_hashtags").select("hashtag_id, hashtags(name)").eq("recipe_id", recipe.id),
      supabase.from("recipe_recommendations").select("recommended_recipe_id").eq("recipe_id", recipe.id).order("sort_order"),
    ]);

    setForm({
      title: recipe.title,
      slug: recipe.slug,
      category: recipe.category,
      description: recipe.description || "",
      prep_time: recipe.prep_time || "",
      alcohol_level: recipe.alcohol_level as FormData["alcohol_level"],
      badge: (recipe.badge || "") as FormData["badge"],
      is_published: recipe.is_published,
      image_url: recipe.image_url,
      image_thumb_url: recipe.image_thumb_url,
      steps: stepsRes.data?.map((s: any) => ({ instruction: s.instruction })) || [{ instruction: "" }],
      ingredients: ingRes.data?.map((i: any) => ({
        ingredient_id: i.ingredient_id,
        amount_value: i.amount_value?.toString() || "",
        amount_unit: i.amount_unit || "",
        display_text: i.display_text,
      })) || [],
      equipment: eqRes.data?.map((e: any) => ({ equipment_id: e.equipment_id })) || [],
      tags: tagsRes.data?.map((t: any) => ({ tag: t.tag })) || [],
      hashtags: htRes.data?.map((h: any) => ({ hashtag_id: h.hashtag_id, name: (h as any).hashtags?.name || "" })) || [],
      recommendations: recRes.data?.map((r: any) => ({ recommended_recipe_id: r.recommended_recipe_id })) || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Введите название"); return; }
    setSaving(true);
    const slug = form.slug || toSlug(form.title);

    try {
      const payload = {
        title: form.title.trim(),
        slug,
        category: form.category,
        description: form.description.trim() || null,
        prep_time: form.prep_time.trim() || null,
        alcohol_level: form.alcohol_level,
        badge: form.badge || null,
        is_published: form.is_published,
        image_url: form.image_url,
        image_thumb_url: form.image_thumb_url,
      };

      let recipeId = editingId;
      if (editingId) {
        const { error } = await supabase.from("recipes").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("recipes").insert(payload).select("id").single();
        if (error) throw error;
        recipeId = data.id;
      }

      // Save related data - delete old and insert new
      await Promise.all([
        supabase.from("recipe_steps").delete().eq("recipe_id", recipeId!),
        supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId!),
        supabase.from("recipe_equipment").delete().eq("recipe_id", recipeId!),
        supabase.from("recipe_tags").delete().eq("recipe_id", recipeId!),
        supabase.from("recipe_hashtags").delete().eq("recipe_id", recipeId!),
        supabase.from("recipe_recommendations").delete().eq("recipe_id", recipeId!),
      ]);

      const validSteps = form.steps.filter((s) => s.instruction.trim());
      const inserts = [];

      if (validSteps.length) {
        inserts.push(supabase.from("recipe_steps").insert(
          validSteps.map((s, i) => ({ recipe_id: recipeId!, step_number: i + 1, instruction: s.instruction.trim() }))
        ));
      }
      if (form.ingredients.length) {
        inserts.push(supabase.from("recipe_ingredients").insert(
          form.ingredients.map((ing, i) => ({
            recipe_id: recipeId!,
            ingredient_id: ing.ingredient_id,
            amount_value: ing.amount_value ? parseFloat(ing.amount_value) : null,
            amount_unit: ing.amount_unit || null,
            display_text: ing.display_text,
            sort_order: i,
          }))
        ));
      }
      if (form.equipment.length) {
        inserts.push(supabase.from("recipe_equipment").insert(
          form.equipment.map((e) => ({ recipe_id: recipeId!, equipment_id: e.equipment_id }))
        ));
      }
      if (form.tags.length) {
        inserts.push(supabase.from("recipe_tags").insert(
          form.tags.map((t) => ({ recipe_id: recipeId!, tag: t.tag }))
        ));
      }
      if (form.hashtags.length) {
        inserts.push(supabase.from("recipe_hashtags").insert(
          form.hashtags.map((h) => ({ recipe_id: recipeId!, hashtag_id: h.hashtag_id }))
        ));
      }
      if (form.recommendations.length) {
        inserts.push(supabase.from("recipe_recommendations").insert(
          form.recommendations.map((r, i) => ({ recipe_id: recipeId!, recommended_recipe_id: r.recommended_recipe_id, sort_order: i }))
        ));
      }

      const results = await Promise.all(inserts);
      const insertError = results.find((r) => r.error);
      if (insertError?.error) throw insertError.error;

      toast.success(editingId ? "Рецепт обновлён" : "Рецепт создан");
      setDialogOpen(false);
      fetchRecipes();
      fetchReferenceData();
    } catch (err: any) {
      toast.error("Ошибка: " + (err.message || "неизвестная"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else { toast.success("Рецепт удалён"); fetchRecipes(); }
    setDeleteConfirm(null);
  };

  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, { instruction: "" }] }));
  const removeStep = (i: number) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i: number, val: string) => setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { instruction: val } : s) }));

  const addIngredient = (id: string) => {
    if (form.ingredients.find((i) => i.ingredient_id === id)) return;
    const name = ingredientOptions.find((o) => o.id === id)?.name || "";
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ingredient_id: id, amount_value: "", amount_unit: "ml", display_text: name }] }));
  };
  const removeIngredient = (i: number) => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const addEquipment = async (name?: string) => {
    if (name) {
      const slug = toSlug(name);
      const { data, error } = await supabase.from("equipment").insert({ name: name.trim(), slug }).select("id, name").single();
      if (error && error.code === "23505") {
        const { data: existing } = await supabase.from("equipment").select("id, name").eq("name", name.trim()).single();
        if (existing && !form.equipment.find((e) => e.equipment_id === existing.id)) {
          setForm((f) => ({ ...f, equipment: [...f.equipment, { equipment_id: existing.id }] }));
          setEquipmentOptions((prev) => prev.find((p) => p.id === existing.id) ? prev : [...prev, existing]);
        }
      } else if (data) {
        setForm((f) => ({ ...f, equipment: [...f.equipment, { equipment_id: data.id }] }));
        setEquipmentOptions((prev) => [...prev, data]);
      }
      setNewEquipment("");
    }
  };

  const addHashtagToForm = async (name?: string) => {
    if (name) {
      const cleanName = name.startsWith("#") ? name : `#${name}`;
      let ht = allHashtags.find((h) => h.name === cleanName);
      if (!ht) {
        const { data, error } = await supabase.from("hashtags").insert({ name: cleanName }).select("id, name").single();
        if (error && error.code === "23505") {
          const { data: existing } = await supabase.from("hashtags").select("id, name").eq("name", cleanName).single();
          ht = existing || undefined;
        } else if (data) {
          ht = data;
          setAllHashtags((prev) => [...prev, data]);
        }
      }
      if (ht && !form.hashtags.find((h) => h.hashtag_id === ht!.id)) {
        setForm((f) => ({ ...f, hashtags: [...f.hashtags, { hashtag_id: ht!.id, name: ht!.name }] }));
      }
      setNewHashtag("");
    }
  };

  const filtered = recipes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-foreground">Напитки</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Добавить</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <GlassWater className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{search ? "Ничего не найдено" : "Пока нет напитков. Создайте первый!"}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.image_thumb_url ? (
                      <img src={r.image_thumb_url} alt={r.title} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <GlassWater className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.title}</div>
                    {r.badge && <Badge variant="secondary" className="mt-1">{r.badge}</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{CATEGORIES.find((c) => c.value === r.category)?.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.is_published ? "default" : "secondary"}>
                      {r.is_published ? "Опубликован" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Recipe editor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать рецепт" : "Новый рецепт"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Basic info */}
            <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
              <ImageUpload
                value={form.image_url}
                onChange={(url, thumb) => setForm((f) => ({ ...f, image_url: url, image_thumb_url: thumb ?? null }))}
                folder="recipes"
                aspectRatio={4 / 3}
              />
              <div className="space-y-3">
                <div>
                  <Label>Название *</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || toSlug(e.target.value) }))} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Категория</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Крепость</Label>
                    <Select value={form.alcohol_level} onValueChange={(v) => setForm((f) => ({ ...f, alcohol_level: v as FormData["alcohol_level"] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ALCOHOL_LEVELS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Время приготовления</Label>
                <Input value={form.prep_time} onChange={(e) => setForm((f) => ({ ...f, prep_time: e.target.value }))} placeholder="5 min" />
              </div>
              <div>
                <Label>Бейдж</Label>
                <Select value={form.badge || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, badge: v === "__none__" ? "" : v as FormData["badge"] }))}>
                  <SelectTrigger><SelectValue placeholder="Нет" /></SelectTrigger>
                  <SelectContent>{BADGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))} />
              <Label>Опубликован</Label>
            </div>

            {/* Ingredients */}
            <div>
              <Label className="text-base font-semibold">Ингредиенты</Label>
              <div className="mt-2 space-y-2">
                {form.ingredients.map((ing, i) => {
                  const opt = ingredientOptions.find((o) => o.id === ing.ingredient_id);
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium min-w-[100px]">{opt?.name || "?"}</span>
                      <Input className="w-20" placeholder="Кол-во" value={ing.amount_value}
                        onChange={(e) => setForm((f) => ({ ...f, ingredients: f.ingredients.map((item, idx) => idx === i ? { ...item, amount_value: e.target.value } : item) }))} />
                      <Input className="w-16" placeholder="ед." value={ing.amount_unit}
                        onChange={(e) => setForm((f) => ({ ...f, ingredients: f.ingredients.map((item, idx) => idx === i ? { ...item, amount_unit: e.target.value } : item) }))} />
                      <Input className="flex-1" placeholder="Отображение" value={ing.display_text}
                        onChange={(e) => setForm((f) => ({ ...f, ingredients: f.ingredients.map((item, idx) => idx === i ? { ...item, display_text: e.target.value } : item) }))} />
                      <Button variant="ghost" size="icon" onClick={() => removeIngredient(i)}><X className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
                <Select onValueChange={addIngredient}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="+ Добавить ингредиент" /></SelectTrigger>
                  <SelectContent>
                    {ingredientOptions.filter((o) => !form.ingredients.find((i) => i.ingredient_id === o.id)).map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Steps */}
            <div>
              <Label className="text-base font-semibold">Шаги приготовления</Label>
              <div className="mt-2 space-y-2">
                {form.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-2 text-sm text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                    <Textarea value={step.instruction} onChange={(e) => updateStep(i, e.target.value)} rows={2} className="flex-1" placeholder="Опишите шаг..." />
                    {form.steps.length > 1 && (
                      <Button variant="ghost" size="icon" className="mt-1" onClick={() => removeStep(i)}><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep}><Plus className="h-4 w-4 mr-1" /> Шаг</Button>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <Label className="text-base font-semibold">Оборудование</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.equipment.map((e, i) => {
                  const opt = equipmentOptions.find((o) => o.id === e.equipment_id);
                  return (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {opt?.name || "?"}
                      <button onClick={() => setForm((f) => ({ ...f, equipment: f.equipment.filter((_, idx) => idx !== i) }))}><X className="h-3 w-3" /></button>
                    </Badge>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <Select onValueChange={(id) => {
                  if (!form.equipment.find((e) => e.equipment_id === id)) {
                    setForm((f) => ({ ...f, equipment: [...f.equipment, { equipment_id: id }] }));
                  }
                }}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Выбрать оборудование" /></SelectTrigger>
                  <SelectContent>
                    {equipmentOptions.filter((o) => !form.equipment.find((e) => e.equipment_id === o.id)).map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input placeholder="Новое" value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)} className="w-28" />
                  <Button variant="outline" size="icon" onClick={() => addEquipment(newEquipment)} disabled={!newEquipment.trim()}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-base font-semibold">Теги</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {t.tag}
                    <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="Добавить тег" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) { e.preventDefault(); setForm((f) => ({ ...f, tags: [...f.tags, { tag: newTag.trim() }] })); setNewTag(""); } }} />
                <Button variant="outline" size="icon" onClick={() => { if (newTag.trim()) { setForm((f) => ({ ...f, tags: [...f.tags, { tag: newTag.trim() }] })); setNewTag(""); } }} disabled={!newTag.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <Label className="text-base font-semibold">Хештеги</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.hashtags.map((h, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {h.name}
                    <button onClick={() => setForm((f) => ({ ...f, hashtags: f.hashtags.filter((_, idx) => idx !== i) }))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input placeholder="#summer" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newHashtag.trim()) { e.preventDefault(); addHashtagToForm(newHashtag.trim()); } }} />
                <Button variant="outline" size="icon" onClick={() => addHashtagToForm(newHashtag.trim())} disabled={!newHashtag.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <Label className="text-base font-semibold">Рекомендуемые напитки</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.recommendations.map((r, i) => {
                  const opt = recipeOptions.find((o) => o.id === r.recommended_recipe_id);
                  return (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {opt?.title || "?"}
                      <button onClick={() => setForm((f) => ({ ...f, recommendations: f.recommendations.filter((_, idx) => idx !== i) }))}><X className="h-3 w-3" /></button>
                    </Badge>
                  );
                })}
              </div>
              <Select onValueChange={(id) => {
                if (!form.recommendations.find((r) => r.recommended_recipe_id === id) && id !== editingId) {
                  setForm((f) => ({ ...f, recommendations: [...f.recommendations, { recommended_recipe_id: id }] }));
                }
              }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="+ Добавить рекомендацию" /></SelectTrigger>
                <SelectContent>
                  {recipeOptions.filter((o) => o.id !== editingId && !form.recommendations.find((r) => r.recommended_recipe_id === o.id)).map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Удалить рецепт?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Все связанные данные будут удалены.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
