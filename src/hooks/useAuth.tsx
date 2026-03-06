import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const SESSION_FLAG = "admin_session_active";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    setIsAdmin(!!data);
  };

  // Auto-logout: if browser was closed (sessionStorage cleared) but localStorage session exists
  useEffect(() => {
    const hasSessionFlag = sessionStorage.getItem(SESSION_FLAG);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // If no session flag and this is an existing session (not a fresh login), sign out
          if (!sessionStorage.getItem(SESSION_FLAG) && _event === "INITIAL_SESSION") {
            // This means browser was reopened — force logout
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (!hasSessionFlag) {
          // Browser was closed/reopened — sign out
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

  const signIn = async (email: string, password: string) => {
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

    // Mark session as active in this browser tab/session
    sessionStorage.setItem(SESSION_FLAG, "1");
    return { error: null };
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
