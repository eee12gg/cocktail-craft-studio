/**
 * Admin registration page.
 *
 * Доступна только если в `admin_settings.allow_registration = 'true'`.
 * Создаёт пользователя через Supabase Auth и присваивает роль `admin`
 * (через edge-функцию `setup-admin` либо прямой insert при наличии прав).
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPath } from "@/hooks/useAdminPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertTriangle, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const { adminPath } = useAdminPath();
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "allow_registration")
      .maybeSingle()
      .then(({ data }) => setAllowed(data?.value === "true"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Пароли не совпадают");
    if (password.length < 8) return setError("Пароль должен быть не менее 8 символов");

    setLoading(true);
    // Sign up via Supabase Auth
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/${adminPath}/login` },
    });

    if (signUpErr) {
      setLoading(false);
      return setError(signUpErr.message);
    }

    // Try to grant admin role. Requires open RLS or edge function `setup-admin`.
    if (signUpData.user?.id) {
      try {
        await supabase.functions.invoke("setup-admin", {
          body: { user_id: signUpData.user.id, email: email.trim() },
        });
      } catch {
        /* Игнорируем — пользователь создан, роль можно выдать вручную */
      }
    }

    toast.success("Аккаунт создан. Войдите в систему.");
    navigate(`/${adminPath}/login`);
    setLoading(false);
  };

  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Регистрация отключена</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Обратитесь к администратору, чтобы получить доступ.
          </p>
          <Link to={`/${adminPath}/login`} className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Вернуться ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Регистрация</h1>
          <p className="mt-1 text-sm text-muted-foreground">Создание нового аккаунта администратора</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email (логин)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Подтверждение пароля</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pl-10"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Создание..." : "Зарегистрироваться"}
          </Button>

          <Link to={`/${adminPath}/login`} className="block text-center text-sm text-muted-foreground hover:text-primary">
            Уже есть аккаунт? Войти
          </Link>
        </form>
      </div>
    </div>
  );
}
