import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag_emoji: string;
}

interface Props {
  equipmentId: string;
}

export default function EquipmentTranslationTabs({ equipmentId }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const langRes = await supabase.from("languages").select("code, name, flag_emoji").eq("is_active", true).order("sort_order");
      const transRes = await supabase.from("equipment_translations").select("*").eq("equipment_id", equipmentId);
      if (langRes.data) setLanguages(langRes.data.filter((l: any) => l.code !== "en"));
      if (transRes.data) {
        const map: Record<string, { name: string; description: string }> = {};
        transRes.data.forEach((row: any) => {
          map[row.language_code] = { name: row.name || "", description: row.description || "" };
        });
        setTranslations(map);
      }
    };
    if (equipmentId) load();
  }, [equipmentId]);

  const update = (lang: string, field: "name" | "description", value: string) => {
    setTranslations((p) => ({ ...p, [lang]: { ...(p[lang] || { name: "", description: "" }), [field]: value } }));
  };

  const save = async (lang: string) => {
    const data = translations[lang];
    if (!data?.name?.trim()) { toast.error("Введите название"); return; }
    setSaving(lang);
    const payload = {
      equipment_id: equipmentId,
      language_code: lang,
      name: data.name.trim(),
      description: data.description?.trim() || null,
    };
    const { data: existing } = await supabase
      .from("equipment_translations").select("id")
      .eq("equipment_id", equipmentId).eq("language_code", lang).maybeSingle();
    const { error } = existing
      ? await supabase.from("equipment_translations").update(payload).eq("id", existing.id)
      : await supabase.from("equipment_translations").insert(payload);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success(`Перевод (${lang}) сохранён`);
    setSaving(null);
  };

  if (languages.length === 0) return null;

  return (
    <div className="mt-4">
      <Label className="text-base font-semibold">Переводы</Label>
      <Tabs defaultValue={languages[0]?.code} className="mt-2">
        <TabsList className="flex-wrap h-auto">
          {languages.map((l) => (
            <TabsTrigger key={l.code} value={l.code} className="gap-1">
              <span>{l.flag_emoji}</span>
              <span className="uppercase text-xs">{l.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {languages.map((l) => {
          const t = translations[l.code] || { name: "", description: "" };
          return (
            <TabsContent key={l.code} value={l.code} className="space-y-3 mt-3">
              <div>
                <Label>Название ({l.name})</Label>
                <Input value={t.name} onChange={(e) => update(l.code, "name", e.target.value)} />
              </div>
              <div>
                <Label>Описание ({l.name})</Label>
                <Textarea value={t.description} onChange={(e) => update(l.code, "description", e.target.value)} rows={3} />
              </div>
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
