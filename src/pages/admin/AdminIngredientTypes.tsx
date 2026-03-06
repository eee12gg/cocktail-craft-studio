import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface TypeRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminIngredientTypes() {
  const [types, setTypes] = useState<TypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TypeRow | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [deleteAction, setDeleteAction] = useState<"move" | "other" | "cancel">("cancel");
  const [moveToTypeId, setMoveToTypeId] = useState<string>("");

  const fetchTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("ingredient_types").select("*").order("name");
    if (error) toast.error("Ошибка загрузки");
    else setTypes((data as TypeRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const openCreate = () => { setEditingId(null); setName(""); setDialogOpen(true); };
  const openEdit = (t: TypeRow) => { setEditingId(t.id); setName(t.name); setDialogOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Введите название"); return; }
    setSaving(true);
    const slug = toSlug(name);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("ingredient_types").update({ name: name.trim(), slug }).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("ingredient_types").insert({ name: name.trim(), slug }));
    }
    if (error) {
      if (error.code === "23505") toast.error("Тип с таким именем уже существует");
      else toast.error("Ошибка: " + error.message);
    } else {
      toast.success(editingId ? "Тип обновлён" : "Тип создан");
      setDialogOpen(false);
      fetchTypes();
    }
    setSaving(false);
  };

  const initiateDelete = async (t: TypeRow) => {
    // Check usage
    const { count } = await supabase
      .from("ingredients")
      .select("id", { count: "exact", head: true })
      .eq("type_id", t.id);
    setUsageCount(count || 0);
    setDeleteTarget(t);
    setDeleteAction(count ? "cancel" : "cancel");
    setMoveToTypeId("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (usageCount > 0) {
      if (deleteAction === "move" && moveToTypeId) {
        await supabase.from("ingredients").update({ type_id: moveToTypeId }).eq("type_id", deleteTarget.id);
      } else if (deleteAction === "other") {
        const otherType = types.find((t) => t.slug === "other");
        if (otherType) {
          await supabase.from("ingredients").update({ type_id: otherType.id }).eq("type_id", deleteTarget.id);
        }
      } else {
        setDeleteTarget(null);
        return;
      }
    }

    const { error } = await supabase.from("ingredient_types").delete().eq("id", deleteTarget.id);
    if (error) toast.error("Ошибка удаления: " + error.message);
    else { toast.success("Тип удалён"); fetchTypes(); }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-foreground">Типы ингредиентов</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Добавить</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : types.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Пока нет типов.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => initiateDelete(t)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать тип" : "Новый тип"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Название *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Garnish" />
            {name && <p className="mt-1 text-xs text-muted-foreground">Slug: {toSlug(name)}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation with usage check */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Удалить тип «{deleteTarget?.name}»?</DialogTitle></DialogHeader>
          {usageCount > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Этот тип используется в <strong>{usageCount}</strong> ингредиентах. Выберите действие:
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="deleteAction" checked={deleteAction === "move"} onChange={() => setDeleteAction("move")} />
                  <span className="text-sm">Перенести в другой тип</span>
                </label>
                {deleteAction === "move" && (
                  <Select value={moveToTypeId} onValueChange={setMoveToTypeId}>
                    <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
                    <SelectContent>
                      {types.filter((t) => t.id !== deleteTarget?.id).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <label className="flex items-center gap-2">
                  <input type="radio" name="deleteAction" checked={deleteAction === "other"} onChange={() => setDeleteAction("other")} />
                  <span className="text-sm">Установить тип «Other»</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="deleteAction" checked={deleteAction === "cancel"} onChange={() => setDeleteAction("cancel")} />
                  <span className="text-sm">Отменить удаление</span>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Этот тип не используется. Удалить?</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteAction === "cancel" || (deleteAction === "move" && !moveToTypeId)}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
