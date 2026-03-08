/**
 * Dynamic admin path provider.
 *
 * The admin panel URL prefix is stored in the `admin_settings` table
 * (key: "admin_path"). This allows changing the admin URL at runtime
 * for security through obscurity.
 *
 * Default: /admin → can be changed to e.g. /my-secret-panel
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminPathContextType {
  adminPath: string;
  loading: boolean;
  setAdminPath: (path: string) => Promise<{ error: string | null }>;
}

const AdminPathContext = createContext<AdminPathContextType | undefined>(undefined);

export function AdminPathProvider({ children }: { children: ReactNode }) {
  const [adminPath, setPath] = useState("admin");
  const [loading, setLoading] = useState(true);

  // Load admin path from database on mount
  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_path")
      .single()
      .then(({ data }) => {
        if (data?.value) setPath(data.value);
        setLoading(false);
      });
  }, []);

  /** Update admin path (requires admin role via RLS) */
  const updateAdminPath = async (newPath: string) => {
    const sanitized = newPath.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
    if (!sanitized || sanitized.length < 3) {
      return { error: "Путь должен быть не менее 3 символов (a-z, 0-9, -, _)" };
    }

    const { error } = await supabase
      .from("admin_settings")
      .update({ value: sanitized, updated_at: new Date().toISOString() })
      .eq("key", "admin_path");

    if (error) return { error: "Ошибка при обновлении пути" };
    setPath(sanitized);
    return { error: null };
  };

  return (
    <AdminPathContext.Provider value={{ adminPath, loading, setAdminPath: updateAdminPath }}>
      {children}
    </AdminPathContext.Provider>
  );
}

export function useAdminPath() {
  const context = useContext(AdminPathContext);
  if (!context) throw new Error("useAdminPath must be used within AdminPathProvider");
  return context;
}
