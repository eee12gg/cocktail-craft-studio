/**
 * Authentication provider and hook.
 *
 * Manages admin login/logout with:
 * - Rate limiting (via DB function `is_login_rate_limited`)
 * - Session-based auto-logout (browser close = session ends)
 * - Admin role check (via DB function `has_role`)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

/** SessionStorage flag — cleared when browser is closed */
const SESSION_FLAG = "admin_session_active";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* ─── Types ────────────────────────────────────────────────────────── */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── Provider ─────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /** Check if user has admin role via secure DB function */
  const checkAdminRole = async (userId: string, accessToken?: string): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    try {
      const token = accessToken ?? session?.access_token;
      if (!token) {
        setIsAdmin(false);
        return false;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _user_id: userId,
          _role: "admin",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setIsAdmin(false);
        return false;
      }

      const data = await response.json();
      const allowed = data === true;
      setIsAdmin(allowed);
      return allowed;
    } catch (e) {
      console.error("[useAuth] admin role check failed", e);
      setIsAdmin(false);
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const checkAdminRoleWithClientFallback = async (userId: string, accessToken?: string): Promise<boolean> => {
    const directResult = await checkAdminRole(userId, accessToken);
    if (directResult) return true;

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      const allowed = !error && !!data;
      setIsAdmin(allowed);
      return allowed;
    } catch (e) {
      console.error("[useAuth] admin role check failed", e);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const applySession = (session: Session | null) => {
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setIsAdmin(false);
        sessionStorage.removeItem(SESSION_FLAG);
        setLoading(false);
        return;
      }

      sessionStorage.setItem(SESSION_FLAG, "1");
      setLoading(true);
      setTimeout(() => {
        if (cancelled) return;
        void checkAdminRoleWithClientFallback(session.user.id, session.access_token).finally(() => {
          if (!cancelled) setLoading(false);
        });
      }, 0);
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        applySession(session);
      })
      .catch((e) => {
        console.error("[useAuth] getSession failed", e);
        if (!cancelled) setLoading(false);
      });

    // Safety net: never keep app blocked > 3s on auth init
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  /** Sign in. Rate limiting and leaked-password checks are enforced server-side by Supabase Auth. */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { error: "Неверный email или пароль" };
    }

    if (!data.session || !data.user) {
      setLoading(false);
      return { error: "Не удалось создать сессию. Попробуйте ещё раз" };
    }

    sessionStorage.setItem(SESSION_FLAG, "1");
    setSession(data.session);
    setUser(data.user);

    const allowed = await checkAdminRoleWithClientFallback(data.user.id, data.session.access_token);
    setLoading(false);

    if (!allowed) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return { error: "У этой учётной записи нет прав администратора" };
    }

    return { error: null };
  };

  /** Sign out and clear admin state */
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSession(null);
    setUser(null);
    sessionStorage.removeItem(SESSION_FLAG);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ─────────────────────────────────────────────────────────── */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
