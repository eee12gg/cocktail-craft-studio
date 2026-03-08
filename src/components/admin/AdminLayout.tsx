import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPath } from "@/hooks/useAdminPath";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  GlassWater,
  Leaf,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Globe,
  Wrench,
  Tag,
  Video,
  MapPin,
  Search,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { adminPath } = useAdminPath();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["admin-unread-messages"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      if (error) return 0;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  const base = `/${adminPath}`;
  const navItems = [
    { label: "Дашборд", path: base, icon: LayoutDashboard },
    { label: "Напитки", path: `${base}/drinks`, icon: GlassWater },
    { label: "Ингредиенты", path: `${base}/ingredients`, icon: Leaf },
    { label: "Типы ингредиентов", path: `${base}/ingredient-types`, icon: Tag },
    { label: "Bar Tools", path: `${base}/tools`, icon: Wrench },
    { label: "Видео", path: `${base}/videos`, icon: Video },
    { label: "Отзывы", path: `${base}/reviews`, icon: MessageSquare },
    { label: "Сообщения", path: `${base}/messages`, icon: Mail, badge: unreadCount },
    { label: "Языки", path: `${base}/languages`, icon: Globe },
    { label: "Страны", path: `${base}/countries`, icon: MapPin },
    { label: "SEO", path: `${base}/seo`, icon: Search },
    { label: "Настройки", path: `${base}/settings`, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300 md:relative md:z-auto ${
          collapsed ? "w-16" : "w-60"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <span className="font-display text-sm font-bold text-gradient-gold">ADMIN</span>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="text-sidebar-foreground hover:text-sidebar-primary"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                {!collapsed && (item as any).badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {(item as any).badge}
                  </span>
                )}
                {collapsed && (item as any).badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title={collapsed ? "Выйти" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-sm font-bold text-gradient-gold">ADMIN</span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
