import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Настройки</h1>
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Панель редактора</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Авторизация отключена — панель редактора доступна напрямую по адресу <code className="rounded bg-muted px-1.5 py-0.5">/editor</code>.
          Управляйте контентом через разделы в боковом меню.
        </p>
      </section>
    </div>
  );
}
