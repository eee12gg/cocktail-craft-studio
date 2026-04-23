import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<File | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/backup-export`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: "{}",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `cocktailcraft-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      toast.success("Backup downloaded successfully");
    } catch (e: any) {
      toast.error("Export failed: " + (e.message || "unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setConfirmRestore(file);
    e.target.value = "";
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    setImporting(true);
    try {
      const text = await confirmRestore.text();
      const parsed = JSON.parse(text);

      const { data, error } = await supabase.functions.invoke("backup-restore", {
        body: parsed,
      });
      if (error) throw error;
      toast.success(`Restored: ${data?.summary || "successful"}`);
      setConfirmRestore(null);
    } catch (e: any) {
      toast.error("Restore failed: " + (e.message || "unknown error"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Резервные копии</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Создание полных бекапов сайта (данные + изображения) и восстановление из них.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Создать бекап</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Архивирует все таблицы базы данных и все изображения из storage в один ZIP-файл.
          </p>
          <Button onClick={handleExport} disabled={exporting} className="w-full">
            {exporting ? "Создание архива..." : "Скачать бекап"}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Восстановить</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Загрузите ZIP-файл, ранее созданный системой бекапа.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={handleFilePick}
              disabled={importing}
            />
            <span
              className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-medium cursor-pointer ${
                importing
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {importing ? "Восстановление..." : "Выбрать ZIP-файл"}
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/80">
            <strong>Внимание:</strong> Восстановление перезаписывает все данные в базе.
            Сначала рекомендуется создать свежий бекап текущего состояния.
          </div>
        </div>
      </div>

      <Dialog open={!!confirmRestore} onOpenChange={(o) => !o && setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-destructive" />
              Подтвердить восстановление
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Восстановить из файла <strong>{confirmRestore?.name}</strong>?
            Это действие <strong>перезапишет</strong> все текущие данные.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)} disabled={importing}>
              Отмена
            </Button>
            <Button onClick={handleRestore} disabled={importing}>
              {importing ? "Восстановление..." : "Восстановить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
