import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";

interface CountryTarget {
  id: string;
  country_code: string;
  country_name: string;
  language_code: string;
  flag_emoji: string;
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
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
];

const emptyForm = { country_code: "", country_name: "", language_code: "", flag_emoji: "" };

export default function AdminCountryTargets() {
  const [targets, setTargets] = useState<CountryTarget[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [targetsRes, langsRes] = await Promise.all([
      supabase.from("country_language_targets").select("*").order("country_name"),
      supabase.from("languages").select("code, name, flag_emoji").eq("is_active", true).order("sort_order"),
    ]);
    if (targetsRes.error) toast.error("Ошибка загрузки");
    else setTargets((targetsRes.data || []) as CountryTarget[]);
    if (langsRes.data) setLanguages(langsRes.data as LanguageOption[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const existingCountries = targets.map(t => t.country_code);
  const availableCountries = KNOWN_COUNTRIES.filter(c => !existingCountries.includes(c.code));

  const handleSave = async () => {
    if (!form.country_code || !form.language_code) {
      toast.error("Выберите страну и язык");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("country_language_targets").insert({
      country_code: form.country_code,
      country_name: form.country_name,
      language_code: form.language_code,
      flag_emoji: form.flag_emoji,
    });
    if (error) toast.error("Ошибка: " + error.message);
    else { toast.success("Страна добавлена"); setDialogOpen(false); setForm(emptyForm); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("country_language_targets").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else { toast.success("Удалено"); fetchData(); }
  };

  const handleChangeLanguage = async (id: string, newLangCode: string) => {
    const { error } = await supabase.from("country_language_targets").update({ language_code: newLangCode }).eq("id", id);
    if (error) toast.error("Ошибка");
    else fetchData();
  };

  // Group targets by language
  const grouped = languages
    .map(lang => ({
      lang,
      countries: targets.filter(t => t.language_code === lang.code),
    }))
    .filter(g => g.countries.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6" /> Страны и языки
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Привязка стран к языкам для SEO (hreflang тегов). Определяет какую языковую версию показывать пользователям из разных стран.
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Добавить страну
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : targets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Нет привязок стран к языкам</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ lang, countries }) => (
            <div key={lang.code} className="rounded-lg border border-border overflow-hidden">
              <div className="bg-secondary/30 px-4 py-2.5 flex items-center gap-2 border-b border-border">
                <span className="text-lg">{lang.flag_emoji}</span>
                <span className="font-semibold text-foreground">{lang.name}</span>
                <span className="text-sm text-muted-foreground font-mono">({lang.code})</span>
                <span className="ml-auto text-xs text-muted-foreground">{countries.length} стран(ы)</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Флаг</TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead>Страна</TableHead>
                    <TableHead>hreflang</TableHead>
                    <TableHead>Язык</TableHead>
                    <TableHead className="text-right w-20">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.map(target => (
                    <TableRow key={target.id}>
                      <TableCell className="text-2xl">{target.flag_emoji}</TableCell>
                      <TableCell className="font-mono text-sm">{target.country_code}</TableCell>
                      <TableCell>{target.country_name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {target.language_code}-{target.country_code}
                      </TableCell>
                      <TableCell>
                        <Select value={target.language_code} onValueChange={(v) => handleChangeLanguage(target.id, v)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(l => (
                              <SelectItem key={l.code} value={l.code}>
                                <span className="flex items-center gap-1.5">
                                  <span>{l.flag_emoji}</span>
                                  <span>{l.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(target.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить страну</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Страна *</Label>
              <Select
                value={form.country_code}
                onValueChange={(code) => {
                  const c = KNOWN_COUNTRIES.find(c => c.code === code);
                  if (c) setForm(f => ({ ...f, country_code: c.code, country_name: c.name, flag_emoji: c.flag }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страну..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableCountries.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground font-mono">({c.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                  {availableCountries.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Все страны добавлены</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Язык по умолчанию *</Label>
              <Select value={form.language_code} onValueChange={(v) => setForm(f => ({ ...f, language_code: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите язык..." />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
