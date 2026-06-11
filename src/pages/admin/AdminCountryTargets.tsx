/**
 * Admin — Countries & Languages.
 *
 * Каждая страна может иметь несколько языков.
 * Один из языков помечается как «по умолчанию» для страны.
 * Удаление последнего языка страны заблокировано триггером БД.
 */

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Star, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

interface CountryTarget {
  id: string;
  country_code: string;
  country_name: string;
  language_code: string;
  flag_emoji: string;
  is_default: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  flag_emoji: string;
}

const KNOWN_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
];

interface AddDialogState {
  open: boolean;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  languageCode: string;
}

const emptyDialog: AddDialogState = {
  open: false,
  countryCode: "",
  countryName: "",
  countryFlag: "",
  languageCode: "",
};

export default function AdminCountryTargets() {
  const [targets, setTargets] = useState<CountryTarget[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<AddDialogState>(emptyDialog);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [t, l] = await Promise.all([
      supabase.from("country_language_targets").select("*").order("country_name"),
      supabase.from("languages").select("code, name, flag_emoji").eq("is_active", true).order("sort_order"),
    ]);
    if (t.error) toast.error("Ошибка загрузки стран");
    else setTargets((t.data || []) as CountryTarget[]);
    if (l.data) setLanguages(l.data as LanguageOption[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group: country -> rows
  const byCountry = useMemo(() => {
    const map = new Map<string, CountryTarget[]>();
    for (const t of targets) {
      const arr = map.get(t.country_code) || [];
      arr.push(t);
      map.set(t.country_code, arr);
    }
    return Array.from(map.entries()).sort((a, b) =>
      (a[1][0]?.country_name || "").localeCompare(b[1][0]?.country_name || "")
    );
  }, [targets]);

  const handleAdd = async () => {
    if (!dialog.countryCode || !dialog.languageCode) {
      return toast.error("Выберите страну и язык");
    }
    setSaving(true);
    const isFirstForCountry = !targets.some((t) => t.country_code === dialog.countryCode);
    const { error } = await supabase.from("country_language_targets").insert({
      country_code: dialog.countryCode,
      country_name: dialog.countryName,
      flag_emoji: dialog.countryFlag,
      language_code: dialog.languageCode,
      is_default: isFirstForCountry,
    });
    setSaving(false);
    if (error) return toast.error("Ошибка: " + error.message);
    toast.success("Язык добавлен");
    setDialog(emptyDialog);
    fetchData();
  };

  const handleDelete = async (row: CountryTarget) => {
    const { error } = await supabase.from("country_language_targets").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message.includes("последний язык") ? "Нельзя удалить последний язык страны" : "Ошибка удаления");
    } else {
      toast.success("Удалено");
      fetchData();
    }
  };

  const handleSetDefault = async (row: CountryTarget) => {
    // Снять флаг с текущего default, поставить на выбранный.
    await supabase
      .from("country_language_targets")
      .update({ is_default: false })
      .eq("country_code", row.country_code)
      .eq("is_default", true);
    const { error } = await supabase
      .from("country_language_targets")
      .update({ is_default: true })
      .eq("id", row.id);
    if (error) toast.error("Не удалось установить язык по умолчанию");
    else {
      toast.success("Установлен язык по умолчанию");
      fetchData();
    }
  };

  const openAddDialog = (country?: { code: string; name: string; flag: string }) => {
    setDialog({
      open: true,
      countryCode: country?.code || "",
      countryName: country?.name || "",
      countryFlag: country?.flag || "",
      languageCode: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6" /> Страны и языки
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Несколько языков на страну. Звезда — язык по умолчанию.
          </p>
        </div>
        <Button onClick={() => openAddDialog()}>
          <Plus className="h-4 w-4 mr-1" /> Добавить запись
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : byCountry.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Нет привязок стран к языкам</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {byCountry.map(([code, rows]) => {
            const country = { code, name: rows[0].country_name, flag: rows[0].flag_emoji };
            return (
              <div key={code} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <div className="font-semibold text-foreground">{country.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{country.code}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAddDialog(country)}
                    disabled={rows.length >= languages.length}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Язык
                  </Button>
                </div>

                <ul className="space-y-1.5">
                  {rows.map((r) => {
                    const lang = languages.find((l) => l.code === r.language_code);
                    return (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-md bg-secondary/30 px-2.5 py-1.5"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span>{lang?.flag_emoji || "🌐"}</span>
                          <span className="text-foreground">{lang?.name || r.language_code}</span>
                          <span className="text-xs text-muted-foreground font-mono">({r.language_code})</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${r.is_default ? "text-primary" : "text-muted-foreground"}`}
                            title={r.is_default ? "Язык по умолчанию" : "Сделать языком по умолчанию"}
                            onClick={() => !r.is_default && handleSetDefault(r)}
                          >
                            <Star className={`h-4 w-4 ${r.is_default ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Удалить язык"
                            onClick={() => handleDelete(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить язык к стране</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Страна *</Label>
              <Select
                value={dialog.countryCode}
                onValueChange={(code) => {
                  const c = KNOWN_COUNTRIES.find((c) => c.code === code);
                  if (c)
                    setDialog((d) => ({
                      ...d,
                      countryCode: c.code,
                      countryName: c.name,
                      countryFlag: c.flag,
                    }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страну..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {KNOWN_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground font-mono">({c.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Язык *</Label>
              <Select
                value={dialog.languageCode}
                onValueChange={(v) => setDialog((d) => ({ ...d, languageCode: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите язык..." />
                </SelectTrigger>
                <SelectContent>
                  {languages
                    .filter(
                      (l) =>
                        !targets.some(
                          (t) => t.country_code === dialog.countryCode && t.language_code === l.code
                        )
                    )
                    .map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        <span className="flex items-center gap-1.5">
                          <span>{l.flag_emoji}</span>
                          <span>{l.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(emptyDialog)}>
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
