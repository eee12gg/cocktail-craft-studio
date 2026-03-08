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
  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    setIsAdmin(!!data);
  };

  useEffect(() => {
    const hasSessionFlag = sessionStorage.getItem(SESSION_FLAG);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Auto-logout: browser was closed and reopened (sessionStorage cleared)
          if (!sessionStorage.getItem(SESSION_FLAG) && _event === "INITIAL_SESSION") {
            await supabase.auth.signOut();
            setIsAdmin(false);
            setLoading(false);
            return;
          }
          sessionStorage.setItem(SESSION_FLAG, "1");
          setTimeout(() => checkAdminRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
          sessionStorage.removeItem(SESSION_FLAG);
        }
        setLoading(false);
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        if (!hasSessionFlag) {
          // Browser was closed/reopened — force logout
          supabase.auth.signOut();
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Sign in with rate limiting protection */
  const signIn = async (email: string, password: string) => {
    // Check server-side rate limit (5 failed attempts per 15 min)
    const { data: rateLimited } = await supabase.rpc("is_login_rate_limited", {
      _email: email,
    });

    if (rateLimited) {
      return { error: "Слишком много попыток входа. Попробуйте через 15 минут." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: "Неверный email или пароль" };
    }

    sessionStorage.setItem(SESSION_FLAG, "1");
    return { error: null };
  };

  /** Sign out and clear admin state */
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
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
