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

interface TranslationTabsProps {
  /** "recipe" or "ingredient" */
  type: "recipe" | "ingredient";
  /** The ID of the parent record */
  parentId: string;
  /** Called when translations are saved */
  onSaved?: () => void;
}

interface TranslationData {
  title?: string;
  name?: string;
  slug: string;
  description: string;
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function TranslationTabs({ type, parentId, onSaved }: TranslationTabsProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const tableName = type === "recipe" ? "recipe_translations" : "ingredient_translations";
  const parentCol = type === "recipe" ? "recipe_id" : "ingredient_id";
  const nameField = type === "recipe" ? "title" : "name";

  useEffect(() => {
    const load = async () => {
      const [langRes, transRes] = await Promise.all([
        supabase.from("languages").select("code, name, flag_emoji").eq("is_active", true).order("sort_order"),
        supabase.from(tableName).select("*").eq(parentCol, parentId),
      ]);

      if (langRes.data) {
        // Filter out 'en' since that's the main record
        setLanguages(langRes.data.filter((l: any) => l.code !== "en"));
      }

      if (transRes.data) {
        const map: Record<string, TranslationData> = {};
        transRes.data.forEach((row: any) => {
          map[row.language_code] = {
            [nameField]: row[nameField] || row.title || row.name || "",
            slug: row.slug || "",
            description: row.description || "",
          } as TranslationData;
        });
        setTranslations(map);
      }
    };
    if (parentId) load();
  }, [parentId, tableName, parentCol]);

  const updateField = (langCode: string, field: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: {
        ...(prev[langCode] || { slug: "", description: "" }),
        [field]: value,
      },
    }));
  };

  const saveTranslation = async (langCode: string) => {
    const data = translations[langCode];
    if (!data) return;

    const titleOrName = type === "recipe" ? (data as any).title : (data as any).name;
    if (!titleOrName?.trim()) {
      toast.error("Введите название");
      return;
    }

    setSaving(langCode);
    const slug = data.slug || toSlug(titleOrName);

    const payload: any = {
      [parentCol]: parentId,
      language_code: langCode,
      [nameField]: titleOrName.trim(),
      slug,
      description: data.description?.trim() || null,
    };

    // Check if exists
    let error;
    if (type === "recipe") {
      const { data: existing } = await supabase
        .from("recipe_translations")
        .select("id")
        .eq("recipe_id", parentId)
        .eq("language_code", langCode)
        .maybeSingle();
      if (existing) {
        ({ error } = await supabase.from("recipe_translations").update(payload).eq("id", existing.id));
      } else {
        ({ error } = await supabase.from("recipe_translations").insert(payload));
      }
    } else {
      const { data: existing } = await supabase
        .from("ingredient_translations")
        .select("id")
        .eq("ingredient_id", parentId)
        .eq("language_code", langCode)
        .maybeSingle();
      if (existing) {
        ({ error } = await supabase.from("ingredient_translations").update(payload).eq("id", existing.id));
      } else {
        ({ error } = await supabase.from("ingredient_translations").insert(payload));
      }
    }

    if (error) toast.error("Ошибка: " + error.message);
    else { toast.success(`Перевод (${langCode}) сохранён`); onSaved?.(); }
    setSaving(null);
  };

  if (languages.length === 0) return null;

  return (
    <div className="mt-4">
      <Label className="text-base font-semibold">Переводы</Label>
      <Tabs defaultValue={languages[0]?.code} className="mt-2">
        <TabsList>
          {languages.map(lang => (
            <TabsTrigger key={lang.code} value={lang.code} className="gap-1">
              <span>{lang.flag_emoji}</span>
              <span className="uppercase text-xs">{lang.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map(lang => {
          const t = translations[lang.code] || { slug: "", description: "" };
          const titleVal = type === "recipe" ? (t as any).title || "" : (t as any).name || "";

          return (
            <TabsContent key={lang.code} value={lang.code} className="space-y-3 mt-3">
              <div>
                <Label>{type === "recipe" ? "Название" : "Название"} ({lang.name})</Label>
                <Input
                  value={titleVal}
                  onChange={(e) => updateField(lang.code, nameField, e.target.value)}
                  placeholder={`Перевод на ${lang.name}`}
                />
              </div>
              <div>
                <Label>Slug ({lang.code})</Label>
                <Input
                  value={t.slug}
                  onChange={(e) => updateField(lang.code, "slug", e.target.value)}
                  placeholder="auto-generated"
                />
              </div>
              <div>
                <Label>Описание ({lang.name})</Label>
                <Textarea
                  value={t.description}
                  onChange={(e) => updateField(lang.code, "description", e.target.value)}
                  rows={3}
                  placeholder={`Описание на ${lang.name}`}
                />
              </div>
              <Button size="sm" onClick={() => saveTranslation(lang.code)} disabled={saving === lang.code}>
                <Save className="h-4 w-4 mr-1" />
                {saving === lang.code ? "Сохранение..." : `Сохранить (${lang.code.toUpperCase()})`}
              </Button>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
