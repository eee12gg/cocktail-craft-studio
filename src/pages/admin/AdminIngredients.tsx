import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, Search, Leaf } from "lucide-react";
import { toast } from "sonner";
import TranslationTabs from "@/components/admin/TranslationTabs";

const INGREDIENT_TYPES = [
  { value: "alcohol", label: "Алкоголь" },
  { value: "liqueur", label: "Ликёр" },
  { value: "syrup", label: "Сироп" },
  { value: "juice", label: "Сок" },
  { value: "fruit", label: "Фрукт" },
  { value: "mixer", label: "Миксер" },
  { value: "other", label: "Другое" },
] as const;

type IngredientType = typeof INGREDIENT_TYPES[number]["value"];

interface IngredientRow {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  type: IngredientType;
  description: string | null;
  image_url: string | null;
  image_thumb_url: string | null;
  created_at: string;
}

interface FormData {
  name: string;
  name_en: string;
  type: IngredientType;
  description: string;
  image_url: string | null;
  image_thumb_url: string | null;
}

const emptyForm: FormData = {
  name: "",
  name_en: "",
  type: "other",
  description: "",
  image_url: null,
  image_thumb_url: null,
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-|-$/g, "");
}

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchIngredients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name");
    if (error) {
      toast.error("Ошибка загрузки ингредиентов");
      console.error(error);
    } else {
      setIngredients((data as IngredientRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchIngredients(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ing: IngredientRow) => {
    setEditingId(ing.id);
    setForm({
      name: ing.name,
      name_en: ing.name_en || "",
      type: ing.type,
      description: ing.description || "",
      image_url: ing.image_url,
      image_thumb_url: ing.image_thumb_url,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Введите название ингредиента");
      return;
    }

    setSaving(true);
    const slug = toSlug(form.name_en || form.name);
    const payload = {
      name: form.name.trim(),
      name_en: form.name_en.trim() || null,
      slug,
      type: form.type,
      description: form.description.trim() || null,
      image_url: form.image_url,
      image_thumb_url: form.image_thumb_url,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("ingredients").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("ingredients").insert(payload));
    }

    if (error) {
      if (error.code === "23505") {
        toast.error("Ингредиент с таким slug уже существует");
      } else {
        toast.error("Ошибка сохранения: " + error.message);
      }
    } else {
      toast.success(editingId ? "Ингредиент обновлён" : "Ингредиент создан");
      setDialogOpen(false);
      fetchIngredients();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) {
      toast.error("Ошибка удаления: " + error.message);
    } else {
      toast.success("Ингредиент удалён");
      fetchIngredients();
    }
    setDeleteConfirm(null);
  };

  const filtered = ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.name_en && i.name_en.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeBadge = (type: IngredientType) => {
    const t = INGREDIENT_TYPES.find((t) => t.value === type);
    return <Badge variant="secondary">{t?.label || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-foreground">Ингредиенты</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Добавить
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Leaf className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search ? "Ничего не найдено" : "Пока нет ингредиентов. Создайте первый!"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ing) => (
                <TableRow key={ing.id}>
                  <TableCell>
                    {ing.image_thumb_url ? (
                      <img src={ing.image_thumb_url} alt={ing.name} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ing.name}</div>
                    {ing.name_en && <div className="text-xs text-muted-foreground">{ing.name_en}</div>}
                  </TableCell>
                  <TableCell>{getTypeBadge(ing.type)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(ing)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(ing.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать ингредиент" : "Новый ингредиент"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
              <ImageUpload
                value={form.image_url}
                onChange={(url, thumb) =>
                  setForm((f) => ({ ...f, image_url: url, image_thumb_url: thumb ?? null }))
                }
                folder="ingredients"
                aspectRatio={1}
              />
              <div className="space-y-3">
                <div>
                  <Label>Название *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Белый ром"
                  />
                </div>
                <div>
                  <Label>Name (EN)</Label>
                  <Input
                    value={form.name_en}
                    onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                    placeholder="White Rum"
                  />
                </div>
                <div>
                  <Label>Тип</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as IngredientType }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INGREDIENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Подробное описание ингредиента..."
                rows={4}
              />
            </div>
            {editingId && (
              <TranslationTabs type="ingredient" parentId={editingId} />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить ингредиент?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
