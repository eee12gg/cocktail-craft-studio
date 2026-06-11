/**
 * Admin path — hardcoded to `/editor`.
 *
 * Динамический путь удалён по требованию: используется фиксированный
 * префикс админ-панели `/editor`. Хук оставлен для обратной совместимости
 * с существующими импортами в коде.
 */

import { createContext, useContext, ReactNode } from "react";

export const ADMIN_PATH = "editor";

interface AdminPathContextType {
  adminPath: string;
  loading: boolean;
}

const AdminPathContext = createContext<AdminPathContextType>({
  adminPath: ADMIN_PATH,
  loading: false,
});

export function AdminPathProvider({ children }: { children: ReactNode }) {
  return (
    <AdminPathContext.Provider value={{ adminPath: ADMIN_PATH, loading: false }}>
      {children}
    </AdminPathContext.Provider>
  );
}

export function useAdminPath() {
  return useContext(AdminPathContext);
}
