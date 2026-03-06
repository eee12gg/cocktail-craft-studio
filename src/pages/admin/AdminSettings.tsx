import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPath } from "@/hooks/useAdminPath";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Lock, Save, Link2 } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { adminPath, setAdminPath } = useAdminPath();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newAdminPath, setNewAdminPath] = useState(adminPath);
  const [saving, setSaving] = useState(false);

  const handleUpdateUsername = async () => {
    if (!username.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Ошибка при обновлении логина");
    } else {
      toast.success("Логин обновлён");
      setUsername("");
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSaving(false);
    if (error) {
      toast.error("Ошибка при обновлении email");
    } else {
      toast.success("Письмо для подтверждения отправлено на новый email");
      setNewEmail("");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast.error("Ошибка при обновлении пароля");
    } else {
      toast.success("Пароль обновлён");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleUpdateAdminPath = async () => {
    setSaving(true);
    const { error } = await setAdminPath(newAdminPath);
    setSaving(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("URL админ-панели обновлён. Перенаправляю...");
      setTimeout(() => {
        navigate(`/${newAdminPath}/settings`);
      }, 1000);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Настройки</h1>

      {/* Admin URL */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">URL админ-панели</h2>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Текущий путь: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/{adminPath}</code>
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/</span>
            <Input
              placeholder="new-admin-path"
              value={newAdminPath}
              onChange={(e) => setNewAdminPath(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase())}
              className="pl-7"
            />
          </div>
          <Button onClick={handleUpdateAdminPath} disabled={saving || !newAdminPath || newAdminPath === adminPath}>
            <Save className="mr-2 h-4 w-4" />
            Изменить
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ⚠️ После изменения старый URL перестанет работать. Запомните новый путь!
        </p>
      </section>

      {/* Username */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Логин</h2>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">Текущий email: {user?.email}</p>
        <div className="flex gap-3">
          <Input
            placeholder="Новый логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleUpdateUsername} disabled={saving || !username.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </section>

      {/* Email */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Email</h2>
        </div>
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="Новый email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button onClick={handleUpdateEmail} disabled={saving || !newEmail.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Изменить
          </Button>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Пароль</h2>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleUpdatePassword} disabled={saving || !newPassword || !confirmPassword}>
            <Save className="mr-2 h-4 w-4" />
            Обновить пароль
          </Button>
        </div>
      </section>
    </div>
  );
}
