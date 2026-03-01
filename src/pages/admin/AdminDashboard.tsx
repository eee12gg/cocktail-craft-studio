import { GlassWater, Leaf, MessageSquare, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Напитки", value: "—", icon: GlassWater, href: "/admin/drinks", color: "text-primary" },
  { label: "Ингредиенты", value: "—", icon: Leaf, href: "/admin/ingredients", color: "text-green-400" },
  { label: "Отзывы", value: "—", icon: MessageSquare, href: "/admin", color: "text-blue-400" },
  { label: "Посещения", value: "—", icon: TrendingUp, href: "/admin", color: "text-purple-400" },
];

export default function AdminDashboard() {
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
            to="/admin/drinks"
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            + Добавить напиток
          </Link>
          <Link
            to="/admin/ingredients"
            className="rounded-lg bg-green-400/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-400/20"
          >
            + Добавить ингредиент
          </Link>
        </div>
      </div>
    </div>
  );
}
