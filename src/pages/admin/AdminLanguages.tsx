import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Plus, Pencil, Globe } from "lucide-react";
import { toast } from "sonner";

interface LanguageRow {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = { code: "", name: "", native_name: "", flag_emoji: "", is_active: true };

export default function AdminLanguages() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLanguages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("languages").select("*").order("sort_order");
    if (error) toast.error("Ошибка загрузки языков");
    else setLanguages((data as LanguageRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLanguages(); }, []);

  const openCreate = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (lang: LanguageRow) => {
    setEditingCode(lang.code);
    setForm({ code: lang.code, name: lang.name, native_name: lang.native_name, flag_emoji: lang.flag_emoji, is_active: lang.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error("Заполните код и название"); return; }
    setSaving(true);
    const payload = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      native_name: form.native_name.trim(),
      flag_emoji: form.flag_emoji.trim(),
      is_active: form.is_active,
    };

    let error;
    if (editingCode) {
      ({ error } = await supabase.from("languages").update(payload).eq("code", editingCode));
    } else {
      const maxOrder = languages.length ? Math.max(...languages.map(l => l.sort_order)) + 1 : 0;
      ({ error } = await supabase.from("languages").insert({ ...payload, sort_order: maxOrder }));
    }

    if (error) toast.error("Ошибка: " + error.message);
    else { toast.success(editingCode ? "Язык обновлён" : "Язык добавлен"); setDialogOpen(false); fetchLanguages(); }
    setSaving(false);
  };

  const toggleActive = async (code: string, isActive: boolean) => {
    const { error } = await supabase.from("languages").update({ is_active: !isActive }).eq("code", code);
    if (error) toast.error("Ошибка");
    else fetchLanguages();
  };

  const moveOrder = async (code: string, direction: "up" | "down") => {
    const idx = languages.findIndex(l => l.code === code);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === languages.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const updates = [
      supabase.from("languages").update({ sort_order: languages[swapIdx].sort_order }).eq("code", languages[idx].code),
      supabase.from("languages").update({ sort_order: languages[idx].sort_order }).eq("code", languages[swapIdx].code),
    ];
    await Promise.all(updates);
    fetchLanguages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-foreground">Языки</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Добавить</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : languages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Нет языков</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Флаг</TableHead>
                <TableHead>Код</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Нативное</TableHead>
                <TableHead>Активен</TableHead>
                <TableHead>Порядок</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((lang, idx) => (
                <TableRow key={lang.code}>
                  <TableCell className="text-2xl">{lang.flag_emoji}</TableCell>
                  <TableCell className="font-mono text-sm">{lang.code}</TableCell>
                  <TableCell>{lang.name}</TableCell>
                  <TableCell>{lang.native_name}</TableCell>
                  <TableCell>
                    <Switch checked={lang.is_active} onCheckedChange={() => toggleActive(lang.code, lang.is_active)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveOrder(lang.code, "up")}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" disabled={idx === languages.length - 1} onClick={() => moveOrder(lang.code, "down")}><ArrowDown className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(lang)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCode ? "Редактировать язык" : "Новый язык"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Код (ISO 639-1) *</Label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} placeholder="uk" maxLength={5} disabled={!!editingCode} />
            </div>
            <div>
              <Label>Название (EN) *</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ukrainian" />
            </div>
            <div>
              <Label>Нативное название</Label>
              <Input value={form.native_name} onChange={(e) => setForm(f => ({ ...f, native_name: e.target.value }))} placeholder="Українська" />
            </div>
            <div>
              <Label>Эмодзи флага</Label>
              <Input value={form.flag_emoji} onChange={(e) => setForm(f => ({ ...f, flag_emoji: e.target.value }))} placeholder="🇺🇦" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Активен</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
