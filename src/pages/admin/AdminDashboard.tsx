import { GlassWater, Leaf, MessageSquare, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPath } from "@/hooks/useAdminPath";

export default function AdminDashboard() {
  const { adminPath } = useAdminPath();
  const [counts, setCounts] = useState({ recipes: 0, ingredients: 0, reviews: 0, tools: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("recipes").select("id", { count: "exact", head: true }),
      supabase.from("ingredients").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("equipment").select("id", { count: "exact", head: true }),
    ]).then(([r, i, rev, t]) => {
      setCounts({
        recipes: r.count ?? 0,
        ingredients: i.count ?? 0,
        reviews: rev.count ?? 0,
        tools: t.count ?? 0,
      });
    });
  }, []);

  const stats = [
    { label: "Напитки", value: counts.recipes, icon: GlassWater, href: `/${adminPath}/drinks`, color: "text-primary" },
    { label: "Ингредиенты", value: counts.ingredients, icon: Leaf, href: `/${adminPath}/ingredients`, color: "text-green-400" },
    { label: "Отзывы", value: counts.reviews, icon: MessageSquare, href: `/${adminPath}/reviews`, color: "text-blue-400" },
    { label: "Инструменты", value: counts.tools, icon: Wrench, href: `/${adminPath}/tools`, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Быстрые действия</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={`/${adminPath}/drinks`}
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            + Добавить напиток
          </Link>
          <Link
            to={`/${adminPath}/ingredients`}
            className="rounded-lg bg-green-400/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-400/20"
          >
            + Добавить ингредиент
          </Link>
          <Link
            to={`/${adminPath}/tools`}
            className="rounded-lg bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-400/20"
          >
            + Добавить инструмент
          </Link>
        </div>
      </div>
    </div>
  );
}
