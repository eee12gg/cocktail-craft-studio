import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ImageUpload from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, Search, Wrench } from "lucide-react";
import { toast } from "sonner";
import EquipmentTranslationTabs from "@/components/admin/EquipmentTranslationTabs";

interface ToolRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_thumb_url: string | null;
  created_at: string;
}

interface FormData {
  name: string;
  description: string;
  image_url: string | null;
  image_thumb_url: string | null;
}

const emptyForm: FormData = { name: "", description: "", image_url: null, image_thumb_url: null };

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminTools() {
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipment").select("*").order("name");
    if (error) toast.error("Ошибка загрузки");
    else setTools((data as ToolRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTools(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (tool: ToolRow) => {
    setEditingId(tool.id);
    setForm({
      name: tool.name,
      description: tool.description || "",
      image_url: tool.image_url,
      image_thumb_url: tool.image_thumb_url,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Введите название"); return; }
    setSaving(true);
    const slug = toSlug(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      image_url: form.image_url,
      image_thumb_url: form.image_thumb_url,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("equipment").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("equipment").insert(payload));
    }

    if (error) {
      if (error.code === "23505") toast.error("Инструмент с таким именем уже существует");
      else toast.error("Ошибка: " + error.message);
    } else {
      toast.success(editingId ? "Инструмент обновлён" : "Инструмент создан");
      setDialogOpen(false);
      fetchTools();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления: " + error.message);
    else { toast.success("Инструмент удалён"); fetchTools(); }
    setDeleteConfirm(null);
  };

  const filtered = tools.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-foreground">Bar Tools</h1>
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
          <Wrench className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{search ? "Ничего не найдено" : "Пока нет инструментов."}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    {tool.image_thumb_url ? (
                      <img src={tool.image_thumb_url} alt={tool.name} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{tool.description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(tool)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(tool.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать инструмент" : "Новый инструмент"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
              <ImageUpload
                value={form.image_url}
                onChange={(url, thumb) => setForm((f) => ({ ...f, image_url: url, image_thumb_url: thumb ?? null }))}
                folder="tools"
                aspectRatio={1}
              />
              <div className="space-y-3">
                <div>
                  <Label>Название *</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Shaker" />
                </div>
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание инструмента..."
                rows={3}
              />
            </div>
            {editingId && <EquipmentTranslationTabs equipmentId={editingId} />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Удалить инструмент?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
