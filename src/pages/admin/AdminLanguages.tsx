import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const KNOWN_LANGUAGES = [
  { code: "en", name: "English", native_name: "English", flag_emoji: "🇬🇧" },
  { code: "de", name: "German", native_name: "Deutsch", flag_emoji: "🇩🇪" },
  { code: "fr", name: "French", native_name: "Français", flag_emoji: "🇫🇷" },
  { code: "es", name: "Spanish", native_name: "Español", flag_emoji: "🇪🇸" },
  { code: "it", name: "Italian", native_name: "Italiano", flag_emoji: "🇮🇹" },
  { code: "pt", name: "Portuguese", native_name: "Português", flag_emoji: "🇵🇹" },
  { code: "pl", name: "Polish", native_name: "Polski", flag_emoji: "🇵🇱" },
  { code: "uk", name: "Ukrainian", native_name: "Українська", flag_emoji: "🇺🇦" },
  { code: "ru", name: "Russian", native_name: "Русский", flag_emoji: "🇷🇺" },
  { code: "cs", name: "Czech", native_name: "Čeština", flag_emoji: "🇨🇿" },
  { code: "sk", name: "Slovak", native_name: "Slovenčina", flag_emoji: "🇸🇰" },
  { code: "nl", name: "Dutch", native_name: "Nederlands", flag_emoji: "🇳🇱" },
  { code: "sv", name: "Swedish", native_name: "Svenska", flag_emoji: "🇸🇪" },
  { code: "no", name: "Norwegian", native_name: "Norsk", flag_emoji: "🇳🇴" },
  { code: "da", name: "Danish", native_name: "Dansk", flag_emoji: "🇩🇰" },
  { code: "fi", name: "Finnish", native_name: "Suomi", flag_emoji: "🇫🇮" },
  { code: "ja", name: "Japanese", native_name: "日本語", flag_emoji: "🇯🇵" },
  { code: "ko", name: "Korean", native_name: "한국어", flag_emoji: "🇰🇷" },
  { code: "zh", name: "Chinese", native_name: "中文", flag_emoji: "🇨🇳" },
  { code: "ar", name: "Arabic", native_name: "العربية", flag_emoji: "🇸🇦" },
  { code: "tr", name: "Turkish", native_name: "Türkçe", flag_emoji: "🇹🇷" },
  { code: "hi", name: "Hindi", native_name: "हिन्दी", flag_emoji: "🇮🇳" },
  { code: "th", name: "Thai", native_name: "ไทย", flag_emoji: "🇹🇭" },
  { code: "vi", name: "Vietnamese", native_name: "Tiếng Việt", flag_emoji: "🇻🇳" },
  { code: "ro", name: "Romanian", native_name: "Română", flag_emoji: "🇷🇴" },
  { code: "hu", name: "Hungarian", native_name: "Magyar", flag_emoji: "🇭🇺" },
  { code: "el", name: "Greek", native_name: "Ελληνικά", flag_emoji: "🇬🇷" },
  { code: "bg", name: "Bulgarian", native_name: "Български", flag_emoji: "🇧🇬" },
  { code: "hr", name: "Croatian", native_name: "Hrvatski", flag_emoji: "🇭🇷" },
  { code: "sr", name: "Serbian", native_name: "Српски", flag_emoji: "🇷🇸" },
  { code: "lt", name: "Lithuanian", native_name: "Lietuvių", flag_emoji: "🇱🇹" },
  { code: "lv", name: "Latvian", native_name: "Latviešu", flag_emoji: "🇱🇻" },
  { code: "et", name: "Estonian", native_name: "Eesti", flag_emoji: "🇪🇪" },
  { code: "ka", name: "Georgian", native_name: "ქართული", flag_emoji: "🇬🇪" },
  { code: "he", name: "Hebrew", native_name: "עברית", flag_emoji: "🇮🇱" },
  { code: "id", name: "Indonesian", native_name: "Bahasa Indonesia", flag_emoji: "🇮🇩" },
  { code: "ms", name: "Malay", native_name: "Bahasa Melayu", flag_emoji: "🇲🇾" },
];

const emptyForm = { code: "", name: "", native_name: "", flag_emoji: "", is_active: true };

function LanguageSelect({ existingCodes, value, onSelect }: {
  existingCodes: string[];
  value: string;
  onSelect: (lang: typeof KNOWN_LANGUAGES[number]) => void;
}) {
  const available = KNOWN_LANGUAGES.filter(l => !existingCodes.includes(l.code));

  return (
    <Select
      value={value}
      onValueChange={(code) => {
        const lang = KNOWN_LANGUAGES.find(l => l.code === code);
        if (lang) onSelect(lang);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Выберите язык из списка..." />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {available.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag_emoji}</span>
              <span>{lang.name}</span>
              <span className="text-muted-foreground">({lang.native_name})</span>
            </span>
          </SelectItem>
        ))}
        {available.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">Все языки уже добавлены</div>
        )}
      </SelectContent>
    </Select>
  );
}

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
            {!editingCode ? (
              <div>
                <Label>Выберите язык *</Label>
                <LanguageSelect
                  existingCodes={languages.map(l => l.code)}
                  value={form.code}
                  onSelect={(lang) => {
                    setForm(f => ({
                      ...f,
                      code: lang.code,
                      name: lang.name,
                      native_name: lang.native_name,
                      flag_emoji: lang.flag_emoji,
                    }));
                  }}
                />
              </div>
            ) : null}
            <div>
              <Label>Код (ISO 639-1) *</Label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} placeholder="uk" maxLength={5} disabled={!!editingCode || !!KNOWN_LANGUAGES.find(l => l.code === form.code)} />
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
